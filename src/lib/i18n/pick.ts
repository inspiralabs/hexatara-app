export function pick<T>(id: T | null, en: T | null, locale: string): T | null {
  return locale === "en" ? (en ?? id) : id;
}
