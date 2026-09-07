import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
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
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-warna-teks sm:text-3xl">{t("pageTitle")}</h1>
      <p className="mt-2 text-sm text-warna-teks-2">{t("tokenResultHint")}</p>

      <CertificateResult row={row} locale={locale} />

      <Link href="/verify" className="mt-6 inline-block text-sm font-medium text-warna-utama underline">
        {t("searchAgain")}
      </Link>
    </div>
  );
}
