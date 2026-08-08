/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/components/upload-option/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/components/upload-option/index.tsx
 * @status adopted-A
 * @notes Not one of the 14 listed files and not explicitly in the decoupling map, but `add-policy-form`
 *        renders it beside `Form`, so it's vendored here. A adopted: A's preview is a plain
 *        iframe/`<img>`, self-contained. B's preview renders `DocxViewer` (its own
 *        `v2-upload-option.tsx`, ~150 more lines with its own doc-conversion service call) instead of the
 *        PDF iframe / image branches — a bigger, separately-coupled component this module has no reason
 *        to pull in for what is, in both apps, just an image-or-PDF policy document.
 *        `CompliceDocsUpload` -> `InsuranceDocumentUpload`.
 */

import { useTranslate } from "@/i18n/translate";
import Iconify from "@/icons/iconify-icon";
import { Button, Card } from "antd";
import type { FC } from "react";
import type { InsuranceDocumentUpload } from "../hooks/use-insurance-document-upload";

type Props = {
	upload: InsuranceDocumentUpload;
};

export const UploadInsuranceDocument: FC<Props> = ({ upload }) => {
	const t = useTranslate();
	const { Dragger, props, preview, fileName, reset, selectedFile, handleCancel, isUploading } = upload;

	const isPDF = fileName?.toLowerCase().endsWith(".pdf");

	return (
		<div className="flex flex-col gap-6 h-full">
			<Card className="h-full" styles={{ body: { height: "100%" } }}>
				{!preview ? (
					<Dragger {...props} className="drag-full h-full">
						<div className="flex flex-col items-center justify-center text-center py-4 h-full">
							<Iconify icon="bytesize:upload" className="text-5xl text-blue-500 mb-2" />
							<p className="ant-upload-text">{t("sys.uploadDocument.clickUpload")}</p>
							<p className="ant-upload-hint">{t("sys.uploadDocument.fileFormats")}</p>
						</div>
					</Dragger>
				) : (
					<>
						{isPDF ? (
							<div className="flex flex-col gap-3 h-full">
								{/* PDF Info Bar */}
								<div className="flex justify-between items-center p-3 rounded-md border border-gray-300">
									<div className="flex items-center gap-3">
										<Iconify icon="mdi:file-pdf-box" className="text-4xl text-red-500" />
										<span className="truncate max-w-[300px] font-medium">{fileName}</span>
									</div>
									<Button type="primary" onClick={reset} disabled={isUploading}>
										{t("sys.uploadDocument.change")}
									</Button>
								</div>

								{/* PDF Preview iframe */}
								<div className="flex-1 border border-gray-300 rounded-md overflow-hidden min-h-[500px]">
									<iframe
										src={`${preview}#toolbar=1&navpanes=0&scrollbar=1`}
										className="w-full h-full border-0"
										title={fileName as string}
										style={{ minHeight: "500px" }}
									/>
								</div>
							</div>
						) : (
							<div className="flex flex-col p-3 gap-4 rounded-md border border-dashed border-gray-300 h-full max-h-[700px]">
								<div className="flex-1 overflow-auto">
									<div className="flex items-center justify-center w-full h-full">
										<img
											src={preview}
											alt="preview"
											style={{
												objectFit: "contain",
												maxWidth: "100%",
												maxHeight: "100%",
												borderRadius: 6,
											}}
										/>
									</div>
								</div>

								<div className="flex justify-between items-center flex-shrink-0">
									<span className="truncate max-w-[70%]">{fileName}</span>
									<Button type="primary" onClick={reset} disabled={isUploading}>
										{t("sys.uploadDocument.change")}
									</Button>
								</div>
							</div>
						)}
					</>
				)}
			</Card>

			<div className="flex justify-end gap-2">
				<Button onClick={handleCancel} disabled={isUploading || !selectedFile}>
					{t("sys.uploadDocument.cancel")}
				</Button>
			</div>
		</div>
	);
};
