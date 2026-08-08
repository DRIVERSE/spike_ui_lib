/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/documents/document-inbox/components/tabs/upload/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/documents/document-inbox/components/tabs/upload/index.tsx
 * @status adopted-B
 * @notes B is the base (`upload.files.length` vs. A's defensive `upload?.files?.length`; `useDocumentUpload`
 *        never returns undefined so B's version is equivalent and simpler). `useDocumentInboxStore` is
 *        `useDocumentInbox()`.
 */

import { useTranslate } from "@/i18n/translate";
import { Icon } from "@iconify/react";
import { Card } from "antd";
import React from "react";

import { DocumentUploadArea, FeatureCard, HowItWorks } from "../..";
import { useDocumentUpload } from "../../../hooks/useDocumentUpload";
import { useDocumentInbox } from "../../../provider";

type Props = {
	onFilesUploaded?: (files: File[]) => void;
};
const InitialUpload: React.FC<Props> = ({ onFilesUploaded }) => {
	const t = useTranslate();
	const upload = useDocumentUpload();
	const { uploadedFiles, setUploadedFiles } = useDocumentInbox();

	const handleFilesSelected = React.useCallback(
		(files: File[]) => {
			setUploadedFiles(files);
		},
		[setUploadedFiles],
	);

	const handleUploadComplete = () => {
		if (onFilesUploaded) {
			onFilesUploaded(uploadedFiles);
		}
		setUploadedFiles([]);
	};

	return (
		<div>
			{/* Upload Area */}
			<div style={{ marginBottom: "48px" }}>
				<Card>
					<DocumentUploadArea
						onFilesSelected={handleFilesSelected}
						onUploadComplete={handleUploadComplete}
						uploadState={upload}
					/>
				</Card>
			</div>

			{upload.files.length < 1 && (
				<>
					{/* Feature Cards */}
					<div style={{ marginBottom: "48px" }}>
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
								gap: "24px",
							}}
						>
							<FeatureCard
								icon={<Icon icon="mage:file-3" width={24} height={24} />}
								title={t("sys.documents.features.supported.title")}
								description={t("sys.documents.features.supported.description")}
							/>
							<FeatureCard
								icon={<Icon icon="ri:upload-cloud-line" width={24} height={24} />}
								title={t("sys.documents.features.batch.title")}
								description={t("sys.documents.features.batch.description")}
							/>
							<FeatureCard
								icon={<Icon icon="gg:check-r" width={24} height={24} />}
								title={t("sys.documents.features.validation.title")}
								description={t("sys.documents.features.validation.description")}
							/>
						</div>
					</div>

					{/* How It Works */}
					<Card>
						<HowItWorks />
					</Card>
				</>
			)}
		</div>
	);
};

export default InitialUpload;
