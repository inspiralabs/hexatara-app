'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AntreanTable, type AntreanRow, SertifikatDitolakTable, type DitolakRow } from '../../upgrade/upgrade-tables';
import { PesananMerchandiseTable, type PesananMerchandiseRow } from './pesanan-merchandise-table';

export function PesananMerchandiseTabs({
  antrean,
  ditolak,
  disetujui,
}: {
  antrean: AntreanRow[];
  ditolak: DitolakRow[];
  disetujui: PesananMerchandiseRow[];
}) {
  return (
    <Tabs defaultValue="menunggu">
      <TabsList variant="line" className="h-auto w-full flex-wrap justify-start gap-1 sm:w-fit">
        <TabsTrigger value="menunggu" className="px-3 py-2">
          Menunggu verifikasi ({antrean.length})
        </TabsTrigger>
        <TabsTrigger value="ditolak" className="px-3 py-2">
          Ditolak ({ditolak.length})
        </TabsTrigger>
        <TabsTrigger value="disetujui" className="px-3 py-2">
          Sudah disetujui ({disetujui.length})
        </TabsTrigger>
      </TabsList>
      <TabsContent value="menunggu" className="mt-4">
        <AntreanTable antrean={antrean} merchandise />
      </TabsContent>
      <TabsContent value="ditolak" className="mt-4">
        <SertifikatDitolakTable rows={ditolak} emptyMessage="Tidak ada pesanan merchandise yang ditolak." tanpaFilter />
      </TabsContent>
      <TabsContent value="disetujui" className="mt-4">
        <PesananMerchandiseTable rows={disetujui} />
      </TabsContent>
    </Tabs>
  );
}
