-- Candidate only: review and test before applying. Does not alter dv_comments/public.lead.
-- Private, purpose-specific landing intake. No browser role has table/RPC access.
begin;
create schema dv_portal;
revoke all on schema dv_portal from public, anon, authenticated;
create table dv_portal.request (
 id uuid primary key default gen_random_uuid(), submission_key uuid not null unique,
 kind text not null check(kind in ('waitlist','contact')), email text not null,
 name text not null default '', message text not null default '', interest text not null default '',
 purpose text not null, source_url text not null, notice_version text not null,
 payload_hash text not null, is_test boolean not null,
 created_at timestamptz not null default now(), expires_at timestamptz not null default now()+interval '180 days'
);
create table dv_portal.subscriber (
 id uuid primary key default gen_random_uuid(), email text not null, is_test boolean not null,
 state text not null check(state in ('pending','active','unsubscribed','suppressed')),
 generation uuid not null default gen_random_uuid(), notice_version text not null,
 purpose text not null default 'portal_launch_offers' check(purpose='portal_launch_offers'),
 requested_at timestamptz not null default now(), confirmed_at timestamptz, withdrawn_at timestamptz,
 confirm_hash text unique, unsubscribe_hash text unique, confirm_expires_at timestamptz,
 unique(email,is_test)
);
create table dv_portal.outbox (
 id uuid primary key default gen_random_uuid(), request_id uuid references dv_portal.request on delete cascade,
 subscriber_id uuid references dv_portal.subscriber on delete cascade, generation uuid,
 kind text not null check(kind in ('contact','confirmation')), is_test boolean not null,
 state text not null default 'pending' check(state in ('pending','sending','retry','accepted','delivered','bounced','complained','failed','cancelled','delivery_unknown')),
 attempts integer not null default 0, next_at timestamptz not null default now(),
 lease uuid, lease_until timestamptz, first_attempt_at timestamptz,
 provider_id text unique, last_error text, created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(), unique(subscriber_id,generation), unique(request_id,kind)
);
create table dv_portal.rate_bucket (
 key text not null, window_at timestamptz not null, hits integer not null,
 primary key(key,window_at)
);
alter table dv_portal.request enable row level security;
alter table dv_portal.subscriber enable row level security;
alter table dv_portal.outbox enable row level security;
alter table dv_portal.rate_bucket enable row level security;
revoke all on all tables in schema dv_portal from public,anon,authenticated;

