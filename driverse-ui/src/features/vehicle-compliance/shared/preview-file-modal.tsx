/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/compliance/components/preview-image/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/compliance/components/preview-image/index.tsx
 * @status merged
 * @notes A and B diverged the most of any shared file here. B's entire file was commented out except a
 *        duplicate block at the bottom (dead code left in place, not a real difference) — that live half
 *        pulls in `@/store/taskStore` (`useFileStore`) and renders `DocxViewer` from
 *        `@/features/vehicle-parks/vehicles/components/upload-option/v2-upload-option`, syncing the
 *        fetched blob URL into the store for that component to read back out. A has no such coupling: it
 *        resolves `fileType` from `contentType` itself and renders an `<iframe>` for PDF / an `<img>` for
 *        images / a "preview not available" fallback directly.
 *        A's self-contained approach won — this library has no `v2-upload-option` and should not need a
 *        store round-trip just to preview a file it already has the URL for. B's one real addition, xlsx
 *        support, is kept: `getExtensionFromContentType` (`@/utils`) picks the branch, and the lib's own
 *        `XlsxViewer` (`@/components/xlsx-viewer`) renders it instead of B's app-store-coupled `DocxViewer`.
 *        `useGetFileUrl` (`@/hooks/web/use-get-fileurl`, Apollo/React Query-backed in both apps) becomes
 *        `dataSource.getFileUrl` — see types.ts.
 */

import { CircleLoading } from "@/components/loading";
import XlsxViewer from "@/components/xlsx-viewer";
import Iconify from "@/icons/iconify-icon";
import { getExtensionFromContentType } from "@/utils";
import { Modal } from "antd";
import { useEffect, useState } from "react";
import { useVehicleCompliance } from "../provider";

export type PreviewFileModalProps = {
	open: boolean;
	bucketId: string;
	fileName: string;
	contentType: string;
	onOpen?: (open: boolean) => void;
};

export const PreviewFileModal = ({ fileName, open, bucketId, contentType, onOpen }: PreviewFileModalProps) => {
	const { dataSource } = useVehicleCompliance();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);
	const [fileUrl, setFileUrl] = useState("");
	const [resolvedName, setResolvedName] = useState("");

	useEffect(() => {
		if (!open || !bucketId || !fileName) return;
		let cancelled = false;
		setLoading(true);
		setError(false);
		dataSource
			.getFileUrl({ bucketId, fileName })
			.then((res) => {
				if (cancelled) return;
				setFileUrl(res?.url ?? "");
				setResolvedName(res?.name ?? fileName);
			})
			.catch(() => {
				if (!cancelled) setError(true);
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, [open, bucketId, fileName, dataSource]);

	const extension = getExtensionFromContentType(contentType);
	const isXlsx = extension === "xlsx" || extension === "xls";
	const isPdf = extension === "pdf";

	const handleClose = () => onOpen?.(false);

	const handleDownload = () => {
		const link = document.createElement("a");
		link.href = fileUrl;
		link.download = fileName;
		link.target = "_blank";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	return (
		<Modal
			centered
			title={
				<div className="flex items-center justify-between mt-6">
					<span className="truncate max-w-[500px]">{resolvedName || fileName}</span>
					{fileUrl && (
						<button
							type="button"
							onClick={handleDownload}
							className="ml-4 p-2 hover:bg-gray-100 rounded transition-colors"
							title="Download"
						>
							<Iconify icon="lucide:download" size={18} />
						</button>
					)}
				</div>
			}
			open={open}
			onCancel={handleClose}
			footer={null}
			width={isXlsx ? 1000 : isPdf ? 700 : 600}
			styles={{ body: { padding: 0 } }}
		>
			<div className="h-[600px] overflow-hidden">
				{error ? (
					<div className="flex items-center justify-center h-full">
						<p className="text-red-500">Failed to fetch file</p>
					</div>
				) : loading ? (
					<div className="flex items-center justify-center h-full">
						<CircleLoading />
					</div>
				) : isXlsx ? (
					<XlsxViewer url={fileUrl} height="600px" />
				) : isPdf ? (
					<iframe
						src={`${fileUrl}#toolbar=1&navpanes=1&scrollbar=1`}
						className="w-full h-full border-0"
						title={fileName}
					/>
				) : fileUrl ? (
					<div className="h-full overflow-auto p-4 flex items-center justify-center bg-gray-50">
						<img
							alt={resolvedName || fileName}
							src={fileUrl}
							loading="lazy"
							className="max-w-full h-auto object-contain"
						/>
					</div>
				) : (
					<div className="flex flex-col items-center justify-center h-full gap-4">
						<p className="text-gray-600">Preview not available for this file type</p>
						<p className="text-sm text-gray-400">Content Type: {contentType}</p>
					</div>
				)}
			</div>
		</Modal>
	);
};

export default PreviewFileModal;
