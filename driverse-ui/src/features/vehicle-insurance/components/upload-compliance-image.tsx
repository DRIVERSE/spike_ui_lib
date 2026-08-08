/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/compliance/components/upload-image/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/compliance/components/upload-image/index.tsx
 * @status decoupled
 * @notes Not one of the 14 listed files and not in the decoupling map — it belongs to the separate
 *        compliance feature — but both `edit/index.tsx` and `overview/index.tsx` render it for the
 *        policy-document uploader, so it is vendored here rather than left as a dangling cross-feature
 *        import. A and B differ only in import order/spacing and stray comments; base is A.
 *        The `controlled` prop's shape now references the module's own `InsuranceDocumentUpload` type
 *        instead of `ReturnType<typeof useCompliceDocsUpload>`; the "run the hook internally" fallback
 *        path is dropped since every call site in this module always passes `controlled` explicitly.
 *        `react-icons/ci`'s `CiImageOn` is rendered through the library's `Iconify` wrapper instead —
 *        same substitution `total-card`/`export-button` made.
 */

import { useTranslate } from "@/i18n/translate";
import Iconify from "@/icons/iconify-icon";
import { Button, Card } from "antd";
import type { UploadProps } from "antd";
import type { RcFile } from "antd/es/upload";
import { type FC, Fragment } from "react";
import type { InsuranceDocumentUpload } from "../hooks/use-insurance-document-upload";
import type { UploadDocumentPayload } from "../types";

type ControlledUploadProps = {
	Dragger: InsuranceDocumentUpload["Dragger"];
	props: UploadProps;
	preview: string | null;
	fileName: string | null;
	reset: () => void;
	shouldShowExisting: boolean;
	selectedFile: RcFile | null;
	handleCancel: () => void;
	processUpload: InsuranceDocumentUpload["processUpload"];
	isUploading: boolean;
};

type Props = {
	data?: { fileName: string }[];
	payload: UploadDocumentPayload;
	/** Called with the uploaded file records once `processUpload` resolves. */
	callBack?: (files?: { id: string }[]) => void;
	loading?: boolean;
	/** Suppresses the internal Cancel/Process Document buttons — the parent form's Submit button drives `processUpload`. */
	hideActions?: boolean;
	hideChangeImage?: boolean;
	controlled: ControlledUploadProps;
};

export const UploadComplianceImage: FC<Props> = ({
	data = [],
	payload,
	callBack,
	loading,
	hideActions = false,
	hideChangeImage = false,
	controlled,
}) => {
	const t = useTranslate();

	const {
		Dragger,
		props,
		preview,
		fileName,
		reset,
		shouldShowExisting,
		selectedFile,
		handleCancel,
		processUpload,
		isUploading,
	} = controlled;

	const showExisting = shouldShowExisting && data.length > 0;
	const isPDF = fileName?.toLowerCase().endsWith(".pdf");

	return (
		<Fragment>
			{showExisting ? (
				data.map((item) => (
					<Card key={item.fileName} styles={{ body: { padding: 8, minHeight: 20 } }} className="!bg-[#f0f1f2]">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-5">
								<Iconify icon="mdi:image-outline" size={20} />
								<div>
									<p>{item.fileName}</p>
								</div>
							</div>
							{!hideChangeImage && (
								<Button type="text" onClick={reset}>
									{t("sys.uploadCompliance.change")}
								</Button>
							)}
						</div>
					</Card>
				))
			) : (
				<Fragment>
					{!preview ? (
						<Dragger {...props}>
							<div className="flex flex-col items-center justify-center text-center py-4">
								<Iconify icon="bytesize:upload" className="text-5xl text-blue-500 mb-2" />
								<p className="ant-upload-text">{t("sys.uploadCompliance.clickUpload")}</p>
								<p className="ant-upload-hint">{t("sys.uploadCompliance.fileFormats")}</p>
							</div>
						</Dragger>
					) : (
						<Fragment>
							{isPDF ? (
								<div className="space-y-3">
									<div className="flex items-center justify-between p-3 gap-4 rounded-md border border-gray-300">
										<div className="flex items-center gap-3">
											<Iconify icon="mdi:file-pdf-box" className="text-4xl text-red-500" />
											<span className="font-medium">{fileName}</span>
										</div>
										<Button type="text" onClick={reset} disabled={isUploading || loading}>
											{t("sys.uploadCompliance.change")}
										</Button>
									</div>
									<div className="border border-gray-300 rounded-md overflow-hidden">
										<iframe
											src={`${preview}#toolbar=1&navpanes=1&scrollbar=1`}
											className="w-full h-[400px] border-0"
											title={fileName as string}
										/>
									</div>
								</div>
							) : (
								<div className="flex items-center justify-between p-3 gap-4 rounded-md border border-gray-300">
									<img
										src={preview}
										alt="preview"
										style={{
											objectFit: "cover",
											border: "4px solid #85a5ff",
											borderRadius: 6,
											width: 60,
											height: 60,
										}}
									/>
									<span className="flex-1">{fileName}</span>
									<Button type="text" onClick={reset} disabled={isUploading || loading}>
										{t("sys.uploadCompliance.change")}
									</Button>
								</div>
							)}
						</Fragment>
					)}

					{/* Only render action buttons when not in controlled/hideActions mode */}
					{!hideActions && (
						<div className="flex justify-end gap-2 mt-4">
							<Button onClick={handleCancel} disabled={isUploading || loading}>
								{t("sys.uploadCompliance.cancel")}
							</Button>
							<Button
								type="primary"
								disabled={!selectedFile || isUploading || loading}
								loading={isUploading || loading}
								onClick={() => {
									processUpload(payload).then((resp) => callBack?.(resp?.detail?.files));
								}}
							>
								{t("sys.uploadCompliance.processDocument")}
							</Button>
						</div>
					)}
				</Fragment>
			)}
		</Fragment>
	);
};
