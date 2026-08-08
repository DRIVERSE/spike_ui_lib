/**
 * @lib-native
 * Contracts for the vehicle-compliance module: the injected navigation/data-source seam, the entity
 * shapes both apps kept in an app-root `types/` directory (redeclared here, kept structurally permissive
 * so either app's GraphQL/REST payloads satisfy them), and the per-document-kind config type that drives
 * `compliance-table/`.
 */

import type { ReactNode } from "react";

/* ------------------------------------------------------------------------------------------------
 * Navigation — replaces `@/router/hooks` (useRouter/useParams), 19 call sites across the three
 * sub-trees, all of them `router.push(`/vehicle-park/vehicles/${params.id}/add-...`)` or `router.back()`.
 * The module keeps building the path strings (that logic is not app-specific); only the actual
 * navigation act is injected.
 * ---------------------------------------------------------------------------------------------- */
export type ComplianceNavigation = {
	push: (path: string) => void;
	back: () => void;
	replace?: (path: string) => void;
};

/* ------------------------------------------------------------------------------------------------
 * Redeclared entity types — both apps read these from an app-root `#/entity` (Autocredit) or
 * `types/entity` (Business) module this library does not have. Kept permissive (optional, loose
 * string unions widened to `string`) so either app's real payload satisfies the shape.
 * ---------------------------------------------------------------------------------------------- */
export type ComplianceFileRef = {
	bucket_name?: string;
	file_name?: string;
	content_type?: string;
	id?: string;
	name?: string;
} | null;

export type CirculationCard = {
	id?: string;
	card_number?: string;
	issue_date?: string;
	expiry_date?: string;
	status?: string;
	file?: ComplianceFileRef | ComplianceFileRef[];
};

export type PollutionTest = {
	id?: string;
	hologram?: string;
	verification_sticker?: string;
	test_date?: string;
	expiry_date?: string;
	status?: string;
	file?: ComplianceFileRef | ComplianceFileRef[];
};

/** A single fiscal-year row inside `OwnershipPaymentStatus.detail.yearlyStatus`. */
export type YearStatus = {
	year: number | string;
	tenenciaStatus?: string;
	refrendoStatus?: string;
};

export type OwnershipPaymentStatus = {
	detail?: {
		overallStatus?: {
			ownershipFeeStatus?: string;
			tenenciaStatus?: string;
			refrendoStatus?: string;
		};
		yearlyStatus?: YearStatus[];
		tenenciaExemption?: { isExempt?: boolean; reason?: string };
	};
};

export type OwnershipPaymentRecord = {
	id?: string;
	fiscal_year?: string | number;
	payment_type?: "TENENCIA" | "REFRENDO" | string;
	amount?: number | string;
	payment_date?: string;
	file?: ComplianceFileRef;
};

export type ComplianceVehicle = {
	id?: string;
	plate_number?: string;
	plate_number_state?: string;
	currency_code?: string;
	pollution_test_required?: boolean;
	circulation_cards?: CirculationCard[];
	pollution_tests?: PollutionTest[];
};

/* ------------------------------------------------------------------------------------------------
 * Data source — replaces `@apollo/client` / `@tanstack/react-query` mutation & query hooks
 * (`useGetPaymentsStatus`, `useAddPaymentStatus`, `useAddCirculation`, `useAddPollutionTest`,
 * `useUpdateCirculationCard`, `useCompliceDocsUpload`, `@/features/employee-benefits/hooks/
 * useConfirmBenefitPayment`) and the file hooks (`use-get-file-url`, `use-delete-file`,
 * `use-uploadfile`). Each entry is a plain async function; the calling logic that decided *when* to
 * call it stays in the component exactly as the apps wrote it — only the transport is injected.
 * A React Query/Apollo-backed implementation is expected to be handed to `VehicleComplianceProvider`
 * by the consuming app; the module itself has zero data-fetching-library dependency.
 * ---------------------------------------------------------------------------------------------- */
export type UploadCompliancePayload = {
	customerId: string;
	category: string;
	uniqueId: string;
	documentGroup: string;
	split?: boolean;
};

export type UploadedComplianceFile = { id: string; fileName?: string };

