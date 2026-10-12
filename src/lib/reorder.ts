// Menukar posisi item pada index dengan tetangganya (naik/turun). Dipakai bareng
// tombol ReorderButtons — hasilnya array id baru yang dikirim ke Server Action
// reorder (ADR-014).
export function moveItem<T>(items: T[], index: number, direction: 'up' | 'down'): T[] {
  const target = direction === 'up' ? index - 1 : index + 1;
  if (target < 0 || target >= items.length) return items;
  const hasil = [...items];
  [hasil[index], hasil[target]] = [hasil[target]!, hasil[index]!];
  return hasil;
}

// Urutan untuk baris baru = urutan tertinggi yang ada + 1, supaya item baru
// selalu muncul paling bawah (F15.7) — menggantikan input angka manual.
export function nextUrutan(items: { urutan: number }[]): number {
  if (items.length === 0) return 0;
  return Math.max(...items.map((item) => item.urutan)) + 1;
}
