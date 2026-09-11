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
