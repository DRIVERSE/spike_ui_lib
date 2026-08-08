/**
 * @extracted-from
 *   B: Driverse_FE_Business   @ b96eda3 src/components/pdf-renderer/utils/usePdfViewer.tsx
 * @status adopted-B
 * @notes Business-only; Autocredit has no PDF renderer. Lifted verbatim apart from the icon import
 *        and dropping the React default import (the new JSX transform makes it dead weight).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const usePdfViewer = ({ showThumbnails, scaleFile }: { showThumbnails?: boolean; scaleFile?: number }) => {
	const [numPages, setNumPages] = useState<number>();
	const [pageNumber, setPageNumber] = useState<number>(1);
	const [pageInput, setPageInput] = useState<string>("1");
	const [scale, setScale] = useState<number>(1);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [thumbnailsLoaded, setThumbnailsLoaded] = useState<Set<number>>(new Set());
	const [continuousScroll] = useState<boolean>(true);

	const mainViewerRef = useRef<HTMLDivElement>(null);
	const thumbnailRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
	const thumbnailContainerRef = useRef<HTMLDivElement>(null);
	const documentPagesRef = useRef<{ [key: number]: HTMLDivElement | null }>({});
	const documentContainerRef = useRef<HTMLDivElement>(null);

	const options = useMemo(
		() => ({
			cMapUrl: "/pdfjs/cmaps/",
			standardFontDataUrl: "/pdfjs/standard_fonts/",
		}),
		[],
	);

	function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
		setNumPages(numPages);
		setPageNumber(1);
		setLoading(false);
		setError(null);

		setThumbnailsLoaded(new Set());
		thumbnailRefs.current = {};
		documentPagesRef.current = {};
	}

	function onDocumentLoadError(error: Error): void {
		console.error("PDF loading error:", error);
		setError("Failed to load PDF document");
		setLoading(false);
	}

	const onThumbnailRenderSuccess = useCallback((pageNum: number) => {
		setThumbnailsLoaded((prev) => new Set([...prev, pageNum]));
	}, []);

	const scrollToThumbnail = useCallback(
		(pageNum: number) => {
			const attemptScroll = () => {
				if (showThumbnails && thumbnailRefs.current[pageNum] && thumbnailContainerRef.current) {
					const thumbnailElement = thumbnailRefs.current[pageNum];
					const container = thumbnailContainerRef.current;

					if (thumbnailElement && container) {
						const containerRect = container.getBoundingClientRect();
						const thumbnailRect = thumbnailElement.getBoundingClientRect();

						const containerTop = container.scrollTop;
						const relativeTop = thumbnailRect.top - containerRect.top + containerTop;
						const scrollPosition = relativeTop - container.clientHeight / 2 + thumbnailElement.clientHeight / 2;

						container.scrollTo({
							top: Math.max(0, scrollPosition),
							behavior: "smooth",
						});
					}
				}
			};

			attemptScroll();

			if (!thumbnailsLoaded.has(pageNum)) {
				const checkAndScroll = () => {
					if (thumbnailsLoaded.has(pageNum)) {
						setTimeout(attemptScroll, 100);
					} else {
						setTimeout(checkAndScroll, 100);
					}
				};
				checkAndScroll();
			}
		},
		[showThumbnails, thumbnailsLoaded],
	);

	const lastManualPageChangeRef = useRef<number>(0);

	const scrollToDocumentPage = useCallback(
		(pageNum: number) => {
			if (continuousScroll && documentPagesRef.current[pageNum] && documentContainerRef.current) {
				const pageElement = documentPagesRef.current[pageNum];
				const container = documentContainerRef.current;

				if (pageElement && container) {
					const containerRect = container.getBoundingClientRect();
					const pageRect = pageElement.getBoundingClientRect();

					const containerTop = container.scrollTop;
					const relativeTop = pageRect.top - containerRect.top + containerTop;

					container.scrollTo({
						top: Math.max(0, relativeTop - 20),
						behavior: "smooth",
					});
				}
			}
		},
		[continuousScroll],
	);

	const goToPrevPage = useCallback(() => {
		if (pageNumber > 1) {
			const newPage = pageNumber - 1;
			setPageNumber(newPage);
			scrollToThumbnail(newPage);
			scrollToDocumentPage(newPage);
			lastManualPageChangeRef.current = Date.now();
		}
	}, [pageNumber, scrollToThumbnail, scrollToDocumentPage]);

	const goToNextPage = useCallback(() => {
		if (pageNumber < (numPages || 1)) {
			const newPage = pageNumber + 1;
			setPageNumber(newPage);
			scrollToThumbnail(newPage);
			scrollToDocumentPage(newPage);
			lastManualPageChangeRef.current = Date.now();
		}
	}, [pageNumber, numPages, scrollToThumbnail, scrollToDocumentPage]);

	const goToPage = useCallback(
		(page: number) => {
			if (page >= 1 && page <= (numPages || 1)) {
				setPageNumber(page);
				scrollToThumbnail(page);
				scrollToDocumentPage(page);
				lastManualPageChangeRef.current = Date.now();
			}
		},
		[numPages, scrollToThumbnail, scrollToDocumentPage],
	);

	const handleDocumentScroll = useCallback(() => {
		if (Date.now() - lastManualPageChangeRef.current < 800) return;
		if (!documentContainerRef.current || !numPages) return;

		const container = documentContainerRef.current;
		const containerTop = container.scrollTop;
		const containerHeight = container.clientHeight;
		const viewCenter = containerTop + containerHeight / 2;

		let currentPage = 1;
		for (let i = 1; i <= numPages; i++) {
			const pageElement = documentPagesRef.current[i];
			if (pageElement) {
				const pageRect = pageElement.getBoundingClientRect();
				const containerRect = container.getBoundingClientRect();
				const pageTop = pageRect.top - containerRect.top + containerTop;
				const pageBottom = pageTop + pageElement.clientHeight;

				if (viewCenter >= pageTop && viewCenter <= pageBottom) {
					currentPage = i;
					break;
				}
			}
		}

		if (currentPage !== pageNumber) {
			setPageNumber(currentPage);
			scrollToThumbnail(currentPage);
		}
	}, [continuousScroll, numPages, pageNumber, scrollToThumbnail]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.target instanceof HTMLInputElement) return;

			switch (event.key) {
				case "ArrowUp":
				case "ArrowLeft":
					event.preventDefault();
					goToPrevPage();
					break;
				case "ArrowDown":
				case "ArrowRight":
					event.preventDefault();
					goToNextPage();
					break;
				case "Home":
					event.preventDefault();
					goToPage(1);
					break;
				case "End":
					event.preventDefault();
					goToPage(numPages || 1);
					break;
				case "PageUp":
					event.preventDefault();
					goToPrevPage();
					break;
				case "PageDown":
					event.preventDefault();
					goToNextPage();
					break;
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [goToPrevPage, goToNextPage, goToPage, numPages]);

	useEffect(() => {
		if (showThumbnails && pageNumber > 1) {
			setTimeout(() => scrollToThumbnail(pageNumber), 200);
		}
	}, [showThumbnails, scrollToThumbnail, pageNumber]);

	useEffect(() => {
		if (numPages && pageNumber) {
			setTimeout(() => {
				scrollToThumbnail(pageNumber);
				scrollToDocumentPage(pageNumber);
			}, 200);
			lastManualPageChangeRef.current = Date.now();
		}
	}, [showThumbnails]);

	useEffect(() => {
		if (continuousScroll && pageNumber > 1) {
			setTimeout(() => scrollToDocumentPage(pageNumber), 200);
		}
	}, [continuousScroll, scrollToDocumentPage, pageNumber]);

	useEffect(() => {
		setPageInput(pageNumber.toString());
	}, [pageNumber]);

	useEffect(() => {
		if (scaleFile) {
			setScale(scaleFile);
		}
	}, [scaleFile]);

	const onPageInputBlur = useCallback(() => {
		const page = Number.parseInt(pageInput, 10);
		if (!Number.isNaN(page)) goToPage(page);
		else setPageInput(pageNumber.toString());
	}, [pageInput, pageNumber, goToPage, setPageInput]);

	const onPageInputKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === "Enter") {
				const page = Number.parseInt(pageInput, 10);
				if (!Number.isNaN(page)) goToPage(page);
				else setPageInput(pageNumber.toString());
			}
		},
		[pageInput, pageNumber, goToPage, setPageInput],
	);

	const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3));
	const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));

	return {
		numPages,
		pageNumber,
		pageInput,
		scale,
		loading,
		error,
		thumbnailsLoaded,
		continuousScroll,
		mainViewerRef,
		thumbnailRefs,
		thumbnailContainerRef,
		documentPagesRef,
		documentContainerRef,
		options,
		onDocumentLoadSuccess,
		onDocumentLoadError,
		onThumbnailRenderSuccess,
		scrollToThumbnail,
		scrollToDocumentPage,
		goToPrevPage,
		goToNextPage,
		goToPage,
		handleDocumentScroll,
		setPageInput,
		zoomIn,
		zoomOut,
		onPageInputBlur,
		onPageInputKeyDown,
		setScale,
	};
};

export { usePdfViewer };
