/**
 * @extracted-from
 *   B: Driverse_FE_Business   @ b96eda3 src/components/pdf-renderer/ReactPdfJsRenderer.tsx
 * @status adopted-B
 * @notes Business-only. The viewer body — thumbnails, IntersectionObserver lazy loading, scroll sync,
 *        zoom, load progress — is lifted verbatim.
 *        One decoupling: the module set `pdfjs.GlobalWorkerOptions.workerSrc` to an unpkg CDN URL as an
 *        import side effect, which forces a network fetch on any consumer and cannot be overridden. That
 *        moves to `configurePdfWorker()` in worker.ts, still defaulting to the same unpkg URL but callable
 *        with a local path (or with a bundled worker) before first render.
 *        React 19 fix: the two `ref={(el) => (map.current[i] = el)}` callbacks returned the assigned
 *        element. React 19 treats a ref callback's return value as a cleanup function, so these would
 *        have thrown on unmount; they now use a block body and return void.
 */

import type { FC } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Document, Page } from "react-pdf";
import { configurePdfWorker } from "./worker";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import Iconify from "@/icons/iconify-icon";
import { PdfNavigationControls } from "./PdfNavigationControls";
import { usePdfViewer } from "./utils/usePdfViewer";

// Was a module-scope CDN assignment; see worker.ts for why it is a call now.
configurePdfWorker();

type Props = {
	fileUrl: string;
	height?: number;
	scaleFile?: number;
	hideThumbnailsControl?: boolean;
	showThumbnails?: boolean;
	pageNumber?: number;
	onShowThumbnails?: (show: boolean) => void;
};

