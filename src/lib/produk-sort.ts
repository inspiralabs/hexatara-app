import { nextUrutan } from '@/lib/reorder';

type ProdukUntukSort = {
  category_id: string | null;
  urutan: number | null;
  created_at: string | null;
};

// Produk (non-merchandise) dan Merchandise punya urutan sendiri (F15.8) —
// satu tabel `products`, kelompok dibedakan lewat category_id vs kategori
// "Merchandise". Kategori lain/NULL semuanya masuk kelompok "produk".
export function masukKelompokMerch(categoryId: string | null, kategoriMerchId: string | null): boolean {
  return kategoriMerchId != null && categoryId === kategoriMerchId;
}

function kelompokRank(categoryId: string | null, kategoriMerchId: string | null): number {
  return masukKelompokMerch(categoryId, kategoriMerchId) ? 1 : 0;
}

/** Urutan berikutnya (max + 1) di dalam satu kelompok saja — item baru selalu di akhir kelompoknya, bukan kelompok lain. */
export function urutanBerikutnyaUntukKelompok(
  items: { category_id: string | null; urutan: number }[],
  kategoriMerchId: string | null,
  isMerch: boolean
): number {
  const dalamKelompok = items.filter((item) => masukKelompokMerch(item.category_id, kategoriMerchId) === isMerch);
  return nextUrutan(dalamKelompok);
}

// Urutan default /katalog (F15.8): produk (non-merchandise) dulu, lalu
// merchandise — masing-masing kelompok naik berdasarkan urutan Admin,
// dasi dipecah oleh created_at terbaru dulu.
export function compareKatalogUrutan<T extends ProdukUntukSort>(
  a: T,
  b: T,
  kategoriMerchId: string | null
): number {
  const rankA = kelompokRank(a.category_id, kategoriMerchId);
  const rankB = kelompokRank(b.category_id, kategoriMerchId);
  if (rankA !== rankB) return rankA - rankB;

  const urutanA = a.urutan ?? 0;
  const urutanB = b.urutan ?? 0;
  if (urutanA !== urutanB) return urutanA - urutanB;

  const createdA = a.created_at ?? '';
  const createdB = b.created_at ?? '';
  return createdB.localeCompare(createdA);
}
