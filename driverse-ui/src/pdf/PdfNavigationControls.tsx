/**
 * @extracted-from
 *   B: Driverse_FE_Business   @ b96eda3 src/components/pdf-renderer/PdfNavigationControls.tsx
 * @status adopted-B
 * @notes Business-only; Autocredit has no PDF renderer. Lifted verbatim apart from the icon import
 *        and dropping the React default import (the new JSX transform makes it dead weight).
 */

import { Tooltip } from "antd";
import type { FC } from "react";

import Iconify from "@/icons/iconify-icon";

interface PdfNavigationControlsProps {
	numPages?: number;
	pageNumber: number;
	pageInput: string;
	scale: number;
	continuousScroll: boolean;
	showThumbnails?: boolean;
	hideThumbnailsControl?: boolean;
	onZoomIn: () => void;
	onZoomOut: () => void;
	onPrevPage: () => void;
	onNextPage: () => void;
	onPageInputChange: (value: string) => void;
	onPageInputBlur: () => void;
	onPageInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
	onShowThumbnails?: (show: boolean) => void;
}

export const PdfNavigationControls: FC<PdfNavigationControlsProps> = ({
	numPages,
	pageNumber,
	pageInput,
	scale,
	showThumbnails,
	onZoomIn,
	onZoomOut,
	onPrevPage,
	onNextPage,
	onPageInputChange,
	onPageInputBlur,
	onPageInputKeyDown,
	onShowThumbnails,
}) => {
	return (
		<div className="flex items-center justify-between p-4 bg-white border-b">
			<div className="flex items-center gap-4 mx-auto min-h-8 w-full justify-end">
				{numPages && numPages >= 1 && (
					<div className="flex items-center gap-4 mx-auto">
						<button
							type="button"
							onClick={onZoomOut}
							className="text-xs px-2 py-1 rounded-md bg-gray-200 hover:bg-gray-300"
						>
							<Iconify icon="solar:magnifer-zoom-out-outline" width={16} height={16} />
						</button>
						<span className="text-gray-700 text-sm">{(scale * 100).toFixed(0)}%</span>
						<button
							type="button"
							onClick={onZoomIn}
							className="text-xs px-2 py-1 rounded-md bg-gray-200 hover:bg-gray-300"
						>
							<Iconify icon="solar:magnifer-zoom-in-outline" width={16} height={16} />
						</button>
						<>
							<button
								type="button"
								onClick={onPrevPage}
								disabled={pageNumber <= 1}
								className={`text-xs px-3 py-2 rounded-md ${
									pageNumber <= 1
										? "bg-gray-300 cursor-not-allowed opacity-50"
										: "bg-blue-500 text-black hover:bg-blue-600"
								}`}
							>
								<Iconify icon="solar:alt-arrow-left-outline" width={16} height={16} />
							</button>
							<div className="flex items-center gap-2">
								<input
									type="number"
									min={1}
									max={numPages}
									value={pageInput}
									onChange={(e) => onPageInputChange(e.target.value)}
									onBlur={onPageInputBlur}
									onKeyDown={onPageInputKeyDown}
									className="w-16 px-2 py-1 text-center border border-gray-300 rounded text-sm"
								/>
								<span className="text-gray-700 text-sm">of {numPages}</span>
							</div>
							<button
								type="button"
								onClick={onNextPage}
								disabled={pageNumber >= (numPages || 1)}
								className={`text-xs px-3 py-2 rounded-md ${
									pageNumber >= (numPages || 1)
										? "bg-gray-300 cursor-not-allowed opacity-50"
										: "bg-blue-500 text-black hover:bg-blue-600"
								}`}
							>
								<Iconify icon="solar:alt-arrow-right-outline" width={16} height={16} />
							</button>
						</>
					</div>
				)}
				<Tooltip title={showThumbnails ? "Hide Thumbnails" : "Show Thumbnails"}>
					<button
						type="button"
						onClick={() => onShowThumbnails?.(!showThumbnails)}
						className="text-xs p-2 rounded-md bg-gray-200 hover:bg-gray-300"
					>
						<Iconify icon={showThumbnails ? "solar:sort-bold" : "solar:hamburger-menu-bold"} width={20} height={20} />
					</button>
				</Tooltip>
			</div>
		</div>
	);
};
