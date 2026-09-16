"use client";

import { useLayoutEffect } from "react";

/**
 * Hapus class dark yang mungkin tertinggal dari ThemeProvider (user) saat
 * navigasi ke publik/auth/kelas.
 *
 * `surface="public"` juga menempelkan data-surface di <html> supaya Dialog/
 * Sheet yang di-portal ke body tetap mewarisi token Cobalt Mist (§12.6.9).
 */
export function ForceLightDocument({ surface }: { surface?: "public" }) {
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark");
    root.style.colorScheme = "light";
    if (surface) root.setAttribute("data-surface", surface);
    return () => {
      if (surface) root.removeAttribute("data-surface");
    };
  }, [surface]);
  return null;
}
