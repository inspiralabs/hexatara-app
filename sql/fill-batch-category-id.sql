-- §12.6.9 / suggest pelatihan — isi category_id yang masih kosong
-- Samakan dengan batch rpc-november-2026 (Sertifikasi RPC).
-- JALANKAN MANUAL di Supabase SQL Editor. Agent tidak mengeksekusi DML ini.

-- Preview dulu (opsional):
-- SELECT slug, category_id, kategori_id
-- FROM batches
-- WHERE slug IN ('rpc-oktober-2026', 'rpc-agustus-2026', 'rpc-november-2026');

UPDATE batches
SET category_id = (
  SELECT category_id
  FROM batches
  WHERE slug = 'rpc-november-2026'
  LIMIT 1
)
WHERE slug IN ('rpc-oktober-2026', 'rpc-agustus-2026')
  AND category_id IS NULL
  AND EXISTS (
    SELECT 1
    FROM batches
    WHERE slug = 'rpc-november-2026'
      AND category_id IS NOT NULL
  );

-- Verifikasi:
-- SELECT slug, category_id, kategori_id
-- FROM batches
-- WHERE slug IN ('rpc-oktober-2026', 'rpc-agustus-2026', 'rpc-november-2026');
