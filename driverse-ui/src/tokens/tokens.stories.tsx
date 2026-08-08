import type { Meta, StoryObj } from "@storybook/react";
import type { ReactNode } from "react";
import { baseThemeTokens } from "./base";
import { autocreditBrand, brandCssVar, brandTokenKeys, businessBrand, defaultBrandTokens } from "./brand";
import { darkColorTokens, lightColorTokens } from "./color";
import { darkShadowTokens, lightShadowTokens } from "./shadow";
import { typographyTokens } from "./typography";

const mono = "ui-monospace, SFMono-Regular, Menlo, monospace";
const sans = "system-ui, sans-serif";

function Section({ title, children }: { title: string; children: ReactNode }) {
	return (
		<section style={{ marginBottom: 40, fontFamily: sans }}>
			<h2 style={{ fontSize: 16, fontWeight: 600, margin: "0 0 12px" }}>{title}</h2>
			{children}
		</section>
	);
}

function Swatch({ name, value }: { name: string; value: string }) {
	return (
		<div style={{ width: 132 }}>
			<div
				style={{
					height: 48,
					borderRadius: 6,
					background: value,
					border: "1px solid rgba(145, 158, 171, 0.24)",
				}}
			/>
			<div style={{ fontSize: 12, marginTop: 4 }}>{name}</div>
			<div style={{ fontSize: 11, fontFamily: mono, opacity: 0.6 }}>{value}</div>
		</div>
	);
}

function Row({ children }: { children: ReactNode }) {
	return <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>{children}</div>;
}

function PaletteScales({ tokens }: { tokens: typeof lightColorTokens }) {
	return (
		<>
			{Object.entries(tokens.palette).map(([group, scale]) => (
				<div key={group} style={{ marginBottom: 16 }}>
					<div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>{group}</div>
					<Row>
						{Object.entries(scale as Record<string, string>).map(([variant, hex]) => (
							<Swatch key={variant} name={variant} value={hex} />
						))}
					</Row>
				</div>
			))}
		</>
	);
}

function TokenGallery() {
	return (
		<div style={{ padding: 24, fontFamily: sans }}>
			<Section title="Brand tokens (contract + reference presets)">
				<p style={{ fontSize: 13, opacity: 0.7, marginTop: 0 }}>
					Brand values are injected per app via <code style={{ fontFamily: mono }}>UIThemeProvider</code>. The library
					ships the key set, the <code style={{ fontFamily: mono }}>--brand-*</code> variable names and a neutral
					default.
				</p>
				<Row>
					{brandTokenKeys.map((key) => (
						<Swatch key={key} name={`${key} → ${brandCssVar(key)}`} value={defaultBrandTokens[key]} />
					))}
				</Row>
				<div style={{ marginTop: 16, fontSize: 13 }}>
					<div style={{ fontWeight: 500, marginBottom: 6 }}>
						autocreditBrand vs businessBrand — the keys where the apps disagree
					</div>
					<Row>
						{brandTokenKeys
							.filter((key) => autocreditBrand[key] !== businessBrand[key])
							.map((key) => (
								<div key={key} style={{ display: "flex", gap: 12 }}>
									<Swatch name={`A: ${key}`} value={autocreditBrand[key]} />
									<Swatch name={`B: ${key}`} value={businessBrand[key]} />
								</div>
							))}
					</Row>
				</div>
			</Section>

			<Section title="Light palette">
				<PaletteScales tokens={lightColorTokens} />
				<div style={{ fontSize: 13, fontWeight: 500, margin: "16px 0 6px" }}>text / background / common</div>
				<Row>
					{[
						...Object.entries(lightColorTokens.text).map(([k, v]) => [`text.${k}`, v] as const),
						...Object.entries(lightColorTokens.background).map(([k, v]) => [`bg.${k}`, v] as const),
						...Object.entries(lightColorTokens.common).map(([k, v]) => [`common.${k}`, v] as const),
					].map(([name, value]) => (
						<Swatch key={name} name={name} value={value} />
					))}
				</Row>
			</Section>

			<Section title="Dark palette (text / background)">
				<Row>
					{[
						...Object.entries(darkColorTokens.text).map(([k, v]) => [`text.${k}`, v] as const),
						...Object.entries(darkColorTokens.background).map(([k, v]) => [`bg.${k}`, v] as const),
					].map(([name, value]) => (
						<Swatch key={name} name={name} value={value} />
					))}
				</Row>
			</Section>

			<Section title="Spacing">
				<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
					{Object.entries(baseThemeTokens.spacing).map(([step, value]) => (
						<div key={step} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12 }}>
							<span style={{ width: 32, fontFamily: mono }}>{step}</span>
							<span style={{ width: 56, fontFamily: mono, opacity: 0.6 }}>{value}</span>
							<span style={{ height: 12, width: value, background: "#5F8BFA", borderRadius: 2 }} />
						</div>
					))}
				</div>
			</Section>

			<Section title="Border radius">
				<Row>
					{Object.entries(baseThemeTokens.borderRadius).map(([name, value]) => (
						<div key={name} style={{ textAlign: "center", fontSize: 12 }}>
							<div
								style={{
									width: 72,
									height: 48,
									borderRadius: value,
									background: "rgba(95, 139, 250, 0.16)",
									border: "1px solid #5F8BFA",
								}}
							/>
							<div style={{ marginTop: 4 }}>{name}</div>
							<div style={{ fontFamily: mono, opacity: 0.6 }}>{value}</div>
						</div>
					))}
				</Row>
			</Section>

			<Section title="Shadows (light)">
				<Row>
					{Object.entries(lightShadowTokens).map(([name, value]) => (
						<div key={name} style={{ textAlign: "center", fontSize: 12, margin: "0 8px 20px" }}>
							<div style={{ width: 104, height: 56, borderRadius: 8, background: "#fff", boxShadow: value }} />
							<div style={{ marginTop: 8, fontFamily: mono }}>{name}</div>
						</div>
					))}
				</Row>
			</Section>

			<Section title="Shadows (dark)">
				<div style={{ background: darkColorTokens.background.default, padding: 20, borderRadius: 8 }}>
					<Row>
						{Object.entries(darkShadowTokens).map(([name, value]) => (
							<div key={name} style={{ textAlign: "center", fontSize: 12, margin: "0 8px 20px", color: "#fff" }}>
								<div
									style={{
										width: 104,
										height: 56,
										borderRadius: 8,
										background: darkColorTokens.background.paper,
										boxShadow: value,
									}}
								/>
								<div style={{ marginTop: 8, fontFamily: mono }}>{name}</div>
							</div>
						))}
					</Row>
				</div>
			</Section>

			<Section title="Typography">
				<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
					{Object.entries(typographyTokens.fontSize).map(([name, value]) => (
						<div key={name} style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
							<span style={{ width: 64, fontFamily: mono, fontSize: 12, opacity: 0.6 }}>{name}</span>
							<span style={{ fontSize: `${value}px` }}>The quick brown fox — {value}px</span>
						</div>
					))}
				</div>
				<div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
					{Object.entries(typographyTokens.fontWeight).map(([name, value]) => (
						<div key={name} style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
							<span style={{ width: 64, fontFamily: mono, fontSize: 12, opacity: 0.6 }}>{name}</span>
							<span style={{ fontWeight: Number(value) }}>The quick brown fox — {value}</span>
						</div>
					))}
				</div>
			</Section>
		</div>
	);
}

const meta = {
	title: "Tokens/Gallery",
	component: TokenGallery,
	parameters: { layout: "fullscreen" },
} satisfies Meta<typeof TokenGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
