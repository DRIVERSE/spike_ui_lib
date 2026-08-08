import type { Meta, StoryObj } from "@storybook/react";
import type { ColDef } from "ag-grid-community";
import DataTable from "./index";

/**
 * The seven vehicle columns Autocredit hard-coded inside the component. They are demo data here — the
 * library ships no domain columns.
 */
export const VEHICLE_COLUMNS: ColDef[] = [
	{ field: "client_name", width: 300, headerName: "Client" },
	{ field: "plate_number", headerName: "Plate Number" },
	{ field: "motor" },
	{ field: "insurance_company", width: 150, headerName: "Insurance Company" },
	{ field: "model" },
	{ field: "make", width: 100 },
	{ field: "invoice_value", headerName: "Invoice Value", width: 150 },
];

export const VEHICLE_ROWS = [
	{
		client_name: "Ada Lovelace",
		plate_number: "ABC-123",
		motor: "2.4L",
		insurance_company: "Qualitas",
		model: "Hilux",
		make: "Toyota",
		invoice_value: 420000,
	},
	{
		client_name: "Alan Turing",
		plate_number: "XYZ-987",
		motor: "3.2L",
		insurance_company: "GNP",
		model: "Ranger",
		make: "Ford",
		invoice_value: 510000,
	},
];

const meta = {
	title: "DataTable/AgGrid",
	component: DataTable,
	parameters: { layout: "padded" },
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		rowData: VEHICLE_ROWS,
		columnDefs: VEHICLE_COLUMNS,
		height: 320,
	},
};

export const Loading: Story = {
	args: { rowData: [], columnDefs: VEHICLE_COLUMNS, loading: true, height: 320 },
};

export const Empty: Story = {
	args: { rowData: [], columnDefs: VEHICLE_COLUMNS, height: 240 },
};
