export const SORT_VALUES = ["tanggalTerdekat", "terbaru", "hargaAsc", "hargaDesc"] as const;
export type PelatihanSort = (typeof SORT_VALUES)[number];
