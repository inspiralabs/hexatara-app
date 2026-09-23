import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { StaticPageBody } from "@/components/static-page-body";
import { pageMetadata } from "@/lib/seo/page-metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return pageMetadata({
    locale,
    path: "/kebijakan-privasi",
    title: t("kebijakanPrivasiTitle"),
    description: t("kebijakanPrivasiDescription"),
  });
}

export default function KebijakanPrivasiPage() {
  return <StaticPageBody namespace="kebijakanPrivasi" />;
}
