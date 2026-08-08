import { composeStories } from "@storybook/react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import * as stories from "./document-inbox.stories";

const { Upload, PendingReview, Completed, mockDataSource, MOCK_PENDING_RECORDS, MOCK_COMPLETED_RECORDS } = {
	...composeStories(stories),
	mockDataSource: stories.mockDataSource,
	MOCK_PENDING_RECORDS: stories.MOCK_PENDING_RECORDS,
	MOCK_COMPLETED_RECORDS: stories.MOCK_COMPLETED_RECORDS,
};

afterEach(() => vi.clearAllMocks());

describe("stories", () => {
	it.each([
		["Upload", Upload],
		["PendingReview", PendingReview],
		["Completed", Completed],
	])("%s renders", async (_name, Story) => {
		const { container } = render(<Story />);
		await waitFor(() => expect(container.firstChild).not.toBeNull());
	});
});

describe("DocumentInbox", () => {
	it("starts on the upload tab and shows the drop area", () => {
		render(<Upload />);
		const uploadTab = screen.getByRole("tab", { name: "Initial upload" });
		expect(uploadTab).toHaveAttribute("aria-selected", "true");
	});

	it("switches to the pending tab and lists the mocked pending documents", async () => {
		render(<Upload />);

		const tabs = screen.getAllByRole("tab");
		const pendingTab = tabs.find((tab) => /pending/i.test(tab.textContent ?? ""));
		expect(pendingTab).toBeTruthy();

		await userEvent.click(pendingTab as HTMLElement);

		await waitFor(() => {
			expect(mockDataSource.subscribePendingUploads).toHaveBeenCalled();
		});
		await waitFor(() => {
			expect(screen.getByText(MOCK_PENDING_RECORDS[0].file_name as string)).toBeInTheDocument();
		});
	});

	it("renders the completed tab from subscribeCompletedUploads and can open its logs", async () => {
		render(<Completed />);

		await waitFor(() => {
			expect(mockDataSource.subscribeCompletedUploads).toHaveBeenCalled();
		});
		await waitFor(() => {
			expect(screen.getByText(MOCK_COMPLETED_RECORDS[0].file_name as string)).toBeInTheDocument();
		});

		const row = screen.getByText(MOCK_COMPLETED_RECORDS[0].file_name as string).closest("tr") as HTMLElement;
		const logsButton = within(row).getByRole("button");
		await userEvent.click(logsButton);

		expect(await screen.findByText("Response Logs")).toBeInTheDocument();
	});

	it("confirms ready documents through the mocked data source", async () => {
		render(<PendingReview />);

		await waitFor(() => {
			expect(mockDataSource.subscribePendingUploads).toHaveBeenCalled();
		});

		const confirmButton = await screen.findByRole("button", { name: /confirm/i });
		await userEvent.click(confirmButton);

		await waitFor(() => {
			expect(mockDataSource.confirmDocuments).toHaveBeenCalledWith(["doc-2"]);
		});
	});
});
