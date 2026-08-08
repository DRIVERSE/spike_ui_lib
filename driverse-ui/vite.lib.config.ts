import path from "node:path";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import svgr from "vite-plugin-svgr";
import pkg from "./package.json" with { type: "json" };

// Everything declared as a peer or regular dependency stays external; only
// the library's own source is bundled (per-module, tree-shakeable output).
const externals = [...Object.keys(pkg.peerDependencies ?? {}), ...Object.keys(pkg.dependencies ?? {})];
const isExternal = (id: string) =>
	id.startsWith("react/") ||
	id.startsWith("react-dom/") ||
	externals.some((dep) => id === dep || id.startsWith(`${dep}/`));

export default defineConfig({
	plugins: [
		react(),
		vanillaExtractPlugin({ identifiers: ({ debugId }) => debugId }),
		svgr(),
		dts({ tsconfigPath: "./tsconfig.json", exclude: ["**/*.stories.tsx", "**/*.test.ts", "**/*.test.tsx", "test"] }),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
		},
	},
	build: {
		target: "esnext",
		sourcemap: true,
		cssCodeSplit: false,
		lib: {
			entry: {
				index: path.resolve(__dirname, "src/index.ts"),
				"tokens/index": path.resolve(__dirname, "src/tokens/index.ts"),
				"tailwind/preset": path.resolve(__dirname, "src/tailwind/preset.ts"),
				"icons/iconify-bundle": path.resolve(__dirname, "src/icons/iconify-bundle.ts"),
				"utils/highlight": path.resolve(__dirname, "src/utils/highlight.ts"),
				"charts/index": path.resolve(__dirname, "src/charts/index.ts"),
				"data-table/index": path.resolve(__dirname, "src/data-table/index.tsx"),
				"editor/index": path.resolve(__dirname, "src/editor/index.tsx"),
				"pdf/index": path.resolve(__dirname, "src/pdf/index.ts"),
				"i18n/index": path.resolve(__dirname, "src/i18n/index.ts"),
				"features/fleet-tracking-map/index": path.resolve(__dirname, "src/features/fleet-tracking-map/index.tsx"),
				"features/multi-tabs/index": path.resolve(__dirname, "src/features/multi-tabs/index.ts"),
				"features/document-inbox/index": path.resolve(__dirname, "src/features/document-inbox/index.tsx"),
				"features/telemetry/index": path.resolve(__dirname, "src/features/telemetry/index.ts"),
				"features/vehicle-compliance/index": path.resolve(__dirname, "src/features/vehicle-compliance/index.ts"),
				"features/vehicle-insurance/index": path.resolve(__dirname, "src/features/vehicle-insurance/index.ts"),
			},
			formats: ["es"],
		},
		rollupOptions: {
			external: isExternal,
			output: {
				preserveModules: true,
				preserveModulesRoot: "src",
				entryFileNames: "[name].js",
				assetFileNames: "driverse-ui[extname]",
			},
		},
	},
});
