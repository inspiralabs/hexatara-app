/** Cobalt mist — hex eksplisit. Recharts SVG sering gagal resolve var(--chart-*). */
export const CHART_COBALT = [
  '#93c5fd', // terang
  '#60a5fa',
  '#3b82f6',
  '#2563eb',
  '#1E40AF', // --warna-utama
  '#1e3a8a', // gelap
] as const;

export const CHART_COBALT_PRIMARY = CHART_COBALT[4];
export const CHART_COBALT_SECONDARY = CHART_COBALT[1];
