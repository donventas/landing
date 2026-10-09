-- Private worker operations only. Apply after 003 in the approved environment.
begin;
alter table dv_comments.message add column is_test boolean not null default false;
alter table dv_comments.delivery_event alter column message_id drop not null;
alter table dv_comments.delivery_event add column provider_id text;
create index on dv_comments.delivery_event(provider_id, occurred_at);

create function public.dv_article_claim(p_test_only boolean default false) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare j dv_comments.outbox%rowtype; m dv_comments.message%rowtype;
begin
  loop
    select o.* into j from dv_comments.outbox o join dv_comments.message msg on msg.id=o.message_id
      where (not p_test_only or msg.is_test) and ((o.state in ('pending','retry') and o.next_at <= now())
        or (o.state = 'sending' and o.lease_until <= now()))
      order by o.next_at, o.message_id for update of o skip locked limit 1;
    if not found then return null; end if;
    select * into m from dv_comments.message where id = j.message_id;
    if m.expires_at <= now() or j.attempts >= 5 or j.first_attempt_at <= now() - interval '23 hours' then
      update dv_comments.outbox set state='delivery_unknown', lease=null, lease_until=null,
        error_code='reconciliation_required' where message_id=j.message_id;
      continue;
    end if;
    update dv_comments.outbox set state='sending', attempts=attempts+1,
      first_attempt_at=coalesce(first_attempt_at,now()), lease=gen_random_uuid(),
      lease_until=now()+interval '10 minutes' where message_id=j.message_id returning * into j;
    return jsonb_build_object('id',j.message_id,'lease',j.lease,'attempts',j.attempts,'message',to_jsonb(m));
  end loop;
end $$;

create function public.dv_article_finish(p_id uuid, p_lease uuid, p_patch jsonb) returns boolean
language plpgsql security definer set search_path = '' as $$
declare j dv_comments.outbox%rowtype; e record;
begin
  if coalesce(p_patch->>'state','') not in ('accepted','retry','delivery_unknown') then raise exception 'invalid'; end if;
  if p_patch->>'provider_id' is not null then
    perform pg_advisory_xact_lock(hashtextextended(p_patch->>'provider_id',742903119));
  end if;
  select * into j from dv_comments.outbox where message_id=p_id for update;
  if not found or j.state <> 'sending' or j.lease is distinct from p_lease then return false; end if;
  if p_patch->>'state'='accepted' and coalesce(p_patch->>'provider_id','') !~ '^[0-9a-f-]{36}$' then raise exception 'invalid'; end if;
  update dv_comments.outbox set state=p_patch->>'state', lease=null,lease_until=null,
    provider_id=coalesce(p_patch->>'provider_id',provider_id),
    next_at=case when p_patch->>'state'='retry' then now()+make_interval(secs=>least(3600,30*power(2,attempts)::integer)) else next_at end,
    error_code=case when p_patch->>'state'='accepted' then null else 'delivery_attempt_failed' end
    where message_id=p_id returning * into j;
  -- A webhook can arrive before the provider response is persisted. Reconcile
  -- those already-verified events rather than losing them or sending again.
  if j.provider_id is not null then
    update dv_comments.delivery_event set message_id=p_id where provider_id=j.provider_id;
    for e in select * from dv_comments.delivery_event where provider_id=j.provider_id order by occurred_at,id loop
      if not (j.state in ('bounced','complained','failed') and e.state not in ('bounced','complained','failed'))
         and not (j.state='delivered' and e.state='delayed') then
        update dv_comments.outbox set state=e.state,event_at=e.occurred_at where message_id=p_id returning * into j;
      end if;
    end loop;
  end if;
  return true;
end $$;

create function public.dv_article_event(p_event jsonb) returns boolean
language plpgsql security definer set search_path = '' as $$
declare j dv_comments.outbox%rowtype; inserted integer; ts timestamptz;
begin
  if coalesce(p_event->>'state','') not in ('delivered','delayed','bounced','failed','complained')
    or char_length(coalesce(p_event->>'id','')) not between 1 and 200
    or coalesce(p_event->>'provider_id','') !~ '^[0-9a-f-]{36}$' then raise exception 'invalid'; end if;
  ts := to_timestamp((p_event->>'at')::double precision/1000);
  -- Serialize with finish, including the unmatched-event case.
  perform pg_advisory_xact_lock(hashtextextended(p_event->>'provider_id',742903119));
  select * into j from dv_comments.outbox where provider_id=p_event->>'provider_id' for update;
  insert into dv_comments.delivery_event(id,message_id,provider_id,state,occurred_at)
    values(p_event->>'id',j.message_id,p_event->>'provider_id',p_event->>'state',ts) on conflict(id) do nothing;
  get diagnostics inserted = row_count;
  if inserted=0 then return false; end if;
  if j.message_id is not null and (j.event_at is null or ts>=j.event_at)
    and not (j.state in ('bounced','complained','failed') and p_event->>'state' not in ('bounced','complained','failed'))
    and not (j.state='delivered' and p_event->>'state'='delayed') then
    update dv_comments.outbox set state=p_event->>'state',event_at=ts where message_id=j.message_id;
  end if;
  return true;
end $$;
revoke all on function public.dv_article_claim(boolean) from public,anon,authenticated;
revoke all on function public.dv_article_finish(uuid,uuid,jsonb) from public,anon,authenticated;
revoke all on function public.dv_article_event(jsonb) from public,anon,authenticated;
grant execute on function public.dv_article_claim(boolean) to service_role;
grant execute on function public.dv_article_finish(uuid,uuid,jsonb) to service_role;
grant execute on function public.dv_article_event(jsonb) to service_role;
commit;