export const ReactPdfJsRenderer: FC<Props> = ({
	fileUrl,
	scaleFile,
	showThumbnails,
	pageNumber: dynamicPageNumber,
	onShowThumbnails,
}) => {
	const {
		numPages,
		pageNumber,
		pageInput,
		scale,
		loading,
		error,
		mainViewerRef,
		thumbnailRefs,
		thumbnailContainerRef,
		documentPagesRef,
		documentContainerRef,
		options,
		onDocumentLoadSuccess,
		onPageInputBlur,
		onPageInputKeyDown,
		onDocumentLoadError,
		onThumbnailRenderSuccess,
		goToPrevPage,
		goToNextPage,
		goToPage,
		handleDocumentScroll,
		setPageInput,
		zoomIn,
		zoomOut,
	} = usePdfViewer({ showThumbnails, scaleFile });

	const [loadProgress, setLoadProgress] = useState<number>(0);
	const [loadedThumbnails, setLoadedThumbnails] = useState<Set<number>>(new Set());
	const [visibleThumbnails, setVisibleThumbnails] = useState<Set<number>>(new Set());
	const isScrollingRef = useRef(false);
	const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const thumbnailObserverRef = useRef<IntersectionObserver | null>(null);
	const isMountedRef = useRef(true);
	const documentKeyRef = useRef(0);

	const safePageNumber = typeof dynamicPageNumber === "string" ? Number(dynamicPageNumber) : dynamicPageNumber;

	// Cleanup on unmount
	useEffect(() => {
		isMountedRef.current = true;
		return () => {
			isMountedRef.current = false;
			if (scrollTimeoutRef.current) {
				clearTimeout(scrollTimeoutRef.current);
			}
			if (thumbnailObserverRef.current) {
				thumbnailObserverRef.current.disconnect();
			}
		};
	}, []);

	// Force re-render of Document when fileUrl changes
	useEffect(() => {
		documentKeyRef.current += 1;
		setLoadProgress(0);
		setLoadedThumbnails(new Set());
		setVisibleThumbnails(new Set());
	}, [fileUrl]);

	useEffect(() => {
		setLoadProgress(0);
	}, [safePageNumber]);

	useEffect(() => {
		if (safePageNumber && safePageNumber !== pageNumber) {
			goToPage(safePageNumber);
		}
	}, [safePageNumber]);

	// Initialize Intersection Observer for thumbnails
	useEffect(() => {
		if (!showThumbnails || !thumbnailContainerRef.current) return;

		thumbnailObserverRef.current = new IntersectionObserver(
			(entries) => {
				if (!isMountedRef.current) return;

				for (const entry of entries) {
					const pageNum = Number.parseInt(entry.target.getAttribute("data-page") || "0");
					if (entry.isIntersecting) {
						setVisibleThumbnails((prev) => new Set(prev).add(pageNum));
					}
				}
			},
			{
				root: thumbnailContainerRef.current,
				rootMargin: "200px 0px",
				threshold: 0.01,
			},
		);

		Object.values(thumbnailRefs.current).forEach((ref) => {
			if (ref) {
				thumbnailObserverRef.current?.observe(ref);
			}
		});

		return () => {
			thumbnailObserverRef.current?.disconnect();
		};
	}, [showThumbnails, numPages]);

	const onDocumentLoadProgress = ({ loaded, total }: { loaded: number; total: number }) => {
		if (total && isMountedRef.current) {
			setLoadProgress(Math.round((loaded / total) * 100));
		}
	};

	const handleThumbnailRenderSuccess = useCallback(
		(pageNum: number) => {
			if (!isMountedRef.current) return;
			setLoadedThumbnails((prev) => new Set(prev).add(pageNum));
			onThumbnailRenderSuccess(pageNum);
		},
		[onThumbnailRenderSuccess],
	);

	const handleSmoothScroll = () => {
		if (safePageNumber) return;

		isScrollingRef.current = true;

		if (scrollTimeoutRef.current) {
			clearTimeout(scrollTimeoutRef.current);
		}

		scrollTimeoutRef.current = setTimeout(() => {
			if (!isMountedRef.current) return;
			isScrollingRef.current = false;
			handleDocumentScroll();
		}, 150);
	};

	if (error) {
		return (
			<div className="w-full border border-gray-300 rounded-lg overflow-hidden flex flex-col items-center justify-center bg-gray-50">
				<div className="flex flex-col items-center">
					<Iconify icon="solar:document-broken" width={48} height={48} className="mb-3 text-red-400" />
					<div className="text-lg font-semibold text-red-500 mb-1">Failed to load PDF</div>
					<div className="text-gray-500 text-sm mb-2">
						The document could not be displayed. Please check the file or try again later.
					</div>
					<button
						type="button"
						className="mt-2 px-4 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
						onClick={() => window.location.reload()}
					>
						Reload
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-[calc(100vh-3rem)] !w-full bg-gray-50 border border-gray-300 rounded-lg overflow-hidden">
			<PdfNavigationControls
				numPages={numPages}
				pageNumber={safePageNumber || pageNumber}
				pageInput={pageInput}
				scale={scale}
				showThumbnails={showThumbnails}
				hideThumbnailsControl
				onZoomIn={zoomIn}
				onZoomOut={zoomOut}
				onPrevPage={goToPrevPage}
				onNextPage={goToNextPage}
				onPageInputChange={(e) => setPageInput(e)}
				onPageInputBlur={onPageInputBlur}
				onPageInputKeyDown={(e) => onPageInputKeyDown(e)}
				onShowThumbnails={onShowThumbnails}
				continuousScroll={false}
			/>
			<div className="flex-1 flex flex-row overflow-hidden relative" ref={mainViewerRef}>
				{loading || (loadProgress > 0 && loadProgress < 100) ? (
					<div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
						<div className="text-center">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
							<span className="text-gray-600">Loading PDF... {loadProgress}%</span>
						</div>
					</div>
				) : null}

				{/* Sidebar Thumbnails */}
				{showThumbnails && numPages && (
					<div
						ref={thumbnailContainerRef}
						className="flex flex-col items-center bg-gray-800 py-4 px-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
						style={{
							width: "180px",
							minWidth: "180px",
							maxHeight: "100%",
						}}
					>
						{Array.from({ length: numPages }, (_, idx) => {
							const pageNum = idx + 1;
							const currentDisplayPage = safePageNumber || pageNumber;
							const isCurrentPage = currentDisplayPage === pageNum;
							const isNearCurrent = Math.abs(pageNum - currentDisplayPage) <= 5;
							const isVisible = visibleThumbnails.has(pageNum);
							const isLoaded = loadedThumbnails.has(pageNum);
							const shouldLoad = isVisible || isNearCurrent || isLoaded;

							return (
								<div
									key={pageNum}
									data-page={pageNum}
									ref={(el) => {
										thumbnailRefs.current[pageNum] = el;
										if (el && thumbnailObserverRef.current) {
											thumbnailObserverRef.current.observe(el);
										}
									}}
									className={`mb-3 cursor-pointer flex flex-col items-center transition-all duration-200 p-2 rounded ${
										isCurrentPage
											? "border-2 border-blue-400 bg-white shadow-lg transform scale-105"
											: "border border-transparent hover:border-gray-400 hover:bg-gray-700"
									}`}
									onClick={() => goToPage(pageNum)}
								>
									{shouldLoad && fileUrl ? (
										<Document
											key={`thumbnail-${pageNum}-${documentKeyRef.current}`}
											file={fileUrl}
											options={options}
											loading={
												<div className="w-[140px] h-[200px] bg-gray-700 animate-pulse rounded flex items-center justify-center">
													<span className="text-xs text-gray-400">Loading...</span>
												</div>
											}
											error={null}
										>
											<Page
												pageNumber={pageNum}
												width={140}
												renderTextLayer={false}
												renderAnnotationLayer={false}
												renderMode="canvas"
												className="shadow-sm"
												onRenderSuccess={() => handleThumbnailRenderSuccess(pageNum)}
												loading={
													<div className="w-[140px] h-[200px] bg-gray-700 animate-pulse rounded flex items-center justify-center">
														<span className="text-xs text-gray-400">{pageNum}</span>
													</div>
												}
											/>
										</Document>
									) : (
										<div className="w-[140px] h-[200px] bg-gray-700 rounded flex items-center justify-center">
											<span className="text-xs text-gray-400">{pageNum}</span>
										</div>
									)}
									<span className={`text-xs mt-2 font-medium ${isCurrentPage ? "text-blue-600" : "text-gray-300"}`}>
										{pageNum}
									</span>
								</div>
							);
						})}
					</div>
				)}

				{/* Main Document Area */}
				{fileUrl && (
					<div
						ref={documentContainerRef}
						className="flex-1 overflow-auto bg-gray-100 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200"
						style={{ scrollBehavior: "smooth" }}
						onScroll={handleSmoothScroll}
					>
						<div className="flex flex-col items-center p-4 gap-4">
							<Document
								key={`main-${documentKeyRef.current}`}
								file={fileUrl}
								onLoadSuccess={onDocumentLoadSuccess}
								onLoadError={onDocumentLoadError}
								onLoadProgress={onDocumentLoadProgress}
								options={options}
								loading={
									<div className="flex items-center justify-center p-8">
										<div className="text-center">
											<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
											<span className="text-gray-600 text-sm">Loading PDF... {loadProgress}%</span>
										</div>
									</div>
								}
							>
								{safePageNumber ? (
									<div
										key={safePageNumber}
										ref={(el) => {
											documentPagesRef.current[safePageNumber] = el;
										}}
										className="shadow-lg border border-gray-200 rounded bg-white mb-4"
									>
										<Page
											pageNumber={safePageNumber}
											renderTextLayer={true}
											renderAnnotationLayer={true}
											scale={scale}
											loading={
												<div className="flex items-center justify-center p-4">
													<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
												</div>
											}
										/>
									</div>
								) : (
									Array.from({ length: numPages || 0 }, (_, idx) => {
										const pageNum = idx + 1;
										const isNearby = Math.abs(pageNum - pageNumber) <= 2;

										return (
											<div
												key={pageNum}
												ref={(el) => {
													documentPagesRef.current[pageNum] = el;
												}}
												className="shadow-lg border border-gray-200 rounded bg-white mb-4"
												style={{ minHeight: "800px" }}
											>
												{isNearby ? (
													<Page
														pageNumber={pageNum}
														renderTextLayer={true}
														renderAnnotationLayer={true}
														scale={scale}
														loading={
															<div className="flex items-center justify-center p-4">
																<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
															</div>
														}
													/>
												) : (
													<div className="flex items-center justify-center h-full">
														<span className="text-gray-400">Page {pageNum}</span>
													</div>
												)}
											</div>
										);
									})
								)}
							</Document>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
