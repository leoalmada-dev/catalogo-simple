export const dynamic = "force-dynamic";
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return Response.json({
    hasUrl: !!url,
    hasKey: !!key,
    urlPreview: url.slice(0, 30),     // no expone secretos
    keyPreview: key.slice(0, 8) + "...",
    bucket: process.env.STORAGE_BUCKET ?? null,
  });
}
