/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/utils/theme.ts
 *   B: Driverse_FE_Business   @ b96eda3 src/utils/theme.ts
 * @status merged
 * @notes Comment-only divergence (B commented out the console.log lines inside the JSDoc examples).
 *        A adopted verbatim; only the `themeTokens` import path changed (../theme/type -> ./type).
 *        Renamed utils/theme.ts -> css-var-utils.ts so the token layer owns the tailwind <-> vanilla-extract bridge.
 *        removePx: dropped the duplicated JSDoc block and translated its zh-CN inline comments; logic untouched.
 */

import color from "color";
import { themeTokens } from "./type";

/**
 * @example
 * const rgb = rgbAlpha("#000000", 0.24);
 * console.log(rgb); // "rgba(0, 0, 0, 0.24)"
 *
 * const rgb = rgbAlpha("var(--colors-palette-primary-main)", 0.24);
 * console.log(rgb); // "rgba(var(--colors-palette-primary-main), 0.24)"
 *
 * const rgb = rgbAlpha("rgb(var(--colors-palette-primary-main))", 0.24);
 * console.log(rgb); // "rgba(rgb(var(--colors-palette-primary-main)), 0.24)"
 *
 * const rgb = rgbAlpha([200, 250, 214], 0.24);
 * console.log(rgb); // "rgba(200, 250, 214, 0.24)"
 */
export function rgbAlpha(color: string | string[] | number[], alpha: number): string {
	// ensure alpha value is between 0-1
	const safeAlpha = Math.max(0, Math.min(1, alpha));

	// if color is CSS variable
	if (typeof color === "string") {
		if (color.startsWith("#")) {
			return `rgba(${hexToRgbChannel(color)}, ${safeAlpha})`;
		}
		if (color.includes("var(")) {
			return `rgba(${color}, ${safeAlpha})`;
		}
		if (color.startsWith("--")) {
			return `rgba(var(${color}), ${safeAlpha})`;
		}

		// handle "200, 250, 214" or "200 250 214" format
		if (color.includes(",") || color.includes(" ")) {
			const rgb = color.split(/[,\s]+/).map((n) => n.trim());
			return `rgba(${rgb.join(", ")}, ${safeAlpha})`;
		}
	}

	// handle array format [200, 250, 214]
	if (Array.isArray(color)) {
		return `rgba(${color.join(", ")}, ${safeAlpha})`;
	}

	throw new Error("Invalid color format");
}

/**
 * @example
 * const rgbChannel = hexToRgbChannel("#000000");
 * console.log(rgbChannel); // "0, 0, 0"
 */
export const hexToRgbChannel = (hex: string) => {
	const rgb = color(hex).rgb().array();
	return rgb.join(",");
};

/**
 * convert to CSS vars
 * @param propertyPath example: `colors.palette.primary`
 * @returns example: `--colors-palette-primary`
 */
export const toCssVar = (propertyPath: string) => {
	return `--${propertyPath.split(".").join("-")}`;
};

/**
 * convert to CSS vars
 * @param propertyPath example: `colors.palette.primary`
 * @returns
 * ```js
 * {
 *   lighter: "var(--colors-palette-primary-lighter)",
 *   light: "var(--colors-palette-primary-light)",
 *   main: "rgb(var(--colors-palette-primary-main))",
 *   dark: "rgb(var(--colors-palette-primary-dark))",
 *   darker: "rgb(var(--colors-palette-primary-darker))"
 * }
 * ```
 */
export const toCssVars = (propertyPath: string) => {
	const variants = getThemeTokenVariants(propertyPath);
	const result = variants.reduce(
		(acc, variant) => {
			const variantKey = variant === "default" ? "DEFAULT" : variant;
			acc[variantKey] = `var(${toCssVar(`${propertyPath}-${variant}`)})`;
			return acc;
		},
		{} as Record<string, string>,
	);
	return result;
};

/**
 * get variants in {@link themeTokens}
 * @param propertyPath example: `colors.palette.primary`
 * @returns example: `["lighter", "light", "main", "dark", "darker"]`
 */
export const getThemeTokenVariants = (propertyPath: string) => {
	const keys = propertyPath.split(".");
	const val = keys.reduce((obj: any, key) => {
		if (obj && typeof obj === "object") {
			return obj[key];
		}
		return;
	}, themeTokens);

	return val ? Object.keys(val) : [];
};

/**
 * remove px unit and convert to number
 * @param value example: "16px", "16.5px", "-16px", "16", 16
 * @returns example: 16, 16.5, -16, 16, 16
 * @throws Error if value is invalid
 */
export const removePx = (value: string | number): number => {
	// already a number: return as-is
	if (typeof value === "number") return value;

	// empty string is not a length
	if (!value) {
		throw new Error("Invalid value: empty string");
	}

	const trimmed = value.trim();

	// case-insensitive px suffix
	const hasPx = /px$/i.test(trimmed);

	const num = hasPx ? trimmed.slice(0, -2) : trimmed;

	const result = Number.parseFloat(num);

	if (Number.isNaN(result)) {
		throw new Error(`Invalid value: ${value}`);
	}

	return result;
};
