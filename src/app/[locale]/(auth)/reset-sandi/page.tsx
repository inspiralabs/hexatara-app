import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createClient } from "@/lib/supabase/server";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetSandiForm } from "./reset-sandi-form";

export default async function ResetSandiPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const t = await getTranslations("auth.resetSandi");

  return (
    <AuthShell title={t("title")} description={data?.claims ? t("description") : undefined}>
      {data?.claims ? (
        <ResetSandiForm />
      ) : (
        <div className="flex flex-col gap-4">
          <Alert variant="destructive">
            <AlertDescription>{t("invalidAlert")}</AlertDescription>
          </Alert>
          <Link href="/lupa-sandi" className="text-sm underline underline-offset-4">
            {t("requestNewLink")}
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
