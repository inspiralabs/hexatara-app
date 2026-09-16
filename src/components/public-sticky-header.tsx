"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function PublicStickyHeader({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm [transition:var(--transition-hover)]",
        scrolled && "shadow-float"
      )}
    >
      {children}
    </header>
  );
}
