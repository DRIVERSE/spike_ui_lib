/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/router/hooks/use-current-route-meta.tsx (replaceDynamicParams)
 *   B: Driverse_FE_Business   @ b96eda3 src/router/hooks/use-current-route-meta.tsx (replaceDynamicParams)
 * @status identical
 * @notes Identical in both apps. Vendored here — multi-tabs was the only consumer outside the router,
 *        and importing it from `@/router/hooks` was one of the two couplings that kept this module
 *        app-bound. Pure string work with no router dependency, so it lifts verbatim; the zh-CN
 *        comments are translated and `Params<string>` is the module's own `RouteParams`.
 */

import type { RouteParams } from "./types";

/**
 * Replaces `user/:id` with `/user/1234512345`.
 */
export const replaceDynamicParams = (menuKey: string, params: RouteParams) => {
	let replacedPathName = menuKey;

	// Pull the parameter names out of the route path.
	const paramNames = menuKey.match(/:\w+/g);

	if (paramNames) {
		for (const paramName of paramNames) {
			// Drop the colon to get the parameter name.
			const paramKey = paramName.slice(1);
			const value = params[paramKey];
			if (!value) continue;

			replacedPathName = replacedPathName.replace(paramName, value);
		}
	}

	return replacedPathName;
};
