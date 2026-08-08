import type { Meta, StoryObj } from "@storybook/react";
import type { ReactNode } from "react";
import { useState } from "react";
import { ComplianceDocumentSection } from "./compliance-table";
import { useCirculationConfig } from "./configs/circulation";
import { useTenureConfig } from "./configs/tenure";
import { useVerificationConfig } from "./configs/verification";
import { VehicleComplianceProvider } from "./provider";
import type {
	ComplianceNavigation,
	ComplianceVehicle,
	OwnershipPaymentRecord,
	OwnershipPaymentStatus,
	VehicleComplianceDataSource,
} from "./types";
import { VehicleCompliance } from "./vehicle-compliance";

/** Vehicle payload shape both apps' GraphQL/REST layers return, minus the backend. */
export const MOCK_VEHICLE: ComplianceVehicle = {
	id: "veh-1",
	plate_number: "ABC-123",
	plate_number_state: "Jalisco",
	currency_code: "MXN",
	pollution_test_required: true,
	circulation_cards: [
		{
			id: "cc-1",
			card_number: "CC-2026-001",
			issue_date: "2026-01-15",
			expiry_date: "2027-01-15",
			status: "ACTIVE",
			file: { bucket_name: "compliance", file_name: "circulation-card.pdf", content_type: "application/pdf" },
		},
		{ id: "cc-0", card_number: "CC-2025-441", issue_date: "2025-01-10", expiry_date: "2026-01-10", status: "EXPIRED" },
	],
	pollution_tests: [
		{
			id: "pt-1",
			hologram: "00",
			verification_sticker: "V-2026-33",
			test_date: "2026-02-01T00:00:00Z",
			expiry_date: "2028-02-01T00:00:00Z",
			status: "approved",
			file: { bucket_name: "compliance", file_name: "pollution-test.jpg", content_type: "image/jpeg" },
		},
	],
};

/** No documents on file yet — drives the "Missing" branch of the status cards. */
export const EMPTY_VEHICLE: ComplianceVehicle = {
	id: "veh-2",
	plate_number: "NEW-001",
	plate_number_state: "Ciudad de México",
	currency_code: "MXN",
	circulation_cards: [],
	pollution_tests: [],
};

const MOCK_PAYMENT_STATUS: OwnershipPaymentStatus = {
	detail: {
		overallStatus: { ownershipFeeStatus: "PAID", tenenciaStatus: "PAID", refrendoStatus: "NO_PAYMENT" },
		yearlyStatus: [
			{ year: 2026, tenenciaStatus: "PAID", refrendoStatus: "NOT_PAID" },
			{ year: 2025, tenenciaStatus: "PAID", refrendoStatus: "PAID" },
		],
		tenenciaExemption: { isExempt: false },
	},
};

const MOCK_PAYMENT_HISTORY: OwnershipPaymentRecord[] = [
	{ id: "p1", fiscal_year: 2025, payment_type: "TENENCIA", amount: 2450, payment_date: "2025-03-20" },
	{ id: "p2", fiscal_year: 2025, payment_type: "REFRENDO", amount: 850, payment_date: "2025-03-20" },
];

/** Everything the module needs from the app: async data operations. See types.ts for the full contract. */
export const MOCK_DATA_SOURCE: VehicleComplianceDataSource = {
	getOwnershipPaymentStatus: async () => MOCK_PAYMENT_STATUS,
	getOwnershipPaymentHistory: async () => MOCK_PAYMENT_HISTORY,
	updateCirculationCardFile: async () => {},
	updatePollutionTestFile: async () => {},
	addCirculationCard: async () => {},
	addPollutionTest: async () => {},
	addManualOwnershipPayment: async () => {},
	confirmBenefitPayment: async () => {},
	deleteCirculationCard: async () => {},
	uploadComplianceDocument: async () => ({ files: [{ id: "file-1", fileName: "upload.pdf" }] }),
	deleteComplianceFile: async () => {},
	getFileUrl: async ({ fileName }) => ({ url: "https://example.com/preview.pdf", name: fileName }),
};

export const MOCK_NAVIGATION: ComplianceNavigation = { push: () => {}, back: () => {}, replace: () => {} };

export const MOCK_PERMISSIONS = [
	"business.action.add_circulation",
	"business.action.edit_circulation",
	"business.action.add_pollution_test",
	"business.action.edit_pollution_test",
	"business.action.add_tenure_payment",
	"business.action.add_tenure_renewal_payment",
	"business.action.edit_tenure_renewal_payment",
];

export const MockComplianceProvider = ({
	children,
	dataSource,
	permissions = MOCK_PERMISSIONS,
}: {
	children: ReactNode;
	dataSource?: Partial<VehicleComplianceDataSource>;
	permissions?: string[];
}) => (
	<VehicleComplianceProvider
		dataSource={{ ...MOCK_DATA_SOURCE, ...dataSource }}
		navigation={MOCK_NAVIGATION}
		permissions={permissions}
		basePath="/vehicle-park/vehicles"
	>
		{children}
	</VehicleComplianceProvider>
);

const CirculationSectionInner = ({ vehicle = MOCK_VEHICLE }: { vehicle?: ComplianceVehicle }) => {
	const config = useCirculationConfig(vehicle);
	return <ComplianceDocumentSection {...config} />;
};

const VerificationSectionInner = ({ vehicle = MOCK_VEHICLE }: { vehicle?: ComplianceVehicle }) => {
	const config = useVerificationConfig(vehicle);
	return <ComplianceDocumentSection {...config} />;
};

const TenureSectionInner = ({ vehicle = MOCK_VEHICLE }: { vehicle?: ComplianceVehicle }) => {
	const config = useTenureConfig(vehicle);
	return <ComplianceDocumentSection {...config} />;
};

function VehicleComplianceDemo({ vehicle = MOCK_VEHICLE }: { vehicle?: ComplianceVehicle }) {
	const [tab, setTab] = useState("verification");
	return (
		<MockComplianceProvider>
			<VehicleCompliance vehicle={vehicle} activeTab={tab} onTabChange={setTab} />
		</MockComplianceProvider>
	);
}

const meta = {
	title: "Features/VehicleCompliance",
	component: VehicleComplianceDemo,
	parameters: { layout: "padded" },
} satisfies Meta<typeof VehicleComplianceDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The main tabbed entry point — the direct port of both apps' `compliance/index.tsx`. */
export const Default: Story = {};

/** Same tab shell, no documents on file yet. */
export const EmptyVehicle: Story = { args: { vehicle: EMPTY_VEHICLE } };

/**
 * The consolidated `compliance-table/` driving the circulation ("Circulation Card") kind — one of the
 * three near-identical sub-trees the task asked to fold into a single parameterized component.
 */
export const CirculationSection: Story = {
	render: () => (
		<MockComplianceProvider>
			<CirculationSectionInner />
		</MockComplianceProvider>
	),
};

/** Same `ComplianceDocumentSection`, driven by the verification ("Pollution Test") kind's config. */
export const VerificationSection: Story = {
	render: () => (
		<MockComplianceProvider>
			<VerificationSectionInner />
		</MockComplianceProvider>
	),
};

/**
 * Same `ComplianceDocumentSection` again, driven by the tenure/ownership-fee kind's config — the
 * dual-chip (tenencia + refrendo) status card plus the tenure-only yearly status grid.
 */
export const TenureSection: Story = {
	render: () => (
		<MockComplianceProvider>
			<TenureSectionInner />
		</MockComplianceProvider>
	),
};
