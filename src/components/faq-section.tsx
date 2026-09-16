import { getTranslations } from "next-intl/server";
import { FaqAccordion } from "@/components/faq-accordion";
import { publicSectionHeading } from "@/lib/public-ui";

export async function FaqSection() {
  const t = await getTranslations("landing");

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <h2 className={publicSectionHeading}>{t("faqHeading")}</h2>
      <div className="mt-6">
        <FaqAccordion />
      </div>
    </section>
  );
}
