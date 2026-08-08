/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/insurance/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/insurance/index.tsx
 * @status identical
 * @notes Byte-identical in both apps; lifted verbatim (the `//` divider comments dropped, `React.FC` ->
 *        a plain `FC` type import). `useInsuranceStore`'s `activeTab`/`setActiveTab` -> `useVehicleInsurance()`.
 *        Renamed from `index.tsx` to `vehicle-insurance.tsx`: this module needs a plain barrel at
 *        `index.ts` (see `index.ts`), and a directory can't resolve both `./index.ts` and `./index.tsx`
 *        for the same specifier. Same rename `../vehicle-compliance` made for the same reason.
 *        Render this inside a `VehicleInsuranceProvider` — see the module README for the full injected
 *        surface and an example.
 */

import { CircleLoading } from "@/components/loading";
import PillTabs from "@/components/pill-tabs";
import { useTranslate } from "@/i18n/translate";
import { Suspense, lazy } from "react";
import type { FC } from "react";
import { InsuranceOverview } from "./overview";
import { useVehicleInsurance } from "./provider";
import type { Vehicle } from "./types";

const InsuranceHistory = lazy(() => import("./history"));

export type VehicleInsuranceProps = {
	vehicleData?: Vehicle;
	loading?: boolean;
};

export const VehicleInsurance: FC<VehicleInsuranceProps> = ({ vehicleData, loading }) => {
	const t = useTranslate();
	const { activeTab, setActiveTab } = useVehicleInsurance();

	const tabItems = [
		{
			key: "overview",
			label: t("sys.forms.insurance.overview"),
			children: <InsuranceOverview vehicleData={vehicleData} loading={loading} />,
		},
		{
			key: "history",
			label: t("sys.forms.insurance.history"),
			children: (
				<Suspense fallback={<CircleLoading />}>
					<InsuranceHistory vehicleData={vehicleData} loading={loading} />
				</Suspense>
			),
		},
	];

	return (
		<div className="mb-10">
			<PillTabs items={tabItems} activeTab={activeTab} onTabChange={setActiveTab} fullWidth={false} />
		</div>
	);
};

export default VehicleInsurance;
