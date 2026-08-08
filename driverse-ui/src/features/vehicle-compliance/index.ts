/** @lib-native */

export { VehicleCompliance, default, type VehicleComplianceProps } from "./vehicle-compliance";
export { VehicleComplianceProvider, useVehicleCompliance, type VehicleComplianceContextValue } from "./provider";

export {
	ComplianceDocumentSection,
	type ComplianceDocumentSectionProps,
	ComplianceStatusCard,
	type ComplianceStatusCardProps,
	ComplianceDocumentCard,
	type ComplianceDocumentCardProps,
	ComplianceHistoryTable,
	type ComplianceHistoryTableProps,
	ComplianceAdditionalInfo,
	type ComplianceAdditionalInfoProps,
} from "./compliance-table";

export { PreviewFileModal, type PreviewFileModalProps } from "./shared/preview-file-modal";
export { UploadComplianceImage, type UploadComplianceImageProps } from "./shared/upload-compliance-image";
export { PaymentOptions, type PaymentOptionsProps } from "./shared/payment-options";

export {
	useCirculationConfig,
	circulationFields,
	buildCirculationHistoryColumns,
	type UseCirculationConfigOptions,
} from "./configs/circulation";
export {
	useVerificationConfig,
	verificationFields,
	buildVerificationHistoryColumns,
	isPollutionTestExcludedState,
	POLLUTION_TEST_EXCLUDED_STATES,
	type UseVerificationConfigOptions,
} from "./configs/verification";
export {
	useTenureConfig,
	buildTenureHistoryColumns,
	type UseTenureConfigOptions,
} from "./configs/tenure";

export { TenureYearlyStatusGrid, type TenureYearlyStatusGridProps } from "./components/tenure/yearly-status-grid";

export type {
	ComplianceAdditionalInfoConfig,
	ComplianceChip,
	ComplianceDocumentCardConfig,
	ComplianceFileRef,
	ComplianceKind,
	ComplianceNavigation,
	ComplianceStatusAction,
	ComplianceStatusCardConfig,
	CirculationCard,
	CompliancePermissionCode,
	ComplianceVehicle,
	OwnershipPaymentRecord,
	OwnershipPaymentStatus,
	PollutionTest,
	UploadCompliancePayload,
	UploadedComplianceFile,
	VehicleComplianceDataSource,
	YearStatus,
} from "./types";
