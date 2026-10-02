-- Ejecutar únicamente durante el release, después de configurar en Vercel
-- SUPABASE_LEAD_KEY o SUPABASE_SERVICE_ROLE_KEY para la función /api/lead.
-- Evita que un navegador omita la validación del servidor e inserte directamente.

begin;

revoke insert on table public.lead from public;
revoke insert on table public.lead from anon;
revoke insert on table public.lead from authenticated;
grant insert on table public.lead to service_role;

commit;
