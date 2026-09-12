import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { CompanyProfileForm } from '../company-profile-form';

export default async function AdminKontenCompanyPage() {
  await requireAdmin();

  const supabase = await createClient();
  const { data: companyProfile, error } = await supabase
    .from('company_profile')
    .select('*')
    .eq('id', 1)
    .maybeSingle();

  if (error) console.error('[admin-konten-company] gagal memuat company profile:', error);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-warna-teks">Konten &rarr; Company Profile</h1>
      {companyProfile ? (
        <CompanyProfileForm profile={companyProfile} />
      ) : (
        <p className="text-sm text-destructive">Gagal memuat company profile. Coba muat ulang halaman.</p>
      )}
    </div>
  );
}
