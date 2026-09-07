import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { pick } from "@/lib/i18n/pick";
import { PopupDialogClient } from "@/components/popup-dialog-client";

export type PopupAktif = {
  id: number;
  judul: string;
  isi: string;
  gambar_url: string | null;
  cta_teks: string | null;
  cta_url: string | null;
};

export async function PopupPembuka() {
  const supabase = await createClient();
  const locale = await getLocale();
  const { data, error } = await supabase
    .from("popups")
    .select(
      "id, judul_id, judul_en, isi_id, isi_en, gambar_url, cta_teks_id, cta_teks_en, cta_url, tayang_mulai, tayang_selesai"
    )
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

  const resolved: PopupAktif = {
    id: popup.id,
    judul: pick(popup.judul_id, popup.judul_en, locale) ?? "",
    isi: pick(popup.isi_id, popup.isi_en, locale) ?? "",
    gambar_url: popup.gambar_url,
    cta_teks: pick(popup.cta_teks_id, popup.cta_teks_en, locale),
    cta_url: popup.cta_url,
  };

  return <PopupDialogClient popup={resolved} />;
}
