/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/theme/adapter/antd.adapter.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/theme/adapter/antd.adapter.tsx
 * @status decoupled
 * @notes Identical in both apps and lifted token-for-token, including the ConfigProvider -> StyleProvider
 *        (hashPriority="high") -> App nesting and the Tag style override.
 *        Decoupling: `useSettings()` and `@/theme/colors` are replaced by UIThemeContext, so `colorPrimary`
 *        now comes from the injected brand contract (`brand.driverse_primary`) rather than an app-local
 *        hex. `useLocale()` from `@/locales` is dropped — the app passes `locale` to UIThemeProvider and it
 *        is forwarded here (undefined by default, which leaves antd on its built-in locale).
 *        The commented-out `presetsColors[themeColorPresets]` line from the apps is preserved as the note
 *        that colorPrimary is intentionally brand-driven, not preset-driven.
 */

import { baseThemeTokens } from "@/tokens/base";
import { darkColorTokens, lightColorTokens } from "@/tokens/color";
import { removePx } from "@/tokens/css-var-utils";
import { ThemeMode } from "@/tokens/enum";
import { darkShadowTokens, lightShadowTokens } from "@/tokens/shadow";
import type { UILibraryAdapter } from "@/tokens/type";
import { StyleProvider } from "@ant-design/cssinjs";
import { App, ConfigProvider, type ThemeConfig, theme } from "antd";
import { useThemeContext } from "./theme-context";

export const AntdAdapter: UILibraryAdapter = ({ mode, children }) => {
	const { brand, fontFamily, fontSize, locale } = useThemeContext();
	const algorithm = mode === ThemeMode.Light ? theme.defaultAlgorithm : theme.darkAlgorithm;

	const colorTokens = mode === ThemeMode.Light ? lightColorTokens : darkColorTokens;
	const shadowTokens = mode === ThemeMode.Light ? lightShadowTokens : darkShadowTokens;

	const token: ThemeConfig["token"] = {
		// Brand-driven, not preset-driven: the apps had `presetsColors[themeColorPresets].default` commented
		// out in favour of their own driverse_primary.
		colorPrimary: brand.driverse_primary,
		colorSuccess: colorTokens.palette.success.default,
		colorWarning: colorTokens.palette.warning.default,
		colorError: colorTokens.palette.error.default,
		colorInfo: colorTokens.palette.info.default,

		colorBgLayout: colorTokens.background.default,
		colorBgContainer: colorTokens.background.paper,
		colorBgElevated: colorTokens.background.default,

		wireframe: false,
		fontFamily: fontFamily,
		fontSize: fontSize,

		borderRadiusSM: removePx(baseThemeTokens.borderRadius.sm),
		borderRadius: removePx(baseThemeTokens.borderRadius.default),
		borderRadiusLG: removePx(baseThemeTokens.borderRadius.lg),
	};

	const components: ThemeConfig["components"] = {
		Breadcrumb: {
			separatorMargin: removePx(baseThemeTokens.spacing[1]),
		},
		Menu: {
			colorFillAlter: "transparent",
			itemColor: colorTokens.text.secondary,
			motionDurationMid: "0.125s",
			motionDurationSlow: "0.125s",
			darkItemBg: darkColorTokens.background.default,
		},
		Layout: {
			siderBg: darkColorTokens.background.default,
		},
		Card: {
			boxShadow: shadowTokens.card,
		},
	};

	return (
		<ConfigProvider
			locale={locale}
			theme={{ algorithm, token, components }}
			tag={{
				style: {
					borderRadius: removePx(baseThemeTokens.borderRadius.md),
					fontWeight: 700,
					padding: `0 ${baseThemeTokens.spacing[1]}`,
					margin: `0 ${baseThemeTokens.spacing[1]}`,
					borderWidth: 0,
				},
			}}
		>
			<StyleProvider hashPriority="high">
				<App>{children}</App>
			</StyleProvider>
		</ConfigProvider>
	);
};
