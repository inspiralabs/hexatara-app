import { createServerClient } from '@supabase/ssr';
import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from '@/i18n/routing';

const handleI18nRouting = createMiddleware(routing);

// /admin, /api, /auth (Route Handler konfirmasi email Supabase), dan /templates
// (berkas statis di public/templates — CSV impor F02.8, PDF sertifikat F03.4)
// TIDAK pernah masuk pohon [locale] — proxy Supabase tetap jalan di jalur-jalur
// ini (auth Admin butuh refresh token juga), hanya locale routing yang dilewati.
// Matcher di bawah hanya mengecualikan ekstensi gambar, jadi berkas statis lain
// tanpa prefix di sini akan salah diarahkan next-intl seolah-olah butuh locale.
const LOCALE_EXCLUDED_PREFIXES = ['/admin', '/api', '/auth', '/templates'];

function shouldSkipLocaleRouting(pathname: string) {
  return LOCALE_EXCLUDED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export async function proxy(request: NextRequest) {
  const skipLocale = shouldSkipLocaleRouting(request.nextUrl.pathname);
  let response = skipLocale ? NextResponse.next({ request }) : handleI18nRouting(request);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = skipLocale ? NextResponse.next({ request }) : handleI18nRouting(request);
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Memicu refresh token kalau sudah kadaluwarsa. Hanya itu tugas proxy
  // ini — keputusan izin/redirect tetap satu-satunya tanggung jawab guard.ts.
  await supabase.auth.getClaims();

  return response;
}

export const config = {
  // Jangan jalankan next-intl pada metadata route / berkas bertitik.
  // Tanpa ini, /sitemap.xml & /robots.txt masuk [locale] → 404 bawaan Next.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
