import eslint from "@eslint/js";
import globals from "globals";

export default [
  eslint.configs.recommended,
  {
    files: ["src/**/*.js", "prisma/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
    rules: {
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "no-console": "off",
    },
  },
  {
    ignores: ["dist/**", "node_modules/**"],
  }
];
