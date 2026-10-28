-- Candidate only: never apply without release review. Does not alter blog functions.
begin;
create function public.dv_portal_webhook_delivery(p_provider_id text,p_event text,p_test_only boolean)
returns boolean language plpgsql security definer set search_path='' as $$
begin
 if p_test_only is null or not exists(select 1 from dv_portal.outbox where provider_id=p_provider_id and (not p_test_only or is_test)) then return false; end if;
 return public.dv_portal_delivery(p_provider_id,p_event);
end $$;
revoke all on function public.dv_portal_webhook_delivery(text,text,boolean) from public,anon,authenticated;
grant execute on function public.dv_portal_webhook_delivery(text,text,boolean) to service_role;
commit;
