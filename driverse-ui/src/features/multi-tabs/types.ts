/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/layouts/dashboard/multi-tabs/types.ts
 *   B: Driverse_FE_Business   @ b96eda3 src/layouts/dashboard/multi-tabs/types.ts
 * @status decoupled
 * @notes Byte-identical in both apps. `KeepAliveTab` extended `RouteMeta` from the apps' root-level
 *        `types/router.ts`, which the library cannot import, so the six fields multi-tabs actually
 *        reads — key, label, icon, hideTab, outlet, params — are redeclared here as `TabRouteMeta`.
 *        It stays open (`[key: string]: unknown` is not needed; the apps' extra RouteMeta fields are
 *        all optional) so an app's own RouteMeta still satisfies it structurally.
 *        `Params<string>` was react-router's; it is `Record<string, string | undefined>`, inlined.
 *        `MultiTabsNavigation` is new: it is the injected replacement for `@/router/hooks`' `useRouter`
 *        and `useCurrentRouteMeta`, which is the only reason this module was app-bound.
 */

import type { MenuProps } from "antd";
import type { CSSProperties, ReactNode } from "react";

/** react-router's `Params<string>`, inlined so the library takes no router dependency. */
export type RouteParams = Record<string, string | undefined>;

/**
 * The slice of the apps' `RouteMeta` that the tab strip reads. An app's fuller RouteMeta is assignable
 * to this, so `tabs` can be fed straight from the app router.
 */
export type TabRouteMeta = {
	/** antd menu selectedKeys */
	key: string;
	/** menu label; apps pass an i18n key and supply `translate` */
	label: string;
	/** menu prefix icon */
	icon?: ReactNode;
	/** hide in multi tab */
	hideTab?: boolean;
	/** react router outlet */
	outlet?: ReactNode;
	/** dynamic route params, e.g. `/user/:id` */
	params?: RouteParams;
};

export type KeepAliveTab = TabRouteMeta & {
	children: ReactNode;
	timeStamp?: string;
};

export type MultiTabsContextType = {
	tabs: KeepAliveTab[];
	activeTabRoutePath?: string;
	setTabs: (tabs: KeepAliveTab[]) => void;
	closeTab: (path?: string) => void;
	closeOthersTab: (path?: string) => void;
	closeAll: () => void;
	closeLeft: (path: string) => void;
	closeRight: (path: string) => void;
	refreshTab: (path: string) => void;
	/** Renders a tab's label. Defaults to the raw `label`; apps pass `t` to localise. */
	translate: (key: string) => string;
};

export type TabItemProps = {
	tab: KeepAliveTab;
	style?: CSSProperties;
	className?: string;
	onClose?: () => void;
};

export type TabDropdownProps = {
	menuItems: MenuProps["items"];
	menuClick: (menuInfo: any, tab: KeepAliveTab) => void;
};

/**
 * The injected navigation seam. In the apps this was `useRouter()` (react-router's navigate wrapped in
 * push/replace/back) plus `useCurrentRouteMeta()` plus the `VITE_APP_HOMEPAGE` env var. The library takes
 * all three as data so it neither imports a router nor reads `import.meta.env`.
 */
export type MultiTabsNavigation = {
	/** Navigate to a resolved tab path. Was `useRouter().push`. */
	push: (path: string) => void;
	/** Route meta for the page currently rendered. Was `useCurrentRouteMeta()`. */
	currentRouteMeta?: TabRouteMeta | null;
	/** Where `closeAll` navigates. Was `import.meta.env.VITE_APP_HOMEPAGE`. */
	homePath: string;
	/** Maximum number of tabs kept alive. The apps hard-coded 5. */
	maxTabs?: number;
};

/**
 * Shell layout the tab strip positions itself against. The apps read `ThemeLayout` off the zustand
 * settings store; the library takes the value directly (same three string members).
 */
export type MultiTabsLayout = "vertical" | "horizontal" | "mini";

/** Right-click menu operations. Redeclared from the apps' `#/enum` `MultiTabOperation`, same values. */
export enum MultiTabOperation {
	FULLSCREEN = "fullscreen",
	REFRESH = "refresh",
	CLOSE = "close",
	CLOSEOTHERS = "closeOthers",
	CLOSEALL = "closeAll",
	CLOSELEFT = "closeLeft",
	CLOSERIGHT = "closeRight",
}
