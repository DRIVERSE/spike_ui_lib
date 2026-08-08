/** @lib-native */

/**
 * Brand-token CONTRACT.
 *
 * Both apps ship a `src/theme/colors.ts` with a flat map of `driverse_*` hexes, and those maps
 * legitimately disagree (`driverse_primary_light` is #E1E9F5 in Autocredit and #f0f7ff in Business).
 * Per the program decision, divergent brand values are a *feature*: the library owns the key set and
 * the CSS-variable naming, each app injects its own values through `<UIThemeProvider brand={...}>`.
 *
 * The contract is the union of both apps' keys (Autocredit's 9 + Business's 6). Every key resolves to
 * a `--brand-*` CSS variable written on `:root` by the provider, which is what the tailwind preset
 * and vanilla-extract styles reference — so a component never bakes in a brand hex.
 */
export type BrandTokens = {
	driverse_primary: string;
	driverse_primary_light: string;
	driverse_secondary: string;
	driverse_black: string;
	driverse_gray: string;
	white: string;
	driverse_blue: string;
	driverse_light_blue: string;
	driverse_red: string;
	driverse_green: string;
};

/** Every key in the contract, in declaration order. The provider and the tailwind preset iterate this. */
export const brandTokenKeys = [
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
] as const satisfies readonly (keyof BrandTokens)[];

/**
 * CSS variable name for a brand token: the `driverse_` prefix is dropped and underscores become
 * dashes, so `driverse_light_blue` -> `--brand-light-blue` and `white` -> `--brand-white`.
 */
export const brandCssVar = (key: keyof BrandTokens): string =>
	`--brand-${key.replace(/^driverse_/, "").replace(/_/g, "-")}`;

/**
 * Neutral default the library ships with, so `<UIThemeProvider>` renders sensibly with no `brand` prop
 * (Storybook, tests, a consumer's first render). Values are Autocredit's, with `driverse_green` filled
 * from Business — the only key Autocredit does not declare.
 */
export const defaultBrandTokens: BrandTokens = {
	driverse_primary: "#5F8BFA",
	driverse_primary_light: "#E1E9F5",
	driverse_secondary: "#294176",
	driverse_black: "#000",
	driverse_gray: "#9d9d9e",
	white: "#fff",
	driverse_blue: "#1A73E8",
	driverse_light_blue: "#c7d6fc",
	driverse_red: "#DF3D3D",
	driverse_green: "#22c55d",
};

/**
 * Reference preset — Autocredit's exact `src/theme/colors.ts` values @ b96eda3.
 * Autocredit does not declare `driverse_green`; it inherits the default.
 * Documentation for the app-side injection, not something the library uses at runtime.
 */
export const autocreditBrand: BrandTokens = {
	driverse_primary: "#5F8BFA",
	driverse_primary_light: "#E1E9F5",
	driverse_secondary: "#294176",
	driverse_black: "#000",
	driverse_gray: "#9d9d9e",
	white: "#fff",
	driverse_blue: "#1A73E8",
	driverse_light_blue: "#c7d6fc",
	driverse_red: "#DF3D3D",
	driverse_green: defaultBrandTokens.driverse_green,
};

/**
 * Reference preset — Business's exact `src/theme/colors.ts` values @ b96eda3.
 * Business declares only 5 keys; the remaining 5 inherit the default. Note `driverse_primary_light`
 * is the one value the two apps genuinely disagree on.
 */
export const businessBrand: BrandTokens = {
	driverse_primary: "#5F8BFA",
	driverse_primary_light: "#f0f7ff",
	driverse_secondary: "#294176",
	driverse_black: "#000",
	driverse_gray: defaultBrandTokens.driverse_gray,
	white: defaultBrandTokens.white,
	driverse_blue: defaultBrandTokens.driverse_blue,
	driverse_light_blue: defaultBrandTokens.driverse_light_blue,
	driverse_red: defaultBrandTokens.driverse_red,
	driverse_green: "#22c55d",
};

/** Merge a partial app override onto the library defaults. */
export const resolveBrandTokens = (brand?: Partial<BrandTokens>): BrandTokens => ({
	...defaultBrandTokens,
	...brand,
});
