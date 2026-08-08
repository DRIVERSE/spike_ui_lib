import {
	HEADER_HEIGHT,
	MULTI_TABS_HEIGHT,
	NAV_COLLAPSED_WIDTH,
	NAV_HORIZONTAL_HEIGHT,
	NAV_WIDTH,
} from "@/tokens/layout-constants";
import { composeStories } from "@storybook/react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import ExportButton from "./export-button";
import HeaderSimple from "./header-simple";
import * as stories from "./interactive.stories";
import LocalePicker from "./locale-picker";
import { NumberInput } from "./number-input";
import PageHeader from "./page-header";
import PillTabs from "./pill-tabs";
import { SearchableSelect } from "./searchable-select";
import { StyledTabs } from "./styled-tabs";
import TableTabs from "./table-tab";

const { Inputs, Tabs, Headers, Modals, Export, Locales, Inbox, MarkdownContent, ErrorState } = composeStories(stories);

// heading-order is a document-level rule; these galleries deliberately mix unrelated components.
const GALLERY_AXE_OPTIONS = { rules: { "heading-order": { enabled: false } } };

const TAB_ITEMS = [
	{ key: "all", label: "All", children: <p>All content</p> },
	{ key: "active", label: "Active", children: <p>Active content</p> },
	{ key: "archived", label: "Archived", children: <p>Archived content</p>, disabled: true },
];

describe("NumberInput", () => {
	// The component is controlled: displayValue is derived from `value`, so a harness holds the state.
	function NumberInputHarness({ onChange }: { onChange: (value: string) => void }) {
		const [value, setValue] = useState("");
		return (
			<NumberInput
				value={value}
				placeholder="Amount"
				aria-label="Amount"
				onChange={(next) => {
					setValue(next);
					onChange(next);
				}}
			/>
		);
	}

	it("groups thousands for display but reports the raw number", async () => {
		const onChange = vi.fn();
		render(<NumberInputHarness onChange={onChange} />);

		const input = screen.getByPlaceholderText("Amount");
		await userEvent.type(input, "1234567");

		expect(onChange).toHaveBeenLastCalledWith("1234567");
		expect(input).toHaveValue("1,234,567");
	});

	it("strips non-numeric characters and keeps a single decimal point", async () => {
		const onChange = vi.fn();
		render(<NumberInputHarness onChange={onChange} />);

		await userEvent.type(screen.getByPlaceholderText("Amount"), "12a.3b.4");
		expect(onChange).toHaveBeenLastCalledWith("12.34");
	});

	it("formats a controlled value on first render", () => {
		render(<NumberInput value={9876543.21} onChange={vi.fn()} placeholder="Amount" />);
		expect(screen.getByPlaceholderText("Amount")).toHaveValue("9,876,543.21");
	});
});

describe("SearchableSelect", () => {
	const options = [
		{ value: "toyota-hilux", label: "Toyota Hilux" },
		{ value: "nissan-frontier", label: "Nissan Frontier" },
		{ value: "ford-ranger", label: "Ford Ranger" },
	];

	it("filters on the option value, not the label", async () => {
		const { baseElement } = render(
			<SearchableSelect options={options} placeholder="Vehicle" aria-label="Vehicle" style={{ width: 240 }} />,
		);

		await userEvent.click(screen.getByRole("combobox"));
		await userEvent.type(screen.getByRole("combobox"), "nissan");

		// The label is split across <strong> nodes by the highlighter, so match on the option's text.
		const optionTexts = () =>
			Array.from(baseElement.querySelectorAll(".ant-select-item-option")).map((el) => el.textContent);

		await waitFor(() => {
			expect(optionTexts()).toEqual(["Nissan Frontier"]);
		});
	});

	it("bolds the matching run of the label", async () => {
		const { baseElement } = render(<SearchableSelect options={options} placeholder="Vehicle" aria-label="Vehicle" />);

		await userEvent.click(screen.getByRole("combobox"));
		await userEvent.type(screen.getByRole("combobox"), "ford");

		await waitFor(() => {
			expect(within(baseElement).getByText("Ford", { selector: "strong" })).toBeInTheDocument();
		});
	});

	it("forwards the search term to onSearch", async () => {
		const onSearch = vi.fn();
		render(<SearchableSelect options={options} onSearch={onSearch} placeholder="Vehicle" aria-label="Vehicle" />);

		await userEvent.click(screen.getByRole("combobox"));
		await userEvent.type(screen.getByRole("combobox"), "ab");

		expect(onSearch).toHaveBeenLastCalledWith("ab");
	});
});

