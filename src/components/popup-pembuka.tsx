import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { pick } from "@/lib/i18n/pick";
import { PopupDialogClient } from "@/components/popup-dialog-client";

export type PopupAktif = {
  id: number;
  judul: string;
  gambarMobileUrl: string | null;
  gambarDesktopUrl: string | null;
  cta_url: string | null;
};

export async function PopupPembuka() {
  const supabase = await createClient();
  const locale = await getLocale();
  const { data, error } = await supabase
    .from("popups")
    .select("id, judul_id, judul_en, gambar_mobile_url, gambar_desktop_url, cta_url, tayang_mulai, tayang_selesai")
    .eq("is_active", true);

  if (error) {
    console.error("[popup] gagal memuat:", error);
    return null;
  }

  const hariIni = new Date().toISOString().slice(0, 10);
  const popup = data?.find(
    (p) =>
      (!p.tayang_mulai || p.tayang_mulai <= hariIni) &&
      (!p.tayang_selesai || p.tayang_selesai >= hariIni) &&
      // Popup berbasis gambar (ADR-015) — baris lama yang belum diisi ulang
      // gambarnya oleh Admin sengaja tidak tampil, bukan migrasi otomatis teks->gambar.
      (p.gambar_mobile_url || p.gambar_desktop_url)
  );

  if (!popup) return null;

  const resolved: PopupAktif = {
    id: popup.id,
    judul: pick(popup.judul_id, popup.judul_en, locale) ?? "",
    // Salah satu kosong -> fallback ke yang terisi, supaya tidak ada breakpoint kosong.
    gambarMobileUrl: popup.gambar_mobile_url ?? popup.gambar_desktop_url,
    gambarDesktopUrl: popup.gambar_desktop_url ?? popup.gambar_mobile_url,
    cta_url: popup.cta_url,
  };

  return <PopupDialogClient popup={resolved} />;
}
