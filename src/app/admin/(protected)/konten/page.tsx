import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PopupList } from './popup-list';
import { SaleBannerList } from './sale-banner-list';
import { HeroSlideList } from './hero-slide-list';
import { InstructorList } from './instructor-list';
import { CompanyProfileForm } from './company-profile-form';
import { TestimonialList } from './testimonial-list';

export default async function AdminKontenPage() {
  // Layout sudah memanggil requireAdmin(), tapi Server Component ini dipanggil
  // lagi secara eksplisit sesuai ENGINEERING §4.1 — bukan cuma diandalkan dari layout.
  await requireAdmin();

  const supabase = await createClient();
  const { data: popups, error } = await supabase
    .from('popups')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) console.error('[admin-konten] gagal memuat popup:', error);

  const { data: saleBanners, error: errorBanner } = await supabase
    .from('sale_banners')
    .select('*')
    .order('created_at', { ascending: false });

  if (errorBanner) console.error('[admin-konten] gagal memuat sale banner:', errorBanner);

  const { data: heroSlides, error: errorHero } = await supabase
    .from('hero_slides')
    .select('*')
    .order('urutan', { ascending: true });

  if (errorHero) console.error('[admin-konten] gagal memuat hero slide:', errorHero);

  const { data: instructors, error: errorInstructor } = await supabase
    .from('instructors')
    .select('*')
    .order('urutan', { ascending: true });

  if (errorInstructor) console.error('[admin-konten] gagal memuat instruktur:', errorInstructor);

  const { data: companyProfile, error: errorCompany } = await supabase
    .from('company_profile')
    .select('*')
    .eq('id', 1)
    .maybeSingle();

  if (errorCompany) console.error('[admin-konten] gagal memuat company profile:', errorCompany);

  const { data: testimonials, error: errorTestimonial } = await supabase
    .from('testimonials')
    .select('*')
    .order('urutan', { ascending: true });

  if (errorTestimonial) console.error('[admin-konten] gagal memuat testimoni:', errorTestimonial);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-warna-teks">Konten Landing</h1>

      <Tabs defaultValue="popup">
        <TabsList>
          <TabsTrigger value="popup">Pop-up</TabsTrigger>
          <TabsTrigger value="banner">Sale Banner</TabsTrigger>
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="instruktur">Instruktur</TabsTrigger>
          <TabsTrigger value="company">Company Profile</TabsTrigger>
          <TabsTrigger value="testimoni">Testimoni</TabsTrigger>
        </TabsList>

        <TabsContent value="popup">
          <PopupList popups={popups ?? []} />
        </TabsContent>
        <TabsContent value="banner">
          <SaleBannerList banners={saleBanners ?? []} />
        </TabsContent>
        <TabsContent value="hero">
          <HeroSlideList slides={heroSlides ?? []} />
        </TabsContent>
        <TabsContent value="instruktur">
          <InstructorList instructors={instructors ?? []} />
        </TabsContent>
        <TabsContent value="company">
          {companyProfile ? (
            <CompanyProfileForm profile={companyProfile} />
          ) : (
            <p className="pt-6 text-sm text-destructive">Gagal memuat company profile. Coba muat ulang halaman.</p>
          )}
        </TabsContent>
        <TabsContent value="testimoni">
          <TestimonialList testimonials={testimonials ?? []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
