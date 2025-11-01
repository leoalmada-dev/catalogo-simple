import { createServerClient } from "@/lib/supabase/server";
import { createBrowserClient } from "@/lib/supabase/client";

const BUCKET = process.env.STORAGE_BUCKET || "products";

export async function listProductImages(productId: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase.storage.from(BUCKET).list(productId, { sortBy: { column: "created_at", order: "asc" }});
  if (error) throw error;
  return (data ?? []).map((i) => ({
    name: i.name,
    path: `${productId}/${i.name}`,
    url: supabase.storage.from(BUCKET).getPublicUrl(`${productId}/${i.name}`).data.publicUrl,
  }));
}

export async function deleteImage(path: string) {
  const supabase = await createServerClient();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw error;
}

export async function uploadFromClient(productId: string, file: File) {
  const supabase = createBrowserClient();
  const filename = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
  const { error } = await supabase.storage.from(BUCKET).upload(`${productId}/${filename}`, file, { upsert: false });
  if (error) throw error;
}
