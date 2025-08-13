import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.tsx"],
  format: ["esm"],
  target: "chrome136",
  minify: true,
  treeshake: true,
  splitting: false,
  injectStyle: true,
  outDir: "dist",
  noExternal: ['preact-material-components'],
});
