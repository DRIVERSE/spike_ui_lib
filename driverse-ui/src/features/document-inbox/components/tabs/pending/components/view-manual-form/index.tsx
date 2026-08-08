/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/documents/document-inbox/components/tabs/pending/components/view-manual-form/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/documents/document-inbox/components/tabs/pending/components/view-manual-form/index.tsx
 * @status decoupled
 * @notes A's `DocxViewer` was `@/components/docx-viewer` (never actually implemented — an app bug); B's
 *        was `@/features/vehicle-parks/vehicles/components/upload-option/v2-upload-option`, a real PDF/
 *        docx/image previewer built on `react-pdf` + `react-file-viewer` + the app's `taskStore` (zustand)
 *        for the blob URL. Neither can live in the library as-is (`react-file-viewer` isn't a dependency,
 *        and the store is gone — see `provider.tsx`). The whole viewer becomes the `renderDocumentPreview`
 *        render prop, read off `useDocumentInbox()`; the module now tracks `{ url, extension, loading }`
 *        itself (in `useMannualFormActions`, as local state — see that hook's notes) and hands it to
 *        whatever the app renders, the same seam fleet-tracking-map uses for `renderSidePanel`. Without a
 *        `renderDocumentPreview`, this falls back to the library's `<Fallback>`.
 *          - `react-icons/io5`'s `IoSearch` -> `<Iconify icon="solar:magnifer-outline">`.
 */

import Fallback from "@/components/fallback";
import { useTranslate } from "@/i18n/translate";
import Iconify from "@/icons/iconify-icon";
import { Card, Form, Select } from "antd";
import type React from "react";

import { useMannualFormActions } from "../../../../../hooks/useMannualFormActions";
import { useDocumentInbox } from "../../../../../provider";
import { CirculationCard } from "../forms/circulation-card";
import { Insurance } from "../forms/insurance";
import Ownership from "../forms/ownership";
import { PollutionTest } from "../forms/pollution-test";

type Props = { documentType?: string };

const VIEWER_HEIGHT = "calc(100vh - 10rem)";

export const ViewManualForm: React.FC<Props> = ({ documentType }) => {
	const t = useTranslate();
	const { renderDocumentPreview } = useDocumentInbox();
	const { error, vehicleOptions, loadingAll, selectedVehicle, handleVehicleChange, blobUrl } = useMannualFormActions();

	let content: React.ReactNode;
	switch (documentType) {
		case "pollution_test":
			content = <PollutionTest />;
			break;
		case "ownership_fee":
			content = <div>Ownership Fee Form</div>;
			break;
		case "insurance":
			content = <Insurance />;
			break;
		case "circulation":
			content = <CirculationCard />;
			break;
		case "tenencia":
		case "refrendo":
			content = <Ownership selectedVehicle={selectedVehicle} />;
			break;
		default:
			break;
	}

	return (
		<Card
			styles={{
				body: { padding: 0, height: VIEWER_HEIGHT, overflow: "hidden" },
			}}
		>
			<div className="flex h-full">
				{/* Left — Document Viewer */}
				<div className="flex flex-col border-r" style={{ width: "55%", height: VIEWER_HEIGHT }}>
					<h3 className="font-semibold px-4 py-3 border-b flex-shrink-0">Uploaded Document</h3>
					<div className="flex-1 overflow-auto p-3">
						{error ? (
							<Fallback title="Failed to load document" />
						) : renderDocumentPreview ? (
							renderDocumentPreview(blobUrl)
						) : (
							<Fallback
								icon={<Iconify icon="solar:folder-open-bold-duotone" size={56} className="text-gray-400" />}
								description="Select a document from the folder tree to preview"
							/>
						)}
					</div>
				</div>

				{/* Right — Form */}
				<div className="flex flex-col" style={{ width: "45%", height: VIEWER_HEIGHT }}>
					<h3 className="font-semibold px-4 py-3 border-b flex-shrink-0 capitalize">
						{documentType?.replaceAll("_", " ") || "Manual Entry Form"}
					</h3>

					<div className="flex-1 overflow-auto px-4 py-3">
						<Card className="!mb-3">
							<Form layout="vertical">
								<Form.Item required label={t("sys.employee_benefits.vehicle_source.search_vehicles")}>
									<Select
										disabled={loadingAll}
										value={selectedVehicle}
										onChange={(value) => handleVehicleChange(value)}
										style={{ height: 35 }}
										showSearch
										defaultActiveFirstOption={false}
										filterOption={(input, option) =>
											String(option?.label ?? "")
												.toLowerCase()
												.includes(input.toLowerCase()) ||
											(typeof option?.label === "string" &&
												(option.label as string).toLowerCase().includes(input.toLowerCase()))
										}
										suffixIcon={<Iconify icon="solar:magnifer-outline" size={16} />}
										options={vehicleOptions}
									/>
								</Form.Item>
							</Form>
						</Card>
						{content}
					</div>
				</div>
			</div>
		</Card>
	);
};
