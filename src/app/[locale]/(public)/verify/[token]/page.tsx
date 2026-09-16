import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { PublicHeroMist } from "@/components/public-hero-mist";
import { publicSectionHeading } from "@/lib/public-ui";
import { CertificateResult } from "../certificate-result";

export default async function VerifyTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const locale = await getLocale();
  const t = await getTranslations("verify");

  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("certificates_public")
    .select("nama_lengkap, nomor_sertifikat, tanggal_terbit, tanggal_kedaluwarsa, status")
    .eq("public_token", token)
    .maybeSingle();
  if (error) console.error("[verify/token] gagal mencari sertifikat:", error);

  return (
    <div className="bg-background pb-16">
      <PublicHeroMist className="border-b border-border">
        <div className="mx-auto max-w-2xl px-4 py-12 text-center md:py-16">
          <h1 className={publicSectionHeading}>{t("pageTitle")}</h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">{t("tokenResultHint")}</p>
        </div>
      </PublicHeroMist>

      <div className="mx-auto max-w-2xl px-4 py-10 md:py-16">
        <CertificateResult row={row} locale={locale} />

        <Link
          href="/verify"
          className="mt-6 inline-block text-sm font-medium text-muted-foreground underline hover:text-foreground"
        >
          {t("searchAgain")}
        </Link>
      </div>
    </div>
  );
}
