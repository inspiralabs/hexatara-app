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
  // Satu gambar saja — CSS hide tetap fetch. MatchMedia pilih mobile vs desktop.
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const sudahDitutup = sessionStorage.getItem(`${KEY_PREFIX}${popup.id}`);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!sudahDitutup) setOpen(true);
  }, [popup.id]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  function tutup() {
    sessionStorage.setItem(`${KEY_PREFIX}${popup.id}`, "1");
    setOpen(false);
  }

  const src = isDesktop ? popup.gambarDesktopUrl : popup.gambarMobileUrl;
  // sizes ≈ max-w di md/lg/xl supaya next/image scale ikut container (bukan tetap 512px)
  const sizes = isDesktop
    ? "(min-width: 1280px) 1024px, (min-width: 1024px) 896px, (min-width: 768px) 768px, 100vw"
    : "360px";
  const aspect = isDesktop ? "aspect-video" : "aspect-[9/16]";

  // Auto-open on mount → gambar adalah LCP kandidat; wajib priority (bukan lazy).
  const gambar =
    open && src ? (
      <div className={`relative w-full overflow-hidden rounded-xl ${aspect}`}>
        <Image
          src={src}
          alt={popup.judul}
          fill
          priority
          className="object-cover"
          sizes={sizes}
        />
      </div>
    ) : null;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && tutup()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-sm gap-0 overflow-hidden p-0 md:max-w-3xl lg:max-w-4xl xl:max-w-5xl"
      >
        <button
          type="button"
          onClick={tutup}
          aria-label={t("closeAriaLabel")}
          className="absolute right-2 top-2 z-10 flex size-11 items-center justify-center rounded-full bg-background/80 text-foreground hover:bg-background"
        >
          <XIcon className="size-5" aria-hidden="true" />
        </button>

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
