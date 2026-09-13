import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthShell } from "@/components/auth/auth-shell";
import { LupaSandiForm } from "./lupa-sandi-form";

export default async function LupaSandiPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const t = await getTranslations("auth.lupaSandi");
  const tAuth = await getTranslations("auth");

  return (
    <AuthShell
      title={t("title")}
      description={t("description")}
      footer={
        <Link href="/login" className="underline underline-offset-4">
          {tAuth("backToLogin")}
        </Link>
      }
    >
      <div className="flex flex-col gap-4">
        {status === "gagal" && (
          <Alert variant="destructive">
            <AlertDescription>{t("expiredAlert")}</AlertDescription>
          </Alert>
        )}
        <LupaSandiForm />
      </div>
    </AuthShell>
  );
}
