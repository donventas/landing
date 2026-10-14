-- Release addition only; preserve every other intake safeguard and permission.
begin;
do $migration$
declare
  definition text;
  old_clause text := $old$'como-aplicar-identidad-visual') then raise exception 'article_invalid'$old$;
  new_clause text := $new$'como-aplicar-identidad-visual','como-crear-una-marca') then raise exception 'article_invalid'$new$;
begin
  definition := pg_catalog.pg_get_functiondef('public.dv_article_receive_v1(jsonb,jsonb,jsonb)'::regprocedure);
  if position(new_clause in definition) > 0 then return; end if;
  if position(old_clause in definition) = 0 then
    raise exception 'article_allowlist_drift: review current RPC before applying migration 008';
  end if;
  execute replace(definition, old_clause, new_clause);
end;
$migration$;
commit;
