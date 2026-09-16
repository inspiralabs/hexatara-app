import { getTranslations } from "next-intl/server";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

type FaqItem = { question: string; answer: string };

// Dipakai di homepage (FaqSection) dan halaman /faq standalone — satu sumber
// data (messages.landingFaq.items), tidak ada FAQ umum di database.
export async function FaqAccordion() {
  const t = await getTranslations("landingFaq");
  const items = t.raw("items") as FaqItem[];

  return (
    <Accordion className="rounded-xl border border-border bg-card px-4 shadow-none">
      {items.map((item, i) => (
        <AccordionItem key={i} value={String(i)} className="border-border last:border-b-0">
          <AccordionTrigger className="py-4 text-base font-medium text-foreground hover:no-underline">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="pb-4 text-base text-muted-foreground">{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
