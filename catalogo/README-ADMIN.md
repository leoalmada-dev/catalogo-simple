# Admin Catálogo — Uso rápido

## Acceso
- Ir a `/admin/login` con mail/clave de Supabase Auth.
- Sólo `profiles.role = 'admin'` puede editar.

## ABM
- Crear/editar/borrar producto, variantes y SEO.
- Imágenes en `/admin/products/[id]/images`: bucket `products/{productId}/`.

## CSV
- Importar (validación Zod) desde `/admin` seleccionando `.csv` v1.
- Exportar con el botón → descarga `export_catalogo.csv`.

## Variables de entorno
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
STORAGE_BUCKET=products