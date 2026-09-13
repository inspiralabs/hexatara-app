"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { ResetSandiSchema } from "@/lib/validations/auth";
import { resetSandiAction } from "./actions";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PasswordInput } from "@/components/auth/password-input";

type ResetSandiInput = z.infer<typeof ResetSandiSchema>;

export function ResetSandiForm() {
  const t = useTranslations("auth.resetSandi");
  const tAuth = useTranslations("auth");
  const router = useRouter();
  const [pesanError, setPesanError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetSandiInput>({
    resolver: zodResolver(ResetSandiSchema),
    defaultValues: { password: "", konfirmasiPassword: "" },
  });

  async function onSubmit(data: ResetSandiInput) {
    setPesanError(null);
    const hasil = await resetSandiAction(data);
    if (!hasil.ok) {
      setPesanError(hasil.pesan);
      toast.error(t("toastError"), { description: hasil.pesan });
      return;
    }
    toast.success(t("toastSuccess"));
    router.push("/login");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      {pesanError && (
        <Alert variant="destructive">
          <AlertDescription>{pesanError}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">{t("newPasswordLabel")}</Label>
        <PasswordInput
          id="password"
          autoComplete="new-password"
          toggleLabelShow={tAuth("passwordShow")}
          toggleLabelHide={tAuth("passwordHide")}
          {...register("password")}
        />
        <p className="text-xs text-muted-foreground">{tAuth("passwordHint")}</p>
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="konfirmasiPassword">{t("confirmPasswordLabel")}</Label>
        <PasswordInput
          id="konfirmasiPassword"
          autoComplete="new-password"
          toggleLabelShow={tAuth("passwordShow")}
          toggleLabelHide={tAuth("passwordHide")}
          {...register("konfirmasiPassword")}
        />
        {errors.konfirmasiPassword && (
          <p className="text-sm text-destructive">{errors.konfirmasiPassword.message}</p>
        )}
      </div>

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? t("saving") : t("submit")}
      </Button>
    </form>
  );
}
