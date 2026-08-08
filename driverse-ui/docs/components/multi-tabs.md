# Multi-tabs (dnd-kit tab strip)

`src/features/multi-tabs` is the keep-alive tab strip from both apps'
`src/layouts/dashboard/multi-tabs`. Nine files, ~650 LOC per app, six byte-identical.

## What actually differed between the apps

Three files, and only one of them meaningfully:

| File | Difference | Decision |
|---|---|---|
| `index.tsx` | Autocredit left a `console.log` in the tab click handler; Business had commented it out | adopt-B, comment dropped |
| `providers/multi-tabs-provider.tsx` | trailing newline | identical |
| `hooks/use-tab-label-render.tsx` | Autocredit looked the tab's `params.id` up in `@/_mock/assets`' `USER_LIST` and rendered `${user?.username}-${label}` | adopt-B |

That last one is the only behavioural fork, and Business had already removed it — Autocredit's branch
reads a mock fixture from production code. Business's version reduces to `${defaultLabel}`, which is what
the ordinary path returns anyway, so the special-case map became dead weight. It survives as the
`specialTabRenderMap` argument to `useTabLabelRender`, so an app can restore per-route label rendering
without the library hard-coding one route.

## The six couplings and where each went

This module had the most coupling per line of anything in W8. Every one had a precedent:

| App dependency | Replacement |
|---|---|
| `@/router/hooks` — `useRouter().push`, `useCurrentRouteMeta()` | `MultiTabsNavigation` (`{ push, currentRouteMeta, homePath, maxTabs? }`), passed to `MultiTabsProvider` |
| `@/router/hooks/use-current-route-meta` — `replaceDynamicParams` | vendored to `replace-dynamic-params.ts`; pure string work, identical in both apps |
| `import.meta.env.VITE_APP_HOMEPAGE` | `navigation.homePath` |
| `#/router`'s `RouteMeta` | `TabRouteMeta` in `types.ts` — the six fields the strip reads; an app's fuller RouteMeta stays assignable |
| `#/enum`'s `MultiTabOperation` | redeclared in `types.ts`, same string values, so `sys.tab.*` keys still resolve |
| `@/store/settingStore` — `themeLayout` | the `layout` prop (`"vertical" | "horizontal" | "mini"`) |
| `@/theme/theme.css` — `themeVars` | the library's `useTheme()` |
| `react-i18next` — `useTranslation` | the `translate` prop on `MultiTabsProvider` |
| ramda — `isEmpty` | a two-line local `hasParams` |

## Context-menu labels without i18next

The library ships no i18next dependency, so `translate` defaults to the identity. That is a problem the
apps did not have: i18next returns the key itself when a translation is missing, so the untranslated
default would have rendered `sys.tab.closeOthers` at the user. Each menu entry now falls back to an
English label when `translate` hands the key straight back:

```tsx
// no i18n — renders "Refresh", "Close all", …
<MultiTabsProvider navigation={nav}>…</MultiTabsProvider>

// with i18n — renders exactly what the apps rendered
<MultiTabsProvider navigation={nav} translate={t}>…</MultiTabsProvider>
```

## One bug fixed in passing

Both apps registered `mouseenter` and `mouseleave` listeners on the scroll container and never removed
them; only the inner `wheel` handler was cleaned up. The effect's teardown now removes all three.
Behaviour while mounted is unchanged.

## Wiring it into an app

```tsx
import { MultiTabs, MultiTabsProvider } from "@driverse/ui/features/multi-tabs";
import { useCurrentRouteMeta, useRouter } from "@/router/hooks";

function Shell() {
	const { push } = useRouter();
	const currentRouteMeta = useCurrentRouteMeta();
	const { themeLayout } = useSettings();

	return (
		<MultiTabsProvider
			navigation={{ push, currentRouteMeta, homePath: import.meta.env.VITE_APP_HOMEPAGE }}
			translate={t}
		>
			<MultiTabs push={push} layout={themeLayout} />
		</MultiTabsProvider>
	);
}
```

`@dnd-kit/core`, `@dnd-kit/sortable` and `@dnd-kit/utilities` are declared as optional peers — only
consumers of this subpath need them installed.
