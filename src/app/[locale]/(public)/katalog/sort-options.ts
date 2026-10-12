// "urutan" (default) = urutan pilihan Admin: produk dulu, lalu merchandise,
// masing-masing kelompok naik — lihat compareKatalogUrutan() (F15.8).
export const SORT_VALUES = ["urutan", "terbaru", "hargaAsc", "hargaDesc"] as const;
export type ProdukSort = (typeof SORT_VALUES)[number];
