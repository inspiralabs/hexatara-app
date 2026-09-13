import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { DaftarForm } from "./daftar-form";

export default async function DaftarPage({
  searchParams,
}: {
  searchParams: Promise<{ kuisSelesai?: string }>;
}) {
  const { kuisSelesai } = await searchParams;
  const t = await getTranslations("auth.daftar");

  return (
    <AuthShell
      title={t("title")}
      description={t("description")}
      footer={
        <p>
          {t("haveAccount")}{" "}
          <Link href="/login" className="underline underline-offset-4">
            {t("loginLink")}
          </Link>
        </p>
      }
    >
      <DaftarForm kuisSelesai={kuisSelesai === "1"} />
    </AuthShell>
  );
}
