import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const t = await getTranslations("auth.login");

  return (
    <AuthShell
      title={t("title")}
      footer={
        <div className="flex flex-col gap-1">
          <Link href="/lupa-sandi" className="underline underline-offset-4">
            {t("forgotPassword")}
          </Link>
          <p>
            {t("noAccount")}{" "}
            <Link href="/daftar" className="underline underline-offset-4">
              {t("registerLink")}
            </Link>
          </p>
        </div>
      }
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
