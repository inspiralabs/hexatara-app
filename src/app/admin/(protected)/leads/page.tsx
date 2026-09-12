import { redirect } from 'next/navigation';

// Dulu satu halaman ber-Tabs (2 tab) — dipecah jadi sub-route per §12.5.10/ADR-017
// supaya navigasinya lewat sub-menu navbar, bukan tab di dalam halaman.
export default function AdminLeadsPage() {
  redirect('/admin/leads/minat');
}
