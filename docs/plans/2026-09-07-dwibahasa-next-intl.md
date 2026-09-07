# F00.4 + F01.11 — Dwibahasa (next-intl) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Move the public/auth route tree under `src/app/[locale]/`, wire up next-intl with `localePrefix: 'as-needed'` (id = no prefix, en = `/en`), extract hardcoded Indonesian JSX text into `messages/{id,en}.json`, add the `pick()` `_id`/`_en` fallback helper everywhere a bilingual DB column is read, and add a language switcher — without touching `src/app/admin/`, without changing any business logic, and without adding any dependency beyond next-intl (already present).

**Architecture:** Standard next-intl v4 App Router setup (`src/i18n/routing.ts`, `request.ts`, `navigation.ts`) with a `[locale]` dynamic segment. Because this project already runs Next.js 16 (proxy convention, see Decisions below), next-intl's routing middleware is merged into the *existing* `src/proxy.ts` (Supabase session refresh) rather than a new `middleware.ts`. Because `/admin` must stay locale-free while the rest of the public app needs its own `<html lang>`, the app moves to Next.js's "multiple root layouts" pattern: the shared `src/app/layout.tsx` is deleted and replaced by two root layouts — `src/app/admin/layout.tsx` (id-only, untouched behavior) and `src/app/[locale]/layout.tsx` (locale-aware, wraps `NextIntlClientProvider`).

**Tech Stack:** next-intl (already in `package.json`, see Decision 1), Next.js 16 App Router, no new dependencies.

---

## Decisions that deviate from the literal task text (flagging per CLAUDE.md — not silently picked)

1. **next-intl version: 3.x asked, 4.14.2 is what's actually installed.**
   `package.json`/`pnpm-lock.yaml` already have `next-intl@^4.14.2` resolved in `node_modules` (uncommitted addition from a prior session, not something this plan introduces). PRD.md §2 and the task text both say "3.x". v3's App Router API (`createSharedPathnamesNavigation`, old middleware shape) is meaningfully different from v4's (`defineRouting`, `createNavigation`, `routing.ts`). Given the app is already on Next.js 16 (see point 3), v4 is the version next-intl actually recommends for Next 15/16. **Recommendation: build against the already-installed v4.14.2, not downgrade to 3.x.** This plan is written for v4. Say so now if you'd rather force a downgrade to 3.x first.

2. **`middleware.ts` asked, but this repo has no `middleware.ts` — it has `src/proxy.ts`.**
   Next.js 16 renamed the middleware file convention to `proxy.ts` (confirmed against Next.js 16 docs and this repo's own history — `src/proxy.ts` already exists and does Supabase session-cookie refresh). Only one such file can exist. **Resolution: extend `src/proxy.ts` in place** — run next-intl's locale routing conditionally (skipped for `/admin`, `/api`, `/auth` prefixes) inside the same function that already refreshes the Supabase session, instead of creating a separate `middleware.ts` that Next 16 would never call.

3. **Pre-existing, out of scope, flagging for awareness only:** `package.json` already has `"next": "16.3.4"` and `"next-themes": "^0.4.6"` committed (commit `d8a2371`), both of which contradict PRD/ENGINEERING's "Next.js 15.x locked" / "`next-themes` forbidden" rules. This predates this task and isn't something F00.4/F01.11 asked to fix — not touched here, just noting it exists so it isn't mistaken for something this plan did.

4. **`admin` message namespace: PRD §4.2 lists it, PRD §4.1 says Admin UI is never bilingual.** These two sentences of the PRD contradict each other. Resolution used below: create an **empty** `"admin": {}` object in both `messages/id.json` and `messages/en.json` for structural parity with the namespace list, but nothing in `src/app/admin/` reads from it (admin isn't wrapped in `NextIntlClientProvider` and doesn't call `useTranslations`/`getTranslations`). Zero behavior change, just satisfies the literal namespace list. Say so if you'd rather omit the key entirely.

5. **Scope boundary, not a deviation — stated explicitly per "berhenti dan katakan" rather than silently narrowing:** task step 4 says extract text "yang tertulis langsung di JSX". Applying that literally:
   - Zod validation messages (`src/lib/validations/*.ts`) and Server Action result strings (e.g. `'Gagal mendaftar. Coba lagi.'` in `actions.ts` files) are **not** JSX — left in Indonesian, untouched, this pass.
   - The WhatsApp message templates built in `daftar-minat-dialog` flow (`Halo Admin Hexatara, saya {nama} ingin mendaftar...`) and `buildWaTanyaLink` are messages sent *to the Indonesian Admin*, not UI copy — left untouched.
   - `formatRupiah`/`formatTanggalBatch` (`src/lib/batch.ts`) keep formatting as `id-ID` regardless of UI language (Rupiah amounts and dates read fine either way; PRD's acceptance criteria don't ask for locale-aware number/date formatting). Only the human-language *labels* around them (status text, "Waktu:", etc.) get translated.

None of these four are business-logic changes; they're all scoping/routing calls within "murni pemindahan teks dan routing".

---

## Complete file-move list

`(user)` doesn't exist yet (F03.9 dashboard is still TODO) — nothing to move there; new dashboard work should be created directly under `src/app/[locale]/(user)/` when that sprint starts.

```
src/app/(public)/layout.tsx                          -> src/app/[locale]/(public)/layout.tsx
src/app/(public)/page.tsx                             -> src/app/[locale]/(public)/page.tsx
src/app/(public)/batch/[slug]/page.tsx                -> src/app/[locale]/(public)/batch/[slug]/page.tsx
src/app/(public)/batch/[slug]/actions.ts               -> src/app/[locale]/(public)/batch/[slug]/actions.ts
src/app/(public)/batch/[slug]/daftar-minat-dialog.tsx -> src/app/[locale]/(public)/batch/[slug]/daftar-minat-dialog.tsx
src/app/(auth)/daftar/page.tsx                        -> src/app/[locale]/(auth)/daftar/page.tsx
src/app/(auth)/daftar/daftar-form.tsx                 -> src/app/[locale]/(auth)/daftar/daftar-form.tsx
src/app/(auth)/daftar/actions.ts                      -> src/app/[locale]/(auth)/daftar/actions.ts
src/app/(auth)/login/page.tsx                         -> src/app/[locale]/(auth)/login/page.tsx
src/app/(auth)/login/login-form.tsx                   -> src/app/[locale]/(auth)/login/login-form.tsx
src/app/(auth)/login/actions.ts                       -> src/app/[locale]/(auth)/login/actions.ts
src/app/(auth)/lupa-sandi/page.tsx                    -> src/app/[locale]/(auth)/lupa-sandi/page.tsx
src/app/(auth)/lupa-sandi/lupa-sandi-form.tsx         -> src/app/[locale]/(auth)/lupa-sandi/lupa-sandi-form.tsx
src/app/(auth)/lupa-sandi/actions.ts                  -> src/app/[locale]/(auth)/lupa-sandi/actions.ts
src/app/(auth)/reset-sandi/page.tsx                   -> src/app/[locale]/(auth)/reset-sandi/page.tsx
src/app/(auth)/reset-sandi/reset-sandi-form.tsx       -> src/app/[locale]/(auth)/reset-sandi/reset-sandi-form.tsx
src/app/(auth)/reset-sandi/actions.ts                 -> src/app/[locale]/(auth)/reset-sandi/actions.ts
src/app/(auth)/verifikasi-email/page.tsx              -> src/app/[locale]/(auth)/verifikasi-email/page.tsx
```

**Not moved, not touched:** everything under `src/app/admin/`, `src/app/auth/confirm/route.ts` (Route Handler — Supabase email links point here; must stay reachable at an unprefixed, locale-independent URL), `src/app/globals.css`.

**Deleted:** `src/app/layout.tsx` (replaced by two root layouts, see Task 3).

**Copied then removed from `src/app/`:** `favicon.ico`, `icon.png` — Next's file-convention icons resolve per root-layout folder under the "multiple root layouts" pattern, so each new root (`src/app/admin/`, `src/app/[locale]/`) needs its own copy.

**New files:** `src/i18n/routing.ts`, `src/i18n/request.ts`, `src/i18n/navigation.ts`, `src/app/[locale]/layout.tsx`, `src/app/admin/layout.tsx`, `src/lib/i18n/pick.ts`, `src/components/language-switcher.tsx`, `messages/id.json`, `messages/en.json`.

**Modified in place (not moved):** `next.config.ts`, `src/proxy.ts`, `src/lib/batch.ts` (status label lookup only touched at call sites, file itself unchanged — see Task 8), all components in `src/components/` that render public UI text or read `_id` DB columns (list in Task 9).

---

## Task 1: next-intl core config

**Files:**
- Create: `src/i18n/routing.ts`
- Create: `src/i18n/request.ts`
- Create: `src/i18n/navigation.ts`

**Step 1: Write `src/i18n/routing.ts`**

```ts
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["id", "en"],
  defaultLocale: "id",
  localePrefix: "as-needed",
});
```

**Step 2: Write `src/i18n/request.ts`**

```ts
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
```

**Step 3: Write `src/i18n/navigation.ts`**

```ts
import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
```

No test for this task — pure config, verified by the build in Task 12.

---

## Task 2: wire next-intl into `next.config.ts`

**Files:**
- Modify: `next.config.ts`

**Step 1: Add the plugin wrapper**

```ts
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'ojltfmvmbolalhtzrhva.supabase.co', pathname: '/storage/v1/object/public/**' },
    ],
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
```

---

## Task 3: `pick()` helper

**Files:**
- Create: `src/lib/i18n/pick.ts`

```ts
export function pick<T>(id: T | null, en: T | null, locale: string): T | null {
  return locale === "en" ? (en ?? id) : id;
}
```

This is verbatim from ENGINEERING.md §5.9 / the task text — no test needed, it's a one-line ternary with an obvious truth table (already exercised in Task 9's components).

