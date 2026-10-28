-- Candidate only: bind each mode to the privacy notice actually shown.
begin;
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
revoke all on function public.dv_portal_receive(jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.dv_portal_receive(jsonb,jsonb) to service_role;
commit;
