import { composeStories } from "@storybook/react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { baseThemeTokens } from "./base";
import {
	type BrandTokens,
	autocreditBrand,
	brandCssVar,
	brandTokenKeys,
	businessBrand,
	defaultBrandTokens,
	resolveBrandTokens,
} from "./brand";
import { darkColorTokens, lightColorTokens, presetsColors } from "./color";
import { getThemeTokenVariants, hexToRgbChannel, removePx, rgbAlpha, toCssVar, toCssVars } from "./css-var-utils";
import { ThemeColorPresets, ThemeMode } from "./enum";
import { darkShadowTokens, lightShadowTokens } from "./shadow";
import { themeVars } from "./theme.css";
import * as stories from "./tokens.stories";
import { themeTokens } from "./type";
import { typographyTokens } from "./typography";

const { Default } = composeStories(stories);

describe("theme contract", () => {
	it("exposes every top-level token group", () => {
		expect(Object.keys(themeVars).sort()).toEqual(
			["borderRadius", "colors", "opacity", "screens", "shadows", "spacing", "typography", "zIndex"].sort(),
		);
	});

	it("names CSS variables after the token path, which is what the provider writes at runtime", () => {
		expect(themeVars.colors.palette.primary.default).toBe("var(--colors-palette-primary-default)");
		expect(themeVars.colors.palette.primary.defaultChannel).toBe("var(--colors-palette-primary-defaultChannel)");
		expect(themeVars.colors.text.primary).toBe("var(--colors-text-primary)");
		expect(themeVars.spacing[4]).toBe("var(--spacing-4)");
		expect(themeVars.shadows.card).toBe("var(--shadows-card)");
		expect(themeVars.typography.fontSize.default).toBe("var(--typography-fontSize-default)");
	});

	it("adds a Channel companion to every color leaf", () => {
		for (const variant of Object.keys(themeTokens.colors.palette.primary)) {
			expect(themeVars.colors.palette.primary).toHaveProperty(`${variant}Channel`);
		}
	});

	it("keeps light and dark token sets structurally identical", () => {
		expect(Object.keys(lightColorTokens)).toEqual(Object.keys(darkColorTokens));
		expect(Object.keys(lightShadowTokens)).toEqual(Object.keys(darkShadowTokens));
		expect(Object.keys(lightColorTokens.palette)).toEqual(Object.keys(themeTokens.colors.palette));
	});

	it("ships one palette per color preset", () => {
		for (const preset of Object.values(ThemeColorPresets)) {
			expect(Object.keys(presetsColors[preset])).toEqual(["lighter", "light", "default", "dark", "darker"]);
		}
	});

	it("declares the theme modes the provider toggles on <html>", () => {
		expect(ThemeMode.Light).toBe("light");
		expect(ThemeMode.Dark).toBe("dark");
	});

	it("keeps the base scales in sync with the contract", () => {
		expect(Object.keys(baseThemeTokens.spacing)).toEqual(Object.keys(themeTokens.spacing));
		expect(Object.keys(baseThemeTokens.borderRadius)).toEqual(Object.keys(themeTokens.borderRadius));
		expect(Object.keys(typographyTokens.fontSize)).toEqual(Object.keys(themeTokens.typography.fontSize));
	});
});

