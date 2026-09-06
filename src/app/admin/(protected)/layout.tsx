import { requireAdmin } from '@/lib/auth/guard';

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  // Sidebar & menu penuh menyusul di F00.8 — ini kerangka minimum
  // supaya requireAdmin() bisa diuji sekarang.
  return <div className="min-h-screen p-4">{children}</div>;
}
