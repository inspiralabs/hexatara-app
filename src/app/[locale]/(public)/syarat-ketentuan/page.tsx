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
    path: "/syarat-ketentuan",
    title: t("syaratKetentuanTitle"),
    description: t("syaratKetentuanDescription"),
  });
}

export default function SyaratKetentuanPage() {
  return <StaticPageBody namespace="syaratKetentuan" />;
}
