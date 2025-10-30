-- ========== CONFIG (upsert) ==========
insert into catalogo_config (id, show_prices, currency_code, whatsapp)
values (1, true, 'UYU', '5989XXXXXXX')
on conflict (id) do update
  set show_prices = excluded.show_prices,
      currency_code = excluded.currency_code,
      whatsapp = excluded.whatsapp;

-- ========== CATEGORÃƒÂAS (upsert por slug) ==========
insert into catalogo_categories (name, slug) values
  ('CafÃƒÂ©s','cafes'),
  ('Desodorantes','desodorantes'),
  ('Pastas de dientes','pastas-dientes'),
  ('Jabones','jabones'),
  ('Limpieza / Repelentes','limpieza-repelentes'),
  ('Shampoo Pack','shampoo-pack'),
  ('Hogar / LavanderÃƒÂ­a','hogar-lavanderia'),
  ('Recomendados','recomendados'),
  ('Esponjas','esponjas')
on conflict (slug) do nothing;

-- ========== PRODUCTOS (upsert por slug) ==========
insert into catalogo_products (slug, name, description, status, show_prices_override) values
  ('cafe-iguacu','CafÃƒÂ© IguaÃƒÂ§u','Lata','published', null),
  ('nescafe','NescafÃƒÂ©','Vidrio / Lata 150g','published', null),
  ('dolce-gusto','Dolce Gusto CÃƒÂ¡psulas','Caja estÃƒÂ¡ndar','published', null),

  ('dove-men-care','Desodorante Dove Men+Care','Presentaciones varias','published', null),
  ('rexona-men','Desodorante Rexona Men','Clinical / Aerosol / Chico','published', null),
  ('axe-aerosol','Axe Aerosol','Aerosol masculino','published', null),

  ('colgate-dentifrico','Pastas de dientes Colgate','Luminous White / Total 12 / 180g','published', null),

  ('jabones-tocador','Jabones de tocador','Astral / Rexona x6 / Dove x8','published', null),

  ('sapolio-repelentes','Limpieza/Repelentes Sapolio','Mata moscas / Ambiente','published', null),
  ('jupiter-mata-todo','JÃƒÂºpiter Mata Todo','Multiuso','published', null),

  ('shampoo-pack','Shampoo Pack','Pantene / Dove / Elvive / H&S','published', null),

  ('hogar-lavanderia-basicos','Hogar/LavanderÃƒÂ­a BÃƒÂ¡sicos','Detergentes y suavizantes','published', null),

  ('perfumol','Perfumol Concentrado','1L y 10L','published', null),
  ('desengrasante-multiuso','Desengrasante Multiuso','1L','published', null),
  ('hipoclorito','Hipoclorito Concentrado','10L','published', null),
  ('cloro-puro','Cloro Puro','3L','published', null),

  ('esponja-bronce','Esponja de bronce','1u y 3u','published', null)
on conflict (slug) do nothing;

-- ========== PIVOT productoÃ¢â€ â€categorÃƒÂ­a (idempotente) ==========
insert into catalogo_product_categories (product_id, category_id)
select p.id, c.id
from (values
  ('cafe-iguacu','cafes'),
  ('nescafe','cafes'),
  ('dolce-gusto','cafes'),
  ('dove-men-care','desodorantes'),
  ('rexona-men','desodorantes'),
  ('axe-aerosol','desodorantes'),
  ('colgate-dentifrico','pastas-dientes'),
  ('jabones-tocador','jabones'),
  ('sapolio-repelentes','limpieza-repelentes'),
  ('jupiter-mata-todo','limpieza-repelentes'),
  ('shampoo-pack','shampoo-pack'),
  ('hogar-lavanderia-basicos','hogar-lavanderia'),
  ('perfumol','recomendados'),
  ('desengrasante-multiuso','recomendados'),
  ('hipoclorito','recomendados'),
  ('cloro-puro','recomendados'),
  ('esponja-bronce','esponjas')
) as m(prod_slug, cat_slug)
join catalogo_products   p on p.slug = m.prod_slug
join catalogo_categories c on c.slug = m.cat_slug
on conflict do nothing;

-- ========== VARIANTES (upsert por SKU) ==========

-- CafÃƒÂ©s
insert into catalogo_variants (product_id, sku, name, price_cents, is_available, attributes)
select p.id, v.sku, v.name, v.price_cents, v.is_available, (v.attributes)::jsonb
from catalogo_products p
join (values
  ('cafe-iguacu','SKU-IGU-LATA','Lata',32000,true,'{"presentacion":"lata"}'),
  ('nescafe','SKU-NES-VID','Vidrio',33000,true,'{"presentacion":"vidrio"}'),
  ('nescafe','SKU-NES-LAT150','Lata 150g',27000,true,'{"presentacion":"lata 150g"}'),
  ('dolce-gusto','SKU-DG-CAJA','Caja',28000,true,'{"tipo":"capsulas"}')
) as v(prod_slug, sku, name, price_cents, is_available, attributes)
  on p.slug = v.prod_slug
