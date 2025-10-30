-- Activar RLS (idempotente)
alter table catalogo_categories           enable row level security;
alter table catalogo_products             enable row level security;
alter table catalogo_product_categories   enable row level security;
alter table catalogo_variants             enable row level security;
alter table catalogo_images               enable row level security;
alter table catalogo_profiles             enable row level security;
alter table catalogo_config               enable row level security;

-- Helper: ¿usuario del equipo (owner/editor)?
create or replace function catalogo_is_team()
returns boolean language sql stable as $$
  select exists (
    select 1 from catalogo_profiles pr
    where pr.user_id = auth.uid() and pr.role in ('owner','editor')
  );
$$;

-- === PROFILES ===
drop policy if exists read_own_profile on catalogo_profiles;
drop policy if exists team_manage_profiles on catalogo_profiles;

create policy read_own_profile
on catalogo_profiles for select
using (auth.uid() = user_id);

create policy team_manage_profiles
on catalogo_profiles for all
using (catalogo_is_team())
with check (catalogo_is_team());

-- === CONFIG ===
drop policy if exists public_read_config on catalogo_config;
drop policy if exists team_update_config on catalogo_config;

create policy public_read_config
on catalogo_config for select
using (true);

create policy team_update_config
on catalogo_config for update
using (catalogo_is_team())
with check (catalogo_is_team());

-- === CATEGORIES ===
drop policy if exists public_read_categories on catalogo_categories;
drop policy if exists team_write_categories on catalogo_categories;
drop policy if exists team_update_categories on catalogo_categories;
drop policy if exists team_delete_categories on catalogo_categories;

create policy public_read_categories
on catalogo_categories for select using (true);

create policy team_write_categories
on catalogo_categories for insert with check (catalogo_is_team());

create policy team_update_categories
on catalogo_categories for update
using (catalogo_is_team())
with check (catalogo_is_team());

create policy team_delete_categories
on catalogo_categories for delete
using (catalogo_is_team());

-- === PRODUCTS ===
drop policy if exists public_read_published_products on catalogo_products;
drop policy if exists team_read_all_products on catalogo_products;
drop policy if exists team_insert_products on catalogo_products;
drop policy if exists team_update_products on catalogo_products;
drop policy if exists team_delete_products on catalogo_products;

create policy public_read_published_products
on catalogo_products for select using (status = 'published');

create policy team_read_all_products
on catalogo_products for select using (catalogo_is_team());

create policy team_insert_products
on catalogo_products for insert with check (catalogo_is_team());

create policy team_update_products
on catalogo_products for update
using (catalogo_is_team())
with check (catalogo_is_team());

create policy team_delete_products
on catalogo_products for delete using (catalogo_is_team());

-- === VARIANTS ===
drop policy if exists public_read_variants_of_published_products on catalogo_variants;
drop policy if exists team_crud_variants on catalogo_variants;

create policy public_read_variants_of_published_products
on catalogo_variants for select
using (exists (
  select 1 from catalogo_products p
  where p.id = catalogo_variants.product_id and p.status = 'published'
));

create policy team_crud_variants
on catalogo_variants for all
using (catalogo_is_team())
with check (catalogo_is_team());

-- === IMAGES ===
drop policy if exists public_read_images_of_published_products on catalogo_images;
drop policy if exists team_crud_images on catalogo_images;

create policy public_read_images_of_published_products
on catalogo_images for select
using (exists (
  select 1 from catalogo_products p
  where p.id = catalogo_images.product_id and p.status = 'published'
));

create policy team_crud_images
on catalogo_images for all
using (catalogo_is_team())
with check (catalogo_is_team());

-- === PRODUCT-CATEGORIES ===
drop policy if exists public_read_pc_of_published on catalogo_product_categories;
drop policy if exists team_crud_pc on catalogo_product_categories;

create policy public_read_pc_of_published
on catalogo_product_categories for select
using (exists (
  select 1 from catalogo_products p
  where p.id = catalogo_product_categories.product_id and p.status = 'published'
));

create policy team_crud_pc
on catalogo_product_categories for all
using (catalogo_is_team())
with check (catalogo_is_team());