export type VehicleComplianceDataSource = {
	/** GET .../ownership-fee-payments/status?vehicleId= */
	getOwnershipPaymentStatus: (vehicleId: string) => Promise<OwnershipPaymentStatus | undefined>;
	/** GET .../ownership-fee-payments/history?vehicleId= */
	getOwnershipPaymentHistory: (vehicleId: string) => Promise<OwnershipPaymentRecord[]>;

	/** Attaches an already-uploaded file id to the vehicle's current circulation card. */
	updateCirculationCardFile: (input: { circulationCardId: string; fileId: string }) => Promise<void>;
	/** Attaches an already-uploaded file id to the vehicle's latest pollution test. */
	updatePollutionTestFile: (input: { pollutionTestId: string; fileId: string }) => Promise<void>;

	/** Creates a circulation card record (OCR or manual flow both land here). */
	addCirculationCard: (input: Record<string, unknown>) => Promise<void>;
	/** Creates a pollution-test record. */
	addPollutionTest: (input: Record<string, unknown>) => Promise<void>;
	/** Creates a manual tenencia or refrendo payment record. */
	addManualOwnershipPayment: (input: Record<string, unknown>) => Promise<void>;
	/** Confirms an OCR-uploaded benefit/compliance payment (was useConfirmBenefitPayment). */
	confirmBenefitPayment: (input: Record<string, unknown>) => Promise<void>;
	/** Deletes a circulation card row from history. */
	deleteCirculationCard: (id: string) => Promise<void>;

	/** Uploads a raw File under the given compliance payload; resolves with the stored file record(s). */
	uploadComplianceDocument: (
		payload: UploadCompliancePayload,
		file: File,
	) => Promise<{ files: UploadedComplianceFile[] } | undefined>;
	/** Deletes an already-uploaded compliance file. */
	deleteComplianceFile: (payload: { bucketId: string; fileId: string }) => Promise<void>;
	/** Resolves a signed URL for previewing an uploaded file. */
	getFileUrl: (payload: {
		bucketId: string;
		fileName: string;
	}) => Promise<{ url?: string; name?: string } | undefined>;
};

/* ------------------------------------------------------------------------------------------------
 * Permissions — the apps read these off zustand's `useCan(code)` / `permissionStore`. The library's
 * `usePermission`/`Can` (see @/hooks) takes the resolved permission list instead of a store, so the
 * context carries the flat list and components call `usePermission(permissions).has(code)`.
 * ---------------------------------------------------------------------------------------------- */
export type CompliancePermissionCode =
	| "business.action.add_circulation"
	| "business.action.edit_circulation"
	| "business.action.add_pollution_test"
	| "business.action.edit_pollution_test"
	| "business.action.add_tenure_payment"
	| "business.action.add_tenure_renewal_payment"
	| "business.action.edit_tenure_renewal_payment"
	| (string & {});

/* ------------------------------------------------------------------------------------------------
 * Per-document-kind config — the payoff of the consolidation. `circulation`, `verification` and the
 * ownership sub-kinds (`tenure`/`referendum`, bundled together under "tenure" in the source apps)
 * each produce one of these from the vehicle payload; `compliance-table/` renders every kind off the
 * same three presentational components using nothing but this object.
 * ---------------------------------------------------------------------------------------------- */
export type ComplianceChip = { label: string; variant: string };

export type ComplianceStatusAction = {
	key: string;
	label: string;
	permission?: CompliancePermissionCode;
	type?: "primary" | "default";
	onClick: () => void;
};

/** Props for the generic status card — one per kind, built by that kind's config function. */
export type ComplianceStatusCardConfig = {
	title: string;
	chip: ComplianceChip | null;
	message: ReactNode;
	/** Tenure's ownership card shows tenencia + refrendo as extra badges beside the overall status. */
	secondaryChips?: { label: string; chip: ComplianceChip }[];
	actions?: ComplianceStatusAction[];
};

/** Props for the generic "current document" card — one per kind, built by that kind's config function. */
export type ComplianceDocumentCardConfig = {
	title: string;
	fields: { label: string; value: ReactNode }[];
	canEdit: boolean;
	onEdit: () => void;
	attachmentsTitle: string;
	files: { bucketId: string; fileName: string; contentType: string }[];
	onViewFile: () => void;
	/** Renders the upload widget; kept a render prop because payload/category differ per kind. */
	renderUpload: () => ReactNode;
};

/** One notes+links card — shared shape across the three kinds' (currently unmounted) additional-info. */
export type ComplianceAdditionalInfoConfig = {
	title: string;
	notesTitle: string;
	notes: string[];
	linksTitle: string;
	links: { title: string; sub: string; link: string }[];
};

export type ComplianceKind = "circulation" | "verification" | "tenure" | "referendum";
