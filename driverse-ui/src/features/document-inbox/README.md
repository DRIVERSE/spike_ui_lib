# document-inbox

Ported from both apps' `src/features/documents/document-inbox` (identical path in QA and BD @ `b96eda3`).
BD was the base — QA differs by ~45 lines total, almost all of it the `useClientId()` swap (see below) and
two cross-feature import paths (`vehicle-park` vs `vehicle-parks`). Where the two disagreed, the merge
decision is recorded in that file's own `@extracted-from` header; this file covers the module-wide seams.

## What was skipped

- **`components/tabs/select-client/`** (QA-only). QA gated the whole feature behind a "pick a client
  first" tab (`selectedClientId` in the store, a fourth `PillTabs` entry, `disabled` on the other three).
  BD dropped it entirely — the client is already known from context in that app — and BD's `index.tsx` is
  the base for this module's `index.tsx`. Since a shared library component shouldn't hard-code "how do you
  pick a client," this tab was not ported. A host app that still needs client selection renders it above
  `<DocumentInbox />` and passes the result in as `clientId`/`token` on `DocumentInboxProvider`.

## The injection seam

Everything that reached outside the feature — the zustand stores, Apollo, a couple of cross-feature app
hooks — was replaced by one `DocumentInboxDataSource` (`types.ts`) plus a `DocumentInboxProvider` /
`useDocumentInbox()` context (`provider.tsx`) that carries it alongside the feature's own UI state (what
used to be `useDocumentInboxStore`).

```tsx
<DocumentInboxProvider dataSource={dataSource} clientId="…" onViewVehicle={(id) => navigate(...)}>
  <DocumentInbox />
</DocumentInboxProvider>
```

- **`@/store/document-inbox-store`** (zustand, 12+ uses) → hoisted into `DocumentInboxProvider`'s own
  `useState`s, exposed with the same field/setter names through `useDocumentInbox()`. `selectedClientId`
  is gone (see `clientId`/`token` below); `selectedEmpInfo` is dropped from `formValues` — it was typed
  but never read or written anywhere in this feature.
- **`@/store/taskStore`** (zustand, the previewed document's blob URL) → gone. That state now lives as
  local `useState` inside `hooks/useMannualFormActions.tsx`, returned as `blobUrl` for the document
  preview render prop (see below).
- **`@apollo/client` + `@/graphql/**`** (2 subscriptions, 2 queries, 1 mutation) → six
  `DocumentInboxDataSource` functions: `subscribePendingUploads`/`subscribeCompletedUploads` (callback +
  unsubscribe), `fetchClientVehicles`, `markAsReady`, `uploadFiles`/`confirmDocuments` (the two REST calls
  through `useApiResource`), `fetchPaymentsStatus`. See `types.ts` for the full contract and the original
  GraphQL selection sets, now expressed as `DocumentInboxRecord`.
- **`@/hooks/web/use-clientId`** → `DocumentInboxProvider` takes an optional `token` and calls the
  library's `useClientId(token)`, or a caller can skip the JWT and pass `clientId` directly (what this
  module's stories/tests do). Every original hook's `useClientId() ?? "023ff72a-…"` fallback is preserved
  as `DocumentInboxProvider`'s `FALLBACK_CLIENT_ID`.
- **`@/hooks/web/use-resource`, `@/hooks/web/use-get-fileurl`** → the library's `useApiResource`/
  `useGetFileUrl`, fed `dataSource.apiResource`/`dataSource.filesApiUrl`.
- **`@/features/vehicle-parks/hooks/useAddInsurance`** → not injected. `useInsuranceForm` only ever used
  it for the react-hook-form instance (schema-bound to `VehicleInsuranceSchema`); the rest of that hook
  (`useInsuranceStore`, `useRouter`, react-query mutation, Apollo client, file-upload store) is unrelated
  to document-inbox. The vendored schema (`schema.ts`) plus a local `useForm` reproduce the exact same
  field validation without the dependency chain.
- **`@/features/vehicle-parks/vehicles/hooks/useGetPaymentsStatus`** → `dataSource.fetchPaymentsStatus`,
  still wrapped in `@tanstack/react-query` inside `useOwnershipForm` (same pattern as the transport-only
  swaps above).
- **`@/features/vehicle-parks/vehicles/components/upload-option/v2-upload-option`** (`DocxViewer`) → the
  `renderDocumentPreview` render prop on `DocumentInboxProvider`, the same pattern fleet-tracking-map uses
  for `renderSidePanel`. The original built on `react-pdf` + `react-file-viewer` + `taskStore`;
  `react-file-viewer` isn't a library dependency, so the viewer itself is now the app's problem — the
  module just hands it `{ url, extension, loading }`.
- **`react-router`'s `useNavigate`** (one hard-coded `/vehicle-park/vehicles/:id` route, in
  `pending-uploads-table.tsx`) → `onViewVehicle` on `DocumentInboxProvider`, called instead of navigating.
- **`react-icons`, `react-json-view`, `@ant-design/icons`** → none of these are library dependencies
  (checked against `package.json`; `@ant-design/icons` in particular is not actually installed or used
  anywhere else in the library despite occasional mentions in other components' doc comments). Every icon
  became the library's `<Iconify>`; `react-json-view`'s collapsible tree in `logs-view.tsx` became a plain
  `JSON.stringify(..., null, 2)` block in the library's `Scrollbar` — the original already rendered fully
  expanded with all its interactive chrome turned off.
- **`@/theme/colors`** → `var(--brand-primary)` / the library's `commonColors`/`paletteColors` tokens,
  same substitution fleet-tracking-map's `STATUS_COLOR` and page-header made.
- **`@/schema/vehicle.schema`** → vendored into `schema.ts`, but only the four schemas this module actually
  used (`CirculationCardSchema`, `PollutionTestSchema`, `OwnershipSchema`, `VehicleInsuranceSchema`); the
  other ~15 in that file belong to vehicle-parks.
- **`@/features/vehicle-parks/.../insurance/overview/data`,
  `.../compliance/components/verification/data`** → each is one small constant
  (`INSURANCE_COMPANIES`, `hologramOptions`) out of a larger, unrelated data module. Both are vendored
  locally next to the form that uses them (`components/tabs/pending/components/forms/`).
- **`#/entity`** → `VehicleType`/`YearStatus` redeclared in `types.ts`, permissive/optional-field, since
  the app's root `types/` directory isn't importable from the library.

## Stories / tests

`document-inbox.stories.tsx` exports `mockDataSource` (an in-memory `DocumentInboxDataSource`) alongside
three stories (default upload tab, pending review with stats, completed uploads) that
`document-inbox.test.tsx` composes with `composeStories` for a smoke test per story, plus interaction tests
that switch tabs and confirm the mock data source's callbacks fire.
