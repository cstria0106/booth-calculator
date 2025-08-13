import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.tsx"],
  format: ["esm"],
  target: "chrome136",
  minify: true,
  treeshake: true,
  splitting: false,
  outDir: "dist",
  noExternal: ["preact", "papaparse", "twind"],
});
