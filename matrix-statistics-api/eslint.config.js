import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,ts,mjs,cjs}"],
    languageOptions: {
      sourceType: "module",
      parser: tseslint.parser, 
      globals: {
        ...globals.node
      }
    },
    rules: {
      semi: ["error", "always"],
      "eol-last": ["error", "always"],
      quotes: ["error", "double"],
      indent: ["error", 2],
      "comma-dangle": ["error", "never"],
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-console": "off",
      "@typescript-eslint/no-namespace": "off"
    }
  }
]);
