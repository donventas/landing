-- Apply once after 004. All access remains service_role-only.
begin;
create table dv_comments.subscriber (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  state text not null check (state in ('pending','active','unsubscribed','suppressed')),
  generation uuid not null default gen_random_uuid(),
  copy text not null, version text not null,
  requested_at timestamptz not null default now(),
  confirmed_at timestamptz, withdrawn_at timestamptz,
  confirm_hash text unique, unsubscribe_hash text unique,
  expires_at timestamptz not null default now()+interval '30 days',
  is_test boolean not null default false
);
create table dv_comments.confirmation_outbox (
  id uuid primary key default gen_random_uuid(),
  subscriber_id uuid not null references dv_comments.subscriber(id) on delete cascade,
  generation uuid not null unique,
  state text not null default 'pending' check (state in ('pending','sending','retry','accepted','delivered','delayed','bounced','failed','complained','delivery_unknown','cancelled')),
  attempts integer not null default 0, first_attempt_at timestamptz,
  next_at timestamptz not null default now(), lease uuid, lease_until timestamptz,
  provider_id text unique, event_at timestamptz
);
alter table dv_comments.subscriber enable row level security;
alter table dv_comments.confirmation_outbox enable row level security;
revoke all on dv_comments.subscriber,dv_comments.confirmation_outbox from public,anon,authenticated;
create index on dv_comments.confirmation_outbox(next_at) where state in ('pending','retry','sending');

