import { CheckCircle2, SearchX, XCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { Database } from "@/types/database";

type CertificateRow = Pick<
  Database["public"]["Views"]["certificates_public"]["Row"],
  "nama_lengkap" | "nomor_sertifikat" | "tanggal_terbit" | "tanggal_kedaluwarsa" | "status"
>;

function formatTanggalSertifikat(tanggal: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(tanggal));
}

export async function CertificateResult({
  row,
  locale,
}: {
  row: CertificateRow | null;
  locale: string;
}) {
  const t = await getTranslations("verify.result");

  if (!row) {
    return (
      <div className="mt-6 rounded-xl border border-warna-teks-2/20 bg-warna-latar-2 p-5">
        <div className="flex items-center gap-2">
          <SearchX className="size-5 shrink-0 text-warna-teks-2" aria-hidden="true" />
          <h2 className="text-lg font-bold text-warna-teks">{t("notFoundTitle")}</h2>
        </div>
        <p className="mt-2 text-sm text-warna-teks-2">{t("notFoundBody")}</p>
      </div>
    );
  }

  const invalid = row.status === "invalid";
  const tanpaMasaBerlaku = row.tanggal_kedaluwarsa === null;

  return (
    <div
      className={`mt-6 rounded-xl border p-5 ${
        invalid ? "border-warna-bahaya/30 bg-warna-bahaya/5" : "border-warna-sukses/30 bg-warna-sukses/5"
      }`}
    >
      <div className="flex items-center gap-2">
        {invalid ? (
          <XCircle className="size-5 shrink-0 text-warna-bahaya" aria-hidden="true" />
        ) : (
          <CheckCircle2 className="size-5 shrink-0 text-warna-sukses" aria-hidden="true" />
        )}
        <h2 className="text-lg font-bold text-warna-teks">{invalid ? t("invalidTitle") : t("validTitle")}</h2>
      </div>

      <span
        className={`mt-3 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
          invalid ? "bg-warna-bahaya/10 text-warna-bahaya" : "bg-warna-sukses/10 text-warna-sukses"
        }`}
      >
        {invalid ? t("invalidBadge") : t("validBadge")}
        {!invalid && tanpaMasaBerlaku ? ` — ${t("noExpiryNote")}` : ""}
      </span>

      {invalid && <p className="mt-3 text-sm text-warna-teks-2">{t("invalidBody")}</p>}

      <dl className="mt-4 space-y-1.5 text-sm text-warna-teks-2">
        <div>
          <dt className="inline font-medium text-warna-teks">{t("nameLabel")}: </dt>
          <dd className="inline">{row.nama_lengkap}</dd>
        </div>
        <div>
          <dt className="inline font-medium text-warna-teks">{t("numberLabel")}: </dt>
          <dd className="inline">{row.nomor_sertifikat}</dd>
        </div>
        <div>
          <dt className="inline font-medium text-warna-teks">{t("issuedLabel")}: </dt>
          <dd className="inline">
            {row.tanggal_terbit ? formatTanggalSertifikat(row.tanggal_terbit, locale) : "-"}
          </dd>
        </div>
        <div>
          <dt className="inline font-medium text-warna-teks">{t("expiryLabel")}: </dt>
          <dd className="inline">
            {tanpaMasaBerlaku
              ? t("noExpiryNote")
              : row.tanggal_kedaluwarsa
                ? formatTanggalSertifikat(row.tanggal_kedaluwarsa, locale)
                : "-"}
          </dd>
        </div>
      </dl>
    </div>
  );
}
