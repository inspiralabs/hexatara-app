import { describe, expect, it } from 'vitest';
import { moveItem, nextUrutan } from './reorder';

describe('moveItem', () => {
  it('menukar posisi dengan tetangga saat naik/turun', () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
    expect(moveItem(items, 1, 'up').map((i) => i.id)).toEqual([2, 1, 3]);
    expect(moveItem(items, 1, 'down').map((i) => i.id)).toEqual([1, 3, 2]);
  });

  it('tidak berubah di batas atas/bawah', () => {
    const items = [{ id: 1 }, { id: 2 }];
    expect(moveItem(items, 0, 'up')).toBe(items);
    expect(moveItem(items, 1, 'down')).toBe(items);
  });
});

describe('nextUrutan', () => {
  it('0 untuk daftar kosong', () => {
    expect(nextUrutan([])).toBe(0);
  });

  it('max + 1 untuk daftar terisi', () => {
    expect(nextUrutan([{ urutan: 0 }, { urutan: 3 }, { urutan: 1 }])).toBe(4);
  });
});
