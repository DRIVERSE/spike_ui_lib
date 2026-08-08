/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/utils/highlight.ts
 *   B: Driverse_FE_Business   @ b96eda3 src/utils/highlight.ts
 * @status identical
 * @notes Byte-identical in both apps; lifted verbatim. Side-effect module: importing it configures
 *        highlight.js and publishes it on `window.hljs`, which is how the markdown renderer (W5) picks
 *        it up. Deliberately left out of the root barrel — it is reachable through the package's
 *        "./highlight" subpath so apps that never render markdown do not pay for the theme CSS.
 */

import "highlight.js/styles/base16/tomorrow-night.css";

import hljs from "highlight.js";

declare global {
	interface Window {
		hljs: any;
	}
}

hljs.configure({
	languages: ["javascript", "sh", "bash", "html", "scss", "css", "json"],
});

if (typeof window !== "undefined") {
	window.hljs = hljs;
}
