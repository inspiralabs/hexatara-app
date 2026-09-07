import { headers } from "next/headers";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { cekRateLimitVerify } from "@/lib/rate-limit/verify";
import { CertificateResult } from "./certificate-result";

async function getClientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "";
}

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ nomor?: string }>;
}) {
  const { nomor } = await searchParams;
  const locale = await getLocale();
  const t = await getTranslations("verify");

  const nomorDicari = nomor?.trim();
  let row = null;
  let rateLimited = false;

  if (nomorDicari) {
    const diizinkan = await cekRateLimitVerify(await getClientIp());
    if (!diizinkan) {
      rateLimited = true;
    } else {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("certificates_public")
        .select("nama_lengkap, nomor_sertifikat, tanggal_terbit, tanggal_kedaluwarsa, status")
        .ilike("nomor_sertifikat", nomorDicari)
        .maybeSingle();
      if (error) console.error("[verify] gagal mencari sertifikat:", error);
      row = data;
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-warna-teks sm:text-3xl">{t("pageTitle")}</h1>
      <p className="mt-2 text-base text-warna-teks-2">{t("pageSubtitle")}</p>

      <form className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="nomor" className="text-sm font-medium text-warna-teks">
            {t("searchLabel")}
          </label>
          <input
            id="nomor"
            name="nomor"
            type="text"
            defaultValue={nomorDicari ?? ""}
            placeholder={t("searchPlaceholder")}
            className="h-11 w-full rounded-lg border border-warna-teks-2/30 bg-warna-latar px-3 text-base text-warna-teks placeholder:text-warna-teks-2 focus:border-warna-utama focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="h-11 shrink-0 rounded-lg bg-warna-aksen px-6 text-base font-semibold text-warna-teks"
        >
          {t("searchButton")}
        </button>
      </form>
      <p className="mt-2 text-sm text-warna-teks-2">{t("searchHint")}</p>

      {nomorDicari && rateLimited && (
        <p className="mt-6 rounded-xl border border-warna-teks-2/20 bg-warna-latar-2 p-5 text-sm text-warna-teks-2">
          {t("rateLimited")}
        </p>
      )}
      {nomorDicari && !rateLimited && <CertificateResult row={row} locale={locale} />}
    </div>
  );
}
