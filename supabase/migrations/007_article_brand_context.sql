-- PREPARED ONLY: apply with explicit release authorization, before enabling the gift.
-- Add one article to the existing RPC allowlist; retain quotas, grants, retention,
-- idempotency and the rest of the live function verbatim. Fail on schema drift.
begin;
do $migration$
declare
  definition text;
  old_clause text := $old$'como-aparecer-en-google') then raise exception 'article_invalid'$old$;
  new_clause text := $new$'como-aparecer-en-google','como-aplicar-identidad-visual') then raise exception 'article_invalid'$new$;
begin
  -- Migration 005 renamed the guarded intake to _v1 and added a public wrapper.
  -- Update the guarded body, not the wrapper that also manages opt-in receipts.
  definition := pg_catalog.pg_get_functiondef('public.dv_article_receive_v1(jsonb,jsonb,jsonb)'::regprocedure);
  if position(new_clause in definition) > 0 then
    return;
  end if;
  if position(old_clause in definition) = 0 then
    raise exception 'article_allowlist_drift: review current RPC before applying migration 007';
  end if;
  execute replace(definition, old_clause, new_clause);
end;
$migration$;
commit;
