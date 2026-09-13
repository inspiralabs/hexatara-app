import { ThemeProvider } from "@/components/shell/theme-provider";

/** Auth (login/daftar/lupa-sandi) selalu light — dark mode hanya di dashboard. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <ThemeProvider forcedTheme="light">{children}</ThemeProvider>;
}
