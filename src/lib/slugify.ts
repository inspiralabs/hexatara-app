/** Slug URL dari teks (huruf kecil, non-alfanumerik → `-`). Tanpa kolom DB. */
export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
