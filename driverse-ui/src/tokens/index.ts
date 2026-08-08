// `themeVars` re-exports theme.css.ts, whose side effect installs the :root.light / :root.dark
// CSS variable declarations — importing the token layer is what makes the theme real.
export { baseThemeTokens } from "./base";
export {
	type BrandTokens,
	autocreditBrand,
	brandCssVar,
	brandTokenKeys,
	businessBrand,
	defaultBrandTokens,
	resolveBrandTokens,
} from "./brand";
export { breakpointsTokens } from "./breakpoints";
export {
	commonColors,
	darkColorTokens,
	lightColorTokens,
	paletteColors,
	presetsColors,
} from "./color";
export {
	getThemeTokenVariants,
	hexToRgbChannel,
	removePx,
	rgbAlpha,
	toCssVar,
	toCssVars,
} from "./css-var-utils";
export { ThemeColorPresets, ThemeMode } from "./enum";
export {
	HEADER_HEIGHT,
	MULTI_TABS_HEIGHT,
	NAV_COLLAPSED_WIDTH,
	NAV_HORIZONTAL_HEIGHT,
	NAV_WIDTH,
} from "./layout-constants";
export { layoutClass, layoutVars } from "./layout.css";
export { darkShadowTokens, lightShadowTokens } from "./shadow";
export { themeVars } from "./theme.css";
export {
	type AddChannelToLeaf,
	type IsLeafObject,
	type UILibraryAdapter,
	type UILibraryAdapterProps,
	themeTokens,
} from "./type";
export { FontFamilyPreset, typographyTokens } from "./typography";
