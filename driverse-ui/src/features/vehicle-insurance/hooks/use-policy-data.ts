/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/hooks/usePolicyData.ts
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/hooks/usePolicyData.ts
 * @status identical
 * @notes Byte-identical in both apps (A also carries a commented-out, dayjs-`.diff`-based earlier version;
 *        dropped as dead code). No app coupling at all — pure derivation over `Vehicle`/`InsurancePolicy` —
 *        so this is a straight lift, not a decoupling.
 */

import { useMemo } from "react";
import type { Vehicle } from "../types";

export const usePolicyData = (vehicleData?: Vehicle) => {
	const policyData = vehicleData?.insurance_policies || [];
	const policyFirstItem = policyData[0];

	const daysRemaining = useMemo(() => {
		if (!policyFirstItem?.coverage_end) return 0;

		// Extract just the date part (YYYY-MM-DD)
		const endDateStr = policyFirstItem.coverage_end.split("T")[0];

		// Get today's date in YYYY-MM-DD format (local timezone)
		const today = new Date();
		const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
			today.getDate(),
		).padStart(2, "0")}`;

		// Parse dates manually to avoid timezone issues
		const [endYear, endMonth, endDay] = endDateStr.split("-").map(Number);
		const [todayYear, todayMonth, todayDay] = todayStr.split("-").map(Number);

		const endDate = new Date(endYear, endMonth - 1, endDay);
		const todayDate = new Date(todayYear, todayMonth - 1, todayDay);

		// Calculate difference in days
		const diffTime = endDate.getTime() - todayDate.getTime();
		const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

		return diffDays;
	}, [policyFirstItem]);

	return { policyData, policyFirstItem, daysRemaining };
};
