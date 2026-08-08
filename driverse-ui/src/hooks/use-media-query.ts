/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/hooks/web/use-media-query.ts
 *   B: Driverse_FE_Business   @ b96eda3 src/hooks/web/use-media-query.ts
 * @status identical
 * @notes Byte-identical in both apps; lifted verbatim with the zh-CN comments translated and the
 *        breakpoints/removePx imports pointed at the library token layer.
 */

import { breakpointsTokens } from "@/tokens/breakpoints";
import { removePx } from "@/tokens/css-var-utils";
import { useEffect, useMemo, useState } from "react";

type MediaQueryConfig = {
	minWidth?: number;
	maxWidth?: number;
	minHeight?: number;
	maxHeight?: number;
	orientation?: "portrait" | "landscape";
	prefersColorScheme?: "dark" | "light";
	prefersReducedMotion?: boolean;
	devicePixelRatio?: number;
	pointerType?: "coarse" | "fine";
};

const buildMediaQuery = (config: MediaQueryConfig | string): string => {
	if (typeof config === "string") return config;

	const conditions: string[] = [];

	if (config.minWidth) conditions.push(`(min-width: ${config.minWidth}px)`);
	if (config.maxWidth) conditions.push(`(max-width: ${config.maxWidth}px)`);
	if (config.minHeight) conditions.push(`(min-height: ${config.minHeight}px)`);
	if (config.maxHeight) conditions.push(`(max-height: ${config.maxHeight}px)`);
	if (config.orientation) conditions.push(`(orientation: ${config.orientation})`);
	if (config.prefersColorScheme) conditions.push(`(prefers-color-scheme: ${config.prefersColorScheme})`);
	if (config.prefersReducedMotion) conditions.push("(prefers-reduced-motion: reduce)");
	if (config.devicePixelRatio) conditions.push(`(-webkit-min-device-pixel-ratio: ${config.devicePixelRatio})`);
	if (config.pointerType) conditions.push(`(pointer: ${config.pointerType})`);

	return conditions.join(" and ");
};

/**
 * React hook for handling media queries.
 *
 * @param config - Media query configuration object or query string
 * @returns boolean - true when the media query matches
 *
 * @example
 * const isMobile = useMediaQuery({ maxWidth: 768 });
 * const isDesktop = useMediaQuery(up("lg"));
 * const isTablet = useMediaQuery(between("sm", "md"));
 * const isDarkMode = useMediaQuery({ prefersColorScheme: "dark" });
 * const isPortrait = useMediaQuery("(orientation: portrait)");
 */
export const useMediaQuery = (config: MediaQueryConfig | string) => {
	// Defaults to false so server-side rendering has a stable first paint.
	const [matches, setMatches] = useState(false);

	const mediaQueryString = useMemo(() => buildMediaQuery(config), [config]);

	useEffect(() => {
		const mediaQuery = window.matchMedia(mediaQueryString);
		setMatches(mediaQuery.matches);

		const handler = (e: MediaQueryListEvent) => setMatches(e.matches);

		// Both APIs, for older browsers that only expose addListener.
		if (mediaQuery.addEventListener) {
			mediaQuery.addEventListener("change", handler);
		} else {
			mediaQuery.addListener(handler);
		}

		return () => {
			if (mediaQuery.removeEventListener) {
				mediaQuery.removeEventListener("change", handler);
			} else {
				mediaQuery.removeListener(handler);
			}
		};
	}, [mediaQueryString]);

	return matches;
};

type Breakpoints = typeof breakpointsTokens;
type BreakpointsKeys = keyof Breakpoints;

export const up = (key: BreakpointsKeys) => ({
	minWidth: removePx(breakpointsTokens[key]),
});

// 0.05px below the breakpoint so up() and down() never both match.
export const down = (key: BreakpointsKeys) => ({
	maxWidth: removePx(breakpointsTokens[key]) - 0.05,
});

export const between = (start: BreakpointsKeys, end: BreakpointsKeys) => ({
	minWidth: removePx(breakpointsTokens[start]),
	maxWidth: removePx(breakpointsTokens[end]) - 0.05,
});
