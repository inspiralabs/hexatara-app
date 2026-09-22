import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import jsxA11y from "eslint-plugin-jsx-a11y";

// Sama dengan files di eslint-config-next (plugin jsx-a11y sudah terdaftar di sana).
// Jangan daftar ulang plugins di sini → "Cannot redefine plugin jsx-a11y".
// Jangan hilangkan `files` → rule strict menempel ke .md/.json tanpa plugin.
const JSX_TS_FILES = ["**/*.{js,jsx,mjs,ts,tsx,mts,cts}"];

const eslintConfig = defineConfig([
  // Skrip audit Lighthouse sementara — tetap di repo untuk re-run, bukan sumber app.
  globalIgnores([
    "/_lh-*.cjs",
    "/_lh-*.mjs",
    "/_lh-*.js",
    "_lh-discover.cjs",
    "_lh-run-perf.cjs",
    "_lh-run-perf.mjs",
    "_lh-run-prod.cjs",
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  ...nextVitals,
  ...nextTs,
  {
    files: JSX_TS_FILES,
    rules: jsxA11y.flatConfigs.strict.rules,
  },
  {
    rules: {
      // allow: ["error"] — console.error adalah mekanisme log yang disepakati
      // (ENGINEERING §5.7: "catat kegagalannya, jangan lempar ke pengguna"),
      // dipakai konsisten di semua Server Action. Yang dilarang cuma
      // console.log/.debug/.info sisa debug, bukan logging server yang disengaja.
      "no-console": ["error", { allow: ["error"] }],
    },
  },
  {
    // Komponen dasar shadcn — dilarang diedit manual (ENGINEERING §6.4).
    // False positive: linter tidak bisa lihat lintas-komponen bahwa semua
    // pemanggil <Label> di app ini selalu mengisi htmlFor (sudah dicek manual).
    files: ["src/components/ui/label.tsx"],
    rules: { "jsx-a11y/label-has-associated-control": "off" },
  },
  {
    // Komponen dasar shadcn (combobox, §12.6.5) — dilarang diedit manual.
    // onClick di InputGroupAddon murni meneruskan fokus ke <input> di sebelahnya
    // (klik di area ikon/tombol tetap memfokuskan input), bukan kontrol
    // interaktif baru yang butuh handler keyboard sendiri.
    files: ["src/components/ui/input-group.tsx"],
    rules: {
      "jsx-a11y/click-events-have-key-events": "off",
      "jsx-a11y/no-noninteractive-element-interactions": "off",
    },
  },
]);

export default eslintConfig;
