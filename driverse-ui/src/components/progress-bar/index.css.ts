/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/components/progress-bar/index.css.ts
 *   B: Driverse_FE_Business   @ b96eda3 src/components/progress-bar/index.css.ts
 * @status identical
 * @notes Byte-identical in both apps; lifted verbatim. Only the themeVars import path changed.
 */

import { themeVars } from "@/tokens/theme.css";
import { globalStyle } from "@vanilla-extract/css";

globalStyle("#nprogress .bar", {
	background: themeVars.colors.palette.primary.default,
	boxShadow: `0 0 2px ${themeVars.colors.palette.primary.default}`,
});

globalStyle("#nprogress .peg", {
	boxShadow: `0 0 10px ${themeVars.colors.palette.primary.default}, 0 0 5px ${themeVars.colors.palette.primary.default}`,
});
