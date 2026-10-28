-- Preserve the active consent link until its request expires; isolate delivery modes.
begin;
create or replace function public.dv_portal_purge() returns void
language plpgsql security definer set search_path='' as $$
begin
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
create or replace function public.dv_portal_delivery_pending(p_test_only boolean default true) returns jsonb
language sql security definer set search_path='' as $$
 select coalesce(jsonb_agg(x),'[]'::jsonb) from (select provider_id from dv_portal.outbox where provider_id is not null and state in ('accepted','delivered') and created_at>now()-interval '30 days' and is_test=p_test_only order by updated_at limit 20) x;
$$;
create or replace function public.dv_portal_webhook_delivery(p_provider_id text,p_event text,p_test_only boolean)
returns boolean language plpgsql security definer set search_path='' as $$
begin
 if p_test_only is null or not exists(select 1 from dv_portal.outbox where provider_id=p_provider_id and is_test=p_test_only) then return false; end if;
 return public.dv_portal_delivery(p_provider_id,p_event);
end $$;
revoke all on function public.dv_portal_purge(),public.dv_portal_delivery_pending(boolean),public.dv_portal_webhook_delivery(text,text,boolean) from public,anon,authenticated;
grant execute on function public.dv_portal_purge(),public.dv_portal_delivery_pending(boolean),public.dv_portal_webhook_delivery(text,text,boolean) to service_role;
commit;
