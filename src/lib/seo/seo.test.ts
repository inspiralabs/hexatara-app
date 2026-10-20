import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { isIndexableHost, canonicalOrigin } from "./canonical";
import { buildHomeJsonLd } from "./site-identity";

const ORIGINAL = { ...process.env };
beforeEach(() => {
  process.env.NEXT_PUBLIC_CANONICAL_URL = "https://hexatara.com/";
  process.env.NEXT_PUBLIC_SITE_URL = "https://hexatara.inspiralabs.id";
});
afterEach(() => {
  process.env = { ...ORIGINAL };
});

describe("isIndexableHost", () => {
  it.each([
    ["hexatara.com", true],
    ["www.hexatara.com", true],
    ["HEXATARA.com:443", true],
    ["localhost", true],
    ["localhost:3000", true],
    ["hexatara.inspiralabs.id", false],
    ["example.com", false],
  ])("%s -> %s", (host, expected) => {
    expect(isIndexableHost(host)).toBe(expected);
  });
});

describe("canonicalOrigin", () => {
  it("memakai env canonical tanpa trailing slash", () => {
    expect(canonicalOrigin()).toBe("https://hexatara.com");
  });
  it("fallback ke SITE_URL", () => {
    delete process.env.NEXT_PUBLIC_CANONICAL_URL;
    expect(canonicalOrigin()).toBe("https://hexatara.inspiralabs.id");
  });
});

describe("buildHomeJsonLd", () => {
  it("memuat tiga node dan semua URL milik Hexatara memakai origin canonical", () => {
    const g = buildHomeJsonLd("https://hexatara.com")["@graph"] as Record<string, unknown>[];
    expect(g.map((n) => n["@type"])).toEqual(["WebSite", "Organization", "Organization"]);
    expect(g[0]?.url).toBe("https://hexatara.com/");
    expect(g[1]?.logo).toBe("https://hexatara.com/hexatara-logo-default.png");
    expect(JSON.stringify(g)).not.toContain("inspiralabs.id/hexatara");
  });
});
