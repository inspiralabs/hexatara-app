import { createClient } from "@/lib/supabase/server";

export const MATERI_PATH = "/materi/get-free-certificate-rpc";

// Course resmi = baris aktif pertama (urutan terkecil) yang punya bab.
// Dipakai pintu bernama dan penjaga /materi/[id]. Bukan getMateriId() Admin.
export async function getMateriAktifId(): Promise<number | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("materials")
    .select("id, material_chapters!inner(id)")
    .eq("is_active", true)
    .order("urutan")
    .limit(1);

  if (error) console.error("[materi-hero] gagal memuat materi:", error);
  return data?.[0]?.id ?? null;
}

// CTA publik selalu ke pintu bernama, bukan /materi/{id}.
// null = belum ada course berbab yang aktif — pemanggil menyembunyikan tombol.
export async function getMateriHeroHref(): Promise<string | null> {
  const id = await getMateriAktifId();
  return id == null ? null : MATERI_PATH;
}
