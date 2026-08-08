import { afterEach, describe, expect, it, vi } from "vitest";

// react-pdf drives pdf.js, which needs a real worker, a canvas and real layout. The viewer additionally
// runs IntersectionObserver-driven thumbnail loading and scroll synchronisation, none of which settles in
// jsdom — rendering it here hangs. So this file covers the part the extraction actually changed (the
// worker decoupling); the viewer itself is exercised in the Storybook build. See docs/components/pdf.md.
vi.mock("react-pdf", () => ({
	pdfjs: { GlobalWorkerOptions: {} as { workerSrc?: string }, version: "4.0.0" },
	Document: () => null,
	Page: () => null,
}));

const { pdfjs } = await import("react-pdf");
const { configurePdfWorker, defaultWorkerSrc, resetPdfWorker } = await import("./worker");

afterEach(() => {
	resetPdfWorker();
	pdfjs.GlobalWorkerOptions.workerSrc = "";
});

describe("pdf worker configuration", () => {
	it("defaults to the unpkg URL Business hard-coded at module scope", () => {
		expect(defaultWorkerSrc()).toBe("//unpkg.com/pdfjs-dist@4.0.0/build/pdf.worker.min.mjs");
	});

	it("applies the default when called with no argument", () => {
		configurePdfWorker();
		expect(pdfjs.GlobalWorkerOptions.workerSrc).toBe(defaultWorkerSrc());
	});

	it("lets an app self-host instead — impossible with the original module-scope assignment", () => {
		configurePdfWorker("/pdf.worker.min.mjs");
		expect(pdfjs.GlobalWorkerOptions.workerSrc).toBe("/pdf.worker.min.mjs");
	});

	it("is idempotent, so a later import cannot clobber the app's choice", () => {
		configurePdfWorker("/first.mjs");
		configurePdfWorker("/second.mjs");
		expect(pdfjs.GlobalWorkerOptions.workerSrc).toBe("/first.mjs");
	});

	it("resetPdfWorker reopens configuration for tests and hot reload", () => {
		configurePdfWorker("/first.mjs");
		resetPdfWorker();
		configurePdfWorker("/second.mjs");
		expect(pdfjs.GlobalWorkerOptions.workerSrc).toBe("/second.mjs");
	});
});
