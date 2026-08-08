/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/documents/document-inbox/hooks/useDocumentUpload.ts
 *   B: Driverse_FE_Business   @ b96eda3 src/features/documents/document-inbox/hooks/useDocumentUpload.ts
 * @status decoupled
 * @notes B is the base (adds `useClientId`; A still read `selectedClientId` off the store). The
 *        `useApiResource` POST to `${FILE_BASE_API}/upload` (`FILE_BASE_API` was
 *        `import.meta.env.VITE_DOCUMENT_INBOX_URL`, an app env var the library can't read) is replaced by
 *        `dataSource.uploadFiles`. `useDocumentInboxStore` is `useDocumentInbox()`. `wait` stays — it's
 *        `@/utils`'s.
 */

import { wait } from "@/utils";
import { useCallback, useState } from "react";

import type { Phase } from "../components/modals/processing-overlay";
import { useDocumentInbox } from "../provider";

export interface DocumentUploadState {
	isDragging: boolean;
	isUploading: boolean;
	uploadProgress: number;
	uploadPhase: Phase;
	error: string | null;
	files: File[];
}

export interface UseDocumentUploadReturn extends DocumentUploadState {
	handleDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
	handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
	handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
	handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
	handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
	uploadFiles: () => Promise<void>;
	clearFiles: () => void;
	clearError: () => void;
	hanndleFilter: (e: File) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 20;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];

export const useDocumentUpload = (): UseDocumentUploadReturn => {
	const { dataSource, clientId, setActiveTab } = useDocumentInbox();
	const [isDragging, setIsDragging] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const [files, setFiles] = useState<File[]>([]);
	const [uploadPhase, setUploadPhase] = useState<Phase>("idle");

	const validateFiles = useCallback(
		(filesToValidate: File[]): boolean => {
			// Check file count
			if (filesToValidate.length + files.length > MAX_FILES) {
				setError(`Maximum ${MAX_FILES} files allowed`);
				return false;
			}

			// Check each file
			for (const file of filesToValidate) {
				if (!ALLOWED_TYPES.includes(file.type)) {
					setError(`File type not allowed: ${file.name}`);
					return false;
				}

				if (file.size > MAX_FILE_SIZE) {
					setError(`File too large: ${file.name}`);
					return false;
				}
			}

			return true;
		},
		[files.length],
	);

	const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	}, []);

	const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			e.stopPropagation();
			setIsDragging(false);

			const droppedFiles = Array.from(e.dataTransfer.files);
			if (validateFiles(droppedFiles)) {
				setFiles((prev) => [...prev, ...droppedFiles]);
				setError(null);
			}
		},
		[validateFiles],
	);

	const handleFileSelect = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const selectedFiles = Array.from(e.target.files || []);
			if (validateFiles(selectedFiles)) {
				setFiles((prev) => [...prev, ...selectedFiles]);
				setError(null);
			}
		},
		[validateFiles],
	);

	const uploadFiles = useCallback(async () => {
		if (files.length === 0) return;

		setIsUploading(true);
		setError(null);
		setUploadPhase("preparing");
		setUploadProgress(0);

		try {
			const interval = setInterval(() => {
				setUploadProgress((prev) => {
					if (prev >= 90) {
						clearInterval(interval);
						return 90;
					}
					return prev + 10;
				});
			}, 200);

			setUploadPhase("uploading");

			const res = await dataSource.uploadFiles(files, clientId);

			clearInterval(interval);
			setUploadProgress(100);
			await wait(400);

			setFiles([]);
			setUploadProgress(0);

			if (res?.status === 200) {
				setUploadPhase("processing");
				setUploadProgress(50); // indeterminate feel during processing
				await wait(5000);

				setUploadPhase("done");
				setUploadProgress(100);
				await wait(1500); // briefly show done state

				setActiveTab("pending");
			}
		} catch (err) {
			setUploadProgress(0);
			setError(err instanceof Error ? err.message : "Upload failed");
		} finally {
			setIsUploading(false);
			setUploadPhase("idle");
		}
	}, [files, dataSource, clientId, setActiveTab]);

	const clearFiles = useCallback(() => {
		setFiles([]);
		setUploadProgress(0);
		setError(null);
	}, []);

	const clearError = useCallback(() => {
		setError(null);
	}, []);
	const hanndleFilter = useCallback(
		(e: File) => {
			const filteredFiles = files.filter((file) => file.name !== e.name);
			setFiles(filteredFiles);
		},
		[files],
	);
	return {
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
	};
};