---

## Task 4: multiple root layouts — delete shared root, add two new roots

**Files:**
- Delete: `src/app/layout.tsx`
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/[locale]/layout.tsx`
- Move: `src/app/favicon.ico` -> copy into `src/app/admin/favicon.ico` and `src/app/[locale]/favicon.ico`
- Move: `src/app/icon.png` -> copy into `src/app/admin/icon.png` and `src/app/[locale]/icon.png`

**Step 1: Copy the icon files (PowerShell, run from repo root)**

```powershell
Copy-Item src/app/favicon.ico src/app/admin/favicon.ico
Copy-Item src/app/icon.png src/app/admin/icon.png
New-Item -ItemType Directory -Force src/app/[locale] | Out-Null
Copy-Item src/app/favicon.ico "src/app/[locale]/favicon.ico"
Copy-Item src/app/icon.png "src/app/[locale]/icon.png"
Remove-Item src/app/favicon.ico
Remove-Item src/app/icon.png
```

**Step 2: Write `src/app/admin/layout.tsx`** (exact content of the old `src/app/layout.tsx`, just renamed function + import path unchanged since same depth)

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
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
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
```

**Step 3: Write `src/app/[locale]/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Inter } from "next/font/google";
import { routing } from "@/i18n/routing";
import "../globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
```

`src/app/auth/confirm/route.ts` is a Route Handler (no JSX rendered), so it needs no root layout at all — Next.js only requires one for the page-rendering tree, not for `route.ts` files. Leave it exactly where it is.

---

## Task 5: extend `src/proxy.ts` with locale routing

**Files:**
- Modify: `src/proxy.ts`

**Step 1: Replace the file content**

```ts
import { createServerClient } from '@supabase/ssr';
import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from '@/i18n/routing';

const handleI18nRouting = createMiddleware(routing);

// /admin, /api, dan /auth (Route Handler konfirmasi email Supabase) TIDAK
// pernah masuk pohon [locale] — proxy Supabase tetap jalan di jalur-jalur
// ini (auth Admin butuh refresh token juga), hanya locale routing yang dilewati.
const LOCALE_EXCLUDED_PREFIXES = ['/admin', '/api', '/auth'];

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
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
```

Matcher is unchanged from before (it must stay broad so Supabase session refresh keeps running on `/admin/*`) — the `/admin`, `/api`, `/auth` exclusion happens inside the function, scoped to the locale-rewriting call only. This is the resolution to Decision 2 above.

---

## Task 6: move the 18 route files

**Step 1: Move with git mv (preserves history), run from repo root**

```powershell
New-Item -ItemType Directory -Force "src/app/[locale]/(public)/batch/[slug]" | Out-Null
New-Item -ItemType Directory -Force "src/app/[locale]/(auth)/daftar" | Out-Null
New-Item -ItemType Directory -Force "src/app/[locale]/(auth)/login" | Out-Null
New-Item -ItemType Directory -Force "src/app/[locale]/(auth)/lupa-sandi" | Out-Null
New-Item -ItemType Directory -Force "src/app/[locale]/(auth)/reset-sandi" | Out-Null
New-Item -ItemType Directory -Force "src/app/[locale]/(auth)/verifikasi-email" | Out-Null

git mv "src/app/(public)/layout.tsx" "src/app/[locale]/(public)/layout.tsx"
git mv "src/app/(public)/page.tsx" "src/app/[locale]/(public)/page.tsx"
git mv "src/app/(public)/batch/[slug]/page.tsx" "src/app/[locale]/(public)/batch/[slug]/page.tsx"
git mv "src/app/(public)/batch/[slug]/actions.ts" "src/app/[locale]/(public)/batch/[slug]/actions.ts"
git mv "src/app/(public)/batch/[slug]/daftar-minat-dialog.tsx" "src/app/[locale]/(public)/batch/[slug]/daftar-minat-dialog.tsx"

git mv "src/app/(auth)/daftar/page.tsx" "src/app/[locale]/(auth)/daftar/page.tsx"
git mv "src/app/(auth)/daftar/daftar-form.tsx" "src/app/[locale]/(auth)/daftar/daftar-form.tsx"
git mv "src/app/(auth)/daftar/actions.ts" "src/app/[locale]/(auth)/daftar/actions.ts"

git mv "src/app/(auth)/login/page.tsx" "src/app/[locale]/(auth)/login/page.tsx"
git mv "src/app/(auth)/login/login-form.tsx" "src/app/[locale]/(auth)/login/login-form.tsx"
git mv "src/app/(auth)/login/actions.ts" "src/app/[locale]/(auth)/login/actions.ts"

git mv "src/app/(auth)/lupa-sandi/page.tsx" "src/app/[locale]/(auth)/lupa-sandi/page.tsx"
git mv "src/app/(auth)/lupa-sandi/lupa-sandi-form.tsx" "src/app/[locale]/(auth)/lupa-sandi/lupa-sandi-form.tsx"
git mv "src/app/(auth)/lupa-sandi/actions.ts" "src/app/[locale]/(auth)/lupa-sandi/actions.ts"

git mv "src/app/(auth)/reset-sandi/page.tsx" "src/app/[locale]/(auth)/reset-sandi/page.tsx"
git mv "src/app/(auth)/reset-sandi/reset-sandi-form.tsx" "src/app/[locale]/(auth)/reset-sandi/reset-sandi-form.tsx"
git mv "src/app/(auth)/reset-sandi/actions.ts" "src/app/[locale]/(auth)/reset-sandi/actions.ts"

git mv "src/app/(auth)/verifikasi-email/page.tsx" "src/app/[locale]/(auth)/verifikasi-email/page.tsx"

Remove-Item "src/app/(public)" -Recurse -Force
Remove-Item "src/app/(auth)" -Recurse -Force
```

No content changes yet — this task is the move only. Verify nothing was lost:

```powershell
git status
```

Expected: 18 renames, no deletions without a matching rename.

---

## Task 7: `messages/id.json` and `messages/en.json`

**Files:**
- Create: `messages/id.json`
- Create: `messages/en.json`

**Step 1: Write `messages/id.json`**

```json
{
  "common": {
    "metaTitle": "Hexatara — Pelatihan Pilot Drone Bersertifikat",
    "metaDescription": "Pelatihan pilot drone bersertifikat (Remote Pilot Certificate) dan penjualan drone profesional Autel oleh Hexatara Indonesia.",
    "companyName": "Hexatara Indonesia",
    "footerTagline": "Pelatihan pilot drone bersertifikat & penjualan drone profesional Autel — Bekasi.",
    "footerCopyright": "© {year} Hexatara Indonesia.",
    "whatsappAriaLabel": "Hubungi Admin lewat WhatsApp",
    "closeAriaLabel": "Tutup",
    "openMenuAriaLabel": "Buka menu navigasi",
    "menuLabel": "Menu",
    "processing": "Memproses…"
  },
  "nav": {
    "home": "Beranda",
    "verify": "Verifikasi Sertifikat",
    "materi": "Materi & Kuis",
    "katalog": "Katalog Produk",
    "switchToId": "Indonesia",
    "switchToEn": "English"
  },
  "landing": {
    "offerTrainingTitle": "Pelatihan Pilot Drone Bersertifikat",
    "offerTrainingDesc": "Sertifikasi RPC resmi, kelas bulanan bersama instruktur berpengalaman.",
    "offerTrainingCta": "Lihat Jadwal",
    "offerRetailTitle": "Jual Drone Profesional Autel",
    "offerRetailDesc": "Drone untuk kebutuhan survei, pemetaan, dan industri.",
    "offerRetailCta": "Lihat Katalog",
    "scheduleHeading": "Jadwal Pelatihan Mendatang",
    "testimonialsHeading": "Kata Mereka",
    "instructorsHeading": "Instruktur Kami"
  },
  "batch": {
    "status": {
      "upcoming": "Akan Datang",
      "open": "Pendaftaran Dibuka",
      "closed": "Ditutup"
    },
    "registerNow": "Daftar Sekarang",
    "scheduleInvestmentHeading": "Jadwal & Investasi",
    "timeLabel": "Waktu: ",
    "locationLabel": "Lokasi: ",
    "addressLabel": "Alamat: ",
    "supportHeading": "Dukungan Peserta",
    "supportDescription": "Ada pertanyaan sebelum mendaftar? Hubungi Admin langsung lewat WhatsApp.",
    "contactAdmin": "Hubungi Admin",
    "equipmentHeading": "Peralatan Belajar",
    "faqHeading": "Pertanyaan Umum",
    "galleryHeading": "Galeri Dokumentasi",
    "descriptionTab": "Deskripsi",
    "syllabusTab": "Silabus",
    "dialog": {
      "title": "Daftar Minat Batch",
      "submit": "Kirim",
      "nameLabel": "Nama lengkap",
      "whatsappLabel": "Nomor WhatsApp",
      "consentLabel": "Saya menyetujui data ini disimpan Hexatara untuk keperluan pendaftaran minat.",
      "disclaimer": "Ini bukan pendaftaran resmi peserta. Seleksi dan pembayaran tetap berjalan manual lewat WhatsApp.",
      "successTitle": "Pendaftaran Minat Tersimpan",
      "successBody": "Terima kasih! Data kamu sudah tersimpan. Lanjutkan ke WhatsApp Admin untuk proses selanjutnya — ini bukan pendaftaran resmi peserta, seleksi dan pembayaran tetap berjalan manual lewat WhatsApp.",
      "continueWhatsapp": "Lanjut ke WhatsApp"
    }
  },
  "verify": {},
  "quiz": {},
  "catalog": {},
  "auth": {
    "backToLogin": "Kembali ke halaman masuk",
    "daftar": {
      "title": "Daftar akun",
      "description": "Buat akun untuk mengakses materi dan sertifikat gratis.",
      "haveAccount": "Sudah punya akun?",
      "loginLink": "Masuk",
      "nameLabel": "Nama lengkap",
      "emailLabel": "Email",
      "passwordLabel": "Kata sandi",
      "consentLabel": "Saya menyetujui data ini disimpan Hexatara untuk keperluan pendaftaran.",
      "submit": "Daftar"
    },
    "login": {
      "title": "Masuk",
      "forgotPassword": "Lupa kata sandi?",
      "noAccount": "Belum punya akun?",
      "registerLink": "Daftar",
      "emailLabel": "Email",
      "passwordLabel": "Kata sandi",
      "submit": "Masuk"
    },
    "lupaSandi": {
      "title": "Lupa kata sandi",
      "description": "Masukkan email akun kamu untuk menerima tautan reset.",
      "expiredAlert": "Tautan reset sudah tidak berlaku atau sudah dipakai. Minta tautan baru di bawah.",
      "emailLabel": "Email",
      "submit": "Kirim tautan reset",
      "sending": "Mengirim…"
    },
    "resetSandi": {
      "title": "Atur ulang kata sandi",
      "description": "Pilih kata sandi baru untuk akun kamu.",
      "invalidAlert": "Tautan reset tidak valid atau sudah kadaluwarsa. Minta tautan baru.",
      "requestNewLink": "Minta tautan reset baru",
      "newPasswordLabel": "Kata sandi baru",
      "confirmPasswordLabel": "Konfirmasi kata sandi",
      "submit": "Simpan kata sandi baru",
      "saving": "Menyimpan…"
    },
    "verifikasiEmail": {
      "title": "Verifikasi email",
      "invalidAlert": "Tautan verifikasi tidak valid atau sudah kadaluwarsa. Daftar ulang untuk mendapatkan tautan baru.",
      "sentMessage": "Kami sudah mengirim tautan verifikasi ke email kamu. Klik tautan itu untuk mengaktifkan akun sebelum bisa masuk."
    }
  },
  "dashboard": {},
  "admin": {}
}
```

