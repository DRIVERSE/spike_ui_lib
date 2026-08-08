/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/layouts/dashboard/multi-tabs/hooks/use-tab-label-render.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/layouts/dashboard/multi-tabs/hooks/use-tab-label-render.tsx
 * @status adopted-B
 * @notes The one real divergence in the module. A looked the tab's `params.id` up in `@/_mock/assets`'
 *        USER_LIST and rendered `${user?.username}-${label}` for the user-detail tab; B had already
 *        stripped that to `${defaultLabel}`, which is what the plain path returns anyway. B adopted —
 *        A's branch reads a mock fixture in production code, and neither variant is library-shaped.
 *        The special-case map survives as the `specialTabRenderMap` seam so an app can restore its own
 *        per-route rendering, but it now takes overrides as an argument instead of hard-coding one route.
 *        `useTranslation()` is gone: the library ships no i18next dependency (same call as export-button
 *        in W5), so `translate` arrives from the multi-tabs context and defaults to the identity.
 */

import type { ReactNode } from "react";
import { useCallback } from "react";
import { useMultiTabsContext } from "../providers/multi-tabs-provider";
import type { KeepAliveTab } from "../types";

export type SpecialTabRenderMap = Record<string, (tab: KeepAliveTab, translate: (key: string) => string) => ReactNode>;

export function useTabLabelRender(specialTabRenderMap: SpecialTabRenderMap = {}) {
	const { translate } = useMultiTabsContext();

	return useCallback(
		(tab: KeepAliveTab): ReactNode => {
			const specialRender = specialTabRenderMap[tab.label];
			if (specialRender) {
				return specialRender(tab, translate);
			}
			return translate(tab.label);
		},
		[specialTabRenderMap, translate],
	);
}
