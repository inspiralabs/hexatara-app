import { createClient } from "@/lib/supabase/server";

// CTA hero /pelatihan selalu langsung ke course pertama (urutan terkecil) —
// tidak ada lagi listing /materi untuk fallback. null berarti belum ada
// course berbab yang aktif (Admin belum publish); pemanggil menyembunyikan
// tombolnya kalau begitu.
export async function getMateriHeroHref(): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("materials")
    .select("id, material_chapters!inner(id)")
    .eq("is_active", true)
    .order("urutan")
    .limit(1);

  if (error) console.error("[materi-hero] gagal memuat materi:", error);
  if (data && data.length > 0) return `/materi/${data[0]!.id}`;
  return null;
}
