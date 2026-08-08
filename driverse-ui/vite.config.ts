import path from "node:path";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";

// Base config: plugins + aliases only. Storybook and Vitest pick this up.
// The library build lives in vite.lib.config.ts (adds lib mode + dts).
export default defineConfig({
	plugins: [react(), vanillaExtractPlugin({ identifiers: ({ debugId }) => debugId }), svgr()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
		},
	},
});
