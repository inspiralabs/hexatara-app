'use client';

import { ChevronUpIcon, ChevronDownIcon } from 'lucide-react';

// Reorder naik/turun (ADR-014) — bukan drag-and-drop, supaya tidak menambah
// dependency baru (larangan #7). Dipakai di daftar bab dan daftar lampiran file.
// size-11 = target sentuh ≥44px (mobile-first).
export function ReorderButtons({
  disabledUp,
  disabledDown,
  onUp,
  onDown,
  label,
}: {
  disabledUp: boolean;
  disabledDown: boolean;
  onUp: () => void;
  onDown: () => void;
  label: string;
}) {
  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={onUp}
        disabled={disabledUp}
        aria-label={`Naikkan urutan ${label}`}
        className="flex size-11 items-center justify-center rounded-md text-muted-foreground hover:bg-muted disabled:opacity-30"
      >
        <ChevronUpIcon className="size-5" />
      </button>
      <button
        type="button"
        onClick={onDown}
        disabled={disabledDown}
        aria-label={`Turunkan urutan ${label}`}
        className="flex size-11 items-center justify-center rounded-md text-muted-foreground hover:bg-muted disabled:opacity-30"
      >
        <ChevronDownIcon className="size-5" />
      </button>
    </div>
  );
}
