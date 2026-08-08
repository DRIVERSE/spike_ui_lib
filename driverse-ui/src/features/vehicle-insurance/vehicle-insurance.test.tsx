import { composeStories } from "@storybook/react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import EditInsuranceForm from "./edit";
import { VehicleInsuranceProvider } from "./provider";
import type { VehicleInsuranceDataSource } from "./types";
import { VehicleInsurance } from "./vehicle-insurance";
import * as stories from "./vehicle-insurance.stories";

const { Overview, Loading, WithoutPermissions, Edit, History, MOCK_VEHICLE, MOCK_POLICY } = {
	...composeStories(stories),
	MOCK_VEHICLE: stories.MOCK_VEHICLE,
	MOCK_POLICY: stories.MOCK_POLICY,
};

afterEach(() => vi.restoreAllMocks());

const mockDataSource = (): VehicleInsuranceDataSource => ({
	createPolicy: vi.fn().mockResolvedValue({ status: 200 }),
	updatePolicy: vi.fn().mockResolvedValue({ status: 200, message: "Insurance policy updated successfully" }),
	attachPolicyFile: vi.fn().mockResolvedValue({ status: 200 }),
	deletePolicyFile: vi.fn().mockResolvedValue({ status: 200, detail: { successCount: 1, failureCount: 0 } }),
	uploadDocument: vi.fn().mockResolvedValue({ status: 200, detail: { files: [{ id: "uploaded-1" }] } }),
	refetchVehicle: vi.fn().mockResolvedValue(undefined),
});

describe("stories", () => {
	it.each([
		["Overview", Overview],
		["Loading", Loading],
		["WithoutPermissions", WithoutPermissions],
		["Edit", Edit],
		["History", History],
	])("%s renders", (_name, Story) => {
		const { container } = render(<Story />);
		expect(container.firstChild).not.toBeNull();
	});
});

describe("VehicleInsurance", () => {
	it("switches from the overview tab to the history tab", async () => {
		render(
			<VehicleInsuranceProvider
				dataSource={mockDataSource()}
				navigation={{ push: vi.fn() }}
				clientId="client-1"
				vehicleId={MOCK_VEHICLE.id}
			>
				<VehicleInsurance vehicleData={MOCK_VEHICLE} />
			</VehicleInsuranceProvider>,
		);

		// Overview renders the policy status card by default.
		expect(screen.getByText("Insurance")).toBeInTheDocument();

		await userEvent.click(screen.getByText("History"));

		await waitFor(() => expect(screen.getByText("Insurance History")).toBeInTheDocument());
	});

	it("navigates to the add-policy page when 'Add Policy' is clicked", async () => {
		const push = vi.fn();
		render(
			<VehicleInsuranceProvider
				dataSource={mockDataSource()}
				navigation={{ push }}
				clientId="client-1"
				vehicleId={MOCK_VEHICLE.id}
				permissions={["business.action.add_insurance_policy"]}
			>
				<VehicleInsurance vehicleData={MOCK_VEHICLE} />
			</VehicleInsuranceProvider>,
		);

		await userEvent.click(screen.getByText("Add Insurance Policy"));

		expect(push).toHaveBeenCalledWith(`/vehicle-park/vehicles/${MOCK_VEHICLE.id}/add-insurance-policy`);
	});

	it("hides 'Add Policy' without the permission code, per InsuranceStatusCard's adopted-B gate", () => {
		render(
			<VehicleInsuranceProvider
				dataSource={mockDataSource()}
				navigation={{ push: vi.fn() }}
				clientId="client-1"
				vehicleId={MOCK_VEHICLE.id}
				permissions={[]}
			>
				<VehicleInsurance vehicleData={MOCK_VEHICLE} />
			</VehicleInsuranceProvider>,
		);

		expect(screen.queryByText("Add Insurance Policy")).not.toBeInTheDocument();
	});
});

describe("EditInsuranceForm", () => {
	it("submits the pre-filled form through the injected data source", async () => {
		const dataSource = mockDataSource();
		const onOpen = vi.fn();

		render(
			<VehicleInsuranceProvider
				dataSource={dataSource}
				navigation={{ push: vi.fn() }}
				clientId="client-1"
				vehicleId={MOCK_VEHICLE.id}
			>
				<EditInsuranceForm open data={MOCK_POLICY} onOpen={onOpen} />
			</VehicleInsuranceProvider>,
		);

		const modal = screen.getByRole("dialog");
		await userEvent.click(within(modal).getByText("Submit"));

		await waitFor(() => expect(dataSource.updatePolicy).toHaveBeenCalledWith(MOCK_POLICY.id, expect.any(Object)));
		expect(dataSource.updatePolicy).toHaveBeenCalledWith(
			MOCK_POLICY.id,
			expect.objectContaining({ policyholder_name: MOCK_POLICY.policyholder_name, rfc: MOCK_POLICY.rfc }),
		);
	});
});
