/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 tailwind.config.ts
 *   B: Driverse_FE_Business   @ b96eda3 tailwind.config.ts
 * @status merged
 * @notes The two configs differ only by A's four hard-coded `driverse_*` colors and whitespace in the
 *        `fontFamily` block. Everything shared is lifted verbatim as a tailwind Preset; `content` stays
 *        with the consumer (it must include the library's dist glob — see docs/CONSUMING.md).
 *        Deviation: brand colors are emitted as `var(--brand-*)` references instead of hexes, so the
 *        values follow whatever `<UIThemeProvider brand={...}>` injects. That also covers `primary` and
 *        `secondary`, which both apps had hard-coded to brand hexes (#5F8BFA / #e1e9f5) with the
 *        `toCssVars("colors.palette.*")` calls commented out; the commented-out originals are kept below.
 *        `darkMode` is deliberately left unset, matching both apps.
 */

import type { Config } from "tailwindcss";
import { type BrandTokens, brandCssVar, brandTokenKeys } from "../tokens/brand";
import { breakpointsTokens } from "../tokens/breakpoints";
import { rgbAlpha, toCssVar, toCssVars } from "../tokens/css-var-utils";

const brandVar = (key: keyof BrandTokens) => `var(${brandCssVar(key)})`;

/** Every brand token as a tailwind color, e.g. `driverse_primary` -> `var(--brand-primary)`. */
const brandColors: Record<string, string> = Object.fromEntries(brandTokenKeys.map((key) => [key, brandVar(key)]));

export const driverseUiPreset = {
	theme: {
		colors: {
			primary: brandVar("driverse_primary"), // was: toCssVars("colors.palette.primary")
			secondary: brandVar("driverse_primary_light"), // was: toCssVars("colors.palette.secondary")
			success: toCssVars("colors.palette.success"),
			warning: toCssVars("colors.palette.warning"),
			error: toCssVars("colors.palette.error"),
			info: toCssVars("colors.palette.info"),
			gray: toCssVars("colors.palette.gray"),
			common: toCssVars("colors.common"),
			text: toCssVars("colors.text"),
			bg: toCssVars("colors.background"),
			border: rgbAlpha(toCssVar("colors.palette.gray.500Channel"), 0.1),
			hover: rgbAlpha(toCssVar("colors.palette.gray.500Channel"), 0.1),
			// Driverse brand colors, resolved at runtime from the --brand-* variables.
			...brandColors,
			red: {
				50: "#fef2f2",
				100: "#fee2e2",
				200: "#fecaca",
				300: "#fca5a5",
				400: "#f87171",
				500: "#ef4444",
				600: "#dc2626",
				700: "#b91c1c",
				800: "#991b1b",
				900: "#7f1d1d",
			},
			green: {
				50: "#f0fdf4",
				100: "#dcfce7",
				200: "#bbf7d0",
				300: "#86efac",
				400: "#4ade80",
				500: "#22c55e",
				600: "#16a34a",
				700: "#15803d",
				800: "#166534",
				900: "#14532d",
			},
			yellow: {
				50: "#fefce8",
				100: "#fef9c3",
				200: "#fef08a",
				300: "#fde047",
				400: "#facc15",
				500: "#eab308",
				600: "#ca8a04",
				700: "#a16207",
				800: "#854d0e",
				900: "#713f12",
			},
			// Both apps keep plain white/black after the brand block; they win over `--brand-white`.
			white: "#ffffff",
			black: "#000000",
		},

		opacity: toCssVars("opacity"),
		screens: breakpointsTokens,
		extend: {
			borderRadius: toCssVars("borderRadius"),
			boxShadow: toCssVars("shadows"),
			spacing: toCssVars("spacing"),
			fontFamily: {
				sans: ["Outfit", "ui-sans-serif", "system-ui", "sans-serif"],
			},
		},
	},

	plugins: [],
} satisfies Partial<Config>;

export default driverseUiPreset;
