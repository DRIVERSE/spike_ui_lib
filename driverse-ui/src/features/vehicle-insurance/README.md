# vehicle-insurance

Extracted from both apps' `.../vehicles/details/insurance` feature (QA = Autocredit's
`src/features/vehicle-park/vehicles/details/insurance`, BD = Business's
`src/features/vehicle-parks/vehicles/details/insurance` — note the `vehicle-park` -> `vehicle-parks`
rename between the two repos). Every ported file carries an `@extracted-from` header naming the exact
app path(s) and the decision (`identical` / `adopted-A` / `adopted-B` / `merged` / `decoupled`); this file
is the index into those, plus the pieces that aren't 1:1 file ports.

## Layout vs. the origin

The 14 files listed in the task are all here, at the same relative paths, with one exception:
`index.tsx` (the tab shell) is `vehicle-insurance.tsx` instead. A directory can't resolve both
`./index.ts` (this module's barrel, exporting the public surface) and `./index.tsx` (the component) for
the same bare specifier, so the component was renamed and the barrel took `index.ts` — the same call
`../vehicle-compliance` made for the same file collision. `provider.tsx` (not one of the 14) is the
`@lib-native` React context replacing every store the apps used.

## Per-file decisions (the 14 listed files)

| File | Status | Notes |
| --- | --- | --- |
| `vehicle-insurance.tsx` (was `index.tsx`) | identical | Byte-identical A/B. `useInsuranceStore` -> `useVehicleInsurance()`. |
| `edit/index.tsx` | merged | Functionally identical; B only re-wraps some `rules={[...]}` arrays onto more lines. Base A. |
| `history/index.tsx` | merged | Only the table's import path differs (see below). |
| `overview/index.tsx` | merged | A/B differ in a hard-coded per-app fallback client id and formatting only. Base A. |
| `overview/data/index.tsx` | adopted-A | B carries one dead commented-out import. |
| `overview/components/add-policy-form/form.tsx` | merged | Import order/paths only. Base A. |
| `overview/components/add-policy-form/index.tsx` | merged | Diverges on which uploader/hook path each app renamed to; see "Vendored supporting components" below. |
| `overview/components/policy-holder/index.tsx` | **adopted-B** | Real behavioural difference, not style — see below. |
| `overview/components/policy-info/index.tsx` | adopted-A | B has stray whitespace only. |
| `overview/components/review/index.tsx` | merged | One dead commented import path differs. Not wired into any of the other 13 files in either app (both leave the wizard's "review" step unused). |
| `overview/components/sections/InsuranceRemindersCard.tsx` | identical | Also dead UI in both apps (commented out at the call site). |
| `overview/components/sections/InsuranceStatusCard.tsx` | **adopted-B** | Permission-based gate replaces a URL-param check — see below. |
| `overview/components/sections/PolicyInformationCard.tsx` | **adopted-B** | Same permission-gate call as `InsuranceStatusCard`. |
| `overview/components/sections/PolicyholderInfoCard.tsx` | identical | Byte-identical A/B. |

### `policy-holder/index.tsx` — adopted-B, real bug fix

The "Autofill with company profile information" checkbox. A autofilled from
`useVehicleDetailsResponseStore().vehicleDetails.insurance_policies[0]` — the vehicle's *existing*
insurance policy, which has nothing to do with "company profile". B autofills from
`useUserInfo()` (the signed-in user's company profile), which is what the label promises. B's behaviour
is what shipped in this module; A's mismatch is called out so nobody reintroduces it upstream.

### `InsuranceStatusCard.tsx` / `PolicyInformationCard.tsx` — adopted-B, permission gate

A hid "Add Policy" / showed "Edit" based on `useSearchParams().get("archived") === "true"` — a
route-specific hack. B gates both on real permission codes
(`business.action.add_insurance_policy`, `business.action.edit_insurance_policy`) through its own
zustand `permissionStore`. B's gates are what this module keeps, but the permission *check* itself is
the library's own `usePermission` (`@/hooks`) fed the `permissions: string[]` the app passes into
`VehicleInsuranceProvider` — so the module has no permission-store dependency of its own, app or library.

## Supporting files not in the 14 (but required for them to run)

`edit/index.tsx`, `add-policy-form/{form,index}.tsx` and `overview/index.tsx` each call into app hooks
one directory up (`vehicles/hooks/`) that weren't in the file list but own the actual state/logic for
those screens. They're vendored here — dropped, the module wouldn't compile — each with its own
`@extracted-from` header:

- `hooks/use-add-insurance-policy.ts` (was `useAddInsurance.tsx`) — the create-policy form state and submit flow.
- `hooks/use-insurance-document-upload.ts` (was `useCompliceDocsUpload.tsx`) — the drag/drop + preview state shared by the add and edit flows.
- `hooks/use-policy-data.ts` (was `usePolicyData.ts`) — pure derivation (`policyFirstItem`, `daysRemaining`); no app coupling to decouple, byte-identical A/B.
- `edit/use-edit-insurance-form.ts` (was `useEditInsuranceForm.tsx`) — the edit modal's state and submit flow.
- `schema.ts` (was `src/schema/vehicle.schema.ts`'s `VehicleInsuranceSchema`/`VehicleInsurancePolicyHolderSchema`) — redeclared, `@lib-native`-adjacent but headered as extracted since the zod shapes are copied, not authored fresh.

## Vendored supporting components (decoupling-map judgement calls)

The plan calls out two components as "vendor with origin header, or render prop — use judgement":

- **`@/features/vehicle-parks/table/vehicle-insurance-history-table`** -> vendored as
  `history/insurance-history-table.tsx` + `history/insurance-history-columns.tsx`. Genuinely
  self-contained UI over the library's `Table`/`Scrollbar`/`ExportButton`. **adopted-B**: A drives it
  through `useInsuranceHistoryTable`, an out-of-scope hook that also lazy-renders `EditInsuranceForm` so
  clicking a policy row opens it for editing. B is already self-contained (own columns file, local
  `useState`), so it was the base — **at the cost of that click-to-edit affordance**, a real capability
  loss from A, noted here since nothing else in this module restores it.
- **`@/features/vehicle-parks/vehicles/components/upload-option`** -> vendored as
  `components/upload-insurance-document.tsx`. **adopted-A**: B's equivalent renders `DocxViewer`
  (`v2-upload-option.tsx`, its own ~150-line document-conversion component) instead of a plain
  iframe/`<img>` preview. A's simpler, self-contained preview was kept rather than pulling in a second,
  separately-coupled viewer for what is, in both apps, just an image-or-PDF policy document.

Two more dependencies turned up that aren't in the plan's decoupling map at all, because they belong to
the separate **compliance** feature (out of scope for this extraction) rather than vehicle-parks:

- **`compliance/components/upload-image`** (`UploadComplianceImage`) — rendered by both `edit/index.tsx`
  and `overview/index.tsx` for the policy-document uploader. Vendored as
  `components/upload-compliance-image.tsx` (adopted-A; B differs only in import order/comments) since
  it's the same kind of self-contained uploader UI as the two components above.
- **`compliance/components/preview-image`** (`PreviewImageModal`) and the app's own
  **"add insurance policy" modal** (`@/features/vehicle-park*/components/modal*/add-insurance-policy`,
  a *different* add-policy UI from the page-based one in `add-policy-form/`) — both stay **render props**
  (`renderFilePreview`, `renderAddPolicyModal` on `VehicleInsuranceProvider`), the same call
  `fleet-tracking-map` made for `SidePanel`. Unlike the table/uploaders above, these aren't
  self-contained: they're full app screens (file preview reads a document by bucket id through the
  compliance service; the add-policy modal is a whole separate form). `overview/index.tsx` and
  `insurance-history-table.tsx` both read `renderFilePreview` from the shared context instead of each
  carrying its own lazy import into the compliance feature.

## The injection seam

Everything that touched a global app store, GraphQL, or the router now goes through
`VehicleInsuranceProvider` (`provider.tsx`) — mirroring how the apps used `useInsuranceStore` /
`useVehicleDetailsResponseStore` / `useUserStore` / `usePermissionStore`, but scoped to whatever subtree
the app wraps instead of module-level singletons. Consume it with `useVehicleInsurance()`.

```tsx
import {
  VehicleInsurance,
  VehicleInsuranceProvider,
  AddVehicleInsurancePolicy,
  type VehicleInsuranceDataSource,
} from "@/features/vehicle-insurance"; // your app's alias to this library

const dataSource: VehicleInsuranceDataSource = {
  createPolicy: (payload) => api.post("/insurance-policies", payload),
  updatePolicy: (id, payload) => graphqlUpdateInsurancePolicy(id, payload),
  attachPolicyFile: (policyId, fileId) => graphqlUpdateInsurancePolicy(policyId, { file_id: fileId }),
  deletePolicyFile: (payload) => filesApi.delete(payload),
  uploadDocument: (payload, file) => filesApi.upload(payload, file),
  refetchVehicle: () => apolloClient.refetchQueries({ include: ["GetVehicleById"] }),
};

<VehicleInsuranceProvider
  dataSource={dataSource}
  navigation={{ push: router.push, back: router.back }}
  clientId={clientId}
  vehicleId={vehicle.id}
  userProfile={{ clientName, rfc, legalCompanyAddress }}
  permissions={userPermissionCodes}
  renderAddPolicyModal={({ open, onOpenChange }) => (
    <AddInsurancePolicyModal open={open} onOpen={onOpenChange} />
  )}
  renderFilePreview={(ctx) => <PreviewImageModal {...ctx} />}
>
  <VehicleInsurance vehicleData={vehicle} loading={loading} />
</VehicleInsuranceProvider>;
```

### `VehicleInsuranceDataSource` (`types.ts`)

Collapses three different transports the apps used — an Apollo mutation (edit, and the "attach
uploaded file to an existing policy" call from overview), a `useApiResource` POST to
`VITE_COMPLIANCE_URL` wrapped in react-query (create), and `useDeleteFile` (delete) — plus every
`apolloClient.refetchQueries([...])` that followed a mutation, into one async contract:

```ts
type VehicleInsuranceDataSource = {
  createPolicy(payload): Promise<{ status; message? }>;
  updatePolicy(id, payload): Promise<{ status; message? }>;
  attachPolicyFile(policyId, fileId): Promise<{ status; message? }>;
  deletePolicyFile(payload): Promise<{ status; detail: { successCount; failureCount } }>;
  uploadDocument(payload, file): Promise<{ status; message?; detail?: { files } }>;
  refetchVehicle?(): Promise<void> | void;
};
```

### Navigation

`@/router/hooks`'s `useRouter()`/`useParams()` pair -> `{ push(path): void; back?(): void }`. The apps
only ever called `router.push` and read `params.id`; the id is now the explicit `vehicleId` prop.

### Permissions

`usePermissionStore`'s `useCan(code)` (Business) -> the library's own `usePermission(permissions)` from
`@/hooks`, fed the `permissions: string[]` array passed into the provider. No permission store of any
kind ships with this module.

### State that was a zustand store

`useInsuranceStore` (`activeTab`, `openInsurance`, `formValues`/`setFormValue`, `resetAll`,
`isFormValid`, `isPolicyHolderFormValid`) is now the same shape on `useVehicleInsurance()`, held in
`useState` inside `VehicleInsuranceProvider` rather than a module-level store — each mounted provider
gets its own draft, which is arguably more correct than a global singleton for a form two different
vehicle detail pages could both have open.

### Entity types

`InsurancePolicy` and `Vehicle` are redeclared in `types.ts` (open index signatures, so app records with
extra fields still satisfy them) because both apps keep them in a root-level `types/entity.ts` the
library can't import. `VehicleInsuranceFieldType` and its two zod schemas are redeclared the same way in
`schema.ts`, from the apps' root `src/schema/vehicle.schema.ts`.

## What didn't get fully decoupled / simplifications

- **`use-insurance-document-upload.ts`** drops two things Business's `useCompliceDocsUpload` added on
  top of Autocredit's version: a `useFileStore` blob-url cache shared with unrelated compliance screens,
  and a `useLocation`-driven "reset upload state when the route changes" effect. Neither applies once
  upload state is scoped to a mounted form instance instead of a app-wide store — dropped rather than
  worked around.
- **`use-edit-insurance-form.ts`/`use-add-insurance-policy.ts`** simplify error-shaped responses to
  `{ status, message? }` rather than the apps' full Apollo/axios error objects; `err?.response?.data?.*`
  reads in `use-add-insurance-policy.ts` assume the injected `dataSource.createPolicy` rejects with
  something axios-shaped when it fails, matching what the real POST transport actually throws — an app
  wiring a different transport (e.g. `fetch`) should reject with a compatible shape or the toast falls
  back to `err.message`.
- **Click-to-edit from the history table** (Autocredit only) was not carried over — see the table's
  header above.
- **The wizard's "review" step** (`overview/components/review/index.tsx`) is ported per the file list but,
  as in both apps, nothing renders it; `add-policy-form` shows policy-info + policy-holder on one screen
  with no third step.
