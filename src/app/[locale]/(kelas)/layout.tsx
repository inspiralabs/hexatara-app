import { ThemeProvider } from "@/components/shell/theme-provider";

/** Kelas materi selalu light — dark mode hanya di dashboard. */
export default function KelasLayout({ children }: { children: React.ReactNode }) {
  return <ThemeProvider forcedTheme="light">{children}</ThemeProvider>;
}
