// Progress bab materi untuk PENGUNJUNG ANONIM (belum login) — persis filosofi
// kuis F03.2: state klaim sisi klien, tidak menyentuh material_progress sampai
// user mendaftar akun. sessionStorage (bukan React state) karena progress ini
// harus "menyeberang" dari /materi/[id] -> /kuis -> /daftar, tiga halaman
// berbeda (lihat ADR-013/PANDUAN §12.5.3).

const KEY = 'hexatara-materi-progress';

export type MateriSessionProgress = {
  materialId: number;
  chapterIds: number[];
};

export function bacaProgresSesi(): MateriSessionProgress | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MateriSessionProgress;
  } catch {
    return null;
  }
}

export function tandaiBabSelesaiSesi(materialId: number, chapterId: number) {
  try {
    const existing = bacaProgresSesi();
    const chapterIds =
      existing && existing.materialId === materialId
        ? Array.from(new Set([...existing.chapterIds, chapterId]))
        : [chapterId];
    sessionStorage.setItem(KEY, JSON.stringify({ materialId, chapterIds }));
  } catch {
    // ponytail: sessionStorage penuh/diblokir browser -> progress anonim tidak
    // tersimpan lintas halaman, tapi tidak menggagalkan alur saat itu juga.
  }
}

export function hapusProgresSesi() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // no-op
  }
}
