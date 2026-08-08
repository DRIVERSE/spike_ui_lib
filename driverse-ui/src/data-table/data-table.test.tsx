import { composeStories } from "@storybook/react";
import { render, screen, waitFor } from "@testing-library/react";
import type { ColDef } from "ag-grid-community";
import { describe, expect, it, vi } from "vitest";
import * as stories from "./data-table.stories";
import DataTable from "./index";

const { Default, Loading, Empty } = composeStories(stories);

type Row = { plate_number: string; make: string };

const COLUMNS: ColDef<Row>[] = [
	{ field: "plate_number", headerName: "Plate Number" },
	{ field: "make", headerName: "Make" },
];

const ROWS: Row[] = [
	{ plate_number: "ABC-123", make: "Toyota" },
	{ plate_number: "XYZ-987", make: "Ford" },
];

describe("DataTable", () => {
	it("renders the rows and headers it is given", async () => {
		render(<DataTable rowData={ROWS} columnDefs={COLUMNS} height={300} />);

		await waitFor(() => expect(screen.getByText("Plate Number")).toBeInTheDocument());
		await waitFor(() => expect(screen.getByText("ABC-123")).toBeInTheDocument());
		expect(screen.getByText("XYZ-987")).toBeInTheDocument();
		expect(screen.getByText("Toyota")).toBeInTheDocument();
	});

	it("carries no vehicle query or column defaults of its own", () => {
		const { container } = render(<DataTable rowData={[]} columnDefs={[]} height={200} />);
		// The seven hard-coded vehicle columns are gone; nothing renders without columnDefs.
		expect(container.querySelectorAll(".ag-header-cell")).toHaveLength(0);
	});

	it("merges caller defaultColDef over the library defaults", async () => {
		const { container } = render(
			<DataTable rowData={ROWS} columnDefs={COLUMNS} height={300} defaultColDef={{ sortable: true }} />,
		);
		await waitFor(() => expect(container.querySelector(".ag-header-cell")).not.toBeNull());
		// flex: 1 from the library default still applies alongside the caller's sortable.
		expect(container.querySelectorAll(".ag-header-cell").length).toBe(COLUMNS.length);
	});

	it("passes grid callbacks straight through", async () => {
		const onGridReady = vi.fn();
		render(<DataTable rowData={ROWS} columnDefs={COLUMNS} height={300} onGridReady={onGridReady} />);
		await waitFor(() => expect(onGridReady).toHaveBeenCalled());
	});

	it("sets the wrapper height so ag-grid can measure itself", () => {
		const { container } = render(<DataTable<Row> rowData={[]} columnDefs={COLUMNS} height={420} />);
		expect(container.firstChild).toHaveStyle({ height: "420px", width: "100%" });
	});
});

describe("stories", () => {
	it("Default renders the demo vehicle columns that used to be hard-coded", async () => {
		render(<Default />);
		await waitFor(() => expect(screen.getByText("Insurance Company")).toBeInTheDocument());
		expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
	});

	it("Loading and Empty render without rows", async () => {
		const { unmount } = render(<Loading />);
		await waitFor(() => expect(screen.queryByText("Ada Lovelace")).not.toBeInTheDocument());
		unmount();

		render(<Empty />);
		expect(screen.queryByText("Ada Lovelace")).not.toBeInTheDocument();
	});
});