alter function public.dv_article_receive(jsonb,jsonb,jsonb) rename to dv_article_receive_v1;
revoke all on function public.dv_article_receive_v1(jsonb,jsonb,jsonb) from public,anon,authenticated,service_role;
create function public.dv_article_receive(p_record jsonb,p_keys jsonb,p_opt_in jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare r jsonb; s dv_comments.subscriber%rowtype;
begin
  r := public.dv_article_receive_v1(p_record,p_keys,p_opt_in);
  if (r->>'duplicate')::boolean then return r; end if;
  update dv_comments.message set is_test=coalesce((p_record->>'is_test')::boolean,false) where id=(p_record->>'id')::uuid;
  if p_record->'newsletter' <> 'true'::jsonb then return r; end if;
  -- The receive-v1 advisory lock serializes concurrent enrollment too.
  select * into s from dv_comments.subscriber where email=lower(p_record->>'email') for update;
  if found then
    -- Never reactivate or repeatedly mail an address just because a box was checked.
    if s.state in ('active','suppressed') or s.requested_at>now()-interval '1 day' then return r; end if;
    update dv_comments.confirmation_outbox set state='cancelled',lease=null,lease_until=null
      where subscriber_id=s.id and state in ('pending','retry','sending');
    update dv_comments.subscriber set state='pending',generation=gen_random_uuid(),
      requested_at=now(),expires_at=now()+interval '30 days',confirm_hash=null,unsubscribe_hash=null,
      confirmed_at=null,withdrawn_at=null,copy=p_opt_in->>'copy',version=p_opt_in->>'version',
      is_test=coalesce((p_record->>'is_test')::boolean,false) where id=s.id returning * into s;
  else
    insert into dv_comments.subscriber(email,state,copy,version,is_test)
      values(lower(p_record->>'email'),'pending',p_opt_in->>'copy',p_opt_in->>'version',coalesce((p_record->>'is_test')::boolean,false)) returning * into s;
  end if;
  insert into dv_comments.confirmation_outbox(subscriber_id,generation) values(s.id,s.generation);
  return r;
end $$;

create function public.dv_newsletter_claim(p_test_only boolean default true) returns jsonb
language plpgsql security definer set search_path='' as $$
declare j dv_comments.confirmation_outbox%rowtype; s dv_comments.subscriber%rowtype;
begin
  loop
    select o.* into j from dv_comments.confirmation_outbox o join dv_comments.subscriber sub on sub.id=o.subscriber_id
      where (not p_test_only or sub.is_test) and ((o.state in ('pending','retry') and o.next_at<=now()) or (o.state='sending' and o.lease_until<=now()))
      order by o.next_at,o.id for update of o skip locked limit 1;
    if not found then return null; end if;
    select * into s from dv_comments.subscriber where id=j.subscriber_id;
    if s.state<>'pending' or s.generation<>j.generation or s.expires_at<=now() then
      update dv_comments.confirmation_outbox set state='cancelled',lease=null,lease_until=null where id=j.id; continue;
    end if;
    if j.attempts>=5 or j.first_attempt_at<=now()-interval '23 hours' then
      update dv_comments.confirmation_outbox set state='delivery_unknown',lease=null,lease_until=null where id=j.id; continue;
    end if;
    update dv_comments.confirmation_outbox set state='sending',attempts=attempts+1,first_attempt_at=coalesce(first_attempt_at,now()),
      lease=gen_random_uuid(),lease_until=now()+interval '10 minutes' where id=j.id returning * into j;
    return jsonb_build_object('id',j.id,'lease',j.lease,'attempts',j.attempts,'generation',j.generation,'email',s.email,'is_test',s.is_test);
  end loop;
end $$;

create function public.dv_newsletter_prepare(p_id uuid,p_lease uuid,p_confirm text,p_unsubscribe text) returns boolean
language plpgsql security definer set search_path='' as $$
declare j dv_comments.confirmation_outbox%rowtype;
begin
  if coalesce(p_confirm,'') !~ '^[a-f0-9]{64}$' or coalesce(p_unsubscribe,'') !~ '^[a-f0-9]{64}$' or p_confirm=p_unsubscribe then raise exception 'invalid'; end if;
  select * into j from dv_comments.confirmation_outbox where id=p_id;
  if not found or j.state<>'sending' or j.lease is distinct from p_lease then return false; end if;
  update dv_comments.subscriber set confirm_hash=p_confirm,unsubscribe_hash=p_unsubscribe
    where id=j.subscriber_id and generation=j.generation and state='pending' and expires_at>now()
      and (confirm_hash is null or confirm_hash=p_confirm) and (unsubscribe_hash is null or unsubscribe_hash=p_unsubscribe);
  return found;
end $$;

create function public.dv_newsletter_action(p_action text,p_hash text) returns boolean
language plpgsql security definer set search_path='' as $$
begin
  if coalesce(p_hash,'') !~ '^[a-f0-9]{64}$' then return false; end if;
  if p_action='confirm' then
    update dv_comments.subscriber set state='active',confirmed_at=coalesce(confirmed_at,now())
      where confirm_hash=p_hash and state in ('pending','active') and expires_at>now();
    return found;
  elsif p_action='unsubscribe' then
    -- No outbox locks here: avoid lock-order inversion with the delivery worker.
    -- The worker rechecks subscriber state before preparing any confirmation.
    update dv_comments.subscriber set state=case when state='suppressed' then state else 'unsubscribed' end,
      withdrawn_at=coalesce(withdrawn_at,now()) where unsubscribe_hash=p_hash;
    return found;
  end if;
  return false;
end $$;

create function dv_comments.apply_newsletter_events(p_id uuid) returns void
language plpgsql security definer set search_path='' as $$
declare j dv_comments.confirmation_outbox%rowtype; e record;
begin
  select * into j from dv_comments.confirmation_outbox where id=p_id for update;
  for e in select * from dv_comments.delivery_event where provider_id=j.provider_id order by occurred_at,id loop
    if (j.event_at is null or e.occurred_at>=j.event_at)
       and not (j.state in ('bounced','complained','failed') and e.state not in ('bounced','complained','failed'))
       and not (j.state='delivered' and e.state='delayed') then
      update dv_comments.confirmation_outbox set state=e.state,event_at=e.occurred_at where id=j.id returning * into j;
      if e.state in ('bounced','complained') then
        update dv_comments.subscriber set state='suppressed',withdrawn_at=coalesce(withdrawn_at,now())
          where id=j.subscriber_id and generation=j.generation;
      end if;
    end if;
  end loop;
end $$;
revoke all on function dv_comments.apply_newsletter_events(uuid) from public,anon,authenticated,service_role;

create function public.dv_newsletter_finish(p_id uuid,p_lease uuid,p_patch jsonb) returns boolean
language plpgsql security definer set search_path='' as $$
declare j dv_comments.confirmation_outbox%rowtype;
begin
  if coalesce(p_patch->>'state','') not in ('accepted','retry','delivery_unknown','cancelled') then raise exception 'invalid'; end if;
  if p_patch->>'provider_id' is not null then perform pg_advisory_xact_lock(hashtextextended(p_patch->>'provider_id',742903119)); end if;
  select * into j from dv_comments.confirmation_outbox where id=p_id for update;
  if not found or j.state<>'sending' or j.lease is distinct from p_lease then return false; end if;
  if p_patch->>'state'='accepted' and coalesce(p_patch->>'provider_id','') !~ '^[0-9a-f-]{36}$' then raise exception 'invalid'; end if;
  update dv_comments.confirmation_outbox set state=p_patch->>'state',lease=null,lease_until=null,
    provider_id=coalesce(p_patch->>'provider_id',provider_id),
    next_at=case when p_patch->>'state'='retry' then now()+make_interval(secs=>least(3600,30*power(2,attempts)::integer)) else next_at end where id=p_id;
  perform dv_comments.apply_newsletter_events(p_id);
  return true;
end $$;

alter function public.dv_article_event(jsonb) rename to dv_article_event_v1;
revoke all on function public.dv_article_event_v1(jsonb) from public,anon,authenticated,service_role;
create function public.dv_article_event(p_event jsonb) returns boolean
language plpgsql security definer set search_path='' as $$
declare r boolean; jid uuid;
begin
  r := public.dv_article_event_v1(p_event);
  select id into jid from dv_comments.confirmation_outbox where provider_id=p_event->>'provider_id';
  if jid is not null then perform dv_comments.apply_newsletter_events(jid); end if;
  return r;
end $$;

-- Do not automatically purge active consents. They are independent of comments.
-- Deletion of provider/inbox copies remains an operational privacy responsibility.
alter function public.dv_article_purge() rename to dv_article_purge_v1;
revoke all on function public.dv_article_purge_v1() from public,anon,authenticated,service_role;
create function public.dv_article_purge() returns bigint
language plpgsql security definer set search_path='' as $$
declare n bigint;
begin
  n := public.dv_article_purge_v1();
  delete from dv_comments.subscriber where state='pending' and expires_at<=now();
  delete from dv_comments.confirmation_outbox where next_at<now()-interval '30 days' and state not in ('pending','retry','sending');
  return n;
end $$;

revoke all on function public.dv_article_receive(jsonb,jsonb,jsonb),public.dv_newsletter_claim(boolean),public.dv_newsletter_prepare(uuid,uuid,text,text),public.dv_newsletter_action(text,text),public.dv_newsletter_finish(uuid,uuid,jsonb),public.dv_article_event(jsonb),public.dv_article_purge() from public,anon,authenticated;
grant execute on function public.dv_article_receive(jsonb,jsonb,jsonb),public.dv_newsletter_claim(boolean),public.dv_newsletter_prepare(uuid,uuid,text,text),public.dv_newsletter_action(text,text),public.dv_newsletter_finish(uuid,uuid,jsonb),public.dv_article_event(jsonb),public.dv_article_purge() to service_role;
commit;
