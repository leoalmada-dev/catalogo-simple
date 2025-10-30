-- =========================
-- EXTENSIONES (idempotentes)
-- =========================
create extension if not exists pgcrypto;   -- gen_random_uuid()
create extension if not exists unaccent;   -- normalizar texto
create extension if not exists pg_trgm;    -- búsquedas fuzzy (opcional)

-- =========================
-- HELPERS / TRIGGERS COMUNES
-- =========================
create or replace function catalogo_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- =========================
-- ENUMS
-- =========================
do $$
begin
  if not exists (select 1 from pg_type where typname = 'catalogo_product_status') then
    create type catalogo_product_status as enum ('draft','published','archived');
  end if;
end $$;

-- =========================
-- PERFILES / ROLES APP
-- =========================
create table if not exists catalogo_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','editor')),
  created_at timestamptz not null default now()
);
comment on table catalogo_profiles is 'Roles de aplicación para RLS (owner/editor).';

-- =========================
-- CATEGORÍAS
-- =========================
create table if not exists catalogo_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  parent_id uuid null references catalogo_categories(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_categories_updated on catalogo_categories;
create trigger trg_categories_updated
before update on catalogo_categories
for each row execute function catalogo_set_updated_at();

-- =========================
-- PRODUCTOS (FTS y nombre sin acentos por triggers)
-- =========================
create table if not exists catalogo_products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  name_unaccent text,                           -- <— NUEVA columna normalizada
  description text,
  status catalogo_product_status not null default 'draft',
  search_fts tsvector,                           -- columna normal (no generada)
  show_prices_override boolean null,             -- override por producto (null = usa config global)
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- asegurar columnas si la tabla venía de una versión previa
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name='catalogo_products' and column_name='search_fts'
  ) then
    alter table catalogo_products add column search_fts tsvector;
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_name='catalogo_products' and column_name='name_unaccent'
  ) then
    alter table catalogo_products add column name_unaccent text;
  end if;
end $$;

drop trigger if exists trg_products_updated on catalogo_products;
create trigger trg_products_updated
before update on catalogo_products
for each row execute function catalogo_set_updated_at();

-- sincroniza FTS y nombre sin acentos
create or replace function catalogo_products_fts_sync()
returns trigger language plpgsql as $$
begin
  new.name_unaccent :=
    unaccent(coalesce(new.name,''));
  new.search_fts :=
    to_tsvector('spanish', unaccent(coalesce(new.name,'') || ' ' || coalesce(new.description,'')));
  return new;
end $$;

drop trigger if exists trg_products_fts on catalogo_products;
create trigger trg_products_fts
before insert or update of name, description
on catalogo_products
for each row execute function catalogo_products_fts_sync();

-- índices
create index if not exists idx_products_status       on catalogo_products(status);
create index if not exists idx_products_created_at   on catalogo_products(created_at desc);
create index if not exists idx_products_fts          on catalogo_products using gin (search_fts);
-- Fuzzy/autocompletar sin función en el índice (evita IMMUTABLE)
create index if not exists idx_products_name_trgm    on catalogo_products using gin (name_unaccent gin_trgm_ops);

-- =========================
-- PIVOT PRODUCTOS↔CATEGORÍAS
-- =========================
create table if not exists catalogo_product_categories (
  product_id uuid not null references catalogo_products(id) on delete cascade,
  category_id uuid not null references catalogo_categories(id) on delete cascade,
  primary key (product_id, category_id)
);
create index if not exists idx_prodcat_category on catalogo_product_categories(category_id, product_id);

-- =========================
-- VARIANTES
-- =========================
create table if not exists catalogo_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references catalogo_products(id) on delete cascade,
  sku text not null unique,
  name text,
  price_cents integer not null default 0 check (price_cents >= 0),
  is_available boolean not null default true,
  stock integer not null default 0 check (stock >= 0),
  attributes jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_variants_product      on catalogo_variants(product_id);
create index if not exists idx_variants_price_cents  on catalogo_variants(price_cents);
create index if not exists idx_variants_available    on catalogo_variants(is_available);

drop trigger if exists trg_variants_updated on catalogo_variants;
create trigger trg_variants_updated
before update on catalogo_variants
for each row execute function catalogo_set_updated_at();

-- =========================
-- IMÁGENES
-- =========================
create table if not exists catalogo_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references catalogo_products(id) on delete cascade,
  path text not null,        -- ruta en Storage (ej. 'products/sku-abc.jpg')
  alt text,
  is_primary boolean not null default false,
  position int not null default 1,
  created_at timestamptz not null default now()
);
create index if not exists idx_images_product_order
  on catalogo_images(product_id, is_primary desc, position asc);

-- =========================
-- CONFIG GLOBAL (singleton id=1)
-- =========================
create table if not exists catalogo_config (
  id smallint primary key default 1 check (id = 1),
  show_prices boolean not null default true,
  currency_code text not null default 'UYU',
  whatsapp text null,
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_config_updated on catalogo_config;
create trigger trg_config_updated
before update on catalogo_config
for each row execute function catalogo_set_updated_at();

-- =========================
-- VISTA PÚBLICA (recrear)
-- =========================
drop view if exists catalogo_v_products_public;

create view catalogo_v_products_public as
select
  p.id,
  p.slug,
  p.name,
  p.description,
  p.created_at,
  p.updated_at,
  coalesce(p.show_prices_override, cfg.show_prices) as effective_show_prices,
  mp.min_price_cents,
  case when coalesce(p.show_prices_override, cfg.show_prices)
       then (mp.min_price_cents / 100.0)::numeric(10,2) else null end as min_price_visible,
  img.path as primary_image
from catalogo_products p
cross join (select show_prices from catalogo_config where id = 1) cfg
left join lateral (
  select min(v.price_cents) as min_price_cents
  from catalogo_variants v
  where v.product_id = p.id and v.is_available = true
) mp on true
left join lateral (
  select i.path
  from catalogo_images i
  where i.product_id = p.id
  order by i.is_primary desc, i.position asc
  limit 1
) img on true
where p.status = 'published';
