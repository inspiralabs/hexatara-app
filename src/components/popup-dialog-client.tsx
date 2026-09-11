"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { PopupAktif } from "@/components/popup-pembuka";

const KEY_PREFIX = "hexatara-popup-tertutup-";

export function PopupDialogClient({ popup }: { popup: PopupAktif }) {
  const t = useTranslations("common");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // sessionStorage tidak ada di server — baru bisa dicek setelah mount di client.
    const sudahDitutup = sessionStorage.getItem(`${KEY_PREFIX}${popup.id}`);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!sudahDitutup) setOpen(true);
  }, [popup.id]);

  function tutup() {
    sessionStorage.setItem(`${KEY_PREFIX}${popup.id}`, "1");
    setOpen(false);
  }

  // Popup ADR-015: murni gambar, dua versi (potret mobile / lanskap desktop)
  // dipilih lewat breakpoint Tailwind `md`, bukan JS matchMedia — CSS saja.
  const gambar = (
    <>
      {popup.gambarMobileUrl && (
        <div className="relative aspect-[9/16] w-full overflow-hidden rounded-xl md:hidden">
          <Image src={popup.gambarMobileUrl} alt={popup.judul} fill className="object-cover" sizes="360px" priority />
        </div>
      )}
      {popup.gambarDesktopUrl && (
        <div className="relative hidden aspect-video w-full overflow-hidden rounded-xl md:block">
          <Image src={popup.gambarDesktopUrl} alt={popup.judul} fill className="object-cover" sizes="480px" priority />
        </div>
      )}
    </>
  );

  return (
    <Dialog open={open} onOpenChange={(next) => !next && tutup()}>
      <DialogContent showCloseButton={false} className="max-w-sm gap-0 overflow-hidden p-0 md:max-w-lg">
        <button
          type="button"
          onClick={tutup}
          aria-label={t("closeAriaLabel")}
          className="absolute right-2 top-2 z-10 flex size-11 items-center justify-center rounded-full bg-warna-latar/80 text-warna-teks hover:bg-warna-latar"
        >
          <XIcon className="size-5" aria-hidden="true" />
        </button>

        {/* Judul cuma untuk aksesibilitas (nama dialog dibacakan screen reader) — tidak
            tampil secara visual, gambar sendiri sudah menyampaikan pesannya. */}
        <DialogHeader className="sr-only">
          <DialogTitle>{popup.judul}</DialogTitle>
        </DialogHeader>

        {popup.cta_url ? (
          <a href={popup.cta_url} target="_blank" rel="noopener noreferrer" className="block">
            {gambar}
          </a>
        ) : (
          gambar
        )}
      </DialogContent>
    </Dialog>
  );
}
