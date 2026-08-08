/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/hooks/web/use-uploadfile.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/hooks/web/use-uploadfile.tsx
 * @status decoupled
 * @notes The most coupled hook in this wave. Three app dependencies removed:
 *        1. `import.meta.env.VITE_UPLOAD_URL` -> `filesApiUrl` option (the apps also re-exported
 *           FILE_BASE_API from here, which is why use-get-fileurl imported it from an upload hook).
 *        2. `client.refetchQueries({ include: ["documentCategories"] })` from the app's apollo singleton
 *           -> an `onUploaded` callback. Apps keep the refetch, the library keeps no GraphQL client.
 *        3. sonner's toast -> the same optional `notify` callback used by use-export.
 *        Behaviour otherwise preserved, including PDF-only validation, drag state and the 100 ms
 *        auto-upload delay after a drop. The multipart Content-Type header is dropped on purpose —
 *        see the note in use-resource.ts about boundaries.
 *        The apps diverge only in formatting plus B's extra `documentType` form field, which is carried
 *        over as an optional key on UploadData.
 */

import { type ChangeEvent, type DragEvent, useRef, useState } from "react";
import type { ApiResourceRequest } from "./use-resource";

export type FileStatus = "success" | "error" | "uploaded";

export type UploadData = {
	customerId?: string;
	category?: string;
	uniqueId?: string;
	documentGroup?: string;
	documentType?: string;
	split?: boolean;
	showToast?: boolean;
};

export interface ProcessedFile {
	file: File;
	id: string;
	status: FileStatus;
	message: string;
}

export type UseFileUploadProps = {
	apiResource: (request: ApiResourceRequest) => Promise<any>;
	/** Files endpoint, e.g. `${uploadUrl}/api/v1/files`. `/upload` is appended. */
	filesApiUrl: string;
	setIsUpload?: (value: boolean) => void;
	uploadData?: UploadData;
	/** Ran after a successful upload — where the apps refetched their documentCategories query. */
	onUploaded?: (response: unknown) => void | Promise<void>;
	notify?: (level: "success" | "error", message: string) => void;
};

export const useFileUpload = ({
	apiResource,
	filesApiUrl,
	setIsUpload,
	uploadData,
	onUploaded,
	notify,
}: UseFileUploadProps) => {
	const [files, setFiles] = useState<ProcessedFile[]>([]);
	const [isDragging, setIsDragging] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleDragEnter = (e: DragEvent<HTMLDivElement>): void => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	};

	const handleDragLeave = (e: DragEvent<HTMLDivElement>): void => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	};

	const handleDragOver = (e: DragEvent<HTMLDivElement>): void => {
		e.preventDefault();
		e.stopPropagation();
		if (!isDragging) {
			setIsDragging(true);
		}
	};

	const uploadFiles = async (
		{ customerId, category, uniqueId, documentGroup, documentType, split = false, showToast = true }: UploadData,
		filesToUpload?: ProcessedFile[],
	) => {
		const validFiles = (filesToUpload || files).filter((file) => file.status === "success");

		const formData = new FormData();
		for (const processed of validFiles) {
			formData.append("files", processed.file);
		}

		formData.append("customerId", customerId ?? "");
		formData.append("category", category ?? "");
		formData.append("uniqueId", uniqueId ?? "");
		formData.append("documentGroup", documentGroup ?? "");
		if (documentType !== undefined) formData.append("documentType", documentType);
		formData.append("split", split ? "true" : "false");

		try {
			setLoading(true);
			const res = await apiResource({
				path: `${filesApiUrl}/upload`,
				method: "post",
				payload: formData,
			});
			if (showToast) notify?.("success", "File uploaded successfully!");

			await onUploaded?.(res);

			setFiles([]);
			setLoading(false);
			setIsUpload?.(false);
			return res;
		} catch (_err) {
			if (showToast) notify?.("error", "Failed to upload file(s)");
			setLoading(false);
		}
	};

	const processFiles = (newFiles: File[], shouldAutoUpload = false): void => {
		const processedFiles: ProcessedFile[] = newFiles.map((file) => {
			const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
			if (!isPdf) {
				return {
					file,
					id: `${file.name}-${Date.now()}`,
					status: "error",
					message: "Only PDF files are allowed",
				};
			}
			return {
				file,
				id: `${file.name}-${Date.now()}`,
				status: "success",
				message: "Ready to upload",
			};
		});

		if (processedFiles.some((f) => f.status === "error" && f.message === "Only PDF files are allowed")) {
			notify?.("error", "Only PDF files are allowed");
		}

		setFiles((prev) => [...prev, ...processedFiles]);

		// Auto-upload on drop when uploadData is provided.
		if (shouldAutoUpload && uploadData) {
			const allFiles = [...files, ...processedFiles];
			setTimeout(() => {
				uploadFiles(uploadData, allFiles);
			}, 100);
		}
	};

	const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);

		processFiles(Array.from(e.dataTransfer.files), true);
	};

	const handleFileInput = (e: ChangeEvent<HTMLInputElement>): void => {
		if (e.target.files) {
			processFiles(Array.from(e.target.files));
		}
	};

	const removeFile = (id: string): void => {
		setFiles(files.filter((file) => file.id !== id));
	};

	const openFileDialog = (): void => {
		fileInputRef.current?.click();
	};

	return {
		openFileDialog,
		handleDrop,
		uploadFiles,
		handleDragOver,
		removeFile,
		handleFileInput,
		handleDragEnter,
		handleDragLeave,
		loading,
		isDragging,
		files,
		fileInputRef,
	};
};

export default useFileUpload;
