# Consuming @driverse/ui

## Install (GitHub Packages)

Add to the app's `.npmrc`:

```
@driverse:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Then `pnpm add @driverse/ui` (or npm). The deploy runners need a read-scoped token.

## Wire-up checklist (per app)

1. **Styles** — import once at the app root: `import "@driverse/ui/styles.css";`
2. **Tailwind** (from W1) — add the preset and the content glob so the lib's utility classes are generated:
   ```ts
   // tailwind.config.ts — the package is ESM-only, so import it (no require)
   import { driverseUiPreset } from "@driverse/ui/tailwind-preset";

   export default {
     presets: [driverseUiPreset],
     content: [..., "./node_modules/@driverse/ui/dist/**/*.js"],
   } satisfies Config;
   ```
   Forgetting the content glob silently unstyles the components — this is the #1 adoption pitfall.
   The preset's `driverse_*`, `primary` and `secondary` colors resolve to `var(--brand-*)`, so they are
   only correct once `UIThemeProvider` has mounted and written the brand variables (step 3).
3. **Theme** (from W2) — wrap the root and inject the app's brand values:
   ```tsx
   <UIThemeProvider mode={mode} onModeChange={setMode} brand={appBrandTokens} adapters={[AntdAdapter]}>
   ```
   Brand colors (e.g. `driverse_primary_light`) are intentionally per-app — each app passes its own.
4. **Icons** (from W3) — delete `vite-plugin-svg-icons` and its `virtual:svg-icons-register` import. The
   library compiles the SVGs with svgr and `<SvgIcon icon="ic-analysis" />` keeps the same props, so no
   call site changes. Import `@driverse/ui/icons/offline` once at the root if you want Iconify to resolve
   locally instead of calling the Iconify API. `ic_logo_nav.svg` stays app-side — pass it to `<Logo src>`.
5. **Types** — bump the app to `@types/react@^19` (both apps are on ^18 with a React 19 runtime).
6. **Dependency bumps forced by React 19.** Three packages the apps pin type themselves against the
   pre-React-19 global `JSX` namespace, so under `@types/react@19` their props resolve to `unknown` and
   the app stops type-checking. Runtime behaviour is unaffected in the first two; the third is a real
   runtime break.

   | Package | Apps pin | Library needs | Why |
   |---|---|---|---|
   | framer-motion | ^10.16.4 | >=11.11.17 | `m.div` props resolve to `unknown` |
   | react-markdown | ^8.0.7 | >=9 (with remark-gfm 4, rehype-raw 7, rehype-highlight 7) | same, plus the `lib/react-markdown` deep import is gone |
   | react-quill | ^2.0.0 | **react-quill-new** ^3.4 | react-quill 2 renders through `ReactDOM.findDOMNode`, which React 19 removed — the editor is broken in both apps today. react-quill-new is the maintained fork with the same API. |

## Hooks that changed shape

The library cannot read an app's `import.meta.env`, keycloak session or apollo client, so five hooks take
those as arguments instead. Wiring is a one-liner per app:

```tsx
const apiResource = useApiResource({ getToken: () => keycloak.token, baseUrl: import.meta.env.VITE_API_URL });
const filesApiUrl = `${import.meta.env.VITE_UPLOAD_URL}/api/v1/files`;

