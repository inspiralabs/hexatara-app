'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function LihatBukti({ url }: { url: string }) {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="link" className="h-auto px-0 text-foreground underline underline-offset-4" />}>
        Lihat bukti
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Bukti transfer</DialogTitle>
        </DialogHeader>
        {/* eslint-disable-next-line @next/next/no-img-element -- signed URL bucket privat */}
        <img src={url} alt="Bukti transfer" className="max-h-[70vh] w-full object-contain" />
      </DialogContent>
    </Dialog>
  );
}
