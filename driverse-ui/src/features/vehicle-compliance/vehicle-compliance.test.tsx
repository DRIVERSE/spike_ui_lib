import { composeStories } from "@storybook/react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ComplianceDocumentSection } from "./compliance-table";
import { useCirculationConfig } from "./configs/circulation";
import { VehicleComplianceProvider } from "./provider";
import type { ComplianceVehicle, VehicleComplianceDataSource } from "./types";
import * as stories from "./vehicle-compliance.stories";

const { Default, EmptyVehicle, CirculationSection, VerificationSection, TenureSection } = composeStories(stories);
const { MOCK_VEHICLE, MOCK_DATA_SOURCE, MOCK_NAVIGATION, MOCK_PERMISSIONS } = stories;

afterEach(() => vi.restoreAllMocks());

describe("stories", () => {
	it.each([
		["Default", Default],
		["EmptyVehicle", EmptyVehicle],
		["CirculationSection", CirculationSection],
		["VerificationSection", VerificationSection],
		["TenureSection", TenureSection],
	])("%s renders", async (_name, Story) => {
		const { container } = render(<Story />);
		await waitFor(() => expect(container.firstChild).not.toBeNull());
	});
});

describe("VehicleCompliance", () => {
	it("switches document kind through the pill tabs", async () => {
		render(<Default />);

		// Verification is the default tab.
		expect(await screen.findByText("Pollution Test Status")).toBeInTheDocument();
		expect(screen.queryByText("Circulation Card Status")).not.toBeInTheDocument();

		await userEvent.click(screen.getByRole("tab", { name: "Circulation" }));

		expect(await screen.findByText("Circulation Card Status")).toBeInTheDocument();
		expect(screen.queryByText("Pollution Test Status")).not.toBeInTheDocument();
	});

	it("shows the dual tenencia/refrendo status chips on the tenure section", async () => {
		render(<TenureSection />);

		expect(await screen.findByText("Ownership Fee Status")).toBeInTheDocument();
		expect(screen.getByText("Tenure:")).toBeInTheDocument();
		expect(screen.getByText("Renewal Fee:")).toBeInTheDocument();
	});

	it("fires the injected data source when a circulation history row is deleted", async () => {
		const deleteCirculationCard = vi.fn().mockResolvedValue(undefined);
		const dataSource: VehicleComplianceDataSource = { ...MOCK_DATA_SOURCE, deleteCirculationCard };

		render(
			<VehicleComplianceProvider
				dataSource={dataSource}
				navigation={MOCK_NAVIGATION}
				permissions={MOCK_PERMISSIONS}
				basePath="/vehicle-park/vehicles"
			>
				<CirculationConfigHarness vehicle={MOCK_VEHICLE} />
			</VehicleComplianceProvider>,
		);

		const row = (await screen.findByText("CC-2025-441")).closest("tr");
		expect(row).not.toBeNull();
		await userEvent.click(within(row as HTMLElement).getByRole("button", { name: "Delete" }));

		const dialog = await screen.findByRole("dialog");
		await userEvent.click(within(dialog).getByRole("button", { name: "Submit" }));

		await waitFor(() => expect(deleteCirculationCard).toHaveBeenCalledWith("cc-0"));
	});

	it("calls the injected navigation when the status card CTA is clicked", async () => {
		const push = vi.fn();

		render(
			<VehicleComplianceProvider
				dataSource={MOCK_DATA_SOURCE}
				navigation={{ ...MOCK_NAVIGATION, push }}
				permissions={MOCK_PERMISSIONS}
				basePath="/vehicle-park/vehicles"
			>
				<CirculationConfigHarness vehicle={MOCK_VEHICLE} />
			</VehicleComplianceProvider>,
		);

		await userEvent.click(await screen.findByRole("button", { name: "Add Circulation Card" }));

		expect(push).toHaveBeenCalledWith("/vehicle-park/vehicles/veh-1/add-circulation");
	});

	it("hides permission-gated actions when the permission is absent", async () => {
		render(
			<VehicleComplianceProvider
				dataSource={MOCK_DATA_SOURCE}
				navigation={MOCK_NAVIGATION}
				permissions={[]}
				basePath="/vehicle-park/vehicles"
			>
				<CirculationConfigHarness vehicle={MOCK_VEHICLE} />
			</VehicleComplianceProvider>,
		);

		expect(await screen.findByText("Circulation Card Status")).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Add Circulation Card" })).not.toBeInTheDocument();
	});
});

const CirculationConfigHarness = ({ vehicle }: { vehicle: ComplianceVehicle }) => {
	const config = useCirculationConfig(vehicle);
	return <ComplianceDocumentSection {...config} />;
};
