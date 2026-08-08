/** @lib-native */

import type { Dayjs } from "dayjs";

/**
 * `InsurancePolicy` is redeclared here because both apps keep it in a root-level `types/entity.ts` the
 * library cannot import. Structurally identical to the app version; the open index signature is kept so
 * app records with extra fields (or GraphQL-shaped nulls) still satisfy it.
 */
export type InsurancePolicy = {
	id: string;
	vehicle_id?: string;
	client_id?: string;
	status?: string;
	insurance_company?: string;
	policy_number?: string;
	policyholder_name?: string;
	rfc?: string;
	address?: string;
	clause?: string;
	issue_date?: string | null;
	coverage_start?: string | null;
	coverage_end?: string | null;
	file?: unknown;
	[key: string]: any;
};

/** Minimal slice of the app's `Vehicle` entity this module actually reads. */
export type Vehicle = {
	id: string;
	alias?: string;
	make?: string;
	client_id?: string;
	insurance_policies?: InsurancePolicy[];
	[key: string]: any;
};

/**
 * Draft state for the "add policy" flow. Mirrors `useInsuranceStore().formValues` in both apps
 * (`src/store/insuranceStore.ts`), minus the store: the values now live in `VehicleInsuranceProvider`.
 */
export type InsuranceFormValues = {
	unique_policy_no?: string;
	policy_issue_date?: Dayjs | null;
	company_name?: string;
	item?: string;
	coverage_start_date?: Dayjs | null;
	coverage_end_date?: Dayjs | null;
	autoFil?: boolean;
	policy_holder_name?: string;
	rfc?: string;
	address?: string;
};

/** The company-profile fields the "autofill" checkbox in the policyholder step copies in. */
export type VehicleInsuranceUserProfile = {
	clientName?: string;
	rfc?: string;
	legalCompanyAddress?: string;
};

export type UploadDocumentPayload = {
	customerId: string;
	category: string;
	uniqueId: string;
	documentGroup: string;
	split?: boolean;
	showToast?: boolean;
};

export type UploadedDocument = {
	id: string;
	[key: string]: any;
};

export type UploadDocumentResult = {
	status: number;
	message?: string;
	detail?: { files: UploadedDocument[] };
};

export type DeleteInsuranceFilePayload = {
	bucketId: string;
	fileId?: string;
};

export type DeleteInsuranceFileResult = {
	status: number;
	detail: { successCount: number; failureCount: number };
};

export type InsuranceMutationResult = {
	status: number;
	message?: string;
};

export type CreateInsurancePolicyPayload = {
	address?: string;
	client_id: string;
	coverage_end: string | null;
	coverage_start: string | null;
	insurance_company?: string;
	policy_number?: string;
	policyholder_name?: string;
	rfc?: string;
	issue_date: string | null;
	vehicle_id?: string;
	clause?: string;
	file_id?: string;
};

export type UpdateInsurancePolicyPayload = Partial<CreateInsurancePolicyPayload> & {
	file_id?: string;
};

/**
 * The transport seam. Both apps drove this feature with a mix of an Apollo mutation (edit, the
 * "attach file to an existing policy" call from overview), a `useApiResource` POST to
 * `VITE_COMPLIANCE_URL` wrapped in react-query (create), and `useDeleteFile` (delete). All three,
 * plus the `apolloClient.refetchQueries(["GetVehicleById"])` calls that followed a mutation, collapse
 * into this one async contract so the module has no GraphQL/react-query/axios dependency of its own.
 */
export type VehicleInsuranceDataSource = {
	/** Was the react-query `createInsurance` mutation (`POST {VITE_COMPLIANCE_URL}/api/v1/insurance-policies`). */
	createPolicy: (payload: CreateInsurancePolicyPayload) => Promise<InsuranceMutationResult>;
	/** Was the `UPDATE_INSURANCE_POLICY` Apollo mutation, called from the edit form. */
	updatePolicy: (id: string, payload: UpdateInsurancePolicyPayload) => Promise<InsuranceMutationResult>;
	/** Was the same mutation, called with just `file_id` from the overview page's attachment uploader. */
	attachPolicyFile: (policyId: string, fileId: string) => Promise<InsuranceMutationResult>;
	/** Was `useDeleteFile` from the edit form's document section. */
	deletePolicyFile: (payload: DeleteInsuranceFilePayload) => Promise<DeleteInsuranceFileResult>;
	/** Was `useFileUpload` (via `useCompliceDocsUpload.processUpload`). */
	uploadDocument: (payload: UploadDocumentPayload, file: File) => Promise<UploadDocumentResult>;
	/** Was `apolloClient.refetchQueries({ include: ["GetVehicleById"] })` / `["GetVehicles", "GetVehicleById"]`. */
	refetchVehicle?: () => Promise<void> | void;
};

/** Replaces `@/router/hooks`' `useRouter()`/`useParams()` pair — the apps only ever called `router.push`. */
export type VehicleInsuranceNavigation = {
	push: (path: string) => void;
	back?: () => void;
};

/** Context passed to a preview modal render prop — the shape `#/entity`'s `NormalizedFile` takes on screen. */
export type FilePreviewContext = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	bucketId: string;
	fileName: string;
	contentType: string;
};

/** Context passed to the "add insurance policy" modal render prop. */
export type AddPolicyModalContext = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};
