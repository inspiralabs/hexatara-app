import { getTranslations } from "next-intl/server";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

type FaqItem = { question: string; answer: string };

// Dipakai di homepage (FaqSection) dan halaman /faq standalone — satu sumber
// data (messages.landingFaq.items), tidak ada FAQ umum di database.
export async function FaqAccordion() {
  const t = await getTranslations("landingFaq");
  const items = t.raw("items") as FaqItem[];

  return (
    <Accordion>
      {items.map((item, i) => (
        <AccordionItem key={i} value={String(i)}>
          <AccordionTrigger className="text-base text-warna-teks">{item.question}</AccordionTrigger>
          <AccordionContent className="text-warna-teks-2">{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
