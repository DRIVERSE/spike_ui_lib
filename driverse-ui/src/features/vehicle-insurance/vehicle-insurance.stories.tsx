import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import EditInsuranceForm from "./edit";
import { InsuranceHistoryTable } from "./history/insurance-history-table";
import { VehicleInsuranceProvider } from "./provider";
import type {
	AddPolicyModalContext,
	FilePreviewContext,
	InsurancePolicy,
	UploadDocumentResult,
	Vehicle,
	VehicleInsuranceDataSource,
} from "./types";
import { VehicleInsurance } from "./vehicle-insurance";

/** A resolved insurance policy — the shape both apps' `GetVehicleById` query returns for `insurance_policies[0]`. */
export const MOCK_POLICY: InsurancePolicy = {
	id: "policy-1",
	vehicle_id: "vehicle-1",
	client_id: "client-1",
	status: "ACTIVE",
	insurance_company: "Quálitas, Compañía de Seguros, S.A. de C.V.",
	policy_number: "QC-2026-004821",
	policyholder_name: "Flotas del Norte S.A. de C.V.",
	rfc: "FDN920415AB1",
	address: "Av. Insurgentes Sur 1602, CDMX",
	clause: "Comprehensive",
	issue_date: "2026-01-15T00:00:00Z",
	coverage_start: "2026-01-15T00:00:00Z",
	coverage_end: "2026-12-15T00:00:00Z",
	file: { bucket_name: "insurance-docs", file_name: "policy-QC-2026-004821.pdf", content_type: "application/pdf" },
};

export const MOCK_VEHICLE: Vehicle = {
	id: "vehicle-1",
	alias: "Hilux 01",
	make: "Toyota",
	client_id: "client-1",
	insurance_policies: [MOCK_POLICY],
};

/** Drives every write in the module through a fake in-memory backend — no GraphQL/react-query/apollo. */
export const MOCK_DATA_SOURCE: VehicleInsuranceDataSource = {
	createPolicy: async (payload) => {
		console.log("[mock] createPolicy", payload);
		return { status: 200, message: "Insurance created successfully" };
	},
	updatePolicy: async (id, payload) => {
		console.log("[mock] updatePolicy", id, payload);
		return { status: 200, message: "Insurance policy updated successfully" };
	},
	attachPolicyFile: async (policyId, fileId) => {
		console.log("[mock] attachPolicyFile", policyId, fileId);
		return { status: 200 };
	},
	deletePolicyFile: async (payload) => {
		console.log("[mock] deletePolicyFile", payload);
		return { status: 200, detail: { successCount: 1, failureCount: 0 } };
	},
	uploadDocument: async (payload, file): Promise<UploadDocumentResult> => {
		console.log("[mock] uploadDocument", payload, file.name);
		return { status: 200, detail: { files: [{ id: "uploaded-file-1" }] } };
	},
	refetchVehicle: async () => {
		console.log("[mock] refetchVehicle");
	},
};

const noop = () => {};

function AddPolicyModalStandIn({ open, onOpenChange }: AddPolicyModalContext) {
	if (!open) return null;
	return (
		<div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "grid", placeItems: "center" }}>
			<div style={{ background: "#fff", padding: 24, borderRadius: 8, minWidth: 320 }}>
				<p>Add Insurance Policy modal (app-owned)</p>
				<button type="button" onClick={() => onOpenChange(false)}>
					Close
				</button>
			</div>
		</div>
	);
}

function FilePreviewStandIn({ open, onOpenChange, fileName }: FilePreviewContext) {
	if (!open) return null;
	return (
		<div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "grid", placeItems: "center" }}>
			<div style={{ background: "#fff", padding: 24, borderRadius: 8, minWidth: 320 }}>
				<p>Preview: {fileName || "(no file)"}</p>
				<button type="button" onClick={() => onOpenChange(false)}>
					Close
				</button>
			</div>
		</div>
	);
}

function VehicleInsuranceDemo({
	loading = false,
	permissions = ["business.action.add_insurance_policy", "business.action.edit_insurance_policy"],
}: { loading?: boolean; permissions?: string[] }) {
	return (
		<VehicleInsuranceProvider
			dataSource={MOCK_DATA_SOURCE}
			navigation={{ push: (path) => console.log("[mock] navigation.push", path), back: noop }}
			clientId="client-1"
			vehicleId={MOCK_VEHICLE.id}
			userProfile={{
				clientName: "Flotas del Norte S.A. de C.V.",
				rfc: "FDN920415AB1",
				legalCompanyAddress: "Av. Insurgentes Sur 1602, CDMX",
			}}
			permissions={permissions}
			renderAddPolicyModal={(ctx) => <AddPolicyModalStandIn {...ctx} />}
			renderFilePreview={(ctx) => <FilePreviewStandIn {...ctx} />}
		>
			<VehicleInsurance vehicleData={MOCK_VEHICLE} loading={loading} />
		</VehicleInsuranceProvider>
	);
}

function EditInsuranceFormDemo() {
	const [open, setOpen] = useState(true);
	return (
		<VehicleInsuranceProvider
			dataSource={MOCK_DATA_SOURCE}
			navigation={{ push: noop, back: noop }}
			clientId="client-1"
			vehicleId={MOCK_VEHICLE.id}
			permissions={["business.action.edit_insurance_policy"]}
		>
			<EditInsuranceForm open={open} onOpen={setOpen} data={MOCK_POLICY} />
		</VehicleInsuranceProvider>
	);
}

function InsuranceHistoryDemo() {
	return (
		<VehicleInsuranceProvider
			dataSource={MOCK_DATA_SOURCE}
			navigation={{ push: noop, back: noop }}
			clientId="client-1"
			vehicleId={MOCK_VEHICLE.id}
			renderFilePreview={(ctx) => <FilePreviewStandIn {...ctx} />}
		>
			<InsuranceHistoryTable
				data={[MOCK_POLICY, { ...MOCK_POLICY, id: "policy-2", status: "EXPIRED", policy_number: "QC-2025-001177" }]}
			/>
		</VehicleInsuranceProvider>
	);
}

const meta = {
	title: "Features/VehicleInsurance",
	component: VehicleInsuranceDemo,
	parameters: { layout: "padded" },
} satisfies Meta<typeof VehicleInsuranceDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The tabbed Overview/History shell, wired to a fully mocked `VehicleInsuranceDataSource`. */
export const Overview: Story = {};

export const Loading: Story = { args: { loading: true } };

/** No `business.action.add_insurance_policy`/`edit_insurance_policy` codes — the "Add Policy"/"Edit" buttons hide. */
export const WithoutPermissions: Story = { args: { permissions: [] } };

/** The standalone edit modal, pre-filled from `MOCK_POLICY`. */
export const Edit: StoryObj<typeof EditInsuranceFormDemo> = {
	render: () => <EditInsuranceFormDemo />,
};

/** The insurance history table on its own, outside the tab shell. */
export const History: StoryObj<typeof InsuranceHistoryDemo> = {
	render: () => <InsuranceHistoryDemo />,
};
