"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { XIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { PopupAktif } from "@/components/popup-pembuka";

const KEY_PREFIX = "hexatara-popup-tertutup-";

export function PopupDialogClient({ popup }: { popup: PopupAktif }) {
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

  return (
    <Dialog open={open} onOpenChange={(next) => !next && tutup()}>
      <DialogContent showCloseButton={false} className="max-w-md">
        <button
          type="button"
          onClick={tutup}
          aria-label="Tutup"
          className="absolute right-1 top-1 flex size-11 items-center justify-center rounded-full text-warna-teks-2 hover:bg-warna-latar-2"
        >
          <XIcon className="size-5" aria-hidden="true" />
        </button>

        <DialogHeader>
          <DialogTitle className="pr-8 text-lg text-warna-teks">{popup.judul_id}</DialogTitle>
        </DialogHeader>

        {popup.gambar_url && (
          <div className="relative aspect-video w-full overflow-hidden rounded-md">
            <Image
              src={popup.gambar_url}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 480px) 100vw, 480px"
            />
          </div>
        )}

        <DialogDescription className="whitespace-pre-line text-base text-warna-teks">
          {popup.isi_id}
        </DialogDescription>

        {popup.cta_teks_id && popup.cta_url && (
          <DialogFooter className="mx-0 mb-0 justify-start border-t-0 bg-transparent p-0">
            <a
              href={popup.cta_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-warna-aksen px-5 text-base font-semibold text-warna-teks"
            >
              {popup.cta_teks_id}
            </a>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
