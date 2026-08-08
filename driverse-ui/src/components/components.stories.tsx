import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { MotionContainer, MotionLazy, varFade } from "./animate";
import Card from "./card";
import Chip from "./chip";
import type { ChipVariant } from "./chip/types";
import ColumnDetailsLayout from "./column-details-layout";
import ComingSoon from "./coming-soon";
import Fallback from "./fallback";
import InfoField from "./info-field";
import { CircleLoading, LineLoading } from "./loading";
import Logo from "./logo";
import Pill from "./pill";
import PlaceholderCard from "./placeholder-card";
import ProTag from "./pro-tag";
import Scrollbar from "./scrollbar";
import TotalCard from "./total-card";

/** A representative sample of the variant map; the tests snapshot all of them. */
export const SAMPLE_VARIANTS: ChipVariant[] = [
	"default",
	"success",
	"danger",
	"warning",
	"COMPLIANT",
	"EXPIRING",
	"IMMEDIATE_ACTION",
	"IN_PROGRESS",
	"UPCOMING",
	"under_review",
	"moving",
	"parked",
];

type ChipsArgs = { onRemove: (id: string) => void };

const SCROLL_ROWS = Array.from({ length: 20 }, (_, index) => `Scrollable row ${index + 1}`);

const meta = {
	title: "Components/Leaves",
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;

export const Cards: StoryObj = {
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
			<Card>
				<InfoField label="Plate number" value="ABC-123-XY" />
			</Card>
			<PlaceholderCard title="Nothing here yet" />
			<TotalCard title="Active vehicles" count={128} percent="12%" increase description="vs. last month" />
			<TotalCard title="Loading" count={0} loading />
		</div>
	),
};

export const Chips: StoryObj<ChipsArgs> = {
	args: { onRemove: fn() },
	render: (args) => (
		<div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
			{SAMPLE_VARIANTS.map((variant) => (
				<Chip key={variant} variant={variant} label={variant} />
			))}
			<Chip id="removable" label="removable chip" variant="warning" onRemove={args.onRemove} />
		</div>
	),
};

export const Pills: StoryObj = {
	render: () => (
		<div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
			{SAMPLE_VARIANTS.map((variant) => (
				<Pill key={variant} variant={variant}>
					{variant}
				</Pill>
			))}
		</div>
	),
};

export const Tags: StoryObj = {
	render: () => (
		<div>
			<ProTag color="blue">pro</ProTag>
			<ProTag color="green">active</ProTag>
			<ProTag color="red">expired</ProTag>
		</div>
	),
};

export const Loading: StoryObj = {
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 24, height: 200 }}>
			<CircleLoading />
			<LineLoading />
		</div>
	),
};

export const EmptyStates: StoryObj = {
	render: () => (
		<div>
			<Fallback height={220} title="No documents" description="Upload a file to get started." />
			<ComingSoon />
		</div>
	),
};

export const Details: StoryObj = {
	render: () => (
		<ColumnDetailsLayout
			data={[
				{ label: "Owner", value: "Ada Lovelace" },
				{ label: "VIN", value: "1HGCM82633A004352" },
				{ label: "State", value: "Jalisco" },
				{ label: "Status", value: <Chip variant="COMPLIANT" label="COMPLIANT" /> },
			]}
		/>
	),
};

export const Scrolling: StoryObj = {
	render: () => (
		<Scrollbar style={{ maxHeight: 160, border: "1px solid rgba(145,158,171,0.24)", borderRadius: 8 }}>
			<div style={{ padding: 12 }}>
				{SCROLL_ROWS.map((label) => (
					<p key={label} style={{ margin: "4px 0" }}>
						{label}
					</p>
				))}
			</div>
		</Scrollbar>
	),
};

export const Branding: StoryObj = {
	render: () => (
		<Logo
			alt="Driverse"
			size={64}
			href="https://example.com"
			src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='12' fill='%235F8BFA'/%3E%3C/svg%3E"
		/>
	),
};

export const Motion: StoryObj = {
	render: () => (
		<MotionLazy>
			<MotionContainer className="flex flex-col gap-2">
				<Card>
					<span>Animated with varFade().inUp — {Object.keys(varFade()).length} variants available</span>
				</Card>
			</MotionContainer>
		</MotionLazy>
	),
};
