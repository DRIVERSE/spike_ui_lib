/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/compliance/components/upload-image/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/compliance/components/upload-image/index.tsx
 * @status decoupled
 * @notes B is the richer version and wins the shell (drag/drop area, existing-file card, PDF-vs-image
 *        preview, "controlled" escape hatch for a parent form) — but B's engine,
 *        `useCompliceDocsUpload` (`@/features/vehicle-parks/vehicles/hooks/useCompliceDocsUpload`), is
 *        the single most app-coupled hook in the module: it reads `@/store/fileUploadStore` and
 *        `@/store/taskStore`, calls `sonner`'s toast directly, and wraps the library's own
 *        `use-uploadfile` with react-router's `useLocation`. None of that belongs in a component this
 *        widely reused (three call sites: circulation's current-card, verification's latest, and every
 *        manual-payment form). This version keeps B's JSX and validation rules (jpg/png/pdf, 10MB,
 *        FileReader preview) but drives them off local component state and one injected call,
 *        `dataSource.uploadComplianceDocument(payload, file)` — the same shape `useFileUpload` in
 *        `@/hooks` already returns from its own `uploadFiles`, so an app can implement the data source
 *        method as a thin wrapper around that hook. The `controlled` escape hatch B added for forms that
 *        want to trigger the upload themselves is preserved as `controlled` here too, minus the
 *        `useCompliceDocsUpload`-shaped internals — a parent now passes plain state instead of a hook
 *        result.
 */

import Iconify from "@/icons/iconify-icon";
import { Button, Card, Upload } from "antd";
import type { UploadProps } from "antd";
import { useRef, useState } from "react";
import { useVehicleCompliance } from "../provider";
import type { UploadCompliancePayload, UploadedComplianceFile } from "../types";

const { Dragger } = Upload;

export type UploadedFileRef = { bucketId: string; fileName: string; contentType: string };

export type UploadComplianceControlledState = {
	preview: string | null;
	fileName: string | null;
	selectedFile: File | null;
	isUploading: boolean;
	onSelect: (file: File) => void;
	onReset: () => void;
};

export type UploadComplianceImageProps = {
	data?: UploadedFileRef[];
	payload: UploadCompliancePayload;
	onUploaded?: (files: UploadedComplianceFile[]) => void;
	loading?: boolean;
	/** When true, suppresses the internal Cancel/Process buttons — the parent form's Submit drives upload. */
	hideActions?: boolean;
	hideChangeImage?: boolean;
	/** Controlled mode: parent owns file selection state (used by the manual-payment forms). */
	controlled?: UploadComplianceControlledState;
};

const MAX_SIZE_MB = 10;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];

export const UploadComplianceImage = ({
	data = [],
	payload,
	onUploaded,
	loading,
	hideActions = false,
	hideChangeImage = false,
	controlled,
}: UploadComplianceImageProps) => {
	const { dataSource } = useVehicleCompliance();
	const errorRef = useRef<string | null>(null);

	const [internalPreview, setInternalPreview] = useState<string | null>(null);
	const [internalFileName, setInternalFileName] = useState<string | null>(null);
	const [internalFile, setInternalFile] = useState<File | null>(null);
	const [internalUploading, setInternalUploading] = useState(false);

	const preview = controlled?.preview ?? internalPreview;
	const fileName = controlled?.fileName ?? internalFileName;
	const selectedFile = controlled?.selectedFile ?? internalFile;
	const isUploading = controlled?.isUploading ?? internalUploading;

	const showExisting = data.length > 0 && !preview;
	const isPDF = fileName?.toLowerCase().endsWith(".pdf");

	const reset = () => {
		if (controlled) {
			controlled.onReset();
			return;
		}
		setInternalPreview(null);
		setInternalFileName(null);
		setInternalFile(null);
	};

	const props: UploadProps = {
		name: "file",
		multiple: false,
		accept: ".png,.jpg,.jpeg,image/png,image/jpeg,application/pdf",
		beforeUpload: (file) => {
			if (!ALLOWED_TYPES.includes(file.type)) {
				errorRef.current = "Only JPG, PNG, or PDF files are allowed!";
				return Upload.LIST_IGNORE;
			}
			if (file.size / 1024 / 1024 > MAX_SIZE_MB) {
				errorRef.current = `File must be smaller than ${MAX_SIZE_MB}MB!`;
				return Upload.LIST_IGNORE;
			}

			if (controlled) {
				controlled.onSelect(file);
				return false;
			}

			const reader = new FileReader();
			reader.onload = (e) => setInternalPreview(e.target?.result as string);
			reader.readAsDataURL(file);
			setInternalFileName(file.name);
			setInternalFile(file);
			return false;
		},
	};

	const processUpload = async () => {
		if (!selectedFile) return;
		setInternalUploading(true);
		try {
			const res = await dataSource.uploadComplianceDocument(payload, selectedFile);
			onUploaded?.(res?.files ?? []);
			reset();
		} finally {
			setInternalUploading(false);
		}
	};

	return (
		<>
			{showExisting ? (
				data.map((item) => (
					<Card key={item.fileName} styles={{ body: { padding: 8, minHeight: 20 } }} className="!bg-[#f0f1f2]">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-5">
								<Iconify icon="mdi:image-outline" size={20} />
								<p>{item.fileName}</p>
							</div>
							{!hideChangeImage && (
								<Button type="text" onClick={reset}>
									Change
								</Button>
							)}
						</div>
					</Card>
				))
			) : !preview ? (
				<Dragger {...props}>
					<div className="flex flex-col items-center justify-center text-center py-4">
						<Iconify icon="bytesize:upload" className="text-5xl text-blue-500 mb-2" />
						<p className="ant-upload-text">Click to upload or drag and drop</p>
						<p className="ant-upload-hint">PDF, JPG, or PNG (max 10MB)</p>
					</div>
				</Dragger>
			) : isPDF ? (
				<div className="space-y-3">
					<div className="flex items-center justify-between p-3 gap-4 rounded-md border border-gray-300">
						<div className="flex items-center gap-3">
							<Iconify icon="mdi:file-pdf-box" className="text-4xl text-red-500" />
							<span className="font-medium">{fileName}</span>
						</div>
						<Button type="text" onClick={reset} disabled={isUploading || loading}>
							Change
						</Button>
					</div>
					<div className="border border-gray-300 rounded-md overflow-hidden">
						<iframe
							src={`${preview}#toolbar=1&navpanes=1&scrollbar=1`}
							className="w-full h-[400px] border-0"
							title={fileName ?? "preview"}
						/>
					</div>
				</div>
			) : (
				<div className="flex items-center justify-between p-3 gap-4 rounded-md border border-gray-300">
					<img
						src={preview}
						alt="preview"
						style={{ objectFit: "cover", border: "4px solid #85a5ff", borderRadius: 6, width: 60, height: 60 }}
					/>
					<span className="flex-1">{fileName}</span>
					<Button type="text" onClick={reset} disabled={isUploading || loading}>
						Change
					</Button>
				</div>
			)}

			{!hideActions && !showExisting && preview && (
				<div className="flex justify-end gap-2 mt-4">
					<Button onClick={reset} disabled={isUploading || loading}>
						Cancel
					</Button>
					<Button
						type="primary"
						disabled={!selectedFile || isUploading || loading}
						loading={isUploading || loading}
						onClick={processUpload}
					>
						Process Document
					</Button>
				</div>
			)}
		</>
	);
};

export default UploadComplianceImage;
