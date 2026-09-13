import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { ProfilAdminForms } from './profil-forms';

export default async function AdminProfilPage() {
  const claims = await requireAdmin();
  const supabase = await createClient();
  const [{ data: profile }, { data: authUser }] = await Promise.all([
    supabase.from('profiles').select('nama_lengkap').eq('id', claims.sub).maybeSingle(),
    supabase.auth.getUser(),
  ]);

  const email = authUser.user?.email ?? '';

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-warna-teks">Profil</h1>
      </div>
      <ProfilAdminForms namaLengkap={profile?.nama_lengkap ?? ''} email={email} />
    </div>
  );
}