**Step 2: Write `messages/en.json`**

Same key structure, values copied from Indonesian for now (Hexatara fills in real translations later — ADR-007, no machine translation built). Only the two labels that are inherently language names differ:

```json
{
  "common": {
    "metaTitle": "Hexatara — Pelatihan Pilot Drone Bersertifikat",
    "metaDescription": "Pelatihan pilot drone bersertifikat (Remote Pilot Certificate) dan penjualan drone profesional Autel oleh Hexatara Indonesia.",
    "companyName": "Hexatara Indonesia",
    "footerTagline": "Pelatihan pilot drone bersertifikat & penjualan drone profesional Autel — Bekasi.",
    "footerCopyright": "© {year} Hexatara Indonesia.",
    "whatsappAriaLabel": "Hubungi Admin lewat WhatsApp",
    "closeAriaLabel": "Tutup",
    "openMenuAriaLabel": "Buka menu navigasi",
    "menuLabel": "Menu",
    "processing": "Memproses…"
  },
  "nav": {
    "home": "Beranda",
    "verify": "Verifikasi Sertifikat",
    "materi": "Materi & Kuis",
    "katalog": "Katalog Produk",
    "switchToId": "Indonesia",
    "switchToEn": "English"
  },
  "landing": {
    "offerTrainingTitle": "Pelatihan Pilot Drone Bersertifikat",
    "offerTrainingDesc": "Sertifikasi RPC resmi, kelas bulanan bersama instruktur berpengalaman.",
    "offerTrainingCta": "Lihat Jadwal",
    "offerRetailTitle": "Jual Drone Profesional Autel",
    "offerRetailDesc": "Drone untuk kebutuhan survei, pemetaan, dan industri.",
    "offerRetailCta": "Lihat Katalog",
    "scheduleHeading": "Jadwal Pelatihan Mendatang",
    "testimonialsHeading": "Kata Mereka",
    "instructorsHeading": "Instruktur Kami"
  },
  "batch": {
    "status": {
      "upcoming": "Akan Datang",
      "open": "Pendaftaran Dibuka",
      "closed": "Ditutup"
    },
    "registerNow": "Daftar Sekarang",
    "scheduleInvestmentHeading": "Jadwal & Investasi",
    "timeLabel": "Waktu: ",
    "locationLabel": "Lokasi: ",
    "addressLabel": "Alamat: ",
    "supportHeading": "Dukungan Peserta",
    "supportDescription": "Ada pertanyaan sebelum mendaftar? Hubungi Admin langsung lewat WhatsApp.",
    "contactAdmin": "Hubungi Admin",
    "equipmentHeading": "Peralatan Belajar",
    "faqHeading": "Pertanyaan Umum",
    "galleryHeading": "Galeri Dokumentasi",
    "descriptionTab": "Deskripsi",
    "syllabusTab": "Silabus",
    "dialog": {
      "title": "Daftar Minat Batch",
      "submit": "Kirim",
      "nameLabel": "Nama lengkap",
      "whatsappLabel": "Nomor WhatsApp",
      "consentLabel": "Saya menyetujui data ini disimpan Hexatara untuk keperluan pendaftaran minat.",
      "disclaimer": "Ini bukan pendaftaran resmi peserta. Seleksi dan pembayaran tetap berjalan manual lewat WhatsApp.",
      "successTitle": "Pendaftaran Minat Tersimpan",
      "successBody": "Terima kasih! Data kamu sudah tersimpan. Lanjutkan ke WhatsApp Admin untuk proses selanjutnya — ini bukan pendaftaran resmi peserta, seleksi dan pembayaran tetap berjalan manual lewat WhatsApp.",
      "continueWhatsapp": "Lanjut ke WhatsApp"
    }
  },
  "verify": {},
  "quiz": {},
  "catalog": {},
  "auth": {
    "backToLogin": "Kembali ke halaman masuk",
    "daftar": {
      "title": "Daftar akun",
      "description": "Buat akun untuk mengakses materi dan sertifikat gratis.",
      "haveAccount": "Sudah punya akun?",
      "loginLink": "Masuk",
      "nameLabel": "Nama lengkap",
      "emailLabel": "Email",
      "passwordLabel": "Kata sandi",
      "consentLabel": "Saya menyetujui data ini disimpan Hexatara untuk keperluan pendaftaran.",
      "submit": "Daftar"
    },
    "login": {
      "title": "Masuk",
      "forgotPassword": "Lupa kata sandi?",
      "noAccount": "Belum punya akun?",
      "registerLink": "Daftar",
      "emailLabel": "Email",
      "passwordLabel": "Kata sandi",
      "submit": "Masuk"
    },
    "lupaSandi": {
      "title": "Lupa kata sandi",
      "description": "Masukkan email akun kamu untuk menerima tautan reset.",
      "expiredAlert": "Tautan reset sudah tidak berlaku atau sudah dipakai. Minta tautan baru di bawah.",
      "emailLabel": "Email",
      "submit": "Kirim tautan reset",
      "sending": "Mengirim…"
    },
    "resetSandi": {
      "title": "Atur ulang kata sandi",
      "description": "Pilih kata sandi baru untuk akun kamu.",
      "invalidAlert": "Tautan reset tidak valid atau sudah kadaluwarsa. Minta tautan baru.",
      "requestNewLink": "Minta tautan reset baru",
      "newPasswordLabel": "Kata sandi baru",
      "confirmPasswordLabel": "Konfirmasi kata sandi",
      "submit": "Simpan kata sandi baru",
      "saving": "Menyimpan…"
    },
    "verifikasiEmail": {
      "title": "Verifikasi email",
      "invalidAlert": "Tautan verifikasi tidak valid atau sudah kadaluwarsa. Daftar ulang untuk mendapatkan tautan baru.",
      "sentMessage": "Kami sudah mengirim tautan verifikasi ke email kamu. Klik tautan itu untuk mengaktifkan akun sebelum bisa masuk."
    }
  },
  "dashboard": {},
  "admin": {}
}
```

**Step 3: sanity-check the two files have identical key structure**

```powershell
node -e "const a=require('./messages/id.json'),b=require('./messages/en.json');const keys=o=>JSON.stringify(o,(k,v)=>typeof v==='string'?null:v);console.log(keys(a)===keys(b)?'MATCH':'MISMATCH')"
```
Expected: `MATCH`

---

## Task 8: language switcher component

**Files:**
- Create: `src/components/language-switcher.tsx`

