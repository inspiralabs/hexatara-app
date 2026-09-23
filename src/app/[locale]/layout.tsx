import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Fraunces, Geist } from "next/font/google";
import { routing } from "@/i18n/routing";
import { Toaster } from "@/components/ui/sonner";
import { OG_IMAGE, siteOrigin } from "@/lib/seo/page-metadata";
import "../globals.css";

const geist = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

/** Variable di <html> supaya `font-heading` resolve benar; class `font-heading` hanya dipakai di (public). */
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common" });
  const title = t("metaTitle");
  const description = t("metaDescription");
  const ogLocale = locale === "en" ? "en_US" : "id_ID";

  return {
    metadataBase: new URL(siteOrigin()),
    title: {
      default: title,
      template: "%s | Hexatara",
    },
    description,
    openGraph: {
      title,
      description,
      siteName: "Hexatara",
      locale: ogLocale,
      type: "website",
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE.url],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} className={`${geist.variable} ${fraunces.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col font-sans">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
