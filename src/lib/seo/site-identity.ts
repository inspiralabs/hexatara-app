export const SITE_NAME = "Hexatara";
export const SITE_EMAIL = "info@hexatara.com";
export const SITE_SAME_AS = ["https://www.instagram.com/hexatara/"];

export const CREATOR_NAME = "InspiraLabs";
export const CREATOR_URL = "https://inspiralabs.id";
// TODO(Alif): isi akun sosial resmi InspiraLabs — jangan mengarang URL.
export const CREATOR_SAME_AS: string[] = [];

/** Satu @graph untuk beranda. Semua URL memakai origin canonical. */
export function buildHomeJsonLd(origin: string) {
  const hexatara = { "@id": `${origin}/#organization` };
  const inspiralabs = { "@id": `${CREATOR_URL}/#organization` };
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${origin}/#website`,
        url: `${origin}/`,
        name: SITE_NAME,
        inLanguage: ["id", "en"],
        publisher: hexatara,
        // schema.org: Organization tidak punya `creator`, WebSite punya.
        creator: inspiralabs,
      },
      {
        "@type": "Organization",
        ...hexatara,
        name: SITE_NAME,
        url: `${origin}/`,
        logo: `${origin}/hexatara-logo-default.png`,
        email: SITE_EMAIL,
        sameAs: SITE_SAME_AS,
      },
      {
        "@type": "Organization",
        ...inspiralabs,
        name: CREATOR_NAME,
        url: CREATOR_URL,
        sameAs: CREATOR_SAME_AS,
      },
    ],
  };
}