describe("css-var-utils", () => {
	it("toCssVar turns a token path into a variable name", () => {
		expect(toCssVar("colors.palette.primary.default")).toBe("--colors-palette-primary-default");
		expect(toCssVar("spacing.4")).toBe("--spacing-4");
	});

	it("toCssVars expands a token group, renaming `default` to tailwind's DEFAULT", () => {
		expect(toCssVars("colors.palette.primary")).toEqual({
			lighter: "var(--colors-palette-primary-lighter)",
			light: "var(--colors-palette-primary-light)",
			DEFAULT: "var(--colors-palette-primary-default)",
			dark: "var(--colors-palette-primary-dark)",
			darker: "var(--colors-palette-primary-darker)",
		});
	});

	it("toCssVars returns an empty map for an unknown path", () => {
		expect(toCssVars("colors.nope")).toEqual({});
		expect(getThemeTokenVariants("colors.palette.gray")).toEqual([
			"100",
			"200",
			"300",
			"400",
			"500",
			"600",
			"700",
			"800",
			"900",
		]);
	});

	it("hexToRgbChannel converts a hex to the channel triplet", () => {
		expect(hexToRgbChannel("#5F8BFA")).toBe("95,139,250");
		expect(hexToRgbChannel("#000000")).toBe("0,0,0");
		expect(hexToRgbChannel("#fff")).toBe("255,255,255");
	});

	it("rgbAlpha handles hex, CSS vars, bare custom properties, lists and arrays", () => {
		expect(rgbAlpha("#000000", 0.24)).toBe("rgba(0,0,0, 0.24)");
		expect(rgbAlpha("var(--colors-palette-primary-defaultChannel)", 0.24)).toBe(
			"rgba(var(--colors-palette-primary-defaultChannel), 0.24)",
		);
		expect(rgbAlpha("--colors-palette-gray-500Channel", 0.1)).toBe("rgba(var(--colors-palette-gray-500Channel), 0.1)");
		expect(rgbAlpha("200, 250, 214", 0.24)).toBe("rgba(200, 250, 214, 0.24)");
		expect(rgbAlpha([200, 250, 214], 0.24)).toBe("rgba(200, 250, 214, 0.24)");
	});

	it("rgbAlpha clamps alpha and rejects garbage", () => {
		expect(rgbAlpha("#000000", 5)).toBe("rgba(0,0,0, 1)");
		expect(rgbAlpha("#000000", -1)).toBe("rgba(0,0,0, 0)");
		expect(() => rgbAlpha("nonsense", 0.5)).toThrow("Invalid color format");
	});

	it("removePx strips the unit and keeps numbers intact", () => {
		expect(removePx("8px")).toBe(8);
		expect(removePx("16.5PX")).toBe(16.5);
		expect(removePx("-16px")).toBe(-16);
		expect(removePx("16")).toBe(16);
		expect(removePx(16)).toBe(16);
		expect(() => removePx("")).toThrow("Invalid value: empty string");
		expect(() => removePx("auto")).toThrow("Invalid value: auto");
	});
});

describe("brand token contract", () => {
	const keys = brandTokenKeys as readonly (keyof BrandTokens)[];

	it("is the union of both apps' brand keys", () => {
		expect(keys).toHaveLength(10);
		expect([...keys].sort()).toEqual(
			[
				"driverse_primary",
				"driverse_primary_light",
				"driverse_secondary",
				"driverse_black",
				"driverse_gray",
				"white",
				"driverse_blue",
				"driverse_light_blue",
				"driverse_red",
				"driverse_green",
			].sort(),
		);
	});

	it("gives the default and both reference presets a value for every key", () => {
		for (const brand of [defaultBrandTokens, autocreditBrand, businessBrand]) {
			for (const key of keys) {
				expect(brand[key]).toMatch(/^#[0-9a-fA-F]{3,8}$/);
			}
			expect(Object.keys(brand).sort()).toEqual([...keys].sort());
		}
	});

	it("maps every key to a kebab-case --brand-* variable", () => {
		expect(brandCssVar("driverse_primary")).toBe("--brand-primary");
		expect(brandCssVar("driverse_primary_light")).toBe("--brand-primary-light");
		expect(brandCssVar("driverse_light_blue")).toBe("--brand-light-blue");
		expect(brandCssVar("white")).toBe("--brand-white");
		expect(new Set(keys.map(brandCssVar)).size).toBe(keys.length);
	});

	it("records the values the two apps genuinely disagree on", () => {
		// The user decision this contract exists for: brand values are per-app by design.
		expect(autocreditBrand.driverse_primary_light).toBe("#E1E9F5");
		expect(businessBrand.driverse_primary_light).toBe("#f0f7ff");
		expect(autocreditBrand.driverse_primary).toBe(businessBrand.driverse_primary);
	});

	it("resolveBrandTokens layers a partial override onto the defaults", () => {
		expect(resolveBrandTokens()).toEqual(defaultBrandTokens);
		expect(resolveBrandTokens({ driverse_primary: "#123456" })).toEqual({
			...defaultBrandTokens,
			driverse_primary: "#123456",
		});
	});
});

describe("token gallery story", () => {
	it("renders every token section", () => {
		render(<Default />);
		for (const title of [
			"Brand tokens (contract + reference presets)",
			"Light palette",
			"Dark palette (text / background)",
			"Spacing",
			"Border radius",
			"Shadows (light)",
			"Shadows (dark)",
			"Typography",
		]) {
			expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
		}
		expect(screen.getByText(`driverse_primary → ${brandCssVar("driverse_primary")}`)).toBeInTheDocument();
	});
});
