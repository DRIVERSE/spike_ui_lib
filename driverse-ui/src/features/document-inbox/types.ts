/** @lib-native */

/**
 * The `DocumentInboxDataSource` is the injection seam for this module. Both apps wired document-inbox
 * straight to Hasura via `@apollo/client` (`useQuery`/`useMutation`/`useSubscription`) plus a couple of
 * REST calls through their own `useApiResource`. None of that can live in the library, so every
 * query/mutation/subscription the feature used becomes one async function (or a subscribe-with-unsubscribe
 * function) here, and a host app supplies a concrete implementation — Apollo-backed, REST-backed, or a
 * mock, as in this module's own stories/tests.
 *
 * Redeclared entity types below (`VehicleType`, `YearStatus`) mirror `#/entity` in both apps' root
 * `types/` directory, which the library cannot import. Only the fields document-inbox actually reads are
 * modelled; both keep an open index signature so a real app record with extra fields still satisfies them.
 */

import type { ApiResourceRequest } from "@/hooks/use-resource";

/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 types/entity.ts (VehicleType)
 *   B: Driverse_FE_Business   @ b96eda3 types/entity.ts (VehicleType)
 * @status identical
 * @notes Identical in both apps. `__typename` (a GraphQL artifact) is dropped since the module no longer
 *        talks GraphQL directly; every other field is kept, all made optional because the manual-entry
 *        forms only ever read a handful of them off records the OCR pipeline or the vehicles list produced.
 */
export type VehicleType = {
	id: string;
	alias?: string;
	annex?: any;
	client_name?: string;
	client_number?: any;
	color?: string;
	insurance_company?: any;
	insurance_policy_number?: any;
	invoice_date?: any;
	invoice_value?: any;
	make?: string;
	model?: string;
	motor?: any;
	name?: any;
	plate_number?: string;
	plate_number_state?: string;
	policy_item?: any;
	polution_test_level?: any;
	use_type?: any;
	status?: string;
	vehicle_type?: string;
	version?: string;
	vin?: string;
	year?: string;
	client_id?: string;
	tenant_id?: string;
	price?: string;
	currency_code?: string;
	[key: string]: any;
};

/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 types/entity.ts (YearStatus)
 *   B: Driverse_FE_Business   @ b96eda3 types/entity.ts (YearStatus)
 * @status identical
 */
export type YearStatus = {
	year: number;
	tenenciaStatus: string;
	refrendoStatus: string;
	[key: string]: any;
};

/**
 * Shape of a `document_inbox` row. Both apps selected the same field set in
 * `GET_PENDING_UPLOADS`/`GET_COMPLETED_UPLOADS`/`MARK_DOCS_AS_READY` (see the README for the original
 * GraphQL); this is that selection set expressed as a plain type instead of a query document.
 */
export type DocumentInboxRecord = {
	id: string;
	account_id?: string;
	assigned_to_id?: string;
	assigned_to_name?: string;
	bucket_name?: string;
	content_type?: string;
	document_type?: string;
	entity_type?: string;
	file_name?: string;
	file_size?: number;
	object_key?: string;
	status: string;
	uploaded_by?: string;
	form?: Record<string, any>;
	logs?: any;
	ocr_data?: {
		document_type?: { category?: string; entity?: string };
		extracted_data?: Record<string, any>;
		[key: string]: any;
	};
	confirmed_at?: string | null;
	created_at?: string;
	expires_at?: string;
	batch_id?: string;
	client_id?: string;
	file_id?: string;
	[key: string]: any;
};

export type DocumentTypeOption = { label: string; value: string };

/** The `detail.file.url` shape `useGetFileUrl` resolves for a bucket/fileName pair. */
export type FileUrlResponse = {
	detail?: { file?: { url?: string } };
	[key: string]: any;
};

/** The `detail.yearlyStatus` shape the ownership/tenencia/refrendo form reads years from. */
export type PaymentsStatusResponse = {
	detail?: { yearlyStatus?: YearStatus[] };
	[key: string]: any;
};

export type MarkAsReadyInput = {
	id: string;
	form: Record<string, any>;
	document_type: string;
	ocr_data: Record<string, any>;
	status: "READY";
};

export type UploadFilesResponse = { status: number; [key: string]: any };
export type ConfirmDocumentsResponse = { status: number; message?: string; [key: string]: any };

/**
 * Everything document-inbox used to reach outside itself for: the Apollo subscriptions/queries/mutation,
 * and the two REST calls (`/upload`, `/confirm`) it made through `useApiResource`. A host app implements
 * this once (Apollo + REST, as both apps did, or anything else) and passes it to `DocumentInboxProvider`.
 */
export type DocumentInboxDataSource = {
	/**
	 * Replaces `useSubscription(GET_PENDING_UPLOADS)`. Call `callback` with the current row set whenever
	 * it changes; return an unsubscribe function. The hook that consumes this treats "no callback yet" as
	 * loading, matching Apollo's initial `loading: true`.
	 */
	subscribePendingUploads: (clientId: string, callback: (records: DocumentInboxRecord[]) => void) => () => void;
	/** Replaces `useSubscription(GET_COMPLETED_UPLOADS)`. Same contract as `subscribePendingUploads`. */
	subscribeCompletedUploads: (clientId: string, callback: (records: DocumentInboxRecord[]) => void) => () => void;
	/** Replaces `useQuery(GET_CLIENT_VEHICLES)`. */
	fetchClientVehicles: (clientId: string) => Promise<VehicleType[]>;
	/** Replaces `useMutation(MARK_DOCS_AS_READY)`. */
	markAsReady: (input: MarkAsReadyInput) => Promise<any>;
	/** Replaces the `${FILE_BASE_API}/upload` POST made through `useApiResource`. */
	uploadFiles: (files: File[], clientId: string) => Promise<UploadFilesResponse>;
	/** Replaces the `${FILE_BASE_API}/confirm` POST made through `useApiResource`. */
	confirmDocuments: (ids: string[]) => Promise<ConfirmDocumentsResponse>;
	/** Replaces `useGetPaymentsStatus`'s `GET .../ownership-fee-payments/status` call. */
	fetchPaymentsStatus: (vehicleId: string) => Promise<PaymentsStatusResponse>;
	/**
	 * Transport for the library's `useGetFileUrl` (see `@/hooks/use-get-fileurl`), which the manual-entry
	 * document preview uses to resolve a bucket/fileName pair to a signed URL.
	 */
	apiResource: (request: ApiResourceRequest) => Promise<any>;
	/** Files endpoint passed to `useGetFileUrl`, e.g. `${uploadUrl}/api/v1/files`. */
	filesApiUrl: string;
	/**
	 * Overrides the module's default `DOCUMENT_TYPE_OPTIONS` (see `data/index.ts`). BD had four of the
	 * five types commented out as a runtime feature flag while QA had all five live; rather than bake in
	 * one app's flag state, the module ships the full set and lets a host app narrow it here.
	 */
	documentTypeOptions?: DocumentTypeOption[];
};
