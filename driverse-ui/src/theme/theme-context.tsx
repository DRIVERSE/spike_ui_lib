/** @lib-native */

import type { baseThemeTokens } from "@/tokens/base";
import type { BrandTokens } from "@/tokens/brand";
import type { darkColorTokens, lightColorTokens } from "@/tokens/color";
import type { ThemeColorPresets, ThemeMode } from "@/tokens/enum";
import type { darkShadowTokens, lightShadowTokens } from "@/tokens/shadow";
import type { typographyTokens } from "@/tokens/typography";
import type { Locale } from "antd/es/locale";
import { createContext, useContext } from "react";

/**
 * The resolved token set for the active mode and color preset. Mirrors the `themeTokens` bag the apps'
 * `useTheme()` returned, so call sites port over unchanged.
 */
export type ResolvedThemeTokens = {
	base: typeof baseThemeTokens;
	color: typeof lightColorTokens | typeof darkColorTokens;
	shadow: typeof lightShadowTokens | typeof darkShadowTokens;
	typography: typeof typographyTokens;
};

export type UIThemeContextValue = {
	mode: ThemeMode;
	setMode: (mode: ThemeMode) => void;
	colorPreset: ThemeColorPresets;
	/** App brand values merged over the library defaults; also mirrored into `--brand-*` CSS variables. */
	brand: BrandTokens;
	tokens: ResolvedThemeTokens;
	fontFamily: string;
	fontSize: number;
	/** Passed straight through to antd's ConfigProvider by the antd adapter. */
	locale?: Locale;
};

export const UIThemeContext = createContext<UIThemeContextValue | null>(null);

/**
 * Raw context access, used by the adapters. Components should prefer `useTheme()`, which exposes the
 * same state plus `themeVars`.
 */
export function useThemeContext(): UIThemeContextValue {
	const ctx = useContext(UIThemeContext);
	if (!ctx) {
		throw new Error("useTheme() and the theme adapters must be rendered inside <UIThemeProvider>");
	}
	return ctx;
}
