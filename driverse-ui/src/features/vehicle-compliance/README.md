# vehicle-compliance

Extracted from:

- **A** — `Driverse_FE_Autocredit-qa` @ `b96eda3`, `src/features/vehicle-park/vehicles/details/compliance`
- **B** — `Driverse_FE_Business-dev` @ `b96eda3`, `src/features/vehicle-parks/vehicles/details/compliance`

B is the richer side (it has `hooks/` subdirectories A lacks) and wins almost every file-level decision
below; A wins in exactly one place (`preview-image`, see below). Every ported file carries an
`@extracted-from` header naming both origin paths and the file's `@status`.

## The consolidation

`circulation/`, `tenure/` and `verification/` were structurally identical sub-trees: a status card, a
"current document" card, a history table, an (unmounted) reminders card, an (unmounted) additional-info
card, create/edit forms, an upload widget, and a `data/index.tsx` field-list function. Diffing the three
against each other inside B showed the status/current-document/history shapes were byte-for-byte
identical in layout — only the field list, the columns and the per-kind callbacks changed.

That became `compliance-table/`, four presentational components plus one composing component, each taking
a plain config object instead of reading a per-kind data shape itself:

- `ComplianceStatusCard` — was `circulation/status-card.tsx` + `tenure/ownership.tsx` +
  `verification/pollution-test.tsx`. Tenure's ownership card is the only one with two extra status badges
  (tenencia + refrendo) and two CTAs instead of one, which is why the config type has
  `secondaryChips`/`actions: []` rather than a single chip/button — the generalization needed for tenure
  turned out to cover circulation and verification for free.
- `ComplianceDocumentCard` — was `circulation/current-card.tsx` + `verification/latest.tsx` (tenure's
  equivalent, `latest-payment.tsx`, is commented out in both apps' `tenure/index.tsx` — dead code, not
  rendered, so no tenure config wires this component up).