on conflict (sku) do nothing;

-- Desodorantes
insert into catalogo_variants (product_id, sku, name, price_cents, is_available, attributes)
select p.id, v.sku, v.name, v.price_cents, v.is_available, (v.attributes)::jsonb
from catalogo_products p
join (values
  ('dove-men-care','SKU-DMC-GRA','Grande',25000,true,'{"linea":"Men+Care"}'),
  ('dove-men-care','SKU-DMC-CHI','Chico',18000,true,'{"linea":"Men+Care"}'),
  ('dove-men-care','SKU-DMC-CLI','Clinical',32000,true,'{"linea":"Men+Care"}'),
  ('rexona-men','SKU-REX-CLI','Clinical Men',32000,true,'{}'),
  ('rexona-men','SKU-REX-AER','Aerosol G',24000,true,'{}'),
  ('rexona-men','SKU-REX-CHI','Chico',18000,true,'{}'),
  ('axe-aerosol','SKU-AXE-AER','ÃƒÅ¡nica',15000,true,'{}')
) as v(prod_slug, sku, name, price_cents, is_available, attributes)
  on p.slug = v.prod_slug
on conflict (sku) do nothing;

-- Pastas de dientes
insert into catalogo_variants (product_id, sku, name, price_cents, is_available, attributes)
select p.id, v.sku, v.name, v.price_cents, v.is_available, (v.attributes)::jsonb
from catalogo_products p
join (values
  ('colgate-dentifrico','SKU-COL-LW70','Luminous White 70g',18000,true,'{}'),
  ('colgate-dentifrico','SKU-COL-T1290','Total 12 90g',16000,true,'{}'),
  ('colgate-dentifrico','SKU-COL-180','Colgate 180g',14000,true,'{}')
) as v(prod_slug, sku, name, price_cents, is_available, attributes)
  on p.slug = v.prod_slug
on conflict (sku) do nothing;

-- Jabones
insert into catalogo_variants (product_id, sku, name, price_cents, is_available, attributes)
select p.id, v.sku, v.name, v.price_cents, v.is_available, (v.attributes)::jsonb
from catalogo_products p
join (values
  ('jabones-tocador','SKU-JAB-ASTR','Astral plateado',4500,true,'{}'),
  ('jabones-tocador','SKU-JAB-REX6','Rexona x6',18000,true,'{}'),
  ('jabones-tocador','SKU-JAB-DOV8','Dove x8',40000,true,'{}')
) as v(prod_slug, sku, name, price_cents, is_available, attributes)
  on p.slug = v.prod_slug
on conflict (sku) do nothing;

-- Limpieza / Repelentes
insert into catalogo_variants (product_id, sku, name, price_cents, is_available, attributes)
select p.id, v.sku, v.name, v.price_cents, v.is_available, (v.attributes)::jsonb
from catalogo_products p
join (values
  ('sapolio-repelentes','SKU-SAP-MM','Sapolio mata moscas',11000,true,'{}'),
  ('sapolio-repelentes','SKU-SAP-AMB','Sapolio ambiente',9000,true,'{}'),
  ('jupiter-mata-todo','SKU-JUP-MT','ÃƒÅ¡nica',13000,true,'{}')
) as v(prod_slug, sku, name, price_cents, is_available, attributes)
  on p.slug = v.prod_slug
on conflict (sku) do nothing;

-- Shampoo pack
insert into catalogo_variants (product_id, sku, name, price_cents, is_available, attributes)
select p.id, v.sku, v.name, v.price_cents, v.is_available, (v.attributes)::jsonb
from catalogo_products p
join (values
  ('shampoo-pack','SKU-SH-PAN','Pantene',43000,true,'{}'),
  ('shampoo-pack','SKU-SH-DOV','Dove',43000,true,'{}'),
  ('shampoo-pack','SKU-SH-ELV','Elvive',44000,true,'{}'),
  ('shampoo-pack','SKU-SH-HS','Head & Shoulders',45000,true,'{}')
) as v(prod_slug, sku, name, price_cents, is_available, attributes)
  on p.slug = v.prod_slug
on conflict (sku) do nothing;

