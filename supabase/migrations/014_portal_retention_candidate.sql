-- Candidate only: do not apply or schedule until the retention policy is approved.
-- Removes unconfirmed request data as well as the pending subscriber after 30 days.
begin;
create or replace function public.dv_portal_purge() returns void
language plpgsql security definer set search_path='' as $$
begin
 delete from dv_portal.rate_bucket where window_at<now()-interval '2 days';
 delete from dv_portal.request r where r.expires_at<=now() or
   (r.kind='waitlist' and r.created_at<now()-interval '30 days' and not exists (
    select 1 from dv_portal.outbox o join dv_portal.subscriber s on s.id=o.subscriber_id
    where o.request_id=r.id and s.state='active' and s.generation=o.generation));
 delete from dv_portal.outbox where updated_at<now()-interval '30 days' and state in ('delivered','bounced','complained','failed','cancelled');
 delete from dv_portal.subscriber where state='pending' and requested_at<now()-interval '30 days';
 -- Active subscriptions and minimum withdrawal/suppression evidence remain;
 -- the approved policy and access process govern their later removal.
end $$;
revoke all on function public.dv_portal_purge() from public,anon,authenticated;
grant execute on function public.dv_portal_purge() to service_role;
commit;
