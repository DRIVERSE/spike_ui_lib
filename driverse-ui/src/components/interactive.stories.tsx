import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Button } from "antd";
import { useState } from "react";
import ActionModal from "./action-modal";
import Chip from "./chip";
import ConfirmModal from "./confirm-modal";
import DragDropInbox from "./drag-drop-inbox";
import ErrorFallback from "./error-pages";
import ExportButton from "./export-button";
import LocalePicker from "./locale-picker";
import Markdown from "./markdown";
import { NumberInput } from "./number-input";
import PageHeader, { Header } from "./page-header";
import PillTabs from "./pill-tabs";
import { SearchableSelect } from "./searchable-select";
import { StyledTabs } from "./styled-tabs";
import TableTabs from "./table-tab";

const meta = {
	title: "Components/Interactive",
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;

export const Inputs: StoryObj<{ onChange: (value: string) => void }> = {
	args: { onChange: fn() },
	render: (args) => {
		return (
			<div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 360 }}>
				<NumberInput value="1234567.89" onChange={args.onChange} placeholder="Amount" aria-label="Amount" />
				<SearchableSelect
					style={{ width: "100%" }}
					aria-label="Vehicle"
					placeholder="Pick a vehicle"
					options={[
						{ value: "toyota-hilux", label: "Toyota Hilux" },
						{ value: "nissan-frontier", label: "Nissan Frontier" },
						{ value: "ford-ranger", label: "Ford Ranger" },
					]}
				/>
			</div>
		);
	},
};

export const Tabs: StoryObj = {
	render: () => {
		const items = [
			{ key: "all", label: "All", children: <p>Everything</p> },
			{ key: "active", label: "Active", children: <p>Only active</p> },
			{ key: "archived", label: "Archived", children: <p>Archived</p>, disabled: true },
		];
		return (
			<div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
				<PillTabsDemo items={items} />
				<TableTabsDemo items={items} />
				<StyledTabs
					options={[
						{ label: "Day", value: "day" },
						{ label: "Week", value: "week" },
						{ label: "Month", value: "month" },
					]}
				/>
			</div>
		);
	},
};

function PillTabsDemo({ items }: { items: Parameters<typeof PillTabs>[0]["items"] }) {
	const [active, setActive] = useState("all");
	return <PillTabs items={items} activeTab={active} onTabChange={setActive} />;
}

function TableTabsDemo({ items }: { items: Parameters<typeof TableTabs>[0]["items"] }) {
	const [active, setActive] = useState("all");
	return <TableTabs items={items} activeTab={active} onTabChange={setActive} />;
}

export const Headers: StoryObj<{ onBack: () => void }> = {
	args: { onBack: fn() },
	render: (args) => (
		<div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
			<PageHeader
				title="Fleet overview"
				description="128 vehicles across 4 parks"
				sticky={false}
				onBack={args.onBack}
				action={<Button type="primary">New vehicle</Button>}
			/>
			<PageHeader title="Vehicle detail" routerLink="/fleet" sticky={false} onBack={args.onBack} />
			<Header title="Section header" description="The shared sub-header both apps use inside cards" />
		</div>
	),
};

export const Modals: StoryObj = {
	render: () => {
		const [action, setAction] = useState(false);
		const [confirm, setConfirm] = useState(false);
		return (
			<div style={{ display: "flex", gap: 12 }}>
				<Button onClick={() => setAction(true)}>Open action modal</Button>
				<Button onClick={() => setConfirm(true)}>Open confirm modal</Button>
				<ActionModal show={action} setShow={setAction} handleTrigger={() => setAction(false)}>
					<p>This wraps antd Modal with the apps' default labels.</p>
				</ActionModal>
				<ConfirmModal
					open={confirm}
					onOpen={setConfirm}
					handleTrigger={() => setConfirm(false)}
					title="Delete vehicle"
					label="This cannot be undone."
				/>
			</div>
		);
	},
};

export const Export: StoryObj<{ notify: (level: string, message: string) => void }> = {
	args: { notify: fn() },
	render: (args) => (
		<ExportButton
			filename="vehicles"
			notify={args.notify as never}
			data={[
				{ plate: "ABC-123", make: "Toyota" },
				{ plate: "XYZ-987", make: "Ford" },
			]}
			columns={[
				{ title: "Plate", dataIndex: "plate" },
				{ title: "Make", dataIndex: "make" },
			]}
		/>
	),
};

export const Locales: StoryObj<{ onChange: (value: string) => void }> = {
	args: { onChange: fn() },
	render: (args) => (
		<LocalePicker
			value="en_US"
			onChange={args.onChange}
			locales={[
				{ value: "en_US", label: "English", icon: "ic-locale_en_US" },
				{ value: "es_ES", label: "Español", icon: "ic-locale_es_ES" },
			]}
		/>
	),
};

export const Inbox: StoryObj = {
	render: () => (
		<DragDropInbox
			onDragEnter={fn()}
			onDragOver={fn()}
			onDragLeave={fn()}
			onDrop={fn()}
			isDragging={false}
			loadingDocs={false}
			inboxCount={2}
			selectedCount={1}
			files={[
				{ id: "1", name: "invoice.pdf" },
				{ id: "2", name: "contract.pdf" },
			]}
			renderFileItem={(file) => (
				<div key={file.id} className="px-3 py-2">
					<Chip label={file.name} variant="default" labelTransform={(value) => value} />
				</div>
			)}
		/>
	),
};

export const MarkdownContent: StoryObj = {
	render: () => (
		<Markdown>
			{
				"# Release notes\n\nExtraction status is tracked in **STATUS.md**.\n\n- merged chip variants\n- decoupled theme\n\n| Wave | Units |\n| --- | --- |\n| W5 | 15 |\n"
			}
		</Markdown>
	),
};

export const ErrorState: StoryObj<{ onGoHome: () => void }> = {
	args: { onGoHome: fn() },
	render: (args) => <ErrorFallback error={new Error("GraphQL request failed")} onGoHome={args.onGoHome} showDetails />,
};
