/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/components/progress-bar/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/components/progress-bar/index.tsx
 * @status identical
 * @notes Byte-identical in both apps; lifted verbatim, including the MutationObserver-based route-change
 *        detection. The zh-CN inline comments were translated. Route changes are still detected by
 *        watching document mutations and popstate, so the component stays router-agnostic.
 */

import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { useEffect } from "react";
import "./index.css";

NProgress.configure({
	showSpinner: false,
	minimum: 0.1,
	trickleSpeed: 200,
});

export default function ProgressBar() {
	useEffect(() => {
		let lastHref = window.location.href;

		const handleRouteChange = () => {
			NProgress.start();
			const timer = setTimeout(() => NProgress.done(), 100);
			return () => {
				clearTimeout(timer);
				NProgress.done();
			};
		};

		// Watch for href changes anywhere in the document.
		const observer = new MutationObserver(() => {
			const currentHref = window.location.href;
			if (currentHref !== lastHref) {
				lastHref = currentHref;
				handleRouteChange();
			}
		});

		observer.observe(document, {
			subtree: true,
			childList: true,
		});

		// Browser back/forward.
		window.addEventListener("popstate", handleRouteChange);

		// Fire once on mount.
		handleRouteChange();

		return () => {
			observer.disconnect();
			window.removeEventListener("popstate", handleRouteChange);
		};
	}, []);

	return null;
}
