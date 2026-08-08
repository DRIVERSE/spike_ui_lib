/**
 * @lib-native
 * Thin lazy-loaded wrapper so `index.tsx` can `lazy(() => import(...))` the tenure tab exactly as both
 * apps did — `useTenureConfig` plus `ComplianceDocumentSection` is the whole tab.
 */

import { ComplianceDocumentSection } from "../compliance-table";
import { useTenureConfig } from "../configs/tenure";
import type { ComplianceVehicle } from "../types";

const TenureTab = ({ vehicle }: { vehicle?: ComplianceVehicle; loading?: boolean }) => {
	const config = useTenureConfig(vehicle);
	return <ComplianceDocumentSection {...config} />;
};

export default TenureTab;
