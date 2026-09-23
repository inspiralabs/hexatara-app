import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { FaqAccordion } from "@/components/faq-accordion";
import { PublicHeroMist } from "@/components/public-hero-mist";
import { publicSectionHeading } from "@/lib/public-ui";
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
    path: "/faq",
    title: t("faqTitle"),
    description: t("faqDescription"),
  });
}

export default async function FaqPage() {
  const t = await getTranslations("landing");

  return (
    <div className="bg-background pb-16">
      <PublicHeroMist className="border-b border-border">
        <div className="mx-auto max-w-3xl px-4 py-12 text-center md:py-16">
          <h1 className={publicSectionHeading}>{t("faqHeading")}</h1>
        </div>
      </PublicHeroMist>
      <div className="mx-auto max-w-3xl px-4 py-10 md:py-16">
        <FaqAccordion />
      </div>
    </div>
  );
}
