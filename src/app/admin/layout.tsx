import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "../globals.css";

const inter = Inter({
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
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Toaster position="top-center" toastOptions={{ classNames: { error: '!bg-warna-bahaya !text-warna-latar' } }} />
      </body>
    </html>
  );
}
