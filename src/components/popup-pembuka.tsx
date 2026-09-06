import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import { PopupDialogClient } from "@/components/popup-dialog-client";

export type PopupAktif = Pick<
  Database["public"]["Tables"]["popups"]["Row"],
  "id" | "judul_id" | "isi_id" | "gambar_url" | "cta_teks_id" | "cta_url"
>;

export async function PopupPembuka() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("popups")
    .select("id, judul_id, isi_id, gambar_url, cta_teks_id, cta_url, tayang_mulai, tayang_selesai")
    .eq("is_active", true);

  if (error) {
    console.error("[popup] gagal memuat:", error);
    return null;
  }

  const hariIni = new Date().toISOString().slice(0, 10);
  const popup = data?.find(
    (p) =>
      (!p.tayang_mulai || p.tayang_mulai <= hariIni) &&
      (!p.tayang_selesai || p.tayang_selesai >= hariIni)
  );

  if (!popup) return null;

  return <PopupDialogClient popup={popup} />;
}
