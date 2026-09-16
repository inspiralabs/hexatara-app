import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { BadgeCheckIcon, MessageCircleIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { BrandLogo } from "@/components/brand-logo";

type KontakSettings = { wa?: string; email?: string; instagram?: string };

export async function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const t = await getTranslations("auth.shell");
  const supabase = await createClient();
  const { data: kontakRow } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "kontak")
    .maybeSingle();
  const kontak = (kontakRow?.value ?? {}) as KontakSettings;
  const waHref = kontak.wa ? `https://wa.me/${kontak.wa}` : null;
  const bantuanHref = waHref ?? (kontak.email ? `mailto:${kontak.email}` : null);

  const { data: heroRows } = await supabase
    .from("hero_slides")
    .select("gambar_url")
    .eq("is_active", true)
    .order("urutan", { ascending: true })
    .limit(5);
  const heroGambar =
    heroRows?.map((r) => r.gambar_url).find((url) => typeof url === "string" && url.trim()) ??
    null;

  return (
    <div className="grid min-h-svh w-full bg-background text-foreground md:grid-cols-2">
      <div className="flex flex-col justify-center px-4 py-10 sm:px-8">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="mb-8 inline-flex items-center gap-2">
            <BrandLogo variant="default" size={36} priority />
            <span className="text-base font-semibold tracking-tight">Hexatara</span>
          </Link>

          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description ? (
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          ) : null}

          <div className="mt-8">{children}</div>
          {footer ? <div className="mt-6 text-sm text-muted-foreground">{footer}</div> : null}
        </div>
      </div>

      {/* Desktop only — hidden on mobile, not stacked */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-zinc-950 p-10 text-zinc-50 md:flex">
        <div>
          <Link href="/" className="inline-flex items-center gap-2">
            <BrandLogo variant="mono" size={40} />
            <span className="text-lg font-semibold">Hexatara</span>
          </Link>
          <p className="mt-6 max-w-sm text-2xl font-medium tracking-tight text-balance">
            {t("tagline")}
          </p>
          <p className="mt-3 max-w-sm text-sm text-zinc-400">{t("taglineSupport")}</p>
        </div>

        {heroGambar ? (
          <div className="relative my-8 min-h-0 flex-1 overflow-hidden rounded-2xl border border-zinc-800">
            <Image
              src={heroGambar}
              alt=""
              fill
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 0px"
              priority
            />
            <div className="absolute inset-0 bg-linear-to-t from-zinc-950/80 via-zinc-950/20 to-transparent" />
          </div>
        ) : null}

        <div className="grid gap-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
                <BadgeCheckIcon className="size-4" />
              </span>
              <div>
                <p className="text-sm font-medium">{t("highlight1Title")}</p>
                <p className="mt-1 text-xs text-zinc-400">{t("highlight1Body")}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
                <MessageCircleIcon className="size-4" />
              </span>
              <div>
                <p className="text-sm font-medium">{t("highlight2Title")}</p>
                <p className="mt-1 text-xs text-zinc-400">{t("highlight2Body")}</p>
                {bantuanHref ? (
                  <a
                    href={bantuanHref}
                    target={waHref ? "_blank" : undefined}
                    rel={waHref ? "noopener noreferrer" : undefined}
                    className="mt-2 inline-block text-xs font-medium text-zinc-200 underline underline-offset-4 hover:text-white"
                  >
                    {waHref ? t("highlight2CtaWa") : t("highlight2CtaEmail")}
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
