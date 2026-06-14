const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["node_modules/**", ".expo/**", "dist/**", "coverage/**"],
  },
  {
    // Every user-facing string on a screen must go through i18n t(); only
    // punctuation/separators are allowed as raw JSX text. Shared UI primitives
    // and tests are exempt.
    files: ["app/**/*.tsx", "src/features/**/*.tsx"],
    ignores: ["**/__tests__/**", "app/dev/**"],
    rules: {
      "react/jsx-no-literals": [
        "error",
        {
          noStrings: false,
          ignoreProps: true,
          allowedStrings: [" - ", " · ", " / ", "/", "%", "·", "-", "•", ":", "% ", "—", "Meridian", "AED"],
        },
      ],
    },
  },
]);
