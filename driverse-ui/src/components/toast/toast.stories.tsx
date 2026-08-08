import type { Meta, StoryObj } from "@storybook/react";
import { Button, Space } from "antd";
import Toast, { toast } from "./index";

function ToastDemo() {
	return (
		<div style={{ padding: 24 }}>
			<Toast />
			<Space wrap>
				<Button onClick={() => toast.success("Vehicle saved")}>Success</Button>
				<Button onClick={() => toast.error("Upload failed")}>Error</Button>
				<Button onClick={() => toast.warning("Registration expires soon")}>Warning</Button>
				<Button onClick={() => toast.info("3 documents pending review")}>Info</Button>
				<Button onClick={() => toast.loading("Uploading…")}>Loading</Button>
				<Button
					onClick={() =>
						toast("Vehicle archived", {
							description: "It can be restored from the archive tab.",
							action: { label: "Undo", onClick: () => toast.success("Restored") },
						})
					}
				>
					With action
				</Button>
			</Space>
		</div>
	);
}

const meta = {
	title: "Components/Toast",
	component: ToastDemo,
	parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ToastDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
