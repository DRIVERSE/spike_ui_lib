/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/hooks/useCompliceDocsUpload.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/hooks/useCompliceDocsUpload.tsx
 * @status decoupled
 * @notes Not one of the 14 listed files, but both `add-policy-form` and `edit` call it, so it has to live
 *        somewhere in the module. A is the base: B's additions are two more app singletons this module
 *        can't take on cleanly — `useFileStore` (a cross-feature blob-url cache used by unrelated compliance
 *        screens) and a `useLocation`-driven "reset on route change" effect, which doesn't apply once the
 *        upload state is scoped to a mounted form rather than a global store. B's other change, an
 *        opt-out `shouldCancel` flag on `processUpload`, is kept — the edit form's document section needs it.
 *        The transport swap: `useFileUpload` (an app hook wrapping `useApiResource`) becomes
 *        `dataSource.uploadDocument`, and the upload-details cache (`useFileUploadResponseStore`) is
 *        dropped — nothing in this module's UI reads it back.
 */

import { toast } from "@/components/toast";
import { Upload } from "antd";
import type { UploadProps } from "antd";
import type { RcFile } from "antd/es/upload";
import { useState } from "react";
import type { UploadDocumentPayload, UploadDocumentResult, VehicleInsuranceDataSource } from "../types";

export type InsuranceDocumentUpload = {
	Dragger: typeof Upload.Dragger;
	props: UploadProps;
	preview: string | null;
	fileName: string | null;
	reset: () => void;
	shouldShowExisting: boolean;
	isEditing: boolean;
	setIsEditing: (value: boolean) => void;
	selectedFile: RcFile | null;
	setSelectedFile: (file: RcFile | null) => void;
	handleCancel: () => void;
	processUpload: (
		payload: UploadDocumentPayload & { shouldCancel?: boolean },
		file?: RcFile,
	) => Promise<UploadDocumentResult | undefined>;
	isUploading: boolean;
};

export const useInsuranceDocumentUpload = (dataSource: VehicleInsuranceDataSource): InsuranceDocumentUpload => {
	const { Dragger } = Upload;
	const [preview, setPreview] = useState<string | null>(null);
	const [fileName, setFileName] = useState<string | null>(null);
	const [selectedFile, setSelectedFile] = useState<RcFile | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [isUploading, setIsUploading] = useState(false);

	const props: UploadProps = {
		name: "file",
		multiple: false,
		accept: ".png,.jpg,.jpeg,image/png,image/jpeg,application/pdf",
		beforeUpload: (file) => {
			const allowed = file.type === "image/jpeg" || file.type === "image/png" || file.type === "application/pdf";

			if (!allowed) {
				toast.error("Only JPG, PNG, or PDF files are allowed!", { position: "top-center" });
				return Upload.LIST_IGNORE;
			}
			if (file.size / 1024 / 1024 > 10) {
				toast.error("File must be smaller than 10MB!", { position: "top-center" });
				return Upload.LIST_IGNORE;
			}

			const reader = new FileReader();
			reader.onload = (e) => setPreview(e.target?.result as string);
			reader.readAsDataURL(file);

			setFileName(file.name);
			setSelectedFile(file);
			setIsEditing(true);

			return false; // Prevent auto-upload
		},
	};

	const handleCancel = () => {
		setPreview(null);
		setFileName(null);
		setSelectedFile(null);
		setIsEditing(false);
	};

	const processUpload = async (
		{ shouldCancel = true, ...payload }: UploadDocumentPayload & { shouldCancel?: boolean },
		file?: RcFile,
	) => {
		const fileToUpload = file ?? selectedFile;
		if (!fileToUpload) return undefined;

		setIsUploading(true);
		try {
			const resp = await dataSource.uploadDocument(payload, fileToUpload);
			if (resp?.status === 200 && shouldCancel) {
				handleCancel();
			}
			return resp;
		} catch (error) {
			console.error("Upload error:", error);
			return undefined;
		} finally {
			setIsUploading(false);
		}
	};

	const reset = () => {
		setPreview(null);
		setFileName(null);
		setIsEditing(true); // Switch to upload UI
	};

	const shouldShowExisting = !isEditing && !preview;

	return {
		Dragger,
		props,
		preview,
		fileName,
		reset,
		shouldShowExisting,
		isEditing,
		setIsEditing,
		selectedFile,
		setSelectedFile,
		handleCancel,
		processUpload,
		isUploading,
	};
};
