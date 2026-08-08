/**
 * @extracted-from
 *   B: Driverse_FE_Business   @ b96eda3 src/components/pdf-renderer/ReactPdfJsRenderer.tsx
 * @status decoupled
 * @notes Business set `pdfjs.GlobalWorkerOptions.workerSrc` to an unpkg CDN URL at module scope, so
 *        simply importing the renderer pinned every consumer to a third-party CDN with no way to
 *        override it — bad for offline installs, air-gapped deployments and CSP.
 *        The assignment moves here behind `configurePdfWorker()`, which keeps the exact same unpkg URL
 *        as its default and is called lazily by the renderer, so behaviour is unchanged unless an app
 *        opts out. Call it once at startup with a self-hosted path to opt out.
 */

import { pdfjs } from "react-pdf";

/** The URL Business hard-coded. Kept as the default so nothing changes for existing call sites. */
export const defaultWorkerSrc = () => `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

let configured = false;

/**
 * Points pdf.js at its web worker. Idempotent, and a no-op once the app has set one itself.
 *
 * @example
 * // self-hosted, e.g. copied into /public by the app's build
 * configurePdfWorker("/pdf.worker.min.mjs");
 */
export function configurePdfWorker(workerSrc: string = defaultWorkerSrc()): void {
	if (configured) return;
	pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
	configured = true;
}

/** Lets a consumer re-point the worker after one has already been set (tests, hot reload). */
export function resetPdfWorker(): void {
	configured = false;
}
