/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/theme/hooks/use-theme.ts
 *   B: Driverse_FE_Business   @ b96eda3 src/theme/hooks/use-theme.ts
 * @status decoupled
 * @notes Identical in both apps. Same return shape, minus the zustand settings store: mode/setMode come
 *        from UIThemeContext (the provider already resolved the color tokens against the active mode and
 *        color preset) and `brand` is added so components read brand values instead of importing
 *        an app-local colors.ts. The apps' `themeTokens` key is now `tokens`.
 */

import { themeVars } from "@/tokens/theme.css";
import { useThemeContext } from "./theme-context";

export function useTheme() {
	const { mode, setMode, colorPreset, brand, tokens } = useThemeContext();

	return { mode, setMode, colorPreset, brand, tokens, themeVars };
}
