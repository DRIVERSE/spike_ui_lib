/**
 * @extracted-from
 *   B: Driverse_FE_Business   @ b96eda3 src/components/file-previewer/index.tsx
 * @status decoupled
 * @notes Business-only. The layout, the loading spinner and the "select a file" empty state are lifted
 *        verbatim. One decoupling: the component called `useGetFileUrl({ bucketId, fileName })` itself
 *        and dug the signed URL out of `fileData.detail.file.url`, hard-wiring it to one backend's
 *        response shape and forcing a react-query provider on anyone who renders it.
 *        It now takes a resolved `url` directly, or an optional `resolveUrl` hook for the lazy case —
 *        pass `resolveUrl={() => useGetFileUrl({ apiResource, filesApiUrl, bucketId, fileName })}` to
 *        reproduce the original behaviour exactly, response-shape mapping included.
 */

import Fallback from "@/components/fallback";
import Iconify from "@/icons/iconify-icon";
import { ReactPdfJsRenderer } from "@/pdf";
import { Spin } from "antd";
import type { FC } from "react";

type Props = {
	/** Resolved document URL. Omit and use `resolveUrl` when it has to be fetched. */
	url?: string;
	/** Lazy resolver, called as a hook. Return `{ url, isLoading }`. */
	resolveUrl?: () => { url?: string; isLoading?: boolean };
	isLoading?: boolean;
	emptyDescription?: string;
	pageNumber?: number;
	scaleFile?: number;
	onShowThumbnails?: (show: boolean) => void;
	showThumbnails?: boolean;
	height?: string;
};

const FilePreviewer: FC<Props> = ({
	url,
	resolveUrl,
	isLoading,
	emptyDescription = "Select a file from queue to preview",
	scaleFile,
	pageNumber,
	onShowThumbnails,
	showThumbnails,
	height = "calc(100vh - 3rem)",
}) => {
	// Calling a prop as a hook is only safe because `resolveUrl` is required to be stable for the
	// lifetime of the component — same contract as a render prop that owns hooks.
	const resolved = resolveUrl?.();
	const fileUrl = url ?? resolved?.url;
	const loading = isLoading ?? resolved?.isLoading ?? false;

	return (
		<div
			style={{
				height,
				overflow: "auto",
				scrollbarWidth: "none",
				msOverflowStyle: "none",
				width: "100%",
			}}
			className="[&::-webkit-scrollbar]:hidden"
		>
			{loading ? (
				<div className="flex items-center w-full justify-center h-[95vh]">
					<Spin />
				</div>
			) : !fileUrl ? (
				<div className="flex items-center w-full justify-center" style={{ height }}>
					<Fallback
						icon={<Iconify icon="solar:folder-open-bold-duotone" width={56} height={56} className="text-gray-500" />}
						description={emptyDescription}
					/>
				</div>
			) : (
				<ReactPdfJsRenderer
					hideThumbnailsControl
					fileUrl={fileUrl}
					scaleFile={scaleFile}
					showThumbnails={showThumbnails}
					onShowThumbnails={onShowThumbnails}
					pageNumber={pageNumber}
				/>
			)}
		</div>
	);
};

export default FilePreviewer;
