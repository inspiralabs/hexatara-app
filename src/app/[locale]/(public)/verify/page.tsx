import type { Metadata } from "next";
import { headers } from "next/headers";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { cekRateLimitVerify } from "@/lib/rate-limit/verify";
import { PublicHeroMist } from "@/components/public-hero-mist";
import { Input } from "@/components/ui/input";
import { publicCtaPrimary, publicSectionHeading } from "@/lib/public-ui";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { CertificateResult } from "./certificate-result";

async function getClientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return pageMetadata({
    locale,
    path: "/verify",
    title: t("verifyTitle"),
    description: t("verifyDescription"),
  });
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
    <div className="bg-background pb-16">
      <PublicHeroMist className="border-b border-border">
        <div className="mx-auto max-w-2xl px-4 py-12 text-center md:py-16">
          <h1 className={publicSectionHeading}>{t("pageTitle")}</h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">{t("pageSubtitle")}</p>
        </div>
      </PublicHeroMist>

      <div className="mx-auto max-w-2xl px-4 py-10 md:py-16">
        <form className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex flex-1 flex-col gap-1.5">
            <label htmlFor="nomor" className="text-sm font-medium text-foreground">
              {t("searchLabel")}
            </label>
            <Input
              id="nomor"
              name="nomor"
              type="text"
              defaultValue={nomorDicari ?? ""}
              placeholder={t("searchPlaceholder")}
              className="h-11"
            />
          </div>
          <button type="submit" className={publicCtaPrimary}>
            {t("searchButton")}
          </button>
        </form>
        <p className="mt-2 text-sm text-muted-foreground">{t("searchHint")}</p>

        {nomorDicari && rateLimited && (
          <p className="mt-6 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
            {t("rateLimited")}
          </p>
        )}
        {nomorDicari && !rateLimited && <CertificateResult row={row} locale={locale} />}
      </div>
    </div>
  );
}