useDeleteFile({ apiResource, filesApiUrl });
useGetFileUrl({ apiResource, filesApiUrl, bucketId, fileName, enabled });
useFileUpload({ apiResource, filesApiUrl, onUploaded: () => client.refetchQueries({ include: ["documentCategories"] }) });
useTenantId(keycloak.token);
```

`useApiResource` also replaces axios with `fetch`. Two behaviour notes: a non-2xx response throws an
`ApiResourceError` (with `.status` and the parsed `.body`) rather than an `AxiosError`, and `FormData`
payloads are sent without an explicit `Content-Type` so the browser writes the multipart boundary.

Hooks that used to call sonner directly — `useCopyToClipboard`, `useExport`, `useFileUpload` — now take
`onSuccess`/`onError`/`notify` callbacks. The library's own toast is re-exported, so the wiring is:

```tsx
import { Toast, toast } from "@driverse/ui";   // mount <Toast /> once at the root
useExport({ notify: (level, message) => toast[level](message) });
```

## Components that changed shape

| Component | Change |
|---|---|
| `PageHeader` | The back button was a react-router `<Link>`. Pass `onBack` (any router) or `backHref` (plain link). |
| `LocalePicker` | No longer reads i18next. Controlled: `locales` / `value` / `onChange`. Pass your `LANGUAGE_MAP` straight through. |
| `ExportButton` | Business hard-coded `t("sys.vehiclePark.fleets.table.export")`. Use `label={t(...)}`; it defaults to "Export". |
| `DataTable` | Autocredit's version ran its own `useQuery(GET_VEHICLES)` and hard-coded seven vehicle columns. Now `rowData` / `columnDefs` / `loading` props; the vehicle columns live in the Storybook story. |
| `StyledTabs` | Colours come from `--brand-*` instead of the app's `theme/colors`, and selection is keyed by option `value` rather than array index. |
| `Logo` | Takes `src`/`alt`; no bundled mark and no router `<Link>`. |
| `ErrorFallback` | Was `PageError`. Drops react-helmet-async and the app router; takes `onGoHome` and `showDetails`. Page403/404/500 are **not** in the library — in both apps they are keycloak redirect shims, not UI. |
| `useQueryParams` | Router-free (`history.pushState` + a synthetic `popstate`, which react-router listens to). Union API: `getQueryParam` / `setQueryParam` / `setQueryParams` / `createQueryString`. |
| `usePermission` | Takes the permission list as an argument instead of reading the zustand user store. |

## Local development loop

- `pnpm pack` in `driverse-ui/`, then `pnpm add ../driverse-ui/driverse-ui-*.tgz` in the app; or
- `pnpm link ../driverse-ui` for a live link while iterating.

## Optional subpaths (W7)

Heavy dependencies live behind subpath exports with optional peers, so an app only installs what it renders:

| Subpath | Peers |
|---|---|
| `@driverse/ui/charts` | apexcharts, react-apexcharts |
| `@driverse/ui/data-table` | ag-grid-community, ag-grid-react |
| `@driverse/ui/editor` | react-quill-new |
| `@driverse/ui/pdf` | react-pdf |
| `@driverse/ui/i18n` | i18next |
| `@driverse/ui/features/fleet-tracking-map` | leaflet, react-leaflet |
| `@driverse/ui/features/telemetry` | leaflet, @tanstack/react-query |
| `@driverse/ui/features/multi-tabs` | @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities |
| `@driverse/ui/features/document-inbox` | react-hook-form, @hookform/resolvers, zod, @tanstack/react-query |
| `@driverse/ui/features/vehicle-insurance` | react-hook-form, @hookform/resolvers, zod |
| `@driverse/ui/features/vehicle-compliance` | react-hook-form, zod, xlsx |
| `@driverse/ui/highlight` | highlight.js |

Every `features/*` subpath takes its data through an injected `<Module>DataSource` — no GraphQL client,
router or store is a dependency of the library. Each module's `README.md` in `src/features/<name>/`
documents its exact contract.

`XlsxViewer` (xlsx) and `DynamicForm` (react-hook-form, @hookform/resolvers, zod) ship from the root barrel
but their peers are optional too — the modules are only reached if you import those components.

### pdf.js worker

`@driverse/ui/pdf` no longer pins a CDN at import time. It still defaults to the same unpkg URL Business
used, so nothing changes unless you opt out:

```ts
import { configurePdfWorker } from "@driverse/ui/pdf";
configurePdfWorker("/pdf.worker.min.mjs"); // once at startup, before first render
```

### i18n base bundle

534 `sys.*` keys both apps define identically in both locales. Merge it under your own bundle — app keys
always win:

```ts
import i18n from "@/locales/i18n";
import { mergeLibI18n } from "@driverse/ui/i18n";
mergeLibI18n(i18n);
```

109 shared keys carry different copy between the two apps (mostly es_ES phrasing). The library ships
Business's wording; every divergence is tabulated in [i18n-conflicts.md](i18n-conflicts.md) for deliberate
reconciliation. Regenerate with `node scripts/gen-i18n-base.mjs` after resolving any.

### Translating the feature modules

`react-i18next` is not a dependency or a peer — an app that doesn't localise pays nothing for the feature
modules that do. Leaf components take their copy as a plain prop (`ExportButton`'s `label`,
`LocalePicker`'s `locales`). The W8 feature modules are too deep to prop-drill a `t` through, so they call
`useTranslate()`, which resolves in three steps: the `t` you supply, then the library's own bundled
`en_US` copy, then the key itself. Wrap once at your root and the modules render exactly what they did
before extraction:

```tsx
import { TranslateProvider } from "@driverse/ui/i18n";
import { useTranslation } from "react-i18next";

const { t } = useTranslation();
return <TranslateProvider t={t}>{children}</TranslateProvider>;
```

Skip the provider entirely and the modules still render real English rather than raw `sys.*` keys, because
the bundle above already carries them — which is what makes them usable in Storybook and tests with no
setup. `multi-tabs` is the one exception: its context menu takes `translate` on `MultiTabsProvider`
directly, since it is the only module whose labels are its own rather than the host app's.
