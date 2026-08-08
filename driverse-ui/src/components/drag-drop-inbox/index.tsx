/**
 * @extracted-from
 *   B: Driverse_FE_Business   @ b96eda3 src/components/drag-drop-inbox/index.tsx
 * @status adopted-B
 * @notes Business-only component; Autocredit has no equivalent. Lifted verbatim — it is already fully
 *        prop-driven (every drag handler, the file list and the row renderer are injected), which makes
 *        it the natural view half of the W4 `useFileUpload` hook.
 */

import Iconify from "@/icons/iconify-icon";
import { Skeleton, Spin } from "antd";
import type { DragEvent, FC, ReactNode } from "react";

type Props = {
	onDragEnter: (e: DragEvent<HTMLDivElement>) => void;
	onDragOver: (e: DragEvent<HTMLDivElement>) => void;
	onDragLeave: (e: DragEvent<HTMLDivElement>) => void;
	onDrop: (e: DragEvent<HTMLDivElement>) => void;
	isDragging: boolean;
	isUploadingDocs?: boolean;
	loadingDocs: boolean;
	selectedCount?: number;
	files: Record<string, string>[];
	inboxCount: number;
	renderFileItem: (file: Record<string, string>) => ReactNode;
};

const DragDropInbox: FC<Props> = ({
	onDragEnter,
	onDragOver,
	onDragLeave,
	onDrop,
	isDragging,
	isUploadingDocs,
	selectedCount = 0,
	loadingDocs,
	files,
	inboxCount,
	renderFileItem,
}) => (
	<div
		className={`h-[90vh] max-h-[90vh] overflow-y-auto relative space-y-4 transition-all duration-200 ${
			isDragging ? "overflow-hidden" : ""
		}`}
		onDragEnter={onDragEnter}
		onDragOver={onDragOver}
		onDragLeave={onDragLeave}
		onDrop={onDrop}
	>
		{isDragging && (
			<div className="absolute inset-0 z-50 bg-green-100 bg-opacity-80 h-full w-full rounded-lg flex items-center justify-center pointer-events-none">
				<div className="text-center">
					<p className="text-blue-700 font-medium text-md">Drop files here to upload</p>
					<p className="text-blue-600 text-sm">Files will be uploaded to inbox</p>
				</div>
			</div>
		)}
		{isUploadingDocs && (
			<div className="absolute inset-0 z-50 bg-green-100 bg-opacity-80 h-full w-full rounded-lg flex flex-col items-center justify-center pointer-events-none">
				<Spin size="default" />
				<div className="text-center pt-5">
					<p className="text-green-700 font-medium text-md">Uploading files...</p>
				</div>
			</div>
		)}
		<div className="my-6 bg-[#f6f8fa] z-0 rounded-2xl border border-gray-200">
			<div className="flex items-center justify-between gap-2 text-md pb-4 font-medium text-gray-700">
				<span>
					Inbox <span className="text-gray-600 font-normal">({inboxCount})</span>
				</span>
				{selectedCount > 0 && <span className="font-medium text-sm">Selected: {selectedCount}</span>}
			</div>
			{loadingDocs ? (
				<div className="space-y-2 mt-4">
					{["a", "b"].map((key) => (
						<div key={key} className="mb-2 w-full">
							<Skeleton.Node className="!w-full" />
						</div>
					))}
				</div>
			) : files.length > 0 ? (
				<div className="max-h-[80vh] overflow-y-auto">{files.map(renderFileItem)}</div>
			) : (
				<div className="flex items-center gap-2 pt-10 flex-col text-gray-500 mb-4">
					<Iconify icon="solar:folder-bold-duotone" width={34} height={34} className="text-gray-400" />
					<div className="text-center">
						<p className="text-sm">No files in inbox</p>
						<p className="text-xs mt-1">Drag and drop files anywhere in this area to upload</p>
					</div>
				</div>
			)}
		</div>
	</div>
);

export default DragDropInbox;
