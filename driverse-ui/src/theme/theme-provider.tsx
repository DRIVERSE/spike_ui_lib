/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/theme/theme-provider.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/theme/theme-provider.tsx
 * @status decoupled
 * @notes Identical in both apps. The DOM side effects are ported verbatim (html light/dark class,
 *        --colors-palette-primary-* + Channel, --shadows-primary, root font size, body font family)
 *        and one is added: the --brand-* variables that back the brand-token contract.
 *        Decoupling: the apps read themeMode/themeColorPresets/fontFamily/fontSize from the zustand
 *        `useSettings()` store; the library takes them as props instead — `mode` controlled with
 *        `onModeChange`, or uncontrolled from `defaultMode` — and publishes them on UIThemeContext so
 *        apps keep owning persistence. `#/enum` is replaced by the library's own enums.
 */

import { baseThemeTokens } from "@/tokens/base";
import { type BrandTokens, brandCssVar, brandTokenKeys, resolveBrandTokens } from "@/tokens/brand";
import { darkColorTokens, lightColorTokens, presetsColors } from "@/tokens/color";
import { hexToRgbChannel, rgbAlpha } from "@/tokens/css-var-utils";
import { ThemeColorPresets, ThemeMode } from "@/tokens/enum";
import { layoutClass } from "@/tokens/layout.css";
import { darkShadowTokens, lightShadowTokens } from "@/tokens/shadow";
import type { UILibraryAdapter } from "@/tokens/type";
import { FontFamilyPreset, typographyTokens } from "@/tokens/typography";
import type { Locale } from "antd/es/locale";
import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { UIThemeContext, type UIThemeContextValue } from "./theme-context";

const DEFAULT_FONT_SIZE = Number(typographyTokens.fontSize.sm);

export interface UIThemeProviderProps {
	children: ReactNode;
	/** Controlled mode. When set, the provider never changes mode on its own — react to `onModeChange`. */
	mode?: ThemeMode;
	/** Initial mode when `mode` is omitted. */
	defaultMode?: ThemeMode;
	onModeChange?: (mode: ThemeMode) => void;
	colorPreset?: ThemeColorPresets;
	/** App brand values; unset keys fall back to `defaultBrandTokens`. */
	brand?: Partial<BrandTokens>;
	fontFamily?: string;
	fontSize?: number;
	/** UI-library adapters (e.g. `AntdAdapter`) wrapped around the children, outermost first. */
	adapters?: UILibraryAdapter[];
	/** antd locale, forwarded to ConfigProvider by the antd adapter. The apps' i18n wiring stays app-side. */
	locale?: Locale;
}

export function UIThemeProvider({
	children,
	mode: controlledMode,
	defaultMode = ThemeMode.Light,
	onModeChange,
	colorPreset = ThemeColorPresets.Default,
	brand,
	fontFamily = FontFamilyPreset.openSans,
	fontSize = DEFAULT_FONT_SIZE,
	adapters = [],
	locale,
}: UIThemeProviderProps) {
	const [uncontrolledMode, setUncontrolledMode] = useState<ThemeMode>(defaultMode);
	const mode = controlledMode ?? uncontrolledMode;

	const setMode = useCallback(
		(next: ThemeMode) => {
			if (controlledMode === undefined) setUncontrolledMode(next);
			onModeChange?.(next);
		},
		[controlledMode, onModeChange],
	);

	const resolvedBrand = useMemo(() => resolveBrandTokens(brand), [brand]);

	// Update HTML class to support Tailwind dark mode
	useEffect(() => {
		const root = window.document.documentElement;
		root.classList.remove(ThemeMode.Light, ThemeMode.Dark);
		root.classList.add(mode);
	}, [mode]);

	// Dynamically update theme color related CSS variables
	useEffect(() => {
		const root = window.document.documentElement;
		const primaryColors = presetsColors[colorPreset];
		for (const [key, value] of Object.entries(primaryColors)) {
			root.style.setProperty(`--colors-palette-primary-${key}`, value);
			root.style.setProperty(`--colors-palette-primary-${key}Channel`, hexToRgbChannel(value));
		}
		root.style.setProperty("--shadows-primary", `box-shadow: 0 8px 16px 0 ${rgbAlpha(primaryColors.default, 0.24)}`);
	}, [colorPreset]);

	// Publish the brand contract as CSS variables so tailwind classes and vanilla-extract styles resolve
	// against whatever the app injected.
	useEffect(() => {
		const root = window.document.documentElement;
		for (const key of brandTokenKeys) {
			root.style.setProperty(brandCssVar(key), resolvedBrand[key]);
		}
	}, [resolvedBrand]);

	// Update font size and font family
	useEffect(() => {
		const root = window.document.documentElement;
		root.style.fontSize = `${fontSize}px`;

		const body = window.document.body;
		body.style.fontFamily = fontFamily;
	}, [fontFamily, fontSize]);

	const value = useMemo<UIThemeContextValue>(() => {
		const isLight = mode === ThemeMode.Light;
		const colorTokens = isLight ? lightColorTokens : darkColorTokens;
		return {
			mode,
			setMode,
			colorPreset,
			brand: resolvedBrand,
			fontFamily,
			fontSize,
			locale,
			tokens: {
				base: baseThemeTokens,
				color: {
					...colorTokens,
					palette: { ...colorTokens.palette, primary: presetsColors[colorPreset] },
				},
				shadow: isLight ? lightShadowTokens : darkShadowTokens,
				typography: typographyTokens,
			},
		};
	}, [mode, setMode, colorPreset, resolvedBrand, fontFamily, fontSize, locale]);

	// Wrap children with adapters
	const wrappedWithAdapters = adapters.reduce(
		(acc, Adapter) => (
			<Adapter key={Adapter.name} mode={mode}>
				{acc}
			</Adapter>
		),
		children,
	);

	return (
		<UIThemeContext.Provider value={value}>
			<div className={layoutClass}>{wrappedWithAdapters}</div>
		</UIThemeContext.Provider>
	);
}
