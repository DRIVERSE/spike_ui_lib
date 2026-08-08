import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as XLSX from "xlsx";
import XlsxViewer from "./index";

/** Builds a real two-sheet workbook in memory, so nothing is mocked but the fetch. */
function workbookBuffer() {
	const wb = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(
		wb,
		XLSX.utils.aoa_to_sheet([
			["Plate", "Make"],
			["ABC-123", "Toyota"],
		]),
		"Vehicles",
	);
	XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["Policy"], ["POL-1"]]), "Policies");
	return XLSX.write(wb, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
}

const mockFetch = (impl: () => Promise<Partial<Response>>) =>
	vi.spyOn(globalThis, "fetch").mockImplementation(impl as unknown as typeof fetch);

afterEach(() => vi.restoreAllMocks());

describe("XlsxViewer", () => {
	it("parses a workbook and renders the first sheet's headers and rows", async () => {
		mockFetch(async () => ({ ok: true, arrayBuffer: async () => workbookBuffer() }));

		render(<XlsxViewer url="https://example.com/book.xlsx" />);

		await waitFor(() => expect(screen.getByText("Plate")).toBeInTheDocument());
		expect(screen.getByText("ABC-123")).toBeInTheDocument();
		expect(screen.getByText("Toyota")).toBeInTheDocument();
	});

	it("switches sheets", async () => {
		mockFetch(async () => ({ ok: true, arrayBuffer: async () => workbookBuffer() }));

		render(<XlsxViewer url="https://example.com/book.xlsx" />);
		await waitFor(() => expect(screen.getByText("Plate")).toBeInTheDocument());

		await userEvent.click(screen.getByText("Policies"));
		await waitFor(() => expect(screen.getByText("POL-1")).toBeInTheDocument());
		expect(screen.queryByText("ABC-123")).not.toBeInTheDocument();
	});

	it("surfaces a fetch failure instead of rendering an empty grid", async () => {
		mockFetch(async () => ({ ok: false, arrayBuffer: async () => new ArrayBuffer(0) }));

		render(<XlsxViewer url="https://example.com/missing.xlsx" />);
		await waitFor(() => expect(screen.getByText(/Failed to fetch file/i)).toBeInTheDocument());
	});

	it("does not fetch without a url", () => {
		const fetchSpy = mockFetch(async () => ({ ok: true, arrayBuffer: async () => workbookBuffer() }));
		render(<XlsxViewer url="" />);
		expect(fetchSpy).not.toHaveBeenCalled();
	});
});
