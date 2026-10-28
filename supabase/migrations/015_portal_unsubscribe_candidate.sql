-- Candidate only: minimise confirmation material upon withdrawal and isolate modes.
begin;
create or replace function public.dv_portal_action(p_action text,p_hash text,p_test_only boolean default true) returns jsonb
language plpgsql security definer set search_path='' as $$
declare s dv_portal.subscriber;
begin
 if p_hash is null or p_hash !~ '^[a-f0-9]{64}$' or p_action not in ('confirm','unsubscribe') then return jsonb_build_object('ok',false); end if;
 select * into s from dv_portal.subscriber where is_test=p_test_only and
 ((p_action='confirm' and confirm_hash=p_hash) or (p_action='unsubscribe' and unsubscribe_hash=p_hash)) for update;
 if not found then return jsonb_build_object('ok',false); end if;
 if p_action='confirm' then
  if s.state not in ('pending','active') or s.confirm_expires_at is null or s.confirm_expires_at<=now() then return jsonb_build_object('ok',false); end if;
  update dv_portal.subscriber set state='active',confirmed_at=coalesce(confirmed_at,now()) where id=s.id;
 else
  update dv_portal.subscriber set state=case when state='suppressed' then state else 'unsubscribed' end,
   withdrawn_at=coalesce(withdrawn_at,now()),confirm_hash=null,confirm_expires_at=null where id=s.id;
  update dv_portal.outbox set state='cancelled',updated_at=now() where subscriber_id=s.id and state in ('pending','retry');
 end if;
 return jsonb_build_object('ok',true);
end $$;
revoke all on function public.dv_portal_action(text,text,boolean) from public,anon,authenticated;
grant execute on function public.dv_portal_action(text,text,boolean) to service_role;
commit;
