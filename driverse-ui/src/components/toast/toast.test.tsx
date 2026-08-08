import { UIThemeProvider } from "@/theme/theme-provider";
import { ThemeMode } from "@/tokens/enum";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import Toast, { toast } from "./index";

const renderToast = (mode?: ThemeMode) =>
	render(
		<UIThemeProvider defaultMode={mode}>
			<Toast />
		</UIThemeProvider>,
	);

// sonner mounts its <ol data-sonner-toaster> into document.body, and only once a toast exists.
const findToaster = async () => {
	await screen.findByText("probe");
	return document.querySelector("[data-sonner-toaster]");
};

describe("Toast", () => {
	it("takes its theme from useTheme, not the settings store", async () => {
		renderToast(ThemeMode.Dark);
		toast.success("probe");
		expect(await findToaster()).toHaveAttribute("data-theme", "dark");
	});

	it("follows a light provider too", async () => {
		renderToast(ThemeMode.Light);
		toast.success("probe");
		expect(await findToaster()).toHaveAttribute("data-theme", "light");
	});

	it("renders a toast fired through the re-exported sonner api", async () => {
		renderToast();
		toast.success("Vehicle saved");
		expect(await screen.findByText("Vehicle saved")).toBeInTheDocument();
	});

	it("fires the action callback on a toast with an action", async () => {
		renderToast();
		let undone = false;
		toast("Vehicle archived", {
			action: {
				label: "Undo",
				onClick: () => {
					undone = true;
				},
			},
		});

		const action = await screen.findByRole("button", { name: "Undo" });
		await userEvent.click(action);
		await waitFor(() => expect(undone).toBe(true));
	});
});
