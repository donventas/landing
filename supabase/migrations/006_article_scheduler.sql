-- Automation and retention authorized by Arturo on 2026-10-09.
-- Requires reviewed cron/pg_net enablement
-- and two named Vault entries created through the dashboard, never in SQL text:
-- article_comments_anon_jwt (public gateway JWT), article_comments_worker_key.
-- No privileged Supabase API credential is required in Vault or Vercel.
begin;
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;
create function dv_comments.dispatch_due() returns bigint
language plpgsql security definer set search_path='' as $$
declare gateway text; worker text; request_id bigint;
begin
  if not exists(select 1 from dv_comments.outbox where
    (state in ('pending','retry') and next_at<=now()) or (state='sending' and lease_until<=now()))
    and not exists(select 1 from dv_comments.confirmation_outbox where
    (state in ('pending','retry') and next_at<=now()) or (state='sending' and lease_until<=now())) then return null; end if;
  select decrypted_secret into gateway from vault.decrypted_secrets where name='article_comments_anon_jwt';
  select decrypted_secret into worker from vault.decrypted_secrets where name='article_comments_worker_key';
  if gateway is null or coalesce(length(worker),0)<32 then return null; end if;
  select net.http_post(
    url:='https://hlabhmegjnrjygsywnqa.supabase.co/functions/v1/article-comment-worker',
    headers:=jsonb_build_object('Authorization','Bearer '||gateway,'x-dv-worker-key',worker,'Content-Type','application/json'),
    body:='{}'::jsonb,timeout_milliseconds:=30000) into request_id;
  return request_id;
end $$;
revoke all on function dv_comments.dispatch_due() from public,anon,authenticated,service_role;
select cron.schedule('dv-article-delivery','* * * * *','select dv_comments.dispatch_due();');
-- Daily 09:20 UTC; only the bounded retention rules from migrations 003-005.
select cron.schedule('dv-article-retention','20 9 * * *','select public.dv_article_purge();');
commit;
