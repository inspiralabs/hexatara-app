export function AdminStubPage({
  judul,
  sprint,
}: {
  judul: string;
  sprint: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-xl font-medium text-warna-teks">{judul}</h1>
      <p className="text-sm text-warna-teks-2">Belum dibangun — menyusul {sprint}.</p>
    </div>
  );
}