describe("PillTabs", () => {
	it("switches panels and marks the active tab", async () => {
		function Harness() {
			const [active, setActive] = useState("all");
			return <PillTabs items={TAB_ITEMS} activeTab={active} onTabChange={setActive} />;
		}
		render(<Harness />);

		expect(screen.getByText("All content")).toBeInTheDocument();
		expect(screen.getByRole("tab", { name: "All" })).toHaveAttribute("aria-selected", "true");

		await userEvent.click(screen.getByRole("tab", { name: "Active" }));
		expect(screen.getByText("Active content")).toBeInTheDocument();
		expect(screen.queryByText("All content")).not.toBeInTheDocument();
	});

	it("keeps Autocredit's disabled support that Business regressed away", async () => {
		const onTabChange = vi.fn();
		render(<PillTabs items={TAB_ITEMS} activeTab="all" onTabChange={onTabChange} />);

		const archived = screen.getByRole("tab", { name: "Archived" });
		expect(archived).toBeDisabled();
		expect(archived).toHaveStyle({ opacity: "0.4", cursor: "not-allowed" });

		await userEvent.click(archived, { pointerEventsCheck: 0 });
		expect(onTabChange).not.toHaveBeenCalled();
	});
});

describe("TableTabs", () => {
	it("switches panels", async () => {
		function Harness() {
			const [active, setActive] = useState("all");
			return <TableTabs items={TAB_ITEMS} activeTab={active} onTabChange={setActive} />;
		}
		render(<Harness />);

		await userEvent.click(screen.getByRole("tab", { name: "Active" }));
		expect(screen.getByText("Active content")).toBeInTheDocument();
	});
});

describe("StyledTabs", () => {
	it("selects the first option by default and reports selections", async () => {
		const onSelect = vi.fn();
		const options = [
			{ label: "Day", value: "day" },
			{ label: "Week", value: "week" },
		];
		render(<StyledTabs options={options} onSelect={onSelect} />);

		await userEvent.click(screen.getByRole("button", { name: "Week" }));
		expect(onSelect).toHaveBeenCalledWith({ label: "Week", value: "week" });
	});

	it("reads brand colours from the CSS variables, never a hard-coded hex", () => {
		render(<StyledTabs options={[{ label: "Day", value: "day" }]} />);
		expect(screen.getByRole("button", { name: "Day" }).getAttribute("style")).toContain("var(--brand-primary)");
	});

	it("honours a controlled value", async () => {
		const onSelect = vi.fn();
		const options = [
			{ label: "Day", value: "day" },
			{ label: "Week", value: "week" },
		];
		const { rerender } = render(<StyledTabs options={options} value="week" onSelect={onSelect} />);
		expect(screen.getByRole("button", { name: "Week" }).getAttribute("style")).toContain("var(--brand-primary)");

		await userEvent.click(screen.getByRole("button", { name: "Day" }));
		// Controlled: the parent decides, so the highlight has not moved.
		expect(screen.getByRole("button", { name: "Week" }).getAttribute("style")).toContain("var(--brand-primary)");
		expect(onSelect).toHaveBeenCalledWith({ label: "Day", value: "day" });

		rerender(<StyledTabs options={options} value="day" onSelect={onSelect} />);
		expect(screen.getByRole("button", { name: "Day" }).getAttribute("style")).toContain("var(--brand-primary)");
	});
});

describe("PageHeader", () => {
	it("calls onBack instead of routing", async () => {
		const onBack = vi.fn();
		render(<PageHeader title="Fleet" onBack={onBack} />);

		await userEvent.click(screen.getByRole("button", { name: "Go back" }));
		expect(onBack).toHaveBeenCalledTimes(1);
	});

	it("renders a real link when backHref is given", () => {
		render(<PageHeader title="Fleet" backHref="/fleet" />);
		expect(screen.getByRole("link", { name: "Go back" })).toHaveAttribute("href", "/fleet");
	});

	it("hides the back control when showBackBtn is false or nothing is wired", () => {
		const { rerender } = render(<PageHeader title="Fleet" />);
		expect(screen.queryByLabelText("Go back")).not.toBeInTheDocument();

		rerender(<PageHeader title="Fleet" onBack={vi.fn()} showBackBtn={false} />);
		expect(screen.queryByLabelText("Go back")).not.toBeInTheDocument();
	});

	it("renders the description as a node, which Autocredit typed as string", () => {
		render(<PageHeader title="Fleet" description={<em>128 vehicles</em>} />);
		expect(screen.getByText("128 vehicles").tagName.toLowerCase()).toBe("em");
	});
});

