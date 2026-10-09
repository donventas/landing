-- PREPARED ONLY. Do not apply to a shared/production project without release approval.
-- Separate from public.lead and the CRM. service_role RPC only; no client table access.
begin;
create schema if not exists dv_comments;
revoke all on schema dv_comments from public, anon, authenticated;
create table dv_comments.message (
  id uuid primary key,
  submission_key uuid not null unique,
  payload_hash text not null check (payload_hash ~ '^[a-f0-9]{64}$'),
  article_id text not null,
  article_title text not null,
  article_url text not null check (article_url ~ '^https://www[.]donventas[.]mx/blog/[a-z0-9-]+[.]html$'),
  message text not null check (char_length(btrim(message)) between 1 and 5000),
  email text not null check (char_length(email) between 3 and 254),
  name text not null default '' check (char_length(name) <= 100),
  source text not null default 'blog_private_comment' check (source = 'blog_private_comment'),
  classification text not null default 'pending_classification' check (classification in ('pending_classification','in_progress','closed')),
  notice_version text not null,
  received_at timestamptz not null default now(),
  closed_at timestamptz,
  expires_at timestamptz not null default now() + interval '180 days'
);
create table dv_comments.outbox (
  message_id uuid primary key references dv_comments.message(id) on delete cascade,
  state text not null default 'pending' check (state in ('pending','sending','retry','accepted','delivered','delayed','bounced','failed','complained','delivery_unknown','simulated')),
  attempts integer not null default 0,
  first_attempt_at timestamptz,
  next_at timestamptz not null default now(),
  lease uuid,
  lease_until timestamptz,
  provider_id text unique,
  event_at timestamptz,
  error_code text
);
create table dv_comments.subscription_intent (
  message_id uuid primary key references dv_comments.message(id) on delete cascade,
  email text not null,
  state text not null default 'pending_confirmation' check (state = 'pending_confirmation'),
  copy text not null,
  version text not null,
  requested_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '30 days'
);
create table dv_comments.rate_bucket (
  key text primary key,
  count integer not null,
  expires_at timestamptz not null
);
create table dv_comments.delivery_event (
  id text primary key,
  message_id uuid not null references dv_comments.message(id) on delete cascade,
  state text not null,
  occurred_at timestamptz not null,
  received_at timestamptz not null default now()
);
create index on dv_comments.message(expires_at);
create index on dv_comments.outbox(next_at) where state in ('pending','retry','sending');
alter table dv_comments.message enable row level security;
alter table dv_comments.outbox enable row level security;
alter table dv_comments.subscription_intent enable row level security;
alter table dv_comments.rate_bucket enable row level security;
alter table dv_comments.delivery_event enable row level security;
revoke all on all tables in schema dv_comments from public, anon, authenticated;

-- Atomic idempotence, independent quotas and receipt+outbox. Small-volume global
-- advisory lock is deliberate: all workers share one budget, unlike a memory Map.
create function public.dv_article_receive(p_record jsonb, p_keys jsonb, p_opt_in jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  prior dv_comments.message%rowtype;
  quota record;
  current_count integer;
  mid uuid := (p_record->>'id')::uuid;
begin
  perform pg_catalog.pg_advisory_xact_lock(742903118);
  select * into prior from dv_comments.message where submission_key = (p_record->>'submission_key')::uuid;
  if found then
    if prior.payload_hash <> p_record->>'payload_hash' then raise exception 'key_reused'; end if;
    return jsonb_build_object('duplicate', true);
  end if;
  if coalesce(p_keys->>'ip','') !~ '^[a-f0-9]{64}$' or coalesce(p_keys->>'email','') !~ '^[a-f0-9]{64}$' then raise exception 'invalid'; end if;
  if (p_record->>'article_id') not in ('por-que-nacio-don-ventas','contenido-que-atrae-clientes','tu-marca-es-tu-ventaja','manual-de-marca','logotipos-mitos','diseno-editorial','como-aparecer-en-google') then raise exception 'article_invalid'; end if;
  delete from dv_comments.rate_bucket where expires_at <= now();
  for quota in select * from (values
    ('ip:' || (p_keys->>'ip'), 5, interval '15 minutes'),
    ('email:' || (p_keys->>'email'), 10, interval '1 day'),
    ('global', 200, interval '1 day')) as q(key, maximum, duration)
  loop
    insert into dv_comments.rate_bucket(key,count,expires_at) values(quota.key,1,now()+quota.duration)
      on conflict(key) do update set count = dv_comments.rate_bucket.count + 1 returning count into current_count;
    if current_count > quota.maximum then raise exception 'rate_limited'; end if;
  end loop;
  insert into dv_comments.message(id,submission_key,payload_hash,article_id,article_title,article_url,message,email,name,notice_version)
    values(mid,(p_record->>'submission_key')::uuid,p_record->>'payload_hash',p_record->>'article_id',p_record->>'article_title',p_record->>'article_url',p_record->>'message',p_record->>'email',p_record->>'name',p_record->>'notice_version');
  insert into dv_comments.outbox(message_id) values(mid);
  if p_record->'newsletter' = 'true'::jsonb then
    insert into dv_comments.subscription_intent(message_id,email,copy,version) values(mid,p_record->>'email',p_opt_in->>'copy',p_opt_in->>'version');
  end if;
  return jsonb_build_object('duplicate', false);
end $$;
revoke all on function public.dv_article_receive(jsonb,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.dv_article_receive(jsonb,jsonb,jsonb) to service_role;

-- Callable by a protected maintenance job; never by the browser.
create function public.dv_article_purge() returns bigint
language plpgsql security definer set search_path = '' as $$
declare total bigint;
begin
  delete from dv_comments.message where expires_at <= now(); get diagnostics total = row_count;
  delete from dv_comments.subscription_intent where expires_at <= now();
  delete from dv_comments.rate_bucket where expires_at <= now();
  delete from dv_comments.delivery_event where received_at < now() - interval '30 days';
  return total;
end $$;
revoke all on function public.dv_article_purge() from public,anon,authenticated;
grant execute on function public.dv_article_purge() to service_role;
commit;
