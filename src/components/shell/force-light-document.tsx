"use client";

import { useLayoutEffect } from "react";

/** Hapus class dark yang mungkin tertinggal dari ThemeProvider (user) saat navigasi ke publik/auth/kelas. */
export function ForceLightDocument() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark");
    root.style.colorScheme = "light";
  }, []);
  return null;
}
