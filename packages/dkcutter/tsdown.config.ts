import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/cli.ts"],
  dts: true,
  shims: true,
  format: ["esm"],
  minify: true,
  exports: true,
});
