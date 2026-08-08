import { composeStories } from "@storybook/react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import Card from "./card";
import Chip, { VARIANT_STYLES, defaultLabelTransform } from "./chip";
import type { ChipVariant } from "./chip/types";
import ColumnDetailsLayout from "./column-details-layout";
import * as stories from "./components.stories";
import Fallback from "./fallback";
import InfoField from "./info-field";
import { CircleLoading } from "./loading";
import Logo from "./logo";
import Pill from "./pill";
import PlaceholderCard from "./placeholder-card";
import TotalCard from "./total-card";

const { Cards, Chips, Pills, EmptyStates, Details, Scrolling, Branding, Motion, Tags } = composeStories(stories);

// The full variant matrix, so a colour change to any status shows up as a snapshot diff.
const ALL_VARIANTS = Object.keys(VARIANT_STYLES) as ChipVariant[];

// heading-order is a document-level rule: it fires because a gallery puts unrelated components side by
// side (PlaceholderCard's <h2> next to TotalCard's <h6>), not because either component is wrong on its
// own. Real pages must still order their headings — see the note in the wave report.
const GALLERY_AXE_OPTIONS = { rules: { "heading-order": { enabled: false } } };

describe("Chip", () => {
	it("covers the union of both apps' variants", () => {
		// Autocredit-only telematics keys.
		for (const key of ["moving", "parked", "offline"]) {
			expect(VARIANT_STYLES[key]).toBeDefined();
		}
		// Business-only workflow keys.
		for (const key of ["UPCOMING", "IN_PROGRESS", "OCR_REVIEW", "under_review", "REJECTED"]) {
			expect(VARIANT_STYLES[key]).toBeDefined();
		}
		expect(ALL_VARIANTS.length).toBeGreaterThanOrEqual(50);
	});

	it("renders every variant identically to the recorded snapshot", () => {
		const { container } = render(
			<div>
				{ALL_VARIANTS.map((variant) => (
					<Chip key={variant} variant={variant} label={variant} />
				))}
			</div>,
		);
		expect(container.innerHTML).toMatchSnapshot("chip-all-variants");
	});

	it("normalizes underscores and capitalizes by default", () => {
		render(<Chip label="UNDER_REVIEW" variant="UNDER_REVIEW" />);
		expect(screen.getByText("Under review")).toBeInTheDocument();
	});

	it("keeps the raw casing when isTextNormal is set", () => {
		render(<Chip label="UNDER_REVIEW" variant="UNDER_REVIEW" isTextNormal />);
		expect(screen.getByText("UNDER REVIEW")).toBeInTheDocument();
	});

	it("accepts a custom labelTransform, restoring Autocredit's untouched labels", () => {
		render(<Chip label="UNDER_REVIEW" isTextNormal labelTransform={(value) => value} />);
		expect(screen.getByText("UNDER_REVIEW")).toBeInTheDocument();
		expect(defaultLabelTransform("UNDER_REVIEW")).toBe("UNDER REVIEW");
	});

	it("falls back to the default style for an unknown variant", () => {
		render(<Chip label="mystery" variant={"nope" as ChipVariant} />);
		expect(screen.getByText("Mystery").parentElement).toHaveStyle({ borderRadius: "20px" });
	});

	it("renders a remove button only with both id and onRemove, and it never submits a form", async () => {
		const onRemove = vi.fn();
		const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());

		const { rerender } = render(<Chip label="tag" onRemove={onRemove} />);
		expect(screen.queryByRole("button")).not.toBeInTheDocument();

		rerender(
			<form onSubmit={onSubmit}>
				<Chip id="t1" label="tag" onRemove={onRemove} />
			</form>,
		);
		const button = screen.getByRole("button", { name: "Remove tag" });
		expect(button).toHaveAttribute("type", "button");

		await userEvent.click(button);
		expect(onRemove).toHaveBeenCalledWith("t1");
		expect(onSubmit).not.toHaveBeenCalled();
	});
});

