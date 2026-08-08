import type { Meta, StoryObj } from "@storybook/react";
import { breakpointsTokens } from "./breakpoints";

function BreakpointsTable() {
	return (
		<table style={{ borderCollapse: "collapse", fontFamily: "system-ui, sans-serif" }}>
			<thead>
				<tr>
					<th style={{ textAlign: "left", padding: "6px 16px 6px 0" }}>Token</th>
					<th style={{ textAlign: "left", padding: "6px 0" }}>Min width</th>
				</tr>
			</thead>
			<tbody>
				{Object.entries(breakpointsTokens).map(([name, value]) => (
					<tr key={name}>
						<td style={{ padding: "6px 16px 6px 0", fontFamily: "monospace" }}>{name}</td>
						<td style={{ padding: "6px 0" }}>{value}</td>
					</tr>
				))}
			</tbody>
		</table>
	);
}

const meta = {
	title: "Tokens/Breakpoints",
	component: BreakpointsTable,
} satisfies Meta<typeof BreakpointsTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
