import globals from "globals";
import pluginJs from "@eslint/js";
import jest from "eslint-plugin-jest";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default [
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  pluginJs.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    rules: {
      "no-unused-vars": "warn",
    },
  },
  {
    ignores: ["dist/*", "coverage/*"],
  },
  {
    files: ["**/*.test.js"],
    languageOptions: {
      env: {
        jest: true,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
    },
    ...jest.configs["flat/recommended"],
    rules: {
      ...jest.configs["flat/recommended"].rules,
      "jest/prefer-expect-assertions": "off",
      "jest/expect-expect": "error",
      "jest/no-conditional-expect": "error",
    },
  },
  {
    files: ["**/*.jest-e2e-setup.js"],
    languageOptions: {
      env: {
        jest: true,
      },
    },
  },
];
