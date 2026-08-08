/** @lib-native */

import { type ReactNode, createContext, useCallback, useContext, useMemo, useState } from "react";
import type {
	AddPolicyModalContext,
	FilePreviewContext,
	InsuranceFormValues,
	VehicleInsuranceDataSource,
	VehicleInsuranceNavigation,
	VehicleInsuranceUserProfile,
} from "./types";

/**
 * Everything the module previously read from app singletons — `useInsuranceStore` (zustand),
 * `useVehicleDetailsResponseStore`/`useUserStore` (client id, autofill profile) and `usePermissionStore`
 * (the `useCan` checks in the two section cards) — lives here instead, scoped to the provider's subtree
 * rather than a global store. Consumed through `useVehicleInsurance()` so the deeply nested form
 * components (policy-info, policy-holder, review, the section cards) don't need it prop-drilled.
 */
type VehicleInsuranceContextValue = {
	dataSource: VehicleInsuranceDataSource;
	navigation: VehicleInsuranceNavigation;
	clientId: string;
	vehicleId: string;
	userProfile?: VehicleInsuranceUserProfile;
	/** Permission codes for the signed-in user. Checked with the library's `usePermission`. */
	permissions?: string[];

	activeTab: string;
	setActiveTab: (tab: string) => void;

	openInsurance: boolean;
	setOpenInsurance: (open: boolean) => void;

	formValues: InsuranceFormValues;
	setFormValue: <K extends keyof InsuranceFormValues>(key: K, value: InsuranceFormValues[K]) => void;
	resetAll: () => void;
	isFormValid: boolean;
	isPolicyHolderFormValid: boolean;

	/** Renders the app's file-preview modal (was the compliance feature's `PreviewImageModal`, lazy-loaded
	 * and out of this module's scope). Used by the overview attachment "View" action and the history table. */
	renderFilePreview?: (ctx: FilePreviewContext) => ReactNode;
	/** Renders the app's "add insurance policy" modal shortcut (was QA's
	 * `@/features/vehicle-park/components/modals/add-insurance-policy`, out of scope). The full add-policy
	 * page (`overview/components/add-policy-form`) does not need this. */
	renderAddPolicyModal?: (ctx: AddPolicyModalContext) => ReactNode;
};

const VehicleInsuranceContext = createContext<VehicleInsuranceContextValue | null>(null);

export type VehicleInsuranceProviderProps = {
	children: ReactNode;
	dataSource: VehicleInsuranceDataSource;
	navigation: VehicleInsuranceNavigation;
	/** Was `useClientId() || vehicleDetails?.client_id`. */
	clientId: string;
	/** Was `useParams().id`. */
	vehicleId: string;
	userProfile?: VehicleInsuranceUserProfile;
	permissions?: string[];
	renderFilePreview?: (ctx: FilePreviewContext) => ReactNode;
	renderAddPolicyModal?: (ctx: AddPolicyModalContext) => ReactNode;
};

const emptyFormValues: InsuranceFormValues = {};

export const VehicleInsuranceProvider = ({
	children,
	dataSource,
	navigation,
	clientId,
	vehicleId,
	userProfile,
	permissions,
	renderFilePreview,
	renderAddPolicyModal,
}: VehicleInsuranceProviderProps) => {
	const [activeTab, setActiveTab] = useState("overview");
	const [openInsurance, setOpenInsurance] = useState(false);
	const [formValues, setFormValues] = useState<InsuranceFormValues>(emptyFormValues);

	const setFormValue = useCallback(<K extends keyof InsuranceFormValues>(key: K, value: InsuranceFormValues[K]) => {
		setFormValues((prev) => ({ ...prev, [key]: value }));
	}, []);

	const resetAll = useCallback(() => {
		setFormValues(emptyFormValues);
		setActiveTab("overview");
	}, []);

	const isFormValid = Boolean(
		formValues.company_name &&
			formValues.unique_policy_no &&
			formValues.coverage_start_date &&
			formValues.coverage_end_date &&
			formValues.policy_holder_name &&
			formValues.rfc,
	);
	const isPolicyHolderFormValid = Boolean(formValues.policy_holder_name && formValues.rfc);

	const value = useMemo<VehicleInsuranceContextValue>(
		() => ({
			dataSource,
			navigation,
			clientId,
			vehicleId,
			userProfile,
			permissions,
			activeTab,
			setActiveTab,
			openInsurance,
			setOpenInsurance,
			formValues,
			setFormValue,
			resetAll,
			isFormValid,
			isPolicyHolderFormValid,
			renderFilePreview,
			renderAddPolicyModal,
		}),
		[
			dataSource,
			navigation,
			clientId,
			vehicleId,
			userProfile,
			permissions,
			activeTab,
			openInsurance,
			formValues,
			setFormValue,
			resetAll,
			isFormValid,
			isPolicyHolderFormValid,
			renderFilePreview,
			renderAddPolicyModal,
		],
	);

	return <VehicleInsuranceContext.Provider value={value}>{children}</VehicleInsuranceContext.Provider>;
};

export const useVehicleInsurance = (): VehicleInsuranceContextValue => {
	const ctx = useContext(VehicleInsuranceContext);
	if (!ctx) {
		throw new Error("useVehicleInsurance must be used within a VehicleInsuranceProvider");
	}
	return ctx;
};
