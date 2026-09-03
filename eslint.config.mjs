import coreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...coreWebVitals,
  ...nextTypescript,
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "coverage/**",
      "next-env.d.ts",
      // Pre-existing Fully Completely sprint-lifecycle tooling (CommonJS
      // Node scripts), not part of the Next.js app this sprint builds.
      // Out of this sprint's scope per its "Out of Scope" section.
      "scripts/**",
    ],
  },
];

export default eslintConfig;
