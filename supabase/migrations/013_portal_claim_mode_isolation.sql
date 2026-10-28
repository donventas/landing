-- Candidate for release: test and live workers must never claim each other's jobs.
-- This changes no mode, credential or schedule by itself.
begin;
create or replace function public.dv_portal_claim(p_test_only boolean default true) returns jsonb
language plpgsql security definer set search_path='' as $$
declare j dv_portal.outbox; r dv_portal.request; s dv_portal.subscriber;
begin
 update dv_portal.outbox set state='delivery_unknown',last_error='retry_window',updated_at=now()
 where is_test=p_test_only and (state in ('pending','retry') or (state='sending' and lease_until<=now()))
 and (attempts>=5 or first_attempt_at<now()-interval '23 hours');
 select * into j from dv_portal.outbox where is_test=p_test_only and
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
revoke all on function public.dv_portal_claim(boolean) from public,anon,authenticated;
grant execute on function public.dv_portal_claim(boolean) to service_role;
commit;
