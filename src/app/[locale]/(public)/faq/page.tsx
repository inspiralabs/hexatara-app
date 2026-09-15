import { getTranslations } from "next-intl/server";
import { FaqAccordion } from "@/components/faq-accordion";

export default async function FaqPage() {
  const t = await getTranslations("landing");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{t("faqHeading")}</h1>
      <div className="mt-6">
        <FaqAccordion />
      </div>
    </div>
  );
}
