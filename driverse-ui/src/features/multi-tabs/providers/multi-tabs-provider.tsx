/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/layouts/dashboard/multi-tabs/providers/multi-tabs-provider.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/layouts/dashboard/multi-tabs/providers/multi-tabs-provider.tsx
 * @status decoupled
 * @notes A and B differ only by a trailing newline. The keep-alive bookkeeping — dropping `hideTab`
 *        routes, resolving dynamic params into the tab key, stamping `timeStamp`, and the tab cap — is
 *        verbatim. Three substitutions:
 *          - `useCurrentRouteMeta()` from `@/router/hooks` is now `navigation.currentRouteMeta`, so the
 *            provider observes the app's router rather than importing one.
 *          - ramda's `isEmpty` became a local `hasParams` check. ramda is not a library dependency and
 *            was pulled in for this one call.
 *          - The apps hard-coded `newTabs.length > 5`; that 5 is `navigation.maxTabs`, still defaulting
 *            to 5, because the limit is a shell policy rather than a property of the strip.
 *        `translate` is threaded onto the context here so tab-item and use-tab-label-render can localise
 *        without the library importing react-i18next.
 */

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useTabOperations } from "../hooks/use-tab-operations";
import { replaceDynamicParams } from "../replace-dynamic-params";
import type { KeepAliveTab, MultiTabsContextType, MultiTabsNavigation, RouteParams } from "../types";

const identity = (key: string) => key;

const MultiTabsContext = createContext<MultiTabsContextType>({
	tabs: [],
	activeTabRoutePath: "",
	setTabs: () => {},
	closeTab: () => {},
	closeOthersTab: () => {},
	closeAll: () => {},
	closeLeft: () => {},
	closeRight: () => {},
	refreshTab: () => {},
	translate: identity,
});

/** ramda's `isEmpty` over the params bag, without the ramda dependency. */
const hasParams = (params: RouteParams) => Object.keys(params).length > 0;

export type MultiTabsProviderProps = {
	children: React.ReactNode;
	/** The injected router seam — see `MultiTabsNavigation`. */
	navigation: MultiTabsNavigation;
	/** Localises tab labels. Apps pass i18next's `t`; defaults to rendering the key verbatim. */
	translate?: (key: string) => string;
};

export function MultiTabsProvider({ children, navigation, translate = identity }: MultiTabsProviderProps) {
	const [tabs, setTabs] = useState<KeepAliveTab[]>([]);
	const { currentRouteMeta, maxTabs = 5 } = navigation;

	const activeTabRoutePath = useMemo(() => {
		if (!currentRouteMeta) return "";
		const { key, params = {} } = currentRouteMeta;
		return hasParams(params) ? replaceDynamicParams(key, params) : key;
	}, [currentRouteMeta]);

	const operations = useTabOperations(tabs, setTabs, activeTabRoutePath, navigation);

	useEffect(() => {
		if (!currentRouteMeta) return;

		setTabs((prev) => {
			const filtered = prev.filter((item) => !item.hideTab);

			let { key } = currentRouteMeta;
			const { outlet: children, params = {} } = currentRouteMeta;

			if (hasParams(params)) {
				key = replaceDynamicParams(key, params);
			}

			const isExisted = filtered.find((item) => item.key === key);
			if (!isExisted) {
				let newTabs = [
					...filtered,
					{
						...currentRouteMeta,
						key,
						children,
						timeStamp: new Date().getTime().toString(),
					},
				];
				// Limit to maximum `maxTabs` tabs
				if (newTabs.length > maxTabs) {
					newTabs = newTabs.slice(1);
				}

				return newTabs;
			}

			return filtered;
		});
	}, [currentRouteMeta, maxTabs]);

	const contextValue = useMemo(
		() => ({
			tabs,
			activeTabRoutePath,
			setTabs,
			translate,
			...operations,
		}),
		[tabs, activeTabRoutePath, operations, translate],
	);

	return <MultiTabsContext.Provider value={contextValue}>{children}</MultiTabsContext.Provider>;
}

export function useMultiTabsContext() {
	return useContext(MultiTabsContext);
}