describe("Pill", () => {
	it("shares the chip variant map", () => {
		render(<Pill variant="COMPLIANT">compliant</Pill>);
		expect(screen.getByText("compliant")).toHaveStyle({
			backgroundColor: VARIANT_STYLES.COMPLIANT.backgroundColor as string,
		});
	});

	it("upper-cases an unknown lowercase variant before giving up", () => {
		render(<Pill variant="in_progress">in progress</Pill>);
		expect(screen.getByText("in progress")).toHaveStyle({
			backgroundColor: VARIANT_STYLES.IN_PROGRESS.backgroundColor as string,
		});
	});

	it("replaces underscores in string children only", () => {
		const { rerender } = render(<Pill variant="default">UNDER_REVIEW</Pill>);
		expect(screen.getByText("UNDER REVIEW")).toBeInTheDocument();

		rerender(
			<Pill variant="default">
				<em>node child</em>
			</Pill>,
		);
		expect(screen.getByText("node child")).toBeInTheDocument();
	});
});

describe("simple leaves", () => {
	it("Card renders children", () => {
		render(<Card className="test-card">content</Card>);
		expect(screen.getByText("content")).toBeInTheDocument();
	});

	it("InfoField hides an empty value", () => {
		const { container } = render(<InfoField label="Owner" />);
		expect(screen.getByText("Owner")).toBeInTheDocument();
		expect(container.querySelectorAll("p")[1]).toBeEmptyDOMElement();
	});

	it("PlaceholderCard shows its title", () => {
		render(<PlaceholderCard title="No results" />);
		expect(screen.getByRole("heading", { name: "No results" })).toBeInTheDocument();
	});

	it("Fallback hides the icon on request", () => {
		const { container, rerender } = render(<Fallback title="Empty" />);
		expect(container.querySelector("svg")).not.toBeNull();

		rerender(<Fallback title="Empty" hideIcon />);
		expect(container.querySelector("svg")).toBeNull();
	});

	it("Fallback converts a numeric height to px", () => {
		const { container, rerender } = render(<Fallback title="Empty" height={240} />);
		expect(container.firstChild).toHaveStyle({ minHeight: "240px" });

		rerender(<Fallback title="Empty" height="50vh" />);
		expect(container.firstChild).toHaveStyle({ minHeight: "50vh" });
	});

	it("CircleLoading defaults to antd's large spinner (Business's default)", () => {
		const { container } = render(<CircleLoading />);
		expect(container.querySelector(".ant-spin-lg")).not.toBeNull();
	});

	it("ColumnDetailsLayout splits rows across two columns, odd counts leaning left", () => {
		const { container } = render(
			<ColumnDetailsLayout
				data={[
					{ label: "a", value: "1" },
					{ label: "b", value: "2" },
					{ label: "c", value: "3" },
				]}
			/>,
		);
		const [left, right] = Array.from(container.querySelectorAll(":scope > div > div > div"));
		expect(left.children).toHaveLength(2);
		expect(right.children).toHaveLength(1);
	});

	it("TotalCard swaps the trend arrow and shows a spinner while loading", () => {
		const { container, rerender } = render(<TotalCard title="Fleet" count={12} percent="4%" increase />);
		expect(screen.getByText("12")).toBeInTheDocument();
		expect(screen.getByText("4%")).toBeInTheDocument();

		rerender(<TotalCard title="Fleet" count={12} loading />);
		expect(container.querySelector(".ant-spin")).not.toBeNull();
		expect(screen.queryByText("12")).not.toBeInTheDocument();
	});

	it("Logo renders a bare image without href and links with one", () => {
		const { rerender } = render(<Logo src="/logo.svg" alt="Driverse" />);
		expect(screen.getByRole("img", { name: "Driverse" })).toBeInTheDocument();
		expect(screen.queryByRole("link")).not.toBeInTheDocument();

		rerender(<Logo src="/logo.svg" alt="Driverse" href="/home" />);
		expect(screen.getByRole("link")).toHaveAttribute("href", "/home");
	});
});

describe("stories", () => {
	it.each([
		["Cards", Cards],
		["Chips", Chips],
		["Pills", Pills],
		["Tags", Tags],
		["EmptyStates", EmptyStates],
		["Details", Details],
		["Scrolling", Scrolling],
		["Branding", Branding],
		["Motion", Motion],
	])("%s renders and passes axe", async (_name, Story) => {
		const { container } = render(<Story />);
		expect(await axe(container, GALLERY_AXE_OPTIONS)).toHaveNoViolations();
	});

	it("the Chips story wires up onRemove", async () => {
		render(<Chips />);
		await userEvent.click(screen.getByRole("button", { name: "Remove removable chip" }));
		expect(Chips.args.onRemove).toHaveBeenCalledWith("removable");
	});
});
