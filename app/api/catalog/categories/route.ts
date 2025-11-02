import { NextResponse } from 'next/server';
import { getCategories } from '@/lib/data/catalog';

export async function GET() {
  const cats = await getCategories();
  return NextResponse.json({ categories: cats });
}
