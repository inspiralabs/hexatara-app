import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "@/components/shell/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "../globals.css";

const geist = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hexatara — Pelatihan Pilot Drone Bersertifikat",
  description:
    "Pelatihan pilot drone bersertifikat (Remote Pilot Certificate) dan penjualan drone profesional Autel oleh Hexatara Indonesia.",
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="id" className={`${geist.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col font-sans">
        <ThemeProvider>
          {children}
          <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