```tsx
"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";

export function LanguageSwitcher() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();

  function switchTo(next: "id" | "en") {
    startTransition(() => {
      router.replace({ pathname, params }, { locale: next });
    });
  }

  return (
    <div className="flex items-center gap-1 text-sm" aria-label="Pilih bahasa">
      <button
        type="button"
        onClick={() => switchTo("id")}
        disabled={isPending || locale === "id"}
        aria-current={locale === "id"}
        className="min-h-11 px-2 font-medium text-warna-teks-2 disabled:text-warna-utama disabled:font-semibold"
      >
        {t("switchToId")}
      </button>
      <span aria-hidden="true" className="text-warna-teks-2">/</span>
      <button
        type="button"
        onClick={() => switchTo("en")}
        disabled={isPending || locale === "en"}
        aria-current={locale === "en"}
        className="min-h-11 px-2 font-medium text-warna-teks-2 disabled:text-warna-utama disabled:font-semibold"
      >
        {t("switchToEn")}
      </button>
    </div>
  );
}
```

`router.replace({ pathname, params }, { locale })` is next-intl's documented "stay on current page while switching locale" call — this satisfies task requirement 6 (switching language keeps the user on the page they're viewing, not the homepage).

---

## Task 9: wire the moved public layout + components

Each of these gets its complete new content. All server components fetching `_id`/`_en` columns now also `select` the `_en` column and run it through `pick()`.

**Step 1: `src/app/[locale]/(public)/layout.tsx`**

```tsx
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { FloatingWhatsapp } from "@/components/floating-whatsapp";
import { PublicNavMobile } from "@/components/public-nav-mobile";
import { LanguageSwitcher } from "@/components/language-switcher";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const tNav = await getTranslations("nav");
  const tCommon = await getTranslations("common");

  const NAV_PUBLIK = [
    { href: "/", label: tNav("home") },
    { href: "/verify", label: tNav("verify") },
    { href: "/materi", label: tNav("materi") },
    { href: "/katalog", label: tNav("katalog") },
  ];

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-30 border-b border-warna-latar-2 bg-warna-latar">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-warna-utama">
            <Image src="/hexatara-logo.png" alt="Hexatara" width={32} height={32} className="h-8 w-8" priority />
            Hexatara
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {NAV_PUBLIK.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-base text-warna-teks-2 hover:text-warna-utama"
              >
                {item.label}
              </Link>
            ))}
            <LanguageSwitcher />
          </nav>

          <PublicNavMobile items={NAV_PUBLIK} />
        </div>
      </header>

      <main className="flex flex-1 flex-col">{children}</main>

      <footer className="border-t border-warna-latar-2 bg-warna-latar-2">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-warna-teks-2">
          <p className="font-semibold text-warna-teks">{tCommon("companyName")}</p>
          <p className="mt-1">{tCommon("footerTagline")}</p>
          <p className="mt-4 text-xs">{tCommon("footerCopyright", { year: new Date().getFullYear() })}</p>
        </div>
      </footer>

      <FloatingWhatsapp />
    </div>
  );
}
```

Note: `PublicNavMobile`'s mobile sheet also needs the switcher — see Step 2.

**Step 2: `src/components/public-nav-mobile.tsx`** (add switcher + translate the two hardcoded strings; item labels already come translated via props)

```tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LanguageSwitcher } from "@/components/language-switcher";

export function PublicNavMobile({
  items,
}: {
  items: { href: string; label: string }[];
}) {
  const t = useTranslations("common");
  const [terbuka, setTerbuka] = useState(false);

  return (
    <Sheet open={terbuka} onOpenChange={setTerbuka}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            className="size-11 md:hidden"
            aria-label={t("openMenuAriaLabel")}
          />
        }
      >
        <MenuIcon className="size-6" />
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>{t("menuLabel")}</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setTerbuka(false)}
              className="flex min-h-11 items-center text-base text-warna-teks hover:text-warna-utama"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-4 pt-2">
          <LanguageSwitcher />
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

Note `Link` now imports from `@/i18n/navigation` instead of `next/link` (needed so mobile nav links stay locale-prefixed on `/en`).

**Step 3: `src/components/floating-whatsapp.tsx`** (aria-label only)

```tsx
import { getTranslations } from "next-intl/server";

