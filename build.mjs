import { build, context } from "esbuild";
import { readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("./package.json", "utf8"));
const watch = process.argv.includes("--watch");

/** @type {import("esbuild").BuildOptions} */
const options = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  format: "esm",
  target: "es2021",
  minify: !watch,
  sourcemap: watch ? "inline" : false,
  legalComments: "none",
  outfile: "dist/lights-area-strategy.js",
  define: { __VERSION__: JSON.stringify(pkg.version) },
};

if (watch) {
  const ctx = await context(options);
  await ctx.watch();
  console.log("👀 Watching src/ …");
} else {
  await build(options);
  console.log(`✅ dist/lights-area-strategy.js (v${pkg.version})`);
}
