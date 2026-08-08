import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import IconButton from "./icon-button";
import SvgIcon from "./svg-icon";

const meta = {
	title: "Icons/IconButton",
	component: IconButton,
	args: {
		onClick: fn(),
		children: <SvgIcon icon="ic-setting" size={20} />,
	},
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = {
	args: { disabled: true },
};

export const WithLabel: Story = {
	args: {
		children: (
			<>
				<SvgIcon icon="ic-edit" size={18} />
				<span style={{ marginLeft: 8, fontSize: 13 }}>Edit</span>
			</>
		),
		className: "rounded-md",
	},
};