create function public.dv_portal_receive(p_record jsonb,p_keys jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare r dv_portal.request; s dv_portal.subscriber; rid uuid; k text; win timestamptz; hits integer; i integer;
begin
 if p_record is null or p_keys is null or jsonb_typeof(p_record)<>'object' or jsonb_typeof(p_keys)<>'object' then raise exception 'invalid'; end if;
 if exists(select 1 from jsonb_object_keys(p_record) x where x not in ('kind','email','name','message','interest','submission_key','consent','purpose','source','source_url','notice_version','is_test'))
 or exists(select 1 from jsonb_object_keys(p_keys) x where x not in ('ip','email','payload')) then raise exception 'invalid'; end if;
 if coalesce(p_record->>'kind','') not in ('waitlist','contact')
 or coalesce(p_record->>'email','') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
 or length(p_record->>'email')>254 or p_record->>'email'<>lower(p_record->>'email')
 or length(coalesce(p_record->>'name',''))>100 or length(coalesce(p_record->>'message',''))>3000
 or coalesce(p_record->>'source','')<>'homepage' or coalesce(p_record->>'source_url','')<>'https://www.donventas.mx/'
 or coalesce(p_record->>'notice_version','')<>'portal-preview-2026-10-27-v1'
 or coalesce(jsonb_typeof(p_record->'is_test'),'')<>'boolean'
 or coalesce(p_record->>'submission_key','') !~* '^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$'
 or coalesce(p_keys->>'ip','') !~ '^[a-f0-9]{64}$' or coalesce(p_keys->>'email','') !~ '^[a-f0-9]{64}$' or coalesce(p_keys->>'payload','') !~ '^[a-f0-9]{64}$'
 then raise exception 'invalid'; end if;
 if p_record->>'kind'='waitlist' then
  if coalesce(p_record->>'purpose','')<>'portal_launch_offers' or (p_record->'consent') is distinct from 'true'::jsonb
  or coalesce(p_record->>'name','')<>'' or coalesce(p_record->>'message','')<>''
  or coalesce(p_record->>'interest','') not in ('','clarity','proposal','formats','brand') then raise exception 'invalid'; end if;
 else
  if coalesce(p_record->>'purpose','')<>'help_request' or (p_record->'consent') is distinct from 'false'::jsonb
  or length(trim(coalesce(p_record->>'message','')))<10 or coalesce(p_record->>'interest','')<>'' then raise exception 'invalid'; end if;
 end if;
 -- Global transaction lock makes key reuse, independent quotas and enqueue atomic.
 perform pg_advisory_xact_lock(742903119);
 select * into r from dv_portal.request where submission_key=(p_record->>'submission_key')::uuid;
 if found then
  if r.payload_hash<>p_keys->>'payload' then raise exception 'key_reused'; end if;
  return jsonb_build_object('accepted',true,'duplicate',true);
 end if;
 for i in 1..3 loop
  k:=case i when 1 then 'ip:'||(p_keys->>'ip') when 2 then 'email:'||(p_keys->>'email') else 'global' end;
  win:=case when i=1 then to_timestamp(floor(extract(epoch from now())/900)*900) else date_trunc('day',now() at time zone 'UTC') at time zone 'UTC' end;
  insert into dv_portal.rate_bucket values(k,win,1) on conflict(key,window_at) do update set hits=dv_portal.rate_bucket.hits+1 returning rate_bucket.hits into hits;
  if hits>(case i when 1 then 5 when 2 then 10 else 200 end) then raise exception 'rate_limited'; end if;
 end loop;
 insert into dv_portal.request(submission_key,kind,email,name,message,interest,purpose,source_url,notice_version,payload_hash,is_test)
 values((p_record->>'submission_key')::uuid,p_record->>'kind',p_record->>'email',coalesce(p_record->>'name',''),coalesce(p_record->>'message',''),coalesce(p_record->>'interest',''),p_record->>'purpose',p_record->>'source_url',p_record->>'notice_version',p_keys->>'payload',(p_record->>'is_test')::boolean) returning id into rid;
 if p_record->>'kind'='contact' then
  insert into dv_portal.outbox(request_id,kind,is_test) values(rid,'contact',(p_record->>'is_test')::boolean);
 else
  select * into s from dv_portal.subscriber where email=p_record->>'email' and is_test=(p_record->>'is_test')::boolean for update;
  if not found then
   insert into dv_portal.subscriber(email,is_test,state,notice_version) values(p_record->>'email',(p_record->>'is_test')::boolean,'pending',p_record->>'notice_version') returning * into s;
  elsif s.state in ('active','suppressed') or s.requested_at>now()-interval '1 day' then
   return jsonb_build_object('accepted',true,'duplicate',false);
  else
   update dv_portal.outbox set state='cancelled',updated_at=now() where subscriber_id=s.id and state in ('pending','retry');
   update dv_portal.subscriber set state='pending',generation=gen_random_uuid(),requested_at=now(),notice_version=p_record->>'notice_version',confirm_hash=null,unsubscribe_hash=null,confirm_expires_at=null,confirmed_at=null,withdrawn_at=null where id=s.id returning * into s;
  end if;
  insert into dv_portal.outbox(request_id,subscriber_id,generation,kind,is_test) values(rid,s.id,s.generation,'confirmation',s.is_test);
 end if;
 return jsonb_build_object('accepted',true,'duplicate',false);
end $$;

create function public.dv_portal_claim(p_test_only boolean default true) returns jsonb
language plpgsql security definer set search_path='' as $$
declare j dv_portal.outbox; r dv_portal.request; s dv_portal.subscriber;
begin
 update dv_portal.outbox set state='delivery_unknown',last_error='retry_window',updated_at=now()
 where (not p_test_only or is_test) and (state in ('pending','retry') or (state='sending' and lease_until<=now()))
 and (attempts>=5 or first_attempt_at<now()-interval '23 hours');
 select * into j from dv_portal.outbox where (not p_test_only or is_test) and
 ((state in ('pending','retry') and next_at<=now()) or (state='sending' and lease_until<=now())) order by created_at for update skip locked limit 1;
 if not found then return null; end if;
 if j.kind='confirmation' then
  select * into s from dv_portal.subscriber where id=j.subscriber_id;
  if s.state<>'pending' or s.generation<>j.generation then update dv_portal.outbox set state='cancelled',updated_at=now() where id=j.id; return null; end if;
 end if;
 update dv_portal.outbox set state='sending',lease=gen_random_uuid(),lease_until=now()+interval '2 minutes',attempts=attempts+1,first_attempt_at=coalesce(first_attempt_at,now()),updated_at=now() where id=j.id returning * into j;
 select * into r from dv_portal.request where id=j.request_id;
 return jsonb_build_object('id',j.id,'lease',j.lease,'kind',j.kind,'is_test',j.is_test,'email',r.email,'name',r.name,'message',r.message,'purpose',r.purpose,'source_url',r.source_url);
end $$;

create function public.dv_portal_prepare(p_id uuid,p_lease uuid,p_confirm_hash text,p_unsubscribe_hash text) returns boolean
language plpgsql security definer set search_path='' as $$
declare j dv_portal.outbox;
begin
 if coalesce(p_confirm_hash,'') !~ '^[a-f0-9]{64}$' or coalesce(p_unsubscribe_hash,'') !~ '^[a-f0-9]{64}$' or p_confirm_hash=p_unsubscribe_hash then return false; end if;
 select * into j from dv_portal.outbox where id=p_id and state='sending' and lease=p_lease and lease_until>now() for update;
 if not found or j.kind<>'confirmation' then return false; end if;
 update dv_portal.subscriber set confirm_hash=p_confirm_hash,unsubscribe_hash=p_unsubscribe_hash,confirm_expires_at=coalesce(confirm_expires_at,now()+interval '30 days')
 where id=j.subscriber_id and generation=j.generation and state='pending'
 and (confirm_hash is null or confirm_hash=p_confirm_hash) and (unsubscribe_hash is null or unsubscribe_hash=p_unsubscribe_hash);
 return found;
end $$;

create function public.dv_portal_finish(p_id uuid,p_lease uuid,p_provider_id text,p_error text default null) returns boolean
language plpgsql security definer set search_path='' as $$
begin
 if p_provider_id is not null and p_provider_id !~ '^[a-f0-9-]{36}$' then return false; end if;
 if p_error is not null and p_error not in ('provider','recipient','configuration','cancelled') then return false; end if;
 update dv_portal.outbox set state=case when p_provider_id is not null then 'accepted' when p_error='cancelled' then 'cancelled' when attempts>=5 then 'delivery_unknown' else 'retry' end,
 provider_id=p_provider_id,last_error=p_error,next_at=now()+interval '15 minutes',lease=null,lease_until=null,updated_at=now()
 where id=p_id and state='sending' and lease=p_lease and lease_until>now();
 return found;
end $$;

create function public.dv_portal_action(p_action text,p_hash text,p_test_only boolean default true) returns jsonb
language plpgsql security definer set search_path='' as $$
declare s dv_portal.subscriber;
begin
 if p_hash is null or p_hash !~ '^[a-f0-9]{64}$' or p_action not in ('confirm','unsubscribe') then return jsonb_build_object('ok',false); end if;
 select * into s from dv_portal.subscriber where (not p_test_only or is_test) and
 ((p_action='confirm' and confirm_hash=p_hash) or (p_action='unsubscribe' and unsubscribe_hash=p_hash)) for update;
 if not found then return jsonb_build_object('ok',false); end if;
 if p_action='confirm' then
  if s.state not in ('pending','active') or s.confirm_expires_at is null or s.confirm_expires_at<=now() then return jsonb_build_object('ok',false); end if;
  update dv_portal.subscriber set state='active',confirmed_at=coalesce(confirmed_at,now()) where id=s.id;
 else
  update dv_portal.subscriber set state=case when state='suppressed' then state else 'unsubscribed' end,withdrawn_at=coalesce(withdrawn_at,now()) where id=s.id;
  update dv_portal.outbox set state='cancelled',updated_at=now() where subscriber_id=s.id and state in ('pending','retry');
 end if;
 return jsonb_build_object('ok',true);
end $$;

-- Worker polls provider evidence; accepted is explicitly NOT delivered.
create function public.dv_portal_delivery(p_provider_id text,p_event text) returns boolean
language plpgsql security definer set search_path='' as $$
declare j dv_portal.outbox;
begin
 if p_event not in ('delivered','bounced','complained') then return false; end if;
 select * into j from dv_portal.outbox where provider_id=p_provider_id for update;
 if not found then return false; end if;
 if j.state='complained' or (j.state='bounced' and p_event='delivered') then return true; end if;
 update dv_portal.outbox set state=p_event,updated_at=now() where id=j.id;
 if p_event in ('bounced','complained') and j.subscriber_id is not null then
  update dv_portal.subscriber set state='suppressed' where id=j.subscriber_id;
  update dv_portal.outbox set state='cancelled',updated_at=now() where subscriber_id=j.subscriber_id and state in ('pending','retry');
 end if;
 return true;
end $$;

create function public.dv_portal_delivery_pending(p_test_only boolean default true) returns jsonb
language sql security definer set search_path='' as $$
 select coalesce(jsonb_agg(x),'[]'::jsonb) from (select provider_id from dv_portal.outbox where provider_id is not null and state in ('accepted','delivered') and created_at>now()-interval '30 days' and (not p_test_only or is_test) order by updated_at limit 20) x;
$$;
create function public.dv_portal_purge() returns void language plpgsql security definer set search_path='' as $$
begin
 delete from dv_portal.rate_bucket where window_at<now()-interval '2 days';
 delete from dv_portal.outbox where updated_at<now()-interval '30 days' and state in ('delivered','bounced','complained','failed','cancelled');
 delete from dv_portal.request where expires_at<=now();
 delete from dv_portal.subscriber where state='pending' and requested_at<now()-interval '30 days';
 -- Retain active consent / withdrawal / suppression evidence pending approved retention policy.
end $$;

revoke all on function public.dv_portal_receive(jsonb,jsonb),public.dv_portal_claim(boolean),public.dv_portal_prepare(uuid,uuid,text,text),public.dv_portal_finish(uuid,uuid,text,text),public.dv_portal_action(text,text,boolean),public.dv_portal_delivery(text,text),public.dv_portal_delivery_pending(boolean),public.dv_portal_purge() from public,anon,authenticated;
grant execute on function public.dv_portal_receive(jsonb,jsonb),public.dv_portal_claim(boolean),public.dv_portal_prepare(uuid,uuid,text,text),public.dv_portal_finish(uuid,uuid,text,text),public.dv_portal_action(text,text,boolean),public.dv_portal_delivery(text,text),public.dv_portal_delivery_pending(boolean),public.dv_portal_purge() to service_role;
commit;
