import { beforeAll, afterAll, test, expect } from 'vitest';
import { Client } from 'pg';

let client: Client;

beforeAll(async () => {
  client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
});
afterAll(async () => {
  try { await client.end(); } catch { /* no-op */ }
});

async function setUid(uid: string | null) {
  await client.query('select app.set_uid($1::uuid)', [uid]);
}

/** 1) SMOKE: el seed cargó algo útil (umbral bajito) */
test('schema+seeds: hay categorías, productos y variantes', async () => {
  const cat = await client.query('select count(*)::int n from catalogo_categories;');
  const pro = await client.query('select count(*)::int n from catalogo_products;');
  const varis = await client.query('select count(*)::int n from catalogo_variants;');
  expect(cat.rows[0].n).toBeGreaterThan(0);
  expect(pro.rows[0].n).toBeGreaterThan(0);
  expect(varis.rows[0].n).toBeGreaterThan(0);

  // la vista pública responde sin romper (no exigimos filas >0 para no atarnos a datos)
  await client.query('select * from catalogo_v_products_public limit 1;');
});

/** 2) RLS: el público NO puede escribir */
test('RLS: anon no puede insertar categorías', async () => {
  await setUid(null);
  const slug = 'test-' + Date.now();
  let denied = false;
  try {
    await client.query(`insert into catalogo_categories(name, slug) values ('Test', $1)`, [slug]);
  } catch (e: unknown) {
    const code = (e as { code?: string }).code;
    denied = code === '42501'; // insufficient_privilege (RLS)
  }
  expect(denied).toBe(true);
});
