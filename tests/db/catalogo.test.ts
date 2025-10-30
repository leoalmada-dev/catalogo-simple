import { beforeAll, afterAll, test, expect } from 'vitest';
import { Client } from 'pg';

let client: Client;

beforeAll(async () => {
  client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
});

afterAll(async () => {
  // cerrar siempre, sin colgar la suite si ya está cerrado
  try { await client.end(); } catch { /* no-op */ }
});

async function setUid(uid: string | null) {
  await client.query('select app.set_uid($1::uuid)', [uid]);
}

test('seeds: conteos base', async () => {
  const cat = await client.query('select count(*)::int n from catalogo_categories;');
  const prod = await client.query('select count(*)::int n from catalogo_products;');
  const vari = await client.query('select count(*)::int n from catalogo_variants;');
  expect(cat.rows[0].n).toBeGreaterThanOrEqual(9);
  expect(prod.rows[0].n).toBeGreaterThanOrEqual(17);
  expect(vari.rows[0].n).toBeGreaterThanOrEqual(39);
});

test('vista pública devuelve filas con min_price', async () => {
  const r = await client.query(`
    select count(*)::int n
    from catalogo_v_products_public
    where min_price_cents is not null
  `);
  expect(r.rows[0].n).toBeGreaterThan(0);
});

test('RLS: anon NO inserta categorías', async () => {
  await setUid(null);
  const slug = 'test-cat-' + Date.now();
  let denied = false;
  try {
    await client.query(`insert into catalogo_categories(name, slug) values ('Test', $1)`, [slug]);
  } catch (e: unknown) {
    const code = (e as { code?: string }).code;
    denied = code === '42501';
  }
  expect(denied).toBe(true);
});

test('RLS: editor SÍ crea producto', async () => {
  const uid = process.env.EDITOR_UID;
  if (!uid) throw new Error('EDITOR_UID no seteado en CI');

  await setUid(uid);

  const slug = 'test-prod-' + Date.now();
  // ⚠️ cumplir con la policy de INSERT: created_by debe ser el uid
  await client.query(
    `insert into catalogo_products(slug, name, status, created_by)
     values ($1,'Producto test','draft',$2::uuid)`,
    [slug, uid]
  );

  const ok = await client.query(`select 1 from catalogo_products where slug = $1`, [slug]);
  expect(ok.rowCount).toBe(1);
});
