module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  env: { node: true, es2022: true, jest: true },
  ignorePatterns: ["dist", "node_modules", "prisma/migrations"],
  rules: {
    "@typescript-eslint/no-explicit-any": "error",
  },
};
