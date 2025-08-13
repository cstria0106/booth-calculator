import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.tsx"],
  format: ["esm"],
  target: "chrome136",
  treeshake: true,
  splitting: false,
  outDir: "dist",
  minify: "terser",
});
