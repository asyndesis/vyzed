const path = require("path");

module.exports = {
  extends: ["eslint:recommended", "next", "next/core-web-vitals"],
  parser: "@babel/eslint-parser",
  parserOptions: {
    requireConfigFile: false,
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    "no-unused-vars": "warn",
    "import/no-unresolved": "error",
    "import/named": "error",
  },
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  settings: {
    "import/resolver": {
      "eslint-import-resolver-custom-alias": {
        alias: {
          "@": path.resolve(__dirname, "src"),
        },
        extensions: [".js", ".jsx"],
      },
    },
    "import/parsers": {
      "@babel/eslint-parser": [".js", ".jsx"],
    },
  },
};