- `ComplianceHistoryTable` — was `circulation/history.tsx` + `tenure/history.tsx` +
  `verification/history.tsx`. All three are `Card` > `Header`(+ optional Edit button) > `Table` in a
  `Scrollbar`, with a lazily-loaded preview modal and an optional lazily-loaded edit/delete modal. Only
  the `columns` array and the delete-vs-edit affordance differ, so `columns` stays a plain antd
  `ColumnsType` built by the caller (each kind's config) rather than a second schema this component would
  have to reinterpret.
- `ComplianceAdditionalInfo` — was `circulation/additional-info.tsx` + `tenure/additional-info.tsx` +
  `verification/additional-info.tsx`. Also dead code in both apps (imported and immediately commented out
  in every `<kind>/index.tsx`) but self-contained (no store/cross-feature reads), so it was cheap to
  consolidate and is exported for a consumer who wants to opt back in.
- `ComplianceDocumentSection` — the "ONE parameterized component" itself: renders status + document +
  (kind-specific extra content) + additional-info + history off a single
  `ComplianceDocumentSectionProps` object. This replaces each of `circulation/index.tsx`,
  `tenure/index.tsx` and `verification/index.tsx`.

Per-kind logic (field lists, table columns, status messages, permission codes, route strings) lives in
`configs/circulation.tsx`, `configs/verification.tsx` and `configs/tenure.tsx` as `use<Kind>Config()`
hooks that read a vehicle payload (plus, for tenure, fetch the ownership-fee service) and return exactly
the props `ComplianceDocumentSection` needs. `data/index.tsx`'s `LIST(...)` functions became the `fields`
builders inside those config files.

Tenure bundles two document kinds neither app ever split apart — tenencia (ownership tax) and refrendo
(renewal fee) — inside one `ownership.tsx` status card and one `payments-history.tsx` yearly grid. The
yearly grid (`components/tenure/yearly-status-grid.tsx`) has no equivalent in circulation/verification and
was kept as its own small component rather than forced into `ComplianceHistoryTable` with a `variant`
flag for a single caller.

### LOC, before / after

| | source (B, richer) | files |
|---|---|---|
| `circulation/` | 1,763 | 13 |
| `tenure/` | 2,283 | 22 |
| `verification/` | 1,481 | 14 |
| shared (`payment-options`, `preview-image`, `upload-image`) | 464 | 3 |
| **total** | **5,991** | **52** |

Of that, **3,712 LOC across 34 files** (the create/edit forms and their hooks — see "Unported" below) were
left unported. The remaining ~2,279 LOC of status/current/history/data/shared files became **1,939 LOC**
across 15 source files in this module (`compliance-table/`, `configs/`, `shared/`, `provider.tsx`,
`types.ts`, `index.ts`, `vehicle-compliance.tsx`, `components/`) — the three duplicated status/current/
history/data groups collapsed into one shared implementation plus three small config files.

## Per-file A vs. B decisions

Every ported file's header has the full reasoning; this is the index.

| File | Status | Notes |
|---|---|---|
| `compliance-table/status-card.tsx` | merged | B adopted for markup; generalized to cover circulation + tenure's dual-chip ownership card + verification |
| `compliance-table/document-card.tsx` | merged | B adopted; render-prop upload slot |
| `compliance-table/history-table.tsx` | merged | B adopted; `columns` stays caller-built |
| `compliance-table/additional-info.tsx` | merged | B adopted for markup; not wired into the default section (dead code upstream) |
| `compliance-table/index.tsx` (`ComplianceDocumentSection`) | merged | B adopted for the `<kind>/index.tsx` wrapper shape |
| `configs/circulation.tsx` | merged | B's `status-card.tsx`/`current-card.tsx`/`history.tsx`/`data/index.tsx`, delete flow folded in from B-only `useCirculationCardHistory` |
| `configs/verification.tsx` | merged | B's `pollution-test.tsx`/`latest.tsx`/`history.tsx`/`data/index.tsx`; `isStateExcluded` vendored (`isPollutionTestExcludedState`) |
| `configs/tenure.tsx` | merged | B's `ownership.tsx`/`history.tsx`; `useGetPaymentsStatus` → `dataSource.getOwnershipPaymentStatus/History` |
| `components/tenure/yearly-status-grid.tsx` | adopted-B | was `tenure/payments-history.tsx`; A/B format-identical |
| `shared/payment-options.tsx` | decoupled | byte-identical otherwise; `<Link>` → `<a>` (no react-router dependency in this module) |
| `shared/preview-file-modal.tsx` | merged | **A's** self-contained approach won over B's store-coupled `DocxViewer`; B's xlsx branch kept via the lib's `XlsxViewer` |
| `shared/upload-compliance-image.tsx` | decoupled | B's shell, decoupled from `useCompliceDocsUpload`'s store/toast/router coupling down to one injected `dataSource.uploadComplianceDocument` call |
| `vehicle-compliance.tsx` (top `index.tsx`) | merged | B adopted; `useSearchParams` → optional controlled `activeTab`/`onTabChange` |
| `types.ts` | lib-native | `VehicleComplianceDataSource`, `ComplianceNavigation`, redeclared entity types, per-kind config types |
| `provider.tsx` | lib-native | Module-internal context, mirroring how the apps used stores |

`preview-image/index.tsx` is the one file where A won outright: B's file was almost entirely commented
out, and its live half read/wrote a zustand store (`taskStore`) purely to hand a blob URL to
`v2-upload-option`'s `DocxViewer`. A resolved the file type itself and rendered directly — no store, no
extra component. B's one real addition (xlsx support) was kept, backed by the library's own `XlsxViewer`
instead of `DocxViewer`.

## Decoupling

- **Navigation** (`@/router/hooks`, 19 call sites) → `ComplianceNavigation` (`push`/`back`/`replace`) on
  `VehicleComplianceProvider`. Path strings (e.g. `` `${basePath}/${vehicleId}/add-circulation` ``) are
  still built inside the configs — that logic isn't app-specific, only the navigation act is injected.
- **Data** (`@apollo/client`, `@tanstack/react-query`, `useGetPaymentsStatus`, `useAddPaymentStatus`,
  `useAddCirculation`, `useAddPollutionTest`, `useUpdateCirculationCard`, `useCompliceDocsUpload`,
  `useConfirmBenefitPayment`) → one `VehicleComplianceDataSource` of plain async functions on the same
  context. A consuming app implements it once, wrapping whatever query/mutation library it already uses.
- **Permissions** (`@/store/permissionStore`'s `useCan`) → a flat `permissions: string[]` on the context,
  read through the library's own `usePermission` (`@/hooks`) inside `ComplianceStatusCard` and the config
  hooks — one filtering pass instead of one `useCan()` call per button.
- **Files** (`@/hooks/web/use-get-file-url`, `use-delete-file`, `use-uploadfile`,
  `@/store/{fileUploadStore,taskStore}`) → folded into `VehicleComplianceDataSource`
  (`getFileUrl`/`uploadComplianceDocument`/`deleteComplianceFile`), used by `shared/preview-file-modal.tsx`
  and `shared/upload-compliance-image.tsx`.
- **Entity types** (`#/entity`) → redeclared, permissive, in `types.ts` (`CirculationCard`, `PollutionTest`,
  `YearStatus`, `OwnershipPaymentStatus`, `OwnershipPaymentRecord`, `ComplianceVehicle`).
- **`isStateExcluded`** (`@/utils`, reads app-only `@/constants`) → vendored as
  `isPollutionTestExcludedState` in `configs/verification.tsx`, its only caller.
- **`@/features/vehicle-parks/vehicles/components/upload-option`** (+ `v2-upload-option`) → not vendored.
  It only appears in the unported files below (`add-circulation-card.tsx`'s `UploadInsurancePolicy`, and
  the old `preview-image.tsx`'s `DocxViewer`, superseded by A's approach — see above).

## Unported files

34 files, 3,712 LOC — the create/edit forms and their BD-only mutation hooks. All of them are
`react-hook-form` + `zod` modals/pages, each wired to a *different* field schema and a *different*
Apollo/React Query mutation hook, with file-upload state machines coupled to app stores
(`fileUploadStore`, `taskStore`, `vehicleDetailsStore`, `paymentConfirmationStore`) and, in one case
(`circulation/upload-option.tsx`, `tenure/upload-tenure.tsx`, `tenure/upload-ref-option.tsx`,
`verification/upload-option.tsx`), a cross-feature hook (`@/features/employee-benefits/hooks/
useConfirmBenefitPayment`). Reconciling four independent zod schemas and four independent mutation call
sites into the same generality budget as the status/current/history consolidation was assessed as real
behavioural divergence, not formatting — attempting it inside this pass risked shipping forms that look
unified but silently drop per-kind validation. `VehicleComplianceDataSource` in `types.ts` already
declares the contract each of these needs (`addCirculationCard`, `addPollutionTest`,
`addManualOwnershipPayment`, `confirmBenefitPayment`, `deleteComplianceFile`) so a follow-up pass has a
stable target instead of inventing one per form.

Circulation (11 files, `components/circulation/`):
`create/form.tsx`, `edit/circulation-card.tsx`, `upload-option.tsx`, `add-manual-payment.tsx`,
`add-circulation-card.tsx`, `reminders.tsx`, `hooks/useAddManualCirculation.ts`,
`hooks/useCirculationCardHistory.ts`, `hooks/useDeleteCirculationCard.ts`,
`hooks/useEditCirculationCard.tsx`, `hooks/useEditCirculationCardForm.tsx`.
(The delete flow this module *does* support in `ComplianceHistoryTable` was written directly against
`dataSource.deleteCirculationCard`, not ported from `useCirculationCardHistory`'s Apollo internals.)

Tenure (14 files, `components/tenure/`):
`create/tenure-form.tsx`, `create/referendum-form.tsx`, `edit/ownership-fee.tsx`, `upload-tenure.tsx`,
`upload-ref-option.tsx`, `add-manual-tenure.tsx`, `add-manual-ref.tsx`, `add-tenure.tsx`,
`add-referendum.tsx`, `add-option.tsx`, `reminders.tsx`, `hooks/useAddManualReferendum.ts`,
`hooks/useAddManualTenure.ts`, `hooks/useEditOwnershipForm.ts`.

Verification (9 files, `components/verification/`):
`create/form.tsx`, `edit/pollution-test.tsx`, `upload-option.tsx`, `manual-payment.tsx`,
`add-pollution.tsx`, `reminders.tsx`, `hooks/useAddManualPayment.ts`, `hooks/useEditPollutionTest.tsx`,
`hooks/useEditPollutionTestForm.tsx`.

`reminders.tsx` in all three kinds is unported for a second, independent reason beyond the above: it is
dead code in both apps (commented out in every `<kind>/index.tsx`) *and* it imports
`reminderPolicyOptions` from a sibling feature (`../../../insurance/overview/data`) that is out of scope
for this module.

Each unported file's "Edit"/upload target is a render-prop hole in the ported configs
(`onEditCurrentCard`, `onEditLatest`, `onEditHistoryRow` in `configs/circulation.tsx`/`verification.tsx`/
`tenure.tsx`) so a consumer can wire its own (unported) form in without this module needing to know about
it.

## Verification

```
pnpm exec tsc --noEmit          # clean for this module (project-wide errors are pre-existing, in other src/features/* dirs)
pnpm exec vitest run src/features/vehicle-compliance   # 10/10 passing
pnpm exec biome check src/features/vehicle-compliance  # clean
```
