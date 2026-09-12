import { redirect } from 'next/navigation';

// Dulu satu halaman ber-Tabs (6 tab) — dipecah jadi sub-route per §12.5.10/ADR-017
// supaya navigasinya lewat sub-menu navbar, bukan tab di dalam halaman.
export default function AdminKontenPage() {
  redirect('/admin/konten/popup');
}
