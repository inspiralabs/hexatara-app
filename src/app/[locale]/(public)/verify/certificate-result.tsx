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
      <div className="mt-6 rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <SearchX className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <h2 className="font-heading text-lg font-semibold text-foreground">{t("notFoundTitle")}</h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{t("notFoundBody")}</p>
      </div>
    );
  }

  const invalid = row.status === "invalid";
  const tanpaMasaBerlaku = row.tanggal_kedaluwarsa === null;

  return (
    <div
      className={`mt-6 rounded-xl border p-5 ${
        invalid ? "border-destructive/30 bg-destructive/5" : "border-emerald-600/30 bg-emerald-600/5"
      }`}
    >
      <div className="flex items-center gap-2">
        {invalid ? (
          <XCircle className="size-5 shrink-0 text-destructive" aria-hidden="true" />
        ) : (
          <CheckCircle2 className="size-5 shrink-0 text-emerald-600" aria-hidden="true" />
        )}
        <h2 className="font-heading text-lg font-semibold text-foreground">{invalid ? t("invalidTitle") : t("validTitle")}</h2>
      </div>

      <span
        className={`mt-3 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
          invalid ? "bg-destructive/10 text-destructive" : "bg-emerald-600/10 text-emerald-600"
        }`}
      >
        {invalid ? t("invalidBadge") : t("validBadge")}
        {!invalid && tanpaMasaBerlaku ? ` — ${t("noExpiryNote")}` : ""}
      </span>

      {invalid && <p className="mt-3 text-sm text-muted-foreground">{t("invalidBody")}</p>}

      <dl className="mt-4 space-y-1.5 text-sm text-muted-foreground">
        <div>
          <dt className="inline font-medium text-foreground">{t("nameLabel")}: </dt>
          <dd className="inline">{row.nama_lengkap}</dd>
        </div>
        <div>
          <dt className="inline font-medium text-foreground">{t("numberLabel")}: </dt>
          <dd className="inline">{row.nomor_sertifikat}</dd>
        </div>
        <div>
          <dt className="inline font-medium text-foreground">{t("issuedLabel")}: </dt>
          <dd className="inline">
            {row.tanggal_terbit ? formatTanggalSertifikat(row.tanggal_terbit, locale) : "-"}
          </dd>
        </div>
        <div>
          <dt className="inline font-medium text-foreground">{t("expiryLabel")}: </dt>
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