-- Hogar / LavanderÃƒÂ­a
insert into catalogo_variants (product_id, sku, name, price_cents, is_available, attributes)
select p.id, v.sku, v.name, v.price_cents, v.is_available, (v.attributes)::jsonb
from catalogo_products p
join (values
  ('hogar-lavanderia-basicos','SKU-HOG-COT3L','Cotonmax 3L',33000,true,'{}'),
  ('hogar-lavanderia-basicos','SKU-HOG-AF5L','Aqua Fast 5L',35000,true,'{}'),
  ('hogar-lavanderia-basicos','SKU-HOG-NEV3L','Nevex diluir 3L',32000,true,'{}'),
  ('hogar-lavanderia-basicos','SKU-HOG-SKP3L','Skip diluir 3L',33500,true,'{}'),
  ('hogar-lavanderia-basicos','SKU-HOG-SUA5L','Suavizante Aqua 5L',30000,true,'{}'),
  ('hogar-lavanderia-basicos','SKU-HOG-SUA2L','Suavizante Aqua 2L',12000,true,'{}'),
  ('hogar-lavanderia-basicos','SKU-HOG-HAB5L','Detergente HÃƒÂ¡bito 5L',28000,true,'{}'),
  ('hogar-lavanderia-basicos','SKU-HOG-JM1L','JabÃƒÂ³n manos 1L',13000,false,'{}')
) as v(prod_slug, sku, name, price_cents, is_available, attributes)
  on p.slug = v.prod_slug
on conflict (sku) do nothing;

-- Recomendados
insert into catalogo_variants (product_id, sku, name, price_cents, is_available, attributes)
select p.id, v.sku, v.name, v.price_cents, v.is_available, (v.attributes)::jsonb
from catalogo_products p
join (values
  ('perfumol','SKU-PER-10L','Perfumol 10L conc.',37000,true,'{}'),
  ('perfumol','SKU-PER-1L','Perfumol 1L (rinde 10L)',30000,true,'{}'),
  ('desengrasante-multiuso','SKU-DES-1L','1L',28000,true,'{}'),
  ('hipoclorito','SKU-HIP-10L','10L',35000,true,'{}'),
  ('cloro-puro','SKU-CL-3L','3L',28000,true,'{}')
) as v(prod_slug, sku, name, price_cents, is_available, attributes)
  on p.slug = v.prod_slug
on conflict (sku) do nothing;

-- Esponjas de bronce
insert into catalogo_variants (product_id, sku, name, price_cents, is_available, attributes)
select p.id, v.sku, v.name, v.price_cents, v.is_available, (v.attributes)::jsonb
from catalogo_products p
join (values
  ('esponja-bronce','SKU-ESP-1U','1u',4500,true,'{}'),
  ('esponja-bronce','SKU-ESP-3U','3u',1000,true,'{}')
) as v(prod_slug, sku, name, price_cents, is_available, attributes)
  on p.slug = v.prod_slug
on conflict (sku) do nothing;

-- ========== IMÃƒÂGENES (evitar duplicados por (product_id, path)) ==========
insert into catalogo_images (product_id, path, alt, is_primary, position)
select p.id, v.path, v.alt, v.is_primary, v.position
from catalogo_products p
join (values
  ('cafe-iguacu','products/cafe-iguacu-1.jpg','CafÃƒÂ© IguaÃƒÂ§u - lata',true,1),
  ('nescafe','products/nescafe-1.jpg','NescafÃƒÂ© - presentaciÃƒÂ³n',true,1),
  ('dolce-gusto','products/dolce-gusto-1.jpg','Dolce Gusto',true,1),
  ('dove-men-care','products/dove-men-1.jpg','Dove Men+Care',true,1),
  ('rexona-men','products/rexona-men-1.jpg','Rexona Men',true,1),
  ('axe-aerosol','products/axe-1.jpg','Axe aerosol',true,1),
  ('colgate-dentifrico','products/colgate-1.jpg','Colgate',true,1),
  ('jabones-tocador','products/jabones-1.jpg','Jabones',true,1),
  ('sapolio-repelentes','products/sapolio-1.jpg','Sapolio',true,1),
  ('jupiter-mata-todo','products/jupiter-1.jpg','JÃƒÂºpiter mata todo',true,1),
  ('shampoo-pack','products/shampoo-pack-1.jpg','Shampoo pack',true,1),
  ('hogar-lavanderia-basicos','products/hogar-1.jpg','Hogar/LavanderÃƒÂ­a',true,1),
  ('perfumol','products/perfumol-1.jpg','Perfumol',true,1),
  ('desengrasante-multiuso','products/desengrasante-1.jpg','Desengrasante',true,1),
  ('hipoclorito','products/hipoclorito-1.jpg','Hipoclorito',true,1),
  ('cloro-puro','products/cloro-1.jpg','Cloro puro',true,1),
  ('esponja-bronce','products/esponja-bronce-1.jpg','Esponja de bronce',true,1)
) as v(prod_slug, path, alt, is_primary, position)
  on p.slug = v.prod_slug
where not exists (
  select 1 from catalogo_images i
  where i.product_id = p.id and i.path = v.path
);

-- ========== Mantenimiento: asegurar FTS/normalizado llenos ==========
update catalogo_products p
set name_unaccent = unaccent(name),
    search_fts = to_tsvector('spanish', unaccent(coalesce(name,'') || ' ' || coalesce(description,'')))
where p.name_unaccent is null or p.search_fts is null;

