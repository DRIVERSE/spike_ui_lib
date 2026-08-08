import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import { DocumentInbox } from "./index";
import { DocumentInboxProvider } from "./provider";
import type { DocumentInboxDataSource, DocumentInboxRecord, VehicleType } from "./types";

/** A fleet the mock vehicles/documents below reference — the shape `fetchClientVehicles` would resolve. */
export const MOCK_VEHICLES: VehicleType[] = [
	{
		id: "vehicle-1",
		alias: "Hilux 01",
		make: "Toyota",
		model: "Hilux",
		year: "2022",
		vin: "3TMCZ5AN0KM123456",
		plate_number: "ABC-123",
		client_name: "Ada Lovelace",
		currency_code: "MXN",
	},
	{
		id: "vehicle-2",
		alias: "Ranger 02",
		make: "Ford",
		model: "Ranger",
		year: "2021",
		vin: "1FTER4EH8MLD98765",
		plate_number: "XYZ-987",
		client_name: "Alan Turing",
		currency_code: "MXN",
	},
];

/** The rows `subscribePendingUploads` pushes — mirrors a `document_inbox` subscription payload. */
export const MOCK_PENDING_RECORDS: DocumentInboxRecord[] = [
	{
		id: "doc-1",
		file_name: "insurance-policy.pdf",
		status: "NEEDS_ATTENTION",
		document_type: "unknown",
		content_type: "application/pdf",
		bucket_name: "documents",
		created_at: "2026-08-05T10:00:00Z",
		form: {},
		ocr_data: { document_type: { category: "unknown" }, extracted_data: { vin: MOCK_VEHICLES[0].vin } },
	},
	{
		id: "doc-2",
		file_name: "pollution-test.jpg",
		status: "READY",
		document_type: "pollution_test",
		content_type: "image/jpeg",
		bucket_name: "documents",
		created_at: "2026-08-06T09:30:00Z",
		form: {},
		ocr_data: { document_type: { category: "pollution_test" }, extracted_data: { vin: MOCK_VEHICLES[1].vin } },
	},
];

/** The rows `subscribeCompletedUploads` pushes — same shape, already `CONFIRMED`. */
export const MOCK_COMPLETED_RECORDS: DocumentInboxRecord[] = [
	{
		id: "doc-0",
		file_name: "circulation-card.pdf",
		status: "CONFIRMED",
		document_type: "circulation",
		content_type: "application/pdf",
		bucket_name: "documents",
		confirmed_at: "2026-08-01T12:00:00Z",
		form: { vehicle_id: MOCK_VEHICLES[0].id },
		logs: { success: true, data: { status: 200, message: "Saved" } },
		ocr_data: { document_type: { category: "circulation" }, extracted_data: { vin: MOCK_VEHICLES[0].vin } },
	},
];

/**
 * In-memory `DocumentInboxDataSource` — the shape the apps' Apollo/REST wiring produced, minus the
 * backend. Exported so `document-inbox.test.tsx` can assert against the same instance the stories render.
 */
export const mockDataSource: DocumentInboxDataSource = {
	subscribePendingUploads: fn((_clientId: string, callback: (records: DocumentInboxRecord[]) => void) => {
		callback(MOCK_PENDING_RECORDS);
		return () => {};
	}),
	subscribeCompletedUploads: fn((_clientId: string, callback: (records: DocumentInboxRecord[]) => void) => {
		callback(MOCK_COMPLETED_RECORDS);
		return () => {};
	}),
	fetchClientVehicles: fn(async () => MOCK_VEHICLES),
	markAsReady: fn(async () => ({ status: 200 })),
	uploadFiles: fn(async () => ({ status: 200 })),
	confirmDocuments: fn(async () => ({ status: 202, message: "Documents confirmed successfully!" })),
	fetchPaymentsStatus: fn(async () => ({
		detail: { yearlyStatus: [{ year: 2024, tenenciaStatus: "PENDING", refrendoStatus: "PENDING" }] },
	})),
	apiResource: fn(async () => ({ detail: { file: { url: "https://example.com/insurance-policy.pdf" } } })),
	filesApiUrl: "https://example.com/api/v1/files",
};

function DocumentInboxDemo({ initialActiveTab }: { initialActiveTab?: string }) {
	return (
		<DocumentInboxProvider
			dataSource={mockDataSource}
			clientId="023ff72a-b7d1-409e-be91-2fd0991eb349"
			initialActiveTab={initialActiveTab}
		>
			<DocumentInbox />
		</DocumentInboxProvider>
	);
}

const meta = {
	title: "Features/DocumentInbox",
	component: DocumentInboxDemo,
	parameters: { layout: "fullscreen" },
} satisfies Meta<typeof DocumentInboxDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The upload tab — drop area, feature cards, "how it works" (shown while no files are selected). */
export const Upload: Story = {};

/** The pending-review tab — stat cards, the pending-uploads table, and the confirm/new-batch actions. */
export const PendingReview: Story = { args: { initialActiveTab: "pending" } };

/** The completed tab — the same table in read-only mode, sourced from `subscribeCompletedUploads`. */
export const Completed: Story = { args: { initialActiveTab: "completed" } };
