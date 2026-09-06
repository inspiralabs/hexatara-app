import { requireAdmin } from '@/lib/auth/guard';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
