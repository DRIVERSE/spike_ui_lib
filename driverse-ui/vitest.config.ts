import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(
	viteConfig,
	defineConfig({
		test: {
			environment: "jsdom",
			globals: true,
			css: true,
			setupFiles: ["./test/setup.ts"],
			include: ["src/**/*.test.{ts,tsx}"],
			coverage: {
				provider: "v8",
				include: ["src/**"],
				exclude: ["src/**/*.stories.tsx", "src/**/*.css.ts"],
			},
		},
	}),
);
