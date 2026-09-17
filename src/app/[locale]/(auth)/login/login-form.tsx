"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { LoginSchema } from "@/lib/validations/auth";
import { loginAction } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PasswordInput } from "@/components/auth/password-input";

type LoginInput = z.infer<typeof LoginSchema>;

const REMEMBER_KEY = "hexatara-auth-email";

/** Hanya path internal relatif aman (bukan //…, bukan /admin). */
function safeNextPath(raw: string | null): string | null {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/admin")) {
    return null;
  }
  return raw;
}

export function LoginForm() {
  const t = useTranslations("auth.login");
  const tAuth = useTranslations("auth");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [ingatSaya, setIngatSaya] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_KEY);
      if (!saved) return;
      setValue("email", saved);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- prefill "Ingat saya" dari localStorage
      setIngatSaya(true);
    } catch {
      // private window
    }
  }, [setValue]);

  async function onSubmit(data: LoginInput) {
    setPesanError(null);
    const hasil = await loginAction(data);
    if (!hasil.ok) {
      setPesanError(hasil.pesan);
      toast.error(t("toastError"), { description: hasil.pesan });
      return;
    }

    try {
      if (ingatSaya) localStorage.setItem(REMEMBER_KEY, data.email);
      else localStorage.removeItem(REMEMBER_KEY);
    } catch {
      // preferensi saja
    }

    toast.success(t("toastSuccess"));
    const next = safeNextPath(searchParams.get("next"));
    router.push(next ?? "/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      {pesanError && (
        <Alert variant="destructive">
          <AlertDescription>{pesanError}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">{t("emailLabel")}</Label>
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">{t("passwordLabel")}</Label>
        <PasswordInput
          id="password"
          autoComplete="current-password"
          toggleLabelShow={tAuth("passwordShow")}
          toggleLabelHide={tAuth("passwordHide")}
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="ingatSaya"
          checked={ingatSaya}
          onCheckedChange={(checked) => setIngatSaya(checked === true)}
        />
        <Label htmlFor="ingatSaya" className="font-normal">
          {t("rememberLabel")}
        </Label>
      </div>

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? tCommon("processing") : t("submit")}
      </Button>
    </form>
  );
}
