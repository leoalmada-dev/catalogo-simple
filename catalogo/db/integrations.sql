-- catalogo/db/integrations.sql

create table if not exists catalogo_events (
  id uuid primary key default gen_random_uuid(),
  ts timestamptz not null default now(),
  event text not null,                          -- ej: 'cta_whatsapp_click'
  product_id uuid null,
  variant_id uuid null,
  src text null,                                -- 'home' | 'category' | 'product' | etc
  utm_source text null,
  utm_medium text null,
  utm_campaign text null,
  ref text null,                                -- referrer
  ip_hash text null,                            -- opcional (ver server route)
  ua text null                                  -- opcional (user-agent)
);

comment on table catalogo_events is 'Eventos simples para reporting (clics WhatsApp, etc).';

-- RLS: los inserts los hace el server con service role. Podemos dejar RLS desactivado.
alter table catalogo_events disable row level security;
