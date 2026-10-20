import { describe, expect, it } from 'vitest';
import { HapusSoalBatchSchema } from './soal-admin';

describe('HapusSoalBatchSchema', () => {
  it('menerima daftar id valid', () => {
    expect(HapusSoalBatchSchema.safeParse([1, 2, 3]).success).toBe(true);
  });
  it('menolak kosong', () => {
    expect(HapusSoalBatchSchema.safeParse([]).success).toBe(false);
  });
  it('menolak lebih dari 200', () => {
    expect(HapusSoalBatchSchema.safeParse(Array.from({ length: 201 }, (_, i) => i + 1)).success).toBe(false);
    expect(HapusSoalBatchSchema.safeParse(Array.from({ length: 200 }, (_, i) => i + 1)).success).toBe(true);
  });
  it('menolak bukan integer positif', () => {
    expect(HapusSoalBatchSchema.safeParse([1.5]).success).toBe(false);
    expect(HapusSoalBatchSchema.safeParse([0]).success).toBe(false);
    expect(HapusSoalBatchSchema.safeParse([-1]).success).toBe(false);
    expect(HapusSoalBatchSchema.safeParse(['1']).success).toBe(false);
  });
});