export async function FloatingWhatsapp() {
  const nomor = process.env.NEXT_PUBLIC_WA_ADMIN;
  if (!nomor) return null;
  const t = await getTranslations("common");

  return (
    <a
      href={`https://wa.me/${nomor}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("whatsappAriaLabel")}
      className="fixed bottom-4 right-4 z-40 flex size-14 items-center justify-center rounded-full bg-warna-sukses text-warna-latar shadow-lg"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-7" aria-hidden="true">
        <path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.77.46 3.45 1.27 4.9L2 22l5.25-1.28A9.96 9.96 0 0 0 12.04 22c5.52 0 10-4.48 10-10s-4.48-10-10-10Zm0 18.13c-1.6 0-3.14-.43-4.48-1.24l-.32-.19-3.11.76.76-3.02-.21-.33a8.08 8.08 0 0 1-1.27-4.31c0-4.48 3.64-8.13 8.13-8.13 4.48 0 8.13 3.65 8.13 8.13s-3.65 8.13-8.13 8.13Zm4.47-6.09c-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.63.79-.78.95-.14.16-.29.18-.53.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.11-.49.11-.11.24-.29.36-.43.12-.14.16-.24.24-.4.08-.16.04-.31-.02-.43-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.42-.55-.42-.14-.01-.31-.01-.47-.01a.9.9 0 0 0-.65.31c-.22.24-.86.84-.86 2.05s.88 2.38 1 2.54c.12.16 1.73 2.64 4.19 3.7.59.25 1.04.4 1.4.52.59.19 1.12.16 1.54.1.47-.07 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28Z" />
      </svg>
    </a>
  );
}
```

`FloatingWhatsapp` becomes `async` (was a plain sync component) — its one caller is `src/app/[locale]/(public)/layout.tsx` which already renders it as `<FloatingWhatsapp />` inside an async Server Component tree, so no caller change needed.

**Step 4: `src/components/hero-section.tsx`**

```tsx
import Image from "next/image";
import { GraduationCap, ShoppingBag } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { pick } from "@/lib/i18n/pick";

export async function HeroSection() {
  const supabase = await createClient();
  const locale = await getLocale();
  const t = await getTranslations("landing");
  const { data, error } = await supabase
    .from("hero_slides")
    .select("id, judul_id, judul_en, subjudul_id, subjudul_en, gambar_url, cta_teks_id, cta_teks_en, cta_url")
    .eq("is_active", true)
    .order("urutan", { ascending: true })
    .limit(1);

  if (error) console.error("[hero] gagal memuat:", error);
  const slide = data?.[0];

  return (
    <section className="w-full">
      {/* Dua penawaran inti — teks tetap, tidak bergantung isi database — supaya
          "hexatara menyelenggarakan pelatihan drone DAN jual drone" langsung
          terlihat tanpa scroll di 375px (PRD §1.3/§6.1), apa pun isi hero_slides. */}
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 px-4 py-6 sm:gap-6 sm:py-10">
        <div className="flex flex-col gap-2 rounded-xl border border-warna-latar-2 bg-warna-latar p-4 sm:p-6">
          <GraduationCap className="size-6 text-warna-utama sm:size-8" aria-hidden="true" />
          <h2 className="text-base font-bold leading-tight text-warna-teks sm:text-xl">
            {t("offerTrainingTitle")}
          </h2>
          <p className="hidden text-sm text-warna-teks-2 sm:block">{t("offerTrainingDesc")}</p>
          <a
            href="#jadwal"
            className="mt-auto inline-flex h-11 w-fit items-center justify-center rounded-lg bg-warna-aksen px-4 text-sm font-semibold text-warna-teks sm:text-base"
          >
            {t("offerTrainingCta")}
          </a>
        </div>

        <div className="flex flex-col gap-2 rounded-xl border border-warna-latar-2 bg-warna-latar p-4 sm:p-6">
          <ShoppingBag className="size-6 text-warna-utama sm:size-8" aria-hidden="true" />
          <h2 className="text-base font-bold leading-tight text-warna-teks sm:text-xl">
            {t("offerRetailTitle")}
          </h2>
          <p className="hidden text-sm text-warna-teks-2 sm:block">{t("offerRetailDesc")}</p>
          <a
            href="/katalog"
            className="mt-auto inline-flex h-11 w-fit items-center justify-center rounded-lg bg-warna-aksen px-4 text-sm font-semibold text-warna-teks sm:text-base"
          >
            {t("offerRetailCta")}
          </a>
        </div>
      </div>

      {slide && (
        <div className="mx-auto max-w-6xl px-4 pb-6 sm:pb-10">
          <div className="overflow-hidden rounded-xl bg-warna-utama sm:flex sm:items-center">
            {slide.gambar_url && (
              <div className="relative aspect-video w-full sm:w-1/2">
                <Image
                  src={slide.gambar_url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              </div>
            )}
            <div className="flex flex-col gap-2 p-6 text-warna-latar sm:w-1/2">
              <h3 className="text-xl font-bold sm:text-2xl">{pick(slide.judul_id, slide.judul_en, locale)}</h3>
              {slide.subjudul_id && (
                <p className="text-base text-warna-latar/90">{pick(slide.subjudul_id, slide.subjudul_en, locale)}</p>
              )}
              {slide.cta_teks_id && slide.cta_url && (
                <a
                  href={slide.cta_url}
                  className="mt-2 inline-flex h-11 w-fit items-center justify-center rounded-lg bg-warna-aksen px-5 text-base font-semibold text-warna-teks"
                >
                  {pick(slide.cta_teks_id, slide.cta_teks_en, locale)}
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
```

**Step 5: `src/components/jadwal-batch-section.tsx`**

```tsx
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { STATUS_BATCH_LABEL, formatRupiah, formatTanggalBatch } from "@/lib/batch";
import { pick } from "@/lib/i18n/pick";
import type { Database } from "@/types/database";

type Batch = Pick<
  Database["public"]["Tables"]["batches"]["Row"],
  | "id"
  | "slug"
  | "judul_id"
  | "judul_en"
  | "kategori_id"
  | "kategori_en"
  | "lokasi_id"
  | "lokasi_en"
  | "harga"
  | "status"
  | "tanggal_mulai"
  | "tanggal_selesai"
>;

function BatchCard({ batch, locale, statusLabel }: { batch: Batch; locale: string; statusLabel: string }) {
  const t = useTranslationsForCard();
  const tanggal = formatTanggalBatch(batch.tanggal_mulai, batch.tanggal_selesai);
  const status = STATUS_BATCH_LABEL[batch.status];
  const kategori = pick(batch.kategori_id, batch.kategori_en, locale);
  const lokasi = pick(batch.lokasi_id, batch.lokasi_en, locale);

  return (
    <article className="flex flex-col gap-2 rounded-xl border border-warna-latar-2 bg-warna-latar p-4">
      <div className="flex flex-wrap items-center gap-2">
        {kategori && (
          <span className="rounded-full bg-warna-utama/10 px-2.5 py-0.5 text-xs font-medium text-warna-utama">
            {kategori}
          </span>
        )}
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}>
          {statusLabel}
        </span>
      </div>
      <h3 className="text-lg font-bold text-warna-teks">{pick(batch.judul_id, batch.judul_en, locale)}</h3>
      {tanggal && <p className="text-sm text-warna-teks-2">{tanggal}</p>}
      {lokasi && <p className="text-sm text-warna-teks-2">{lokasi}</p>}
      {batch.harga != null && (
        <p className="text-base font-semibold text-warna-teks">{formatRupiah(batch.harga)}</p>
      )}
      {batch.status !== "closed" && (
        <Link
          href={`/batch/${batch.slug}`}
          className="mt-2 inline-flex h-11 w-fit items-center justify-center rounded-lg bg-warna-aksen px-5 text-base font-semibold text-warna-teks"
        >
          {t("registerNow")}
        </Link>
      )}
    </article>
  );
}

export async function JadwalBatchSection() {
  const supabase = await createClient();
  const locale = await getLocale();
  const t = await getTranslations("landing");
  const tBatch = await getTranslations("batch");
  const { data, error } = await supabase
    .from("batches")
    .select(
      "id, slug, judul_id, judul_en, kategori_id, kategori_en, lokasi_id, lokasi_en, harga, status, tanggal_mulai, tanggal_selesai"
    )
    .eq("is_active", true)
    .order("tanggal_mulai", { ascending: true });

  if (error) console.error("[jadwal-batch] gagal memuat:", error);
  if (!data || data.length === 0) return null;

  return (
    <section id="jadwal" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-10">
      <h2 className="text-xl font-bold text-warna-teks sm:text-2xl">{t("scheduleHeading")}</h2>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((batch) => (
          <BatchCard
            key={batch.id}
            batch={batch}
            locale={locale}
            statusLabel={tBatch(`status.${batch.status}`)}
          />
        ))}
      </div>
    </section>
  );
}
```

`BatchCard` is a plain (non-async) inner function — it can't call `getTranslations` itself, so it needs `registerNow` passed in too rather than a fake `useTranslationsForCard()` (that placeholder doesn't exist). Fix before writing the file: pass `registerNow` down as a prop alongside `statusLabel` instead. Corrected `BatchCard` signature and body:

```tsx
function BatchCard({
  batch,
  locale,
  statusLabel,
  registerNowLabel,
}: {
  batch: Batch;
  locale: string;
  statusLabel: string;
  registerNowLabel: string;
}) {
  const tanggal = formatTanggalBatch(batch.tanggal_mulai, batch.tanggal_selesai);
  const status = STATUS_BATCH_LABEL[batch.status];
  const kategori = pick(batch.kategori_id, batch.kategori_en, locale);
  const lokasi = pick(batch.lokasi_id, batch.lokasi_en, locale);

  return (
    <article className="flex flex-col gap-2 rounded-xl border border-warna-latar-2 bg-warna-latar p-4">
      <div className="flex flex-wrap items-center gap-2">
        {kategori && (
          <span className="rounded-full bg-warna-utama/10 px-2.5 py-0.5 text-xs font-medium text-warna-utama">
            {kategori}
          </span>
        )}
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}>
          {statusLabel}
        </span>
      </div>
      <h3 className="text-lg font-bold text-warna-teks">{pick(batch.judul_id, batch.judul_en, locale)}</h3>
      {tanggal && <p className="text-sm text-warna-teks-2">{tanggal}</p>}
      {lokasi && <p className="text-sm text-warna-teks-2">{lokasi}</p>}
      {batch.harga != null && (
        <p className="text-base font-semibold text-warna-teks">{formatRupiah(batch.harga)}</p>
      )}
      {batch.status !== "closed" && (
        <Link
          href={`/batch/${batch.slug}`}
          className="mt-2 inline-flex h-11 w-fit items-center justify-center rounded-lg bg-warna-aksen px-5 text-base font-semibold text-warna-teks"
        >
          {registerNowLabel}
        </Link>
      )}
    </article>
  );
}
```

And its call site becomes `<BatchCard key={batch.id} batch={batch} locale={locale} statusLabel={tBatch(\`status.${batch.status}\`)} registerNowLabel={tBatch("registerNow")} />`. Use this corrected version, not the first draft above, when writing the file.

**Step 6: `src/components/testimoni-section.tsx`**

```tsx
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { pick } from "@/lib/i18n/pick";

export async function TestimoniSection() {
  const supabase = await createClient();
  const locale = await getLocale();
  const t = await getTranslations("landing");
  const { data, error } = await supabase
    .from("testimonials")
    .select("id, nama, peran_id, peran_en, isi_id, isi_en, foto_url")
    .eq("is_active", true)
    .order("urutan", { ascending: true });

  if (error) console.error("[testimoni] gagal memuat:", error);
  if (!data || data.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h2 className="text-xl font-bold text-warna-teks sm:text-2xl">{t("testimonialsHeading")}</h2>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((testi) => (
          <figure
            key={testi.id}
            className="flex flex-col gap-3 rounded-xl border border-warna-latar-2 bg-warna-latar p-4"
          >
            <blockquote className="text-base text-warna-teks">
              &ldquo;{pick(testi.isi_id, testi.isi_en, locale)}&rdquo;
            </blockquote>
            <figcaption className="mt-auto flex items-center gap-3">
              <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-warna-latar-2">
                {testi.foto_url && (
                  <Image src={testi.foto_url} alt="" fill className="object-cover" sizes="40px" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-warna-teks">{testi.nama}</p>
                {testi.peran_id && (
                  <p className="text-sm text-warna-teks-2">{pick(testi.peran_id, testi.peran_en, locale)}</p>
                )}
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
```

**Step 7: `src/components/instruktur-section.tsx`**

```tsx
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { pick } from "@/lib/i18n/pick";

export async function InstrukturSection() {
  const supabase = await createClient();
  const locale = await getLocale();
  const t = await getTranslations("landing");
  const { data, error } = await supabase
    .from("instructors")
    .select("id, nama, foto_url, jabatan_id, jabatan_en")
    .eq("is_active", true)
    .order("urutan", { ascending: true });

  if (error) console.error("[instruktur] gagal memuat:", error);
  if (!data || data.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h2 className="text-xl font-bold text-warna-teks sm:text-2xl">{t("instructorsHeading")}</h2>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {data.map((instruktur) => (
          <div key={instruktur.id} className="flex flex-col items-center gap-2 text-center">
            <div className="relative size-24 overflow-hidden rounded-full bg-warna-latar-2 sm:size-32">
              {instruktur.foto_url && (
                <Image
                  src={instruktur.foto_url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              )}
            </div>
            <p className="text-base font-semibold text-warna-teks">{instruktur.nama}</p>
            {instruktur.jabatan_id && (
              <p className="text-sm text-warna-teks-2">{pick(instruktur.jabatan_id, instruktur.jabatan_en, locale)}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
```

**Step 8: `src/components/company-profile-section.tsx`**

```tsx
import Image from "next/image";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { pick } from "@/lib/i18n/pick";

export async function CompanyProfileSection() {
  const supabase = await createClient();
  const locale = await getLocale();
  const { data, error } = await supabase
    .from("company_profile")
    .select("judul_id, judul_en, konten_id, konten_en, gambar_url")
    .eq("id", 1)
    .maybeSingle();

  if (error) console.error("[company-profile] gagal memuat:", error);
  if (!data || (!data.judul_id.trim() && !data.konten_id.trim())) return null;

  const judul = pick(data.judul_id, data.judul_en, locale);
  const konten = pick(data.konten_id, data.konten_en, locale);

  return (
    <section className="bg-warna-latar-2">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:flex sm:items-center sm:gap-8">
        {data.gambar_url && (
          <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-xl sm:mb-0 sm:w-1/2">
            <Image
              src={data.gambar_url}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
          </div>
        )}
        <div className={data.gambar_url ? "sm:w-1/2" : ""}>
          {judul && <h2 className="text-xl font-bold text-warna-teks sm:text-2xl">{judul}</h2>}
          {konten && (
            // konten diisi lewat Tiptap di Admin Panel (ENGINEERING §5.8) — HTML dari
            // Admin, bukan input publik, jadi dangerouslySetInnerHTML aman di sini.
            <div
              className="mt-3 space-y-3 text-base text-warna-teks-2 [&_a]:underline [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-warna-teks [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5"
              dangerouslySetInnerHTML={{ __html: konten }}
            />
          )}
        </div>
      </div>
    </section>
  );
}
```

**Step 9: `src/components/sale-banner.tsx`** (data-only, no static UI text — just add `_en` select + `pick()`)

```tsx
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { pick } from "@/lib/i18n/pick";

export async function SaleBanner() {
  const supabase = await createClient();
  const locale = await getLocale();
  const { data, error } = await supabase
    .from("sale_banners")
    .select(
      "id, judul_id, judul_en, teks_id, teks_en, urgensi_id, urgensi_en, tombol_teks_id, tombol_teks_en, tombol_url, tayang_mulai, tayang_selesai"
    )
    .eq("is_active", true);

  if (error) {
    console.error("[sale-banner] gagal memuat:", error);
    return null;
  }

  const hariIni = new Date().toISOString().slice(0, 10);
  const banner = data?.find(
    (b) =>
      (!b.tayang_mulai || b.tayang_mulai <= hariIni) &&
      (!b.tayang_selesai || b.tayang_selesai >= hariIni)
  );

  if (!banner) return null;

  const judul = pick(banner.judul_id, banner.judul_en, locale);
  const teks = pick(banner.teks_id, banner.teks_en, locale);
  const urgensi = pick(banner.urgensi_id, banner.urgensi_en, locale);
  const tombolTeks = pick(banner.tombol_teks_id, banner.tombol_teks_en, locale);

  return (
    <div className="bg-warna-utama px-4 py-3 text-warna-latar">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-base font-semibold">{judul}</p>
          {teks && <p className="text-sm text-warna-latar/90">{teks}</p>}
          {urgensi && <p className="text-sm font-medium text-warna-aksen">{urgensi}</p>}
        </div>
        {tombolTeks && banner.tombol_url && (
          <a
            href={banner.tombol_url}
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg bg-warna-aksen px-5 text-base font-semibold text-warna-teks"
          >
            {tombolTeks}
          </a>
        )}
      </div>
    </div>
  );
}
```

**Step 10: `src/components/popup-pembuka.tsx`** (fetch `_en`, resolve with `pick()` *before* handing to the client component — locale is a server concern)

```tsx
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { pick } from "@/lib/i18n/pick";
import { PopupDialogClient } from "@/components/popup-dialog-client";

export type PopupAktif = {
  id: number;
  judul: string;
  isi: string;
  gambar_url: string | null;
  cta_teks: string | null;
  cta_url: string | null;
};

export async function PopupPembuka() {
  const supabase = await createClient();
  const locale = await getLocale();
  const { data, error } = await supabase
    .from("popups")
    .select(
      "id, judul_id, judul_en, isi_id, isi_en, gambar_url, cta_teks_id, cta_teks_en, cta_url, tayang_mulai, tayang_selesai"
    )
    .eq("is_active", true);

  if (error) {
    console.error("[popup] gagal memuat:", error);
    return null;
  }

  const hariIni = new Date().toISOString().slice(0, 10);
  const popup = data?.find(
    (p) =>
      (!p.tayang_mulai || p.tayang_mulai <= hariIni) &&
      (!p.tayang_selesai || p.tayang_selesai >= hariIni)
  );

  if (!popup) return null;

  const resolved: PopupAktif = {
    id: popup.id,
    judul: pick(popup.judul_id, popup.judul_en, locale) ?? "",
    isi: pick(popup.isi_id, popup.isi_en, locale) ?? "",
    gambar_url: popup.gambar_url,
    cta_teks: pick(popup.cta_teks_id, popup.cta_teks_en, locale),
    cta_url: popup.cta_url,
  };

  return <PopupDialogClient popup={resolved} />;
}
```

Changing `PopupAktif`'s shape (from a `Pick<Database[...]>` of raw `_id` columns to a resolved flat shape) means `popup-dialog-client.tsx` field references (`popup.judul_id` etc.) must update to the new flat names — done in Step 11.

**Step 11: `src/components/popup-dialog-client.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { PopupAktif } from "@/components/popup-pembuka";

const KEY_PREFIX = "hexatara-popup-tertutup-";

export function PopupDialogClient({ popup }: { popup: PopupAktif }) {
  const t = useTranslations("common");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // sessionStorage tidak ada di server — baru bisa dicek setelah mount di client.
    const sudahDitutup = sessionStorage.getItem(`${KEY_PREFIX}${popup.id}`);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!sudahDitutup) setOpen(true);
  }, [popup.id]);

  function tutup() {
    sessionStorage.setItem(`${KEY_PREFIX}${popup.id}`, "1");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && tutup()}>
      <DialogContent showCloseButton={false} className="max-w-md">
        <button
          type="button"
          onClick={tutup}
          aria-label={t("closeAriaLabel")}
          className="absolute right-1 top-1 flex size-11 items-center justify-center rounded-full text-warna-teks-2 hover:bg-warna-latar-2"
        >
          <XIcon className="size-5" aria-hidden="true" />
        </button>

        <DialogHeader>
          <DialogTitle className="pr-8 text-lg text-warna-teks">{popup.judul}</DialogTitle>
        </DialogHeader>

        {popup.gambar_url && (
          <div className="relative aspect-video w-full overflow-hidden rounded-md">
            <Image
              src={popup.gambar_url}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 480px) 100vw, 480px"
            />
          </div>
        )}

        <DialogDescription className="whitespace-pre-line text-base text-warna-teks">
          {popup.isi}
        </DialogDescription>

        {popup.cta_teks && popup.cta_url && (
          <DialogFooter className="mx-0 mb-0 justify-start border-t-0 bg-transparent p-0">
            <a
              href={popup.cta_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-warna-aksen px-5 text-base font-semibold text-warna-teks"
            >
              {popup.cta_teks}
            </a>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

---

## Task 10: batch detail page + dialog

**Files:**
- Modify: `src/app/[locale]/(public)/batch/[slug]/page.tsx`
- Modify: `src/app/[locale]/(public)/batch/[slug]/daftar-minat-dialog.tsx`

**Step 1: `page.tsx`** — full replacement (adds `_en` columns to every query, resolves through `pick()`, replaces the 10 hardcoded headings/labels with `t()` calls)

```tsx
import Image from "next/image";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { STATUS_BATCH_LABEL, formatRupiah, formatTanggalBatch } from "@/lib/batch";
import { pick } from "@/lib/i18n/pick";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DaftarMinatDialog } from "./daftar-minat-dialog";

const KONTEN_HTML_CLASS =
  "mt-2 space-y-3 text-base text-warna-teks-2 [&_a]:underline [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-warna-teks [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5";

function buildWaTanyaLink(nomor: string | undefined, judul: string) {
  if (!nomor) return null;
  const pesan = `Halo Admin Hexatara, saya ingin bertanya tentang batch "${judul}".`;
  return `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;
}

export default async function BatchDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const locale = await getLocale();
  const t = await getTranslations("batch");

  const { data: batch, error: batchError } = await supabase
    .from("batches")
    .select(
      "id, slug, judul_id, judul_en, kategori_id, kategori_en, lokasi_id, lokasi_en, alamat, harga, status, tanggal_mulai, tanggal_selesai, deskripsi_id, deskripsi_en, silabus_id, silabus_en, hero_gambar_url"
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (batchError) console.error("[batch-detail] gagal memuat batch:", batchError);
  if (!batch) notFound();

  const [{ data: benefits }, { data: equipment }, { data: faqs }, { data: gallery }] = await Promise.all([
    supabase.from("batch_benefits").select("id, ikon, teks_id, teks_en").eq("batch_id", batch.id).order("urutan"),
    supabase.from("batch_equipment").select("id, teks_id, teks_en").eq("batch_id", batch.id).order("urutan"),
    supabase.from("batch_faqs").select("id, tanya_id, tanya_en, jawab_id, jawab_en").eq("batch_id", batch.id).order("urutan"),
    supabase.from("batch_gallery").select("id, gambar_url, caption_id, caption_en").eq("batch_id", batch.id).order("urutan"),
  ]);

  const nomorWa = process.env.NEXT_PUBLIC_WA_ADMIN;
  const status = STATUS_BATCH_LABEL[batch.status];
  const tanggal = formatTanggalBatch(batch.tanggal_mulai, batch.tanggal_selesai);
  const judul = pick(batch.judul_id, batch.judul_en, locale) ?? batch.judul_id;
  const kategori = pick(batch.kategori_id, batch.kategori_en, locale);
  const lokasi = pick(batch.lokasi_id, batch.lokasi_en, locale);
  const deskripsi = pick(batch.deskripsi_id, batch.deskripsi_en, locale);
  const silabus = pick(batch.silabus_id, batch.silabus_en, locale);
  const waTanyaLink = buildWaTanyaLink(nomorWa, batch.judul_id);

  const tabItems = [
    deskripsi?.trim() ? { value: "deskripsi", label: t("descriptionTab"), html: deskripsi } : null,
    silabus?.trim() ? { value: "silabus", label: t("syllabusTab"), html: silabus } : null,
  ].filter((item): item is { value: string; label: string; html: string } => item !== null);

  return (
    <div className="pb-10">
      {/* 1. Hero judul */}
      <section className="border-b border-warna-latar-2 bg-warna-latar-2">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="flex flex-wrap items-center gap-2">
            {kategori && (
              <span className="rounded-full bg-warna-utama/10 px-2.5 py-0.5 text-xs font-medium text-warna-utama">
                {kategori}
              </span>
            )}
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}>
              {t(`status.${batch.status}`)}
            </span>
          </div>
          <h1 className="mt-3 text-2xl font-bold text-warna-teks sm:text-3xl">{judul}</h1>
          {batch.hero_gambar_url && (
            <div className="relative mt-6 aspect-video w-full overflow-hidden rounded-xl">
              <Image
                src={batch.hero_gambar_url}
                alt=""
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4">
        {/* 2. Benefit pills */}
        {benefits && benefits.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-6">
            {benefits.map((b) => (
              <span
                key={b.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-warna-latar-2 bg-warna-latar px-3 py-1.5 text-sm text-warna-teks"
              >
                {b.ikon && <span aria-hidden="true">{b.ikon}</span>}
                {pick(b.teks_id, b.teks_en, locale)}
              </span>
            ))}
          </div>
        )}

        {/* 3. Tab Deskripsi + Silabus */}
        {tabItems.length > 0 && (
          <div className="pt-8">
            <Tabs defaultValue={tabItems[0].value}>
              <TabsList>
                {tabItems.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {tabItems.map((tab) => (
                <TabsContent key={tab.value} value={tab.value}>
                  {/* HTML dari Tiptap di Admin Panel (ENGINEERING §5.8) — hanya Admin
                      yang mengisi, dangerouslySetInnerHTML aman di sini. */}
                  <div className={KONTEN_HTML_CLASS} dangerouslySetInnerHTML={{ __html: tab.html }} />
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}

        {/* 4–6. Jadwal & Investasi / Dukungan Peserta / Peralatan Belajar */}
        <div className="grid grid-cols-1 gap-4 pt-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-warna-latar-2 bg-warna-latar p-5">
            <h2 className="text-lg font-bold text-warna-teks">{t("scheduleInvestmentHeading")}</h2>
            <dl className="mt-3 space-y-1.5 text-sm text-warna-teks-2">
              {tanggal && (
                <div>
                  <dt className="inline font-medium text-warna-teks">{t("timeLabel")}</dt>
                  <dd className="inline">{tanggal}</dd>
                </div>
              )}
              {lokasi && (
                <div>
                  <dt className="inline font-medium text-warna-teks">{t("locationLabel")}</dt>
                  <dd className="inline">{lokasi}</dd>
                </div>
              )}
              {batch.alamat && (
                <div>
                  <dt className="inline font-medium text-warna-teks">{t("addressLabel")}</dt>
                  <dd className="inline">{batch.alamat}</dd>
                </div>
              )}
            </dl>
            {batch.harga != null && (
              <p className="mt-3 text-xl font-bold text-warna-teks">{formatRupiah(batch.harga)}</p>
            )}
            {batch.status !== "closed" && <DaftarMinatDialog batchId={batch.id} />}
          </div>

          <div className="rounded-xl border border-warna-latar-2 bg-warna-latar p-5">
            <h2 className="text-lg font-bold text-warna-teks">{t("supportHeading")}</h2>
            <p className="mt-2 text-sm text-warna-teks-2">{t("supportDescription")}</p>
            {waTanyaLink && (
              <a
                href={waTanyaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-lg border border-warna-utama px-5 text-base font-semibold text-warna-utama"
              >
                {t("contactAdmin")}
              </a>
            )}
          </div>

          {equipment && equipment.length > 0 && (
            <div className="rounded-xl border border-warna-latar-2 bg-warna-latar p-5">
              <h2 className="text-lg font-bold text-warna-teks">{t("equipmentHeading")}</h2>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-warna-teks-2">
                {equipment.map((item) => (
                  <li key={item.id}>{pick(item.teks_id, item.teks_en, locale)}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 7a. FAQ */}
        {faqs && faqs.length > 0 && (
          <div className="pt-10">
            <h2 className="text-xl font-bold text-warna-teks">{t("faqHeading")}</h2>
            <Accordion className="mt-4">
              {faqs.map((faq) => (
                <AccordionItem key={faq.id} value={String(faq.id)}>
                  <AccordionTrigger className="text-base text-warna-teks">
                    {pick(faq.tanya_id, faq.tanya_en, locale)}
                  </AccordionTrigger>
                  <AccordionContent className="text-warna-teks-2">
                    {pick(faq.jawab_id, faq.jawab_en, locale)}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}

        {/* 7b. Galeri dokumentasi */}
        {gallery && gallery.length > 0 && (
          <div className="pt-10">
            <h2 className="text-xl font-bold text-warna-teks">{t("galleryHeading")}</h2>
            <Carousel className="mt-4">
              <CarouselContent>
                {gallery.map((item) => {
                  const caption = pick(item.caption_id, item.caption_en, locale);
                  return (
                    <CarouselItem key={item.id} className="sm:basis-1/2">
                      <div className="relative aspect-video overflow-hidden rounded-xl">
                        <Image
                          src={item.gambar_url}
                          alt={caption ?? ""}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 50vw"
                        />
                      </div>
                      {caption && <p className="mt-2 text-sm text-warna-teks-2">{caption}</p>}
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex" />
              <CarouselNext className="hidden sm:flex" />
            </Carousel>
          </div>
        )}
      </div>
    </div>
  );
}
```

`buildWaTanyaLink` keeps using `batch.judul_id` (not the picked title) — deliberate, see Decision 5: this message goes to the Indonesian Admin regardless of which language the visitor is browsing in.

**Step 2: `daftar-minat-dialog.tsx`** — full replacement (client component, `useTranslations`)

```tsx
'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { BatchLeadFormSchema } from '@/lib/validations/batch-lead';
import { daftarMinatAction } from './actions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';

type BatchLeadInput = z.infer<typeof BatchLeadFormSchema>;

export function DaftarMinatDialog({ batchId }: { batchId: number }) {
  const t = useTranslations('batch');
  const tCommon = useTranslations('common');
  const [open, setOpen] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [waLink, setWaLink] = useState<string | null | undefined>(undefined);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BatchLeadInput>({
    resolver: zodResolver(BatchLeadFormSchema),
    defaultValues: { nama: '', whatsapp: '', persetujuan: false },
  });

  async function onSubmit(data: BatchLeadInput) {
    setPesanError(null);
    const hasil = await daftarMinatAction(batchId, data);
    if (!hasil.ok) {
      setPesanError(hasil.pesan);
      return;
    }
    setWaLink(hasil.waLink);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      reset();
      setPesanError(null);
      setWaLink(undefined);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-lg bg-warna-aksen px-5 text-base font-semibold text-warna-teks">
        {t('registerNow')}
      </DialogTrigger>
      <DialogContent>
        {waLink !== undefined ? (
          <div className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>{t('dialog.successTitle')}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-warna-teks-2">{t('dialog.successBody')}</p>
            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-warna-sukses px-5 text-base font-semibold text-warna-latar"
              >
                {t('dialog.continueWhatsapp')}
              </a>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <DialogHeader>
              <DialogTitle>{t('dialog.title')}</DialogTitle>
            </DialogHeader>

            {pesanError && (
              <Alert variant="destructive">
                <AlertDescription>{pesanError}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nama">{t('dialog.nameLabel')}</Label>
              <Input id="nama" autoComplete="name" {...register('nama')} />
              {errors.nama && <p className="text-sm text-destructive">{errors.nama.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="whatsapp">{t('dialog.whatsappLabel')}</Label>
              <Input id="whatsapp" type="tel" autoComplete="tel" {...register('whatsapp')} />
              {errors.whatsapp && (
                <p className="text-sm text-destructive">{errors.whatsapp.message}</p>
              )}
            </div>

            <Controller
              control={control}
              name="persetujuan"
              render={({ field }) => (
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="persetujuan"
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked)}
                  />
                  <Label htmlFor="persetujuan" className="font-normal">
                    {t('dialog.consentLabel')}
                  </Label>
                </div>
              )}
            />
            {errors.persetujuan && (
              <p className="text-sm text-destructive">{errors.persetujuan.message}</p>
            )}

            <p className="text-xs text-warna-teks-2">{t('dialog.disclaimer')}</p>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-warna-aksen px-5 text-base font-semibold text-warna-teks disabled:opacity-50"
            >
              {isSubmitting ? tCommon('processing') : t('dialog.submit')}
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

`actions.ts` in this folder is untouched (Decision 5 — Server Action strings aren't JSX).

---

## Task 11: auth pages/forms

**Files:**
- Modify: `src/app/[locale]/(auth)/daftar/page.tsx`, `daftar-form.tsx`
- Modify: `src/app/[locale]/(auth)/login/page.tsx`, `login-form.tsx`
- Modify: `src/app/[locale]/(auth)/lupa-sandi/page.tsx`, `lupa-sandi-form.tsx`
- Modify: `src/app/[locale]/(auth)/reset-sandi/page.tsx`, `reset-sandi-form.tsx`
- Modify: `src/app/[locale]/(auth)/verifikasi-email/page.tsx`

**Step 1: `daftar/page.tsx`**

```tsx
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DaftarForm } from './daftar-form';

export default async function DaftarPage() {
  const t = await getTranslations('auth.daftar');
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <DaftarForm />
          <p className="mt-4 text-sm text-muted-foreground">
            {t('haveAccount')}{' '}
            <Link href="/login" className="underline underline-offset-4">
              {t('loginLink')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Step 2: `daftar/daftar-form.tsx`** (also switches `useRouter`/navigation to the locale-aware one)

```tsx
'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { z } from 'zod';
import { DaftarSchema } from '@/lib/validations/auth';
import { daftarAction } from './actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

type DaftarInput = z.infer<typeof DaftarSchema>;

export function DaftarForm() {
  const t = useTranslations('auth.daftar');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [pesanError, setPesanError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<DaftarInput>({
    resolver: zodResolver(DaftarSchema),
    defaultValues: { nama_lengkap: '', email: '', password: '', persetujuan: false },
  });

  async function onSubmit(data: DaftarInput) {
    setPesanError(null);
    const hasil = await daftarAction(data);
    if (!hasil.ok) {
      setPesanError(hasil.pesan);
      return;
    }
    router.push('/verifikasi-email');
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      {pesanError && (
        <Alert variant="destructive">
          <AlertDescription>{pesanError}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="nama_lengkap">{t('nameLabel')}</Label>
        <Input id="nama_lengkap" autoComplete="name" {...register('nama_lengkap')} />
        {errors.nama_lengkap && (
          <p className="text-sm text-destructive">{errors.nama_lengkap.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">{t('emailLabel')}</Label>
        <Input id="email" type="email" autoComplete="email" {...register('email')} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">{t('passwordLabel')}</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          {...register('password')}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Controller
        control={control}
        name="persetujuan"
        render={({ field }) => (
          <div className="flex items-start gap-2">
            <Checkbox
              id="persetujuan"
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked)}
            />
            <Label htmlFor="persetujuan" className="font-normal">
              {t('consentLabel')}
            </Label>
          </div>
        )}
      />
      {errors.persetujuan && (
        <p className="text-sm text-destructive">{errors.persetujuan.message}</p>
      )}

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? tCommon('processing') : t('submit')}
      </Button>
    </form>
  );
}
```

**Step 3: `login/page.tsx`**

```tsx
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from './login-form';

export default async function LoginPage() {
  const t = await getTranslations('auth.login');
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <div className="mt-4 flex flex-col gap-1 text-sm text-muted-foreground">
            <Link href="/lupa-sandi" className="underline underline-offset-4">
              {t('forgotPassword')}
            </Link>
            <p>
              {t('noAccount')}{' '}
              <Link href="/daftar" className="underline underline-offset-4">
                {t('registerLink')}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Step 4: `login/login-form.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { z } from 'zod';
import { LoginSchema } from '@/lib/validations/auth';
import { loginAction } from './actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

type LoginInput = z.infer<typeof LoginSchema>;

export function LoginForm() {
  const t = useTranslations('auth.login');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [pesanError, setPesanError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(data: LoginInput) {
    setPesanError(null);
    const hasil = await loginAction(data);
    if (!hasil.ok) {
      setPesanError(hasil.pesan);
      return;
    }
    router.push('/');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      {pesanError && (
        <Alert variant="destructive">
          <AlertDescription>{pesanError}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">{t('emailLabel')}</Label>
        <Input id="email" type="email" autoComplete="email" {...register('email')} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">{t('passwordLabel')}</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register('password')}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? tCommon('processing') : t('submit')}
      </Button>
    </form>
  );
}
```

**Step 5: `lupa-sandi/page.tsx`**

```tsx
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LupaSandiForm } from './lupa-sandi-form';

export default async function LupaSandiPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const t = await getTranslations('auth.lupaSandi');
  const tAuth = await getTranslations('auth');

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {status === 'gagal' && (
            <Alert variant="destructive">
              <AlertDescription>{t('expiredAlert')}</AlertDescription>
            </Alert>
          )}
          <LupaSandiForm />
          <p className="text-sm text-muted-foreground">
            <Link href="/login" className="underline underline-offset-4">
              {tAuth('backToLogin')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Step 6: `lupa-sandi/lupa-sandi-form.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { LupaSandiSchema } from '@/lib/validations/auth';
import { lupaSandiAction } from './actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

type LupaSandiInput = z.infer<typeof LupaSandiSchema>;

export function LupaSandiForm() {
  const t = useTranslations('auth.lupaSandi');
  const [pesan, setPesan] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LupaSandiInput>({
    resolver: zodResolver(LupaSandiSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(data: LupaSandiInput) {
    const hasil = await lupaSandiAction(data);
    setPesan(hasil.pesan);
  }

  if (pesan) {
    return (
      <Alert>
        <AlertDescription>{pesan}</AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">{t('emailLabel')}</Label>
        <Input id="email" type="email" autoComplete="email" {...register('email')} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? t('sending') : t('submit')}
      </Button>
    </form>
  );
}
```

**Step 7: `reset-sandi/page.tsx`**

```tsx
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createClient } from '@/lib/supabase/server';
import { ResetSandiForm } from './reset-sandi-form';

export default async function ResetSandiPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const t = await getTranslations('auth.resetSandi');

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          {data?.claims && <CardDescription>{t('description')}</CardDescription>}
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {data?.claims ? (
            <ResetSandiForm />
          ) : (
            <>
              <Alert variant="destructive">
                <AlertDescription>{t('invalidAlert')}</AlertDescription>
              </Alert>
              <Link href="/lupa-sandi" className="text-sm underline underline-offset-4">
                {t('requestNewLink')}
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

**Step 8: `reset-sandi/reset-sandi-form.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { z } from 'zod';
import { ResetSandiSchema } from '@/lib/validations/auth';
import { resetSandiAction } from './actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

type ResetSandiInput = z.infer<typeof ResetSandiSchema>;

export function ResetSandiForm() {
  const t = useTranslations('auth.resetSandi');
  const router = useRouter();
  const [pesanError, setPesanError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetSandiInput>({
    resolver: zodResolver(ResetSandiSchema),
    defaultValues: { password: '', konfirmasiPassword: '' },
  });

  async function onSubmit(data: ResetSandiInput) {
    setPesanError(null);
    const hasil = await resetSandiAction(data);
    if (!hasil.ok) {
      setPesanError(hasil.pesan);
      return;
    }
    router.push('/login');
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      {pesanError && (
        <Alert variant="destructive">
          <AlertDescription>{pesanError}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">{t('newPasswordLabel')}</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          {...register('password')}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="konfirmasiPassword">{t('confirmPasswordLabel')}</Label>
        <Input
          id="konfirmasiPassword"
          type="password"
          autoComplete="new-password"
          {...register('konfirmasiPassword')}
        />
        {errors.konfirmasiPassword && (
          <p className="text-sm text-destructive">{errors.konfirmasiPassword.message}</p>
        )}
      </div>

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? t('saving') : t('submit')}
      </Button>
    </form>
  );
}
```

**Step 9: `verifikasi-email/page.tsx`**

```tsx
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default async function VerifikasiEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const t = await getTranslations('auth.verifikasiEmail');
  const tAuth = await getTranslations('auth');

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {status === 'gagal' ? (
            <Alert variant="destructive">
              <AlertDescription>{t('invalidAlert')}</AlertDescription>
            </Alert>
          ) : (
            <p className="text-sm text-muted-foreground">{t('sentMessage')}</p>
          )}
          <Link href="/login" className="text-sm underline underline-offset-4">
            {tAuth('backToLogin')}
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Task 12: verify

**Step 1: type-check, lint, build**

```powershell
pnpm tsc --noEmit
pnpm lint
pnpm build
```
Expected: all three clean, and the build output lists routes for both `/` and `/en` variants of every moved page, plus `/admin/*` unchanged.

**Step 2: manual browser check (this is the part only Alif can sign off per feature-registry.md's Definition of Done — do it, but it doesn't earn a DONE mark by itself)**

- `/` loads in Indonesian, no `/id` in the URL.
- `/en` loads the same page in the (currently identical, pending real translation) English strings.
- Clicking the language switcher on `/batch/some-slug` lands on `/en/batch/some-slug` (or back), not the homepage.
- `/admin` and `/admin/login` still work, still Indonesian, URL never gets an `/en` or `/id` prefix.
- `/verify` and any not-yet-built route still 404 normally (no crash from the empty `verify: {}` namespace).
- Registering a new account, verifying the email link, and resetting a password still work end-to-end (this exercises `src/proxy.ts` merge + `src/app/auth/confirm/route.ts` staying outside the locale tree).
- 375px viewport: header nav + language switcher + hamburger drawer all fit without horizontal scroll (existing F00.5 acceptance criterion, must not regress).

**Step 3: update `feature-registry.md`**

Do **not** mark F00.4 or F01.11 `DONE` — per the repo's own rule, only Alif can do that after testing in the browser himself. Leave both rows at `WIP` with the files touched, and let Alif fill in the "Diuji"/"Bukti" columns once he's clicked through it.

---

## Execution note

This is a large, mechanical, low-ambiguity change (routing + text extraction, no business logic). It's a good fit for **subagent-driven execution one task at a time**, since each task above is self-contained and independently verifiable by `pnpm build`. Task 6 (the actual `git mv`) must run before Tasks 9–11 (which edit the moved files at their new paths).
