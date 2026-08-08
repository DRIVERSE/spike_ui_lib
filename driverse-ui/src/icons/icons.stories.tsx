import { useTheme } from "@/theme/use-theme";
import type { Meta, StoryObj } from "@storybook/react";
import Iconify from "./iconify-icon";
import SvgIcon from "./svg-icon";
import { svgIconNames } from "./svg-map";

const mono = "ui-monospace, SFMono-Regular, Menlo, monospace";

function IconGallery() {
	const { tokens } = useTheme();

	return (
		<div style={{ padding: 24, fontFamily: "system-ui, sans-serif", color: tokens.color.text.primary }}>
			<h2 style={{ fontSize: 16, margin: "0 0 4px" }}>SVG icons ({svgIconNames.length})</h2>
			<p style={{ fontSize: 13, margin: "0 0 16px", color: tokens.color.text.secondary }}>
				The union of both apps' <code style={{ fontFamily: mono }}>src/assets/icons</code>, compiled to React
				components. Pass the file name to <code style={{ fontFamily: mono }}>&lt;SvgIcon icon="…" /&gt;</code>.
			</p>
			<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
				{svgIconNames.map((name) => (
					<div
						key={name}
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							gap: 8,
							padding: 12,
							borderRadius: tokens.base.borderRadius.lg,
							border: `1px solid ${tokens.color.common.border}`,
						}}
					>
						<SvgIcon icon={name} size={28} />
						<span style={{ fontSize: 11, fontFamily: mono, textAlign: "center", wordBreak: "break-all" }}>{name}</span>
					</div>
				))}
			</div>
		</div>
	);
}

function IconifySamples() {
	const icons = ["solar:pen-bold", "mdi:circle", "lucide:car", "carbon:calendar", "material-symbols:add"];
	return (
		<div style={{ padding: 24, display: "flex", gap: 24, alignItems: "center", fontFamily: "system-ui, sans-serif" }}>
			{icons.map((icon) => (
				<div key={icon} style={{ textAlign: "center" }}>
					<Iconify icon={icon} size={28} />
					<div style={{ fontSize: 11, fontFamily: mono, marginTop: 8 }}>{icon}</div>
				</div>
			))}
		</div>
	);
}

const meta = {
	title: "Icons/Gallery",
	component: IconGallery,
	parameters: { layout: "fullscreen" },
} satisfies Meta<typeof IconGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Svg: Story = {};

/** Iconify icons resolved from the offline bundle — no network request. */
export const IconifyOffline: StoryObj<typeof IconifySamples> = {
	render: () => <IconifySamples />,
};
