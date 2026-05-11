import { defineConfig } from "oxfmt";

export default defineConfig({
  ignorePatterns: ["node_modules", "dist"],
  sortImports: true,
  printWidth: 80,
});
