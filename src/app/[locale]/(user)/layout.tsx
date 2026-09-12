import { requireUser } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { UserSidebar } from '@/components/user-sidebar';

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const claims = await requireUser();
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('nama_lengkap')
    .eq('id', claims.sub)
    .maybeSingle();

  return (
    <div className="flex min-h-full flex-1 flex-col md:flex-row">
      <UserSidebar namaLengkap={profile?.nama_lengkap ?? ''} />
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
