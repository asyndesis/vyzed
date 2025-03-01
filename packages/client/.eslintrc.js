const path = require("path");

module.exports = {
  extends: ["next"],
  // parser: "@babel/eslint-parser",
  // parserOptions: {
  //   requireConfigFile: false,
  //   ecmaVersion: "latest",
  //   sourceType: "module",
  // },
  rules: {
    "no-unused-vars": "warn",
    "import/no-unresolved": "error",
    "import/named": "error",
  },
  env: {
    browser: true,
    node: true,
    es2024: true,
  },
  settings: {
    "import/resolver": {
      node: {
        moduleDirectory: ["node_modules"],
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      },
      "eslint-import-resolver-custom-alias": {
        alias: {
          "@": path.resolve(__dirname, "src"),
        },
        extensions: [".js", ".jsx"],
      },
    },
    "import/parsers": {
      "@babel/eslint-parser": [".js", ".jsx"],
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
  },
};
