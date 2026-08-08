/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/documents/document-inbox/components/DocumentUploadArea.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/documents/document-inbox/components/DocumentUploadArea.tsx
 * @status identical
 * @notes Byte-identical in both apps modulo a large commented-out block (an alternate, unused files-list
 *        rendering) dropped as dead code. Purely presentational — it takes `uploadState` (the return value
 *        of `hooks/useDocumentUpload`) as a prop, so it needed no decoupling of its own; only its import
 *        paths (the type and the two relative siblings) moved.
 */

import { useTranslate } from "@/i18n/translate";
import { Icon } from "@iconify/react";
import React, { Suspense } from "react";

import type { UseDocumentUploadReturn } from "../hooks/useDocumentUpload";
import { ProcessingOverlay } from "./modals/processing-overlay";
import SelectedFilesTable from "./table/fleet-vehicles-table";

interface DocumentUploadAreaProps {
	onFilesSelected?: (files: File[]) => void;
	onUploadComplete?: () => void;
	uploadState: UseDocumentUploadReturn;
}

export const DocumentUploadArea: React.FC<DocumentUploadAreaProps> = ({
	onFilesSelected,
	onUploadComplete,
	uploadState,
}) => {
	const t = useTranslate();
	const {
		isDragging,
		isUploading,
		uploadProgress,
		error,
		files,
		uploadPhase,
		handleDragEnter,
		handleDragLeave,
		handleDragOver,
		handleDrop,
		handleFileSelect,
		uploadFiles,
		clearFiles,
		clearError,
		hanndleFilter,
	} = uploadState;

	const inputRef = React.useRef<HTMLInputElement>(null);

	React.useEffect(() => {
		if (files.length > 0 && onFilesSelected) {
			onFilesSelected(files);
		}
	}, [files, onFilesSelected]);

	const handleUploadClick = async () => {
		await uploadFiles();
		if (onUploadComplete) {
			onUploadComplete();
		}
	};

	const handleBrowseClick = () => {
		inputRef.current?.click();
	};

	return (
		<div style={{ width: "100%" }}>
			{/* Upload Area */}
			<div
				onDragEnter={handleDragEnter}
				onDragLeave={handleDragLeave}
				onDragOver={handleDragOver}
				onDrop={handleDrop}
				style={{
					border: `2px dashed ${isDragging ? "#2196F3" : "#ddd"}`,
					borderRadius: "8px",
					padding: "48px 24px",
					textAlign: "center",
					backgroundColor: isDragging ? "rgba(33, 150, 243, 0.05)" : "#fafafa",
					cursor: "pointer",
					transition: "all 0.3s ease",
				}}
			>
				<div style={{ marginBottom: "16px" }} className="flex items-center justify-center">
					<Icon icon="ri:upload-cloud-line" width={36} height={36} color="#5f8bfa" />
				</div>

				<p style={{ margin: "8px 0 16px 0", fontSize: "16px" }}>
					{t("sys.documents.upload.subtitle")}{" "}
					<button
						type="button"
						onClick={handleBrowseClick}
						className="text-primary"
						style={{
							background: "none",
							border: "none",
							cursor: "pointer",
							textDecoration: "underline",
							fontSize: "14px",
							fontWeight: 500,
							padding: 0,
						}}
					>
						{t("sys.documents.upload.browse")}
					</button>
				</p>

				<p style={{ margin: "8px 0 0 0", fontSize: "14px" }}>{t("sys.documents.upload.fileLimit")}</p>

				<input
					ref={inputRef}
					type="file"
					multiple
					accept=".jpg,.jpeg,.png,.pdf"
					onChange={handleFileSelect}
					style={{ display: "none" }}
				/>
			</div>

			{/* Error Message */}
			{error && (
				<div
					style={{
						marginTop: "16px",
						padding: "12px 16px",
						backgroundColor: "#ffebee",
						border: "1px solid #ef5350",
						borderRadius: "4px",
						color: "#c62828",
						fontSize: "14px",
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
					}}
				>
					<span>{error}</span>
					<button
						type="button"
						onClick={clearError}
						style={{
							background: "none",
							border: "none",
							cursor: "pointer",
							fontSize: "16px",
							color: "#c62828",
							padding: "0 4px",
						}}
					>
						×
					</button>
				</div>
			)}

			{/* Files List */}
			{files.length > 0 && (
				<div style={{ marginTop: "24px" }}>
					<h4 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: 600 }}>
						{t("sys.documents.upload.selectedFiles")} ({files.length})
					</h4>
					<SelectedFilesTable
						data={files}
						isLoading={isUploading}
						handleCancel={clearFiles}
						handleProcess={handleUploadClick}
						onAction={(file) => {
							hanndleFilter(file);
						}}
					/>
				</div>
			)}
			<Suspense>
				<ProcessingOverlay
					open={isUploading}
					phase={uploadPhase === "idle" ? "preparing" : uploadPhase}
					progress={uploadProgress}
					fileCount={files.length}
				/>
			</Suspense>
		</div>
	);
};

export default DocumentUploadArea;
