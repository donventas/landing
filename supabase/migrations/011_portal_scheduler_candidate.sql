-- Candidate only. Do not apply until reviewed and the two Portal-only Vault
-- entries exist. This test schedule cannot claim or send live records because
-- the independently deployed worker must remain in test mode.
-- Does not change the existing blog jobs, functions, credentials or schedules.
begin;
create function dv_portal.dispatch_test_due() returns bigint
language plpgsql security definer set search_path='' as $$
declare gateway text; worker text; request_id bigint;
begin
 if not exists(select 1 from dv_portal.outbox where is_test and
   ((state in ('pending','retry') and next_at<=now()) or
    (state='sending' and lease_until<=now()))) then return null; end if;
 select decrypted_secret into gateway from vault.decrypted_secrets where name='portal_worker_anon_jwt';
 select decrypted_secret into worker from vault.decrypted_secrets where name='portal_worker_test_key';
 if gateway is null or coalesce(length(worker),0)<32 then return null; end if;
 select net.http_post(
   url:='https://hlabhmegjnrjygsywnqa.supabase.co/functions/v1/portal-worker',
   headers:=jsonb_build_object('Authorization','Bearer '||gateway,'x-dv-worker-key',worker,'Content-Type','application/json'),
   body:='{}'::jsonb,timeout_milliseconds:=30000) into request_id;
 return request_id;
end $$;
revoke all on function dv_portal.dispatch_test_due() from public,anon,authenticated,service_role;
-- Schedule intentionally absent. Live dispatch and retention require separate
-- review; this candidate alone does not authorize them or make them operational.
commit;
