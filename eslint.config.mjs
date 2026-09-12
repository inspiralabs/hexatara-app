import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import jsxA11y from "eslint-plugin-jsx-a11y";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // eslint-config-next sudah mendaftarkan plugin jsx-a11y sendiri (recommended,
  // sebagian besar warning) — pakai flatConfigs.strict.rules SAJA (tanpa key
  // plugins) supaya rule-nya naik ke error tanpa mendaftarkan ulang plugin yang
  // sama dan bentrok ("Cannot redefine plugin jsx-a11y").
  { rules: jsxA11y.flatConfigs.strict.rules },
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
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
