/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/documents/document-inbox/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/documents/document-inbox/index.tsx
 * @status adopted-B
 * @notes B is the base: A had an extra `select-client` tab (gating the other three on
 *        `selectedClientId`) that this module does not port — see the module README. B's numberless tab
 *        labels, `showBackBtn={false}` header and the simplified `onTabChange` handler are all kept as-is.
 *        The `useDocumentInboxStore` zustand access is replaced by `useDocumentInbox()` — see
 *        `provider.tsx` for the store -> context seam.
 */

import { CircleLoading } from "@/components/loading";
import PageHeader from "@/components/page-header";
import PillTabs from "@/components/pill-tabs";
import { useTranslate } from "@/i18n/translate";
import type React from "react";
import { Suspense, lazy } from "react";

import InitialUpload from "./components/tabs/upload";
import { useDocumentInbox } from "./provider";

const PendingUploads = lazy(() => import("./components/tabs/pending"));
const CompletedUploads = lazy(() => import("./components/tabs/completed"));

export const DocumentInbox: React.FC = () => {
	const t = useTranslate();

	const { activeTab, setActiveTab, setViewMaanualEntry, setFormValue, resetFormValues } = useDocumentInbox();

	const tabItems = [
		{
			key: "upload",
			label: t("sys.documents.tabs.initialUpload"),
			children: <InitialUpload />,
		},
		{
			key: "pending",
			label: t("sys.documents.tabs.pendingUploads"),
			children: (
				<Suspense fallback={<CircleLoading />}>
					<PendingUploads />
				</Suspense>
			),
		},
		{
			key: "completed",
			label: t("sys.documents.tabs.completedUploads"),
			children: (
				<Suspense fallback={<CircleLoading />}>
					<CompletedUploads />
				</Suspense>
			),
		},
	];

	return (
		<section style={{ padding: "0" }}>
			<PageHeader
				title={t("sys.documents.inbox.title")}
				description={t("sys.documents.inbox.description")}
				showBackBtn={false}
			/>

			<div>
				<PillTabs
					items={tabItems}
					activeTab={activeTab}
					onTabChange={(value) => {
						setActiveTab(value);
						setViewMaanualEntry(false);
						setFormValue("vehicle", undefined);
						resetFormValues();
					}}
				/>
			</div>
		</section>
	);
};

export default DocumentInbox;

export { DocumentInboxProvider, useDocumentInbox } from "./provider";
export type { DocumentInboxContextValue, DocumentInboxFormValues, DocumentInboxProviderProps } from "./provider";
export { DOCUMENT_TYPE_OPTIONS } from "./data";
export type {
	ConfirmDocumentsResponse,
	DocumentInboxDataSource,
	DocumentInboxRecord,
	DocumentTypeOption,
	FileUrlResponse,
	MarkAsReadyInput,
	PaymentsStatusResponse,
	UploadFilesResponse,
	VehicleType,
	YearStatus,
} from "./types";
