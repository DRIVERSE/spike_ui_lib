/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/layouts/dashboard/multi-tabs/hooks/use-tab-style.ts
 *   B: Driverse_FE_Business   @ b96eda3 src/layouts/dashboard/multi-tabs/hooks/use-tab-style.ts
 * @status decoupled
 * @notes Byte-identical in both apps. The computed style is unchanged, position for position. Two
 *        substitutions: `themeVars` now comes from the library's `useTheme()` instead of a direct
 *        `@/theme/theme.css` import (W2's decoupling — the provider is what makes the vars real), and
 *        `useSettings().themeLayout` from the zustand settings store became the `layout` argument, typed
 *        as the same three string members the apps' `ThemeLayout` enum has. The shell dimensions moved
 *        from `../../config` to the token layer (`@/tokens`), where W8 lifted them.
 */

import { up, useMediaQuery } from "@/hooks/use-media-query";
import { useTheme } from "@/theme/use-theme";
import { rgbAlpha } from "@/tokens/css-var-utils";
import {
	HEADER_HEIGHT,
	MULTI_TABS_HEIGHT,
	NAV_COLLAPSED_WIDTH,
	NAV_HORIZONTAL_HEIGHT,
	NAV_WIDTH,
} from "@/tokens/layout-constants";
import { type CSSProperties, useMemo } from "react";
import type { MultiTabsLayout } from "../types";

export function useMultiTabsStyle(layout: MultiTabsLayout = "vertical") {
	const { themeVars } = useTheme();
	const isPc = useMediaQuery(up("md"));

	return useMemo(() => {
		const style: CSSProperties = {
			position: "fixed",
			top: HEADER_HEIGHT,
			right: 0,
			height: MULTI_TABS_HEIGHT,
			backgroundColor: rgbAlpha(themeVars.colors.background.defaultChannel, 0.9),
			transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
			width: "100%",
		};

		if (layout === "horizontal") {
			style.top = HEADER_HEIGHT + NAV_HORIZONTAL_HEIGHT - 2;
		} else if (isPc) {
			style.width = `calc(100% - ${layout === "vertical" ? NAV_WIDTH : NAV_COLLAPSED_WIDTH}px`;
		}

		return style;
	}, [layout, isPc, themeVars]);
}
