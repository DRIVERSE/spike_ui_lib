/**
 * @lib-native
 * The apps threaded `@apollo/client`/`@tanstack/react-query` hooks and zustand stores
 * (`permissionStore`, `vehicleDetailsStore`, `paymentConfirmationStore`, `fileUploadStore`, `taskStore`,
 * `userStore`) straight into every leaf component that needed them. A prop for each of those through a
 * five-level-deep tree (status card / current card / history table / edit form / upload widget) would
 * make every intermediate component take a fistful of pass-through props it never reads itself — so,
 * mirroring how the apps used stores, this is a module-internal React context instead. One provider at
 * the top, `useVehicleCompliance()` anywhere below it.
 */

import { type ReactNode, createContext, useContext } from "react";
import type { ComplianceNavigation, VehicleComplianceDataSource } from "./types";

export type VehicleComplianceContextValue = {
	dataSource: VehicleComplianceDataSource;
	navigation: ComplianceNavigation;
	/** Flat permission-code list — see `usePermission` in `@/hooks`, which this context feeds. */
	permissions: string[];
	/** Base path the module builds "add X" / "edit X" routes under, e.g. `/vehicle-park/vehicles`. */
	basePath: string;
};

const VehicleComplianceContext = createContext<VehicleComplianceContextValue | null>(null);

export const VehicleComplianceProvider = ({
	children,
	...value
}: VehicleComplianceContextValue & { children: ReactNode }) => (
	<VehicleComplianceContext.Provider value={value}>{children}</VehicleComplianceContext.Provider>
);

export const useVehicleCompliance = (): VehicleComplianceContextValue => {
	const ctx = useContext(VehicleComplianceContext);
	if (!ctx) {
		throw new Error("useVehicleCompliance must be used within a VehicleComplianceProvider");
	}
	return ctx;
};
