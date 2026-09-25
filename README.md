# Catálogo Simple

Proyecto personal construido a partir de una necesidad real planteada por un tercero: disponer de un catálogo web sencillo con gestión de productos y una base técnica que pudiera evolucionar sin convertirlo en un proyecto sobredimensionado.

No se presenta como trabajo freelance ni como producto comercial en producción.

## Propósito

Explorar una implementación full stack moderna para un catálogo administrable, con persistencia en PostgreSQL/Supabase y controles de calidad automatizados.

## Stack

- Next.js 16
- React 19
- TypeScript
- Supabase
- PostgreSQL
- Drizzle ORM
- Vitest
- GitHub Actions

## Quality checks

La CI del repositorio valida, sobre pull requests a `main`:

- instalación reproducible con `npm ci`;
- lint;
- typecheck;
- build de Next.js;
- tests con Vitest y cobertura;
- smoke tests de base de datos sobre PostgreSQL 16;
- aplicación del esquema, RLS y seeds necesarios para las pruebas de DB.

## Configuración

El repositorio incluye `.env.example` con las variables esperadas y valores de ejemplo.

Las credenciales reales de Supabase y cualquier valor sensible deben mantenerse fuera del repositorio.

## Estado

Proyecto personal funcional utilizado como evidencia técnica secundaria.

Actualmente **no se documenta una demo pública verificada** en este repositorio.
