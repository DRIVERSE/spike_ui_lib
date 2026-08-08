/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/layouts/dashboard/multi-tabs/hooks/use-tab-operations.ts
 *   B: Driverse_FE_Business   @ b96eda3 src/layouts/dashboard/multi-tabs/hooks/use-tab-operations.ts
 * @status decoupled
 * @notes Byte-identical in both apps. Every operation's body is unchanged; only where `push` and the
 *        home path come from moved. The apps called `useRouter()` from `@/router/hooks` and read
 *        `import.meta.env.VITE_APP_HOMEPAGE` at module scope — both are now fields on the injected
 *        `MultiTabsNavigation`, so the hook is router-agnostic and testable without a Router provider.
 *        `import.meta.env` at module scope also meant this file could not be imported by a plain Node
 *        test; taking `homePath` as data fixes that too.
 */

import { type Dispatch, type SetStateAction, useCallback } from "react";
import type { KeepAliveTab, MultiTabsNavigation } from "../types";

export function useTabOperations(
	tabs: KeepAliveTab[],
	setTabs: Dispatch<SetStateAction<KeepAliveTab[]>>,
	activeTabRoutePath: string,
	navigation: MultiTabsNavigation,
) {
	const { push, homePath } = navigation;

	const closeTab = useCallback(
		(path = activeTabRoutePath) => {
			const tempTabs = [...tabs];
			if (tempTabs.length === 1) return;

			const deleteTabIndex = tempTabs.findIndex((item) => item.key === path);
			if (deleteTabIndex === -1) return;

			if (deleteTabIndex > 0) {
				push(tempTabs[deleteTabIndex - 1].key);
			} else {
				push(tempTabs[deleteTabIndex + 1].key);
			}

			tempTabs.splice(deleteTabIndex, 1);
			setTabs(tempTabs);
		},
		[activeTabRoutePath, push, tabs, setTabs],
	);

	const closeOthersTab = useCallback(
		(path = activeTabRoutePath) => {
			setTabs((prev) => prev.filter((item) => item.key === path));
			if (path !== activeTabRoutePath) {
				push(path);
			}
		},
		[activeTabRoutePath, push, setTabs],
	);

	const closeAll = useCallback(() => {
		setTabs([]);
		push(homePath);
	}, [push, homePath, setTabs]);

	const closeLeft = useCallback(
		(path: string) => {
			const currentTabIndex = tabs.findIndex((item) => item.key === path);
			const newTabs = tabs.slice(currentTabIndex);
			setTabs(newTabs);
			push(path);
		},
		[push, tabs, setTabs],
	);

	const closeRight = useCallback(
		(path: string) => {
			const currentTabIndex = tabs.findIndex((item) => item.key === path);
			const newTabs = tabs.slice(0, currentTabIndex + 1);
			setTabs(newTabs);
			push(path);
		},
		[push, tabs, setTabs],
	);

	const refreshTab = useCallback(
		(path = activeTabRoutePath) => {
			setTabs((prev) => {
				const newTabs = [...prev];
				const index = newTabs.findIndex((item) => item.key === path);
				if (index >= 0) {
					newTabs[index] = {
						...newTabs[index],
						timeStamp: new Date().getTime().toString(),
					};
				}
				return newTabs;
			});
		},
		[activeTabRoutePath, setTabs],
	);

	return {
		closeTab,
		closeOthersTab,
		closeAll,
		closeLeft,
		closeRight,
		refreshTab,
	};
}
