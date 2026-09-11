export const SORT_VALUES = ["terbaru", "hargaAsc", "hargaDesc"] as const;
export type ProdukSort = (typeof SORT_VALUES)[number];
