import { brandCssVar, brandTokenKeys, businessBrand } from "@/tokens/brand";
import type { ThemeMode } from "@/tokens/enum";
import type { Meta, StoryObj } from "@storybook/react";
import { Button, Space, Tag } from "antd";
import { AntdAdapter } from "./antd-adapter";
import { UIThemeProvider } from "./theme-provider";
import { useTheme } from "./use-theme";

const mono = "ui-monospace, SFMono-Regular, Menlo, monospace";

function ThemeDemoCard() {
	const { mode, colorPreset, brand, tokens } = useTheme();

	return (
		<div
			style={{
				maxWidth: 640,
				margin: 24,
				padding: 24,
				borderRadius: tokens.base.borderRadius.lg,
				background: tokens.color.background.paper,
				color: tokens.color.text.primary,
				boxShadow: tokens.shadow.card,
				fontFamily: "system-ui, sans-serif",
			}}
		>
			<h2 style={{ margin: "0 0 4px", fontSize: 18 }}>UIThemeProvider</h2>
			<p style={{ margin: "0 0 20px", fontSize: 13, color: tokens.color.text.secondary }}>
				mode <strong>{mode}</strong> · color preset <strong>{colorPreset}</strong> — switch modes with the Mode control
				in the toolbar.
			</p>

			<Space wrap>
				<Button type="primary">Primary</Button>
				<Button>Default</Button>
				<Button type="dashed">Dashed</Button>
				<Button danger>Danger</Button>
				<Button type="primary" disabled>
					Disabled
				</Button>
			</Space>

			<div style={{ marginTop: 16 }}>
				<Space wrap>
					<Tag color="processing">processing</Tag>
					<Tag color="success">success</Tag>
					<Tag color="warning">warning</Tag>
					<Tag color="error">error</Tag>
				</Space>
			</div>

			<div style={{ marginTop: 24 }}>
				<div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Injected brand tokens</div>
				<div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
					{brandTokenKeys.map((key) => (
						<div key={key} style={{ fontSize: 11, textAlign: "center", width: 104 }}>
							<div
								style={{
									height: 36,
									borderRadius: 6,
									background: `var(${brandCssVar(key)})`,
									border: "1px solid rgba(145, 158, 171, 0.24)",
								}}
							/>
							<div style={{ marginTop: 4, fontFamily: mono }}>{brandCssVar(key)}</div>
							<div style={{ opacity: 0.6, fontFamily: mono }}>{brand[key]}</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

const meta = {
	title: "Theme/UIThemeProvider",
	component: ThemeDemoCard,
	parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ThemeDemoCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Themed antd surface, driven by the ambient provider from the Storybook toolbar. */
export const Default: Story = {};

/** The same card with the Business brand injected — brand values are per-app by design. */
export const BusinessBrand: Story = {
	decorators: [
		(Story, context) => (
			<UIThemeProvider
				mode={context.globals.mode as ThemeMode}
				brand={businessBrand}
				adapters={[AntdAdapter]}
				locale={undefined}
			>
				<Story />
			</UIThemeProvider>
		),
	],
};
