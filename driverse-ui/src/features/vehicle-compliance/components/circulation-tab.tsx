/**
 * @lib-native
 * Thin lazy-loaded wrapper so `index.tsx` can `lazy(() => import(...))` the circulation tab exactly as
 * both apps did — `useCirculationConfig` plus `ComplianceDocumentSection` is the whole tab.
 */

import { ComplianceDocumentSection } from "../compliance-table";
import { useCirculationConfig } from "../configs/circulation";
import type { ComplianceVehicle } from "../types";

const CirculationTab = ({ vehicle, loading }: { vehicle?: ComplianceVehicle; loading?: boolean }) => {
	const config = useCirculationConfig(vehicle);
	return <ComplianceDocumentSection loading={loading} {...config} />;
};

export default CirculationTab;
