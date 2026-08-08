/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/insurance/history/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/insurance/history/index.tsx
 * @status merged
 * @notes Only difference is the table's import path, which diverges further between apps than this diff
 *        shows — see `insurance-history-table.tsx`'s header for the real A-vs-B comparison and why B was
 *        the base for the vendored table. `InsurancePolicy`/`Vehicle` now come from the module's own
 *        `types.ts`.
 */

import { Header } from "@/components/page-header/header";
import { Card } from "antd";
import type { FC } from "react";
import type { Vehicle } from "../types";
import { InsuranceHistoryTable } from "./insurance-history-table";

type Props = {
	vehicleData?: Vehicle;
	loading?: boolean;
};

const InsuranceHistory: FC<Props> = ({ vehicleData, loading }) => {
	return (
		<Card>
			<div className="flex flex-col gap-3">
				<Header title="Insurance History" />
				<InsuranceHistoryTable data={vehicleData?.insurance_policies || []} loading={loading} />
			</div>
		</Card>
	);
};
export default InsuranceHistory;
