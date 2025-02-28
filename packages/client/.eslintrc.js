const path = require("path");

module.exports = {
  extends: ["eslint:recommended", "next", "next/core-web-vitals"],
  rules: {
    "no-unused-vars": "warn",
    "import/no-unresolved": "error",
    "import/named": "error",
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
