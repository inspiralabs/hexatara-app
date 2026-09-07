import { getTranslations } from "next-intl/server";

export async function FloatingWhatsapp() {
  const nomor = process.env.NEXT_PUBLIC_WA_ADMIN;
  if (!nomor) return null;
  const t = await getTranslations("common");

  return (
    <a
      href={`https://wa.me/${nomor}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("whatsappAriaLabel")}
      className="fixed bottom-4 right-4 z-40 flex size-14 items-center justify-center rounded-full bg-warna-sukses text-warna-latar shadow-lg"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-7" aria-hidden="true">
        <path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.77.46 3.45 1.27 4.9L2 22l5.25-1.28A9.96 9.96 0 0 0 12.04 22c5.52 0 10-4.48 10-10s-4.48-10-10-10Zm0 18.13c-1.6 0-3.14-.43-4.48-1.24l-.32-.19-3.11.76.76-3.02-.21-.33a8.08 8.08 0 0 1-1.27-4.31c0-4.48 3.64-8.13 8.13-8.13 4.48 0 8.13 3.65 8.13 8.13s-3.65 8.13-8.13 8.13Zm4.47-6.09c-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.63.79-.78.95-.14.16-.29.18-.53.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.11-.49.11-.11.24-.29.36-.43.12-.14.16-.24.24-.4.08-.16.04-.31-.02-.43-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.42-.55-.42-.14-.01-.31-.01-.47-.01a.9.9 0 0 0-.65.31c-.22.24-.86.84-.86 2.05s.88 2.38 1 2.54c.12.16 1.73 2.64 4.19 3.7.59.25 1.04.4 1.4.52.59.19 1.12.16 1.54.1.47-.07 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28Z" />
      </svg>
    </a>
  );
}
