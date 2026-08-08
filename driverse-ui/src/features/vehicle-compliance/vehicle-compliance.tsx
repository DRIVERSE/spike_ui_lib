/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/compliance/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/compliance/index.tsx
 * @status merged
 * @notes The tab shell around the three (now one, config-driven) sections. B adopted for the JSX
 *        (PillTabs + lazy-loaded Tenure/Circulation, Verification eager) — A/B differ only in formatting.
 *        `useSearchParams` (react-router) -> `activeTab`/`onTabChange`, an optional controlled pair; the
 *        component keeps its own `useState` fallback when the app doesn't want URL-synced tabs, and calls
 *        `onTabChange` either way so an app that does can call `setSearchParams` itself — exactly the
 *        `renderSidePanel`-style seam from `fleet-tracking-map`, minus a render prop since a plain
 *        callback covers the whole coupling here.
 *        `Suspense`/`lazy` kept: circulation and tenure fetch on mount (tenure hits the compliance
 *        service directly), verification reads straight off the `data` prop, matching the apps' choice
 *        to only defer the two sections with their own async cost.
 */

import { CircleLoading } from "@/components/loading";
import PillTabs, { type TabItem } from "@/components/pill-tabs";
import { Suspense, lazy, useState } from "react";
import { ComplianceDocumentSection } from "./compliance-table";
import { useVerificationConfig } from "./configs/verification";
import type { ComplianceVehicle } from "./types";

const CirculationTab = lazy(() => import("./components/circulation-tab"));
const TenureTab = lazy(() => import("./components/tenure-tab"));

export type VehicleComplianceProps = {
	vehicle?: ComplianceVehicle;
	loading?: boolean;
	activeTab?: string;
	onTabChange?: (key: string) => void;
};

const VerificationTab = ({ vehicle, loading }: { vehicle?: ComplianceVehicle; loading?: boolean }) => {
	const config = useVerificationConfig(vehicle);
	return <ComplianceDocumentSection loading={loading} {...config} />;
};

export const VehicleCompliance = ({ vehicle, loading, activeTab, onTabChange }: VehicleComplianceProps) => {
	const [internalTab, setInternalTab] = useState("verification");
	const tab = activeTab ?? internalTab;

	const handleTabChange = (key: string) => {
		setInternalTab(key);
		onTabChange?.(key);
	};

	const tabItems: TabItem[] = [
		{
			key: "verification",
			label: "Vehicle Verification",
			children: <VerificationTab vehicle={vehicle} loading={loading} />,
		},
		{
			key: "tenure",
			label: "Tenure",
			children: (
				<Suspense fallback={<CircleLoading />}>
					<TenureTab vehicle={vehicle} loading={loading} />
				</Suspense>
			),
		},
		{
			key: "circulation",
			label: "Circulation",
			children: (
				<Suspense fallback={<CircleLoading />}>
					<CirculationTab vehicle={vehicle} loading={loading} />
				</Suspense>
			),
		},
	];

	return (
		<div className="flex flex-col gap-6">
			<PillTabs items={tabItems} activeTab={tab} onTabChange={handleTabChange} fullWidth={false} />
		</div>
	);
};

export default VehicleCompliance;
