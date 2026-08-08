/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/store/document-inbox-store.ts
 *   B: Driverse_FE_Business   @ b96eda3 src/store/document-inbox-store.ts
 * @status decoupled
 * @notes Both apps kept this as a global `zustand` store (`useDocumentInboxStore`) — a peer the library
 *        does not take. Its state and actions are hoisted into a React context instead: same field names,
 *        same setters, so every hook below reads it exactly as it read the store. B is the base (A still
 *        carried `selectedClientId`/`setSelectedClientId` for the `select-client` tab this module drops —
 *        see the module README). `selectedEmpInfo` is dropped from `formValues`: it was typed but never
 *        read or written anywhere in document-inbox, in either app.
 *
 *        `useDocumentInboxStore` also isn't the module's only external coupling: `useClientId()` (a
 *        parameterless app hook backed by keycloak) resolved the acting client id in every one of this
 *        module's hooks, always with the same `?? "023ff72a-b7d1-409e-be91-2fd0991eb349"` fallback. The
 *        library's `useClientId` (`@/hooks/use-client-id`) takes the JWT as a parameter instead, so the
 *        provider takes an optional `token` and calls it — or a caller can skip the JWT entirely and pass
 *        `clientId` directly (what this module's own stories/tests do).
 *
 *        Several of this module's hooks (`useOwnershipForm`, `useMannualFormActions`, `usePendingAction`)
 *        wrap `dataSource` calls in `@tanstack/react-query`'s `useQuery`, which needs a `QueryClient` in
 *        context. Both apps already had one at the root for their own unrelated queries; rather than
 *        require every consumer to know that detail, this provider carries its own `QueryClient` (lazily
 *        constructed once per mount), the same way `src/hooks/hooks.test.tsx` wraps hooks that need one.
 *        Nesting under an app's own `QueryClientProvider` is harmless — the inner one just shadows it for
 *        this subtree.
 */

import { useClientId } from "@/hooks/use-client-id";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { CheckboxProps } from "antd";
import type { Dayjs } from "dayjs";
import { type ReactNode, createContext, useCallback, useContext, useMemo, useState } from "react";
import type { DocumentInboxDataSource, VehicleType } from "./types";

/** Matches the fallback every hook in both apps used when `useClientId()` resolved to nothing. */
const FALLBACK_CLIENT_ID = "023ff72a-b7d1-409e-be91-2fd0991eb349";

export type DocumentInboxFormValues = {
	// circulation
	card_number?: string;
	issue_date?: Dayjs | string | null;
	expiry_date?: Dayjs | string | null;
	permanentCard?: boolean;
	// pollution test
	hollogram?: string;
	test_date?: string;
	// insurance
	unique_policy_no?: string;
	policy_issue_date?: Dayjs | string | null;
	company_name?: string;
	item?: string;
	coverage_start_date?: Dayjs | string | null;
	coverage_end_date?: Dayjs | string | null;
	policy_holder_name?: string;
	rfc?: string;
	address?: string;
	// vehicle
	vehicle?: string;
	selectedVehicle?: VehicleType | null;
};

type FormValueKey = keyof DocumentInboxFormValues;
type FormValueValue = string | Dayjs | null | boolean | number | CheckboxProps["onChange"] | VehicleType | undefined;

export type DocumentInboxContextValue = {
	dataSource: DocumentInboxDataSource;
	clientId: string;
	/** Renders the preview for the manually-reviewed document — see `ViewManualForm`'s doc comment. */
	renderDocumentPreview?: (context: { url: string | null; extension: string; loading: boolean }) => ReactNode;
	/** Called instead of navigating when a completed-uploads row is clicked — the app owns routing. */
	onViewVehicle?: (vehicleId: string) => void;

	activeTab: string;
	setActiveTab: (tab: string) => void;
	resolvedDocType: string;
	setResolvedDocType: (docType: string) => void;
	uploadedFiles: File[];
	setUploadedFiles: (files: File[]) => void;
	viewMaanualEntry: boolean;
	setViewMaanualEntry: (view: boolean) => void;
	columnValues: Record<string, any>;
	setColumnValues: (values: Record<string, any>) => void;
	formValues: DocumentInboxFormValues;
	setFormValue: (key: FormValueKey, value: FormValueValue) => void;
	resetFormValues: () => void;
};

const DocumentInboxContext = createContext<DocumentInboxContextValue | null>(null);

export type DocumentInboxProviderProps = {
	dataSource: DocumentInboxDataSource;
	/** JWT carrying the hasura `x-hasura-client-id` claim, decoded via the library's `useClientId`. */
	token?: string | null;
	/** Explicit client id. Takes priority over `token` — the simplest path for tests/Storybook. */
	clientId?: string;
	renderDocumentPreview?: DocumentInboxContextValue["renderDocumentPreview"];
	onViewVehicle?: (vehicleId: string) => void;
	/**
	 * Which tab `DocumentInbox` opens on. Both apps always started on `"upload"` (BD hard-coded it as the
	 * store's `initialState`); this is a minor addition beyond that so a host app can deep-link straight
	 * into `"pending"`/`"completed"` — also handy for this module's own stories.
	 */
	initialActiveTab?: string;
	children: ReactNode;
};

export function DocumentInboxProvider({
	dataSource,
	token,
	clientId: clientIdProp,
	renderDocumentPreview,
	onViewVehicle,
	initialActiveTab = "upload",
	children,
}: DocumentInboxProviderProps) {
	const tokenDerivedClientId = useClientId(token ?? null);
	const clientId = clientIdProp ?? tokenDerivedClientId ?? FALLBACK_CLIENT_ID;

	const [queryClient] = useState(() => new QueryClient());
	const [activeTab, setActiveTab] = useState(initialActiveTab);
	const [resolvedDocType, setResolvedDocType] = useState("");
	const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
	const [viewMaanualEntry, setViewMaanualEntry] = useState(false);
	const [columnValues, setColumnValues] = useState<Record<string, any>>({});
	const [formValues, setFormValues] = useState<DocumentInboxFormValues>({});

	const setFormValue = useCallback((key: FormValueKey, value: FormValueValue) => {
		setFormValues((prev) => ({ ...prev, [key]: value }));
	}, []);

	const resetFormValues = useCallback(() => setFormValues({}), []);

	const value = useMemo<DocumentInboxContextValue>(
		() => ({
			dataSource,
			clientId,
			renderDocumentPreview,
			onViewVehicle,
			activeTab,
			setActiveTab,
			resolvedDocType,
			setResolvedDocType,
			uploadedFiles,
			setUploadedFiles,
			viewMaanualEntry,
			setViewMaanualEntry,
			columnValues,
			setColumnValues,
			formValues,
			setFormValue,
			resetFormValues,
		}),
		[
			dataSource,
			clientId,
			renderDocumentPreview,
			onViewVehicle,
			activeTab,
			resolvedDocType,
			uploadedFiles,
			viewMaanualEntry,
			columnValues,
			formValues,
			setFormValue,
			resetFormValues,
		],
	);

	return (
		<QueryClientProvider client={queryClient}>
			<DocumentInboxContext.Provider value={value}>{children}</DocumentInboxContext.Provider>
		</QueryClientProvider>
	);
}

export function useDocumentInbox(): DocumentInboxContextValue {
	const ctx = useContext(DocumentInboxContext);
	if (!ctx) {
		throw new Error("useDocumentInbox must be used within a DocumentInboxProvider");
	}
	return ctx;
}