describe("ExportButton", () => {
	const data = [{ plate: "ABC-123", make: "Toyota" }];
	const columns = [
		{ title: "Plate", dataIndex: "plate" },
		{ title: "Make", dataIndex: "make" },
	];

	it("defaults to 'Export' with no i18n key in sight", () => {
		render(<ExportButton filename="v" data={data} columns={columns} />);
		expect(screen.getByRole("button", { name: /Export/ })).toBeInTheDocument();
	});

	it("takes its label from the label prop, so apps localise it", () => {
		render(<ExportButton filename="v" data={data} columns={columns} label="Exportar" />);
		expect(screen.getByRole("button", { name: /Exportar/ })).toBeInTheDocument();
	});

	it("is disabled with no rows", () => {
		render(<ExportButton filename="v" data={[]} columns={columns} />);
		expect(screen.getByRole("button")).toBeDisabled();
	});

	it("exports and reports through notify", async () => {
		vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
		URL.createObjectURL = vi.fn(() => "blob:mock");
		URL.revokeObjectURL = vi.fn();
		const notify = vi.fn();

		render(<ExportButton filename="v" data={data} columns={columns} notify={notify} />);
		await userEvent.click(screen.getByRole("button"));

		await waitFor(() => expect(notify).toHaveBeenCalledWith("success", "Data exported successfully"));
		vi.restoreAllMocks();
	});
});

describe("LocalePicker", () => {
	const locales = [
		{ value: "en_US", label: "English", icon: "ic-locale_en_US" },
		{ value: "es_ES", label: "Español", icon: "ic-locale_es_ES" },
	];

	it("shows the current locale's flag and reports a change by value", async () => {
		const onChange = vi.fn();
		render(<LocalePicker locales={locales} value="en_US" onChange={onChange} />);

		expect(screen.getByRole("img", { name: "ic-locale_en_US" })).toBeInTheDocument();

		await userEvent.click(screen.getByRole("button", { name: "Language: English" }));
		await userEvent.click(await screen.findByText("Español"));

		expect(onChange).toHaveBeenCalledWith("es_ES");
	});

	it("falls back to the first locale when value is unknown", () => {
		render(<LocalePicker locales={locales} value="zz" onChange={vi.fn()} />);
		expect(screen.getByRole("button", { name: "Language: English" })).toBeInTheDocument();
	});
});

describe("stories", () => {
	it.each([
		["Inputs", Inputs],
		["Tabs", Tabs],
		["Headers", Headers],
		["Modals", Modals],
		["Export", Export],
		["Locales", Locales],
		["Inbox", Inbox],
		["MarkdownContent", MarkdownContent],
		["ErrorState", ErrorState],
	])("%s renders and passes axe", async (_name, Story) => {
		const { container } = render(<Story />);
		expect(await axe(container, GALLERY_AXE_OPTIONS)).toHaveNoViolations();
	});

	it("the Markdown story renders GFM tables through react-markdown", () => {
		render(<MarkdownContent />);
		expect(screen.getByRole("table")).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Release notes" })).toBeInTheDocument();
	});
});

describe("HeaderSimple", () => {
	it("renders the injected logo and action instead of importing the app's", () => {
		render(
			<HeaderSimple logo={<img src="/logo.svg" alt="Driverse" />} action={<button type="button">Settings</button>} />,
		);

		expect(screen.getByRole("img", { name: "Driverse" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Settings" })).toBeInTheDocument();
	});

	it("renders an empty bar when nothing is passed", () => {
		const { container } = render(<HeaderSimple />);
		expect(container.querySelector("header")).toHaveClass("h-16");
	});
});

describe("layout constants", () => {
	it("carries the shell dimensions both apps share", () => {
		expect({ NAV_WIDTH, NAV_COLLAPSED_WIDTH, NAV_HORIZONTAL_HEIGHT, HEADER_HEIGHT, MULTI_TABS_HEIGHT }).toEqual({
			NAV_WIDTH: 260,
			NAV_COLLAPSED_WIDTH: 80,
			NAV_HORIZONTAL_HEIGHT: 48,
			HEADER_HEIGHT: 64,
			MULTI_TABS_HEIGHT: 32,
		});
	});
});
