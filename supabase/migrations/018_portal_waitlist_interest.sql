-- Keep the chosen waitlist interest with the subscription, rather than the short-lived request.
begin;
alter table dv_portal.subscriber add column interest text not null default '' check(interest in ('','clarity','proposal','formats','brand'));
update dv_portal.subscriber s set interest=r.interest from dv_portal.outbox o join dv_portal.request r on r.id=o.request_id where o.subscriber_id=s.id and o.generation=s.generation and s.state in ('pending','active');
create or replace function public.dv_portal_receive(p_record jsonb,p_keys jsonb) returns jsonb
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
 or coalesce(p_record->>'notice_version','')<>(case when p_record->>'is_test'='true' then 'portal-preview-2026-10-27-v1' else 'portal-2026-10-28-v2' end)
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
   insert into dv_portal.subscriber(email,is_test,state,notice_version,interest) values(p_record->>'email',(p_record->>'is_test')::boolean,'pending',p_record->>'notice_version',coalesce(p_record->>'interest','')) returning * into s;
  elsif s.state in ('active','suppressed') or (s.state='pending' and s.requested_at>now()-interval '1 day') then
   if s.state='suppressed' then update dv_portal.request set interest='' where id=rid; end if;
   return jsonb_build_object('accepted',true,'duplicate',false);
  else
   update dv_portal.outbox set state='cancelled',updated_at=now() where subscriber_id=s.id and state in ('pending','retry');
   update dv_portal.subscriber set state='pending',generation=gen_random_uuid(),requested_at=now(),notice_version=p_record->>'notice_version',interest=coalesce(p_record->>'interest',''),confirm_hash=null,unsubscribe_hash=null,confirm_expires_at=null,confirmed_at=null,withdrawn_at=null where id=s.id returning * into s;
  end if;
  insert into dv_portal.outbox(request_id,subscriber_id,generation,kind,is_test) values(rid,s.id,s.generation,'confirmation',s.is_test);
 end if;
 return jsonb_build_object('accepted',true,'duplicate',false);
end $$;
revoke all on function public.dv_portal_receive(jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.dv_portal_receive(jsonb,jsonb) to service_role;

create or replace function public.dv_portal_action(p_action text,p_hash text,p_test_only boolean default true) returns jsonb
language plpgsql security definer set search_path='' as $$
declare s dv_portal.subscriber;
begin
 if p_hash is null or p_hash !~ '^[a-f0-9]{64}$' or p_action not in ('confirm','unsubscribe') then return jsonb_build_object('ok',false); end if;
 perform pg_advisory_xact_lock(742903119);
 select * into s from dv_portal.subscriber where is_test=p_test_only and
 ((p_action='confirm' and confirm_hash=p_hash) or (p_action='unsubscribe' and unsubscribe_hash=p_hash)) for update;
 if not found then return jsonb_build_object('ok',false); end if;
 if p_action='confirm' then
  if s.state not in ('pending','active') or s.confirm_expires_at is null or s.confirm_expires_at<=now() then return jsonb_build_object('ok',false); end if;
  update dv_portal.subscriber set state='active',confirmed_at=coalesce(confirmed_at,now()) where id=s.id;
 else
  update dv_portal.subscriber set state=case when state='suppressed' then state else 'unsubscribed' end,
   withdrawn_at=coalesce(withdrawn_at,now()),interest='',confirm_hash=null,confirm_expires_at=null where id=s.id;
  update dv_portal.request set interest='' where kind='waitlist' and email=s.email and is_test=s.is_test;
  update dv_portal.outbox set state='cancelled',updated_at=now() where subscriber_id=s.id and state in ('pending','retry');
 end if;
 return jsonb_build_object('ok',true);
end $$;
revoke all on function public.dv_portal_action(text,text,boolean) from public,anon,authenticated;
grant execute on function public.dv_portal_action(text,text,boolean) to service_role;

create or replace function public.dv_portal_delivery(p_provider_id text,p_event text) returns boolean
language plpgsql security definer set search_path='' as $$
declare j dv_portal.outbox;
begin
 if p_event not in ('delivered','bounced','complained') then return false; end if;
 perform pg_advisory_xact_lock(742903119);
 select * into j from dv_portal.outbox where provider_id=p_provider_id for update;
 if not found then return false; end if;
 if j.state='complained' or (j.state='bounced' and p_event='delivered') then return true; end if;
 update dv_portal.outbox set state=p_event,updated_at=now() where id=j.id;
 if p_event in ('bounced','complained') and j.subscriber_id is not null then
  update dv_portal.subscriber set state='suppressed',interest='' where id=j.subscriber_id and generation=j.generation;
  if found then
   update dv_portal.request r set interest='' from dv_portal.subscriber s where s.id=j.subscriber_id and r.kind='waitlist' and r.email=s.email and r.is_test=s.is_test;
   update dv_portal.outbox set state='cancelled',updated_at=now() where subscriber_id=j.subscriber_id and generation=j.generation and state in ('pending','retry');
  end if;
 end if;
 return true;
end $$;

revoke all on function public.dv_portal_delivery(text,text) from public,anon,authenticated;
grant execute on function public.dv_portal_delivery(text,text) to service_role;
create or replace function public.dv_portal_prepare(p_id uuid,p_lease uuid,p_confirm_hash text,p_unsubscribe_hash text) returns boolean
language plpgsql security definer set search_path='' as $$
declare j dv_portal.outbox;
begin
 perform pg_advisory_xact_lock(742903119);
 if coalesce(p_confirm_hash,'') !~ '^[a-f0-9]{64}$' or coalesce(p_unsubscribe_hash,'') !~ '^[a-f0-9]{64}$' or p_confirm_hash=p_unsubscribe_hash then return false; end if;
 select * into j from dv_portal.outbox where id=p_id and state='sending' and lease=p_lease and lease_until>now() for update;
 if not found or j.kind<>'confirmation' then return false; end if;
 update dv_portal.subscriber set confirm_hash=p_confirm_hash,unsubscribe_hash=p_unsubscribe_hash,confirm_expires_at=coalesce(confirm_expires_at,now()+interval '30 days')
 where id=j.subscriber_id and generation=j.generation and state='pending'
 and (confirm_hash is null or confirm_hash=p_confirm_hash) and (unsubscribe_hash is null or unsubscribe_hash=p_unsubscribe_hash);
 return found;
end $$;


create or replace function public.dv_portal_purge() returns void
language plpgsql security definer set search_path='' as $$
begin
 perform pg_advisory_xact_lock(742903119);
 delete from dv_portal.rate_bucket where window_at<now()-interval '2 days';
 delete from dv_portal.request r where r.expires_at<=now() or
   (r.kind='waitlist' and r.created_at<now()-interval '30 days' and not exists (
    select 1 from dv_portal.outbox o join dv_portal.subscriber s on s.id=o.subscriber_id
    where o.request_id=r.id and s.state='active' and s.generation=o.generation));
 delete from dv_portal.outbox o where o.updated_at<now()-interval '30 days' and o.state in ('delivered','bounced','complained','failed','cancelled')
   and not exists (select 1 from dv_portal.subscriber s join dv_portal.request r on r.id=o.request_id
    where s.id=o.subscriber_id and s.state='active' and s.generation=o.generation and r.expires_at>now());
 delete from dv_portal.subscriber where state='pending' and requested_at<now()-interval '30 days';
end $$;

revoke all on function public.dv_portal_prepare(uuid,uuid,text,text),public.dv_portal_purge() from public,anon,authenticated;
grant execute on function public.dv_portal_prepare(uuid,uuid,text,text),public.dv_portal_purge() to service_role;
commit;
