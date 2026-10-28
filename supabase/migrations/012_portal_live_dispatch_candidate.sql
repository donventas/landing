-- Candidate only: no schedule and no change to the test worker or blog.
-- Provision the dedicated live Vault values and review release ordering before use.
begin;
create function dv_portal.dispatch_live_due() returns bigint
language plpgsql security definer set search_path='' as $$
declare gateway text; worker text; request_id bigint;
begin
 if not exists(select 1 from dv_portal.outbox where not is_test and
   ((state in ('pending','retry') and next_at<=now()) or
    (state='sending' and lease_until<=now()))) then return null; end if;
 select decrypted_secret into gateway from vault.decrypted_secrets where name='portal_live_anon_jwt';
 select decrypted_secret into worker from vault.decrypted_secrets where name='portal_live_worker_key';
 if gateway is null or coalesce(length(worker),0)<32 then return null; end if;
 select net.http_post(
   url:='https://hlabhmegjnrjygsywnqa.supabase.co/functions/v1/portal-worker',
   headers:=jsonb_build_object('Authorization','Bearer '||gateway,'x-dv-worker-key',worker,'Content-Type','application/json'),
   body:='{}'::jsonb,timeout_milliseconds:=30000) into request_id;
 return request_id;
end $$;
revoke all on function dv_portal.dispatch_live_due() from public,anon,authenticated,service_role;
-- No live job or purge schedule is created by this candidate.
commit;
