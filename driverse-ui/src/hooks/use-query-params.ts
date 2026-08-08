/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/hooks/event/useQueryParams.ts
 *   B: Driverse_FE_Business   @ b96eda3 src/hooks/web/use-query-params.tsx
 * @status rewritten
 * @notes The two APIs diverged and neither is a superset:
 *          A: `useQueryParams(path?)` -> { getQueryParams(key), setQueryParams(key, value) }.
 *             Pushes a new history entry and has a latent bug — `navigate(path ?? pathname + "?" + qs)`
 *             parses as `path ?? (pathname + "?" + qs)`, so passing `path` silently drops the query string.
 *          B: `useQueryParams()` -> { getQueryParam(key, defaultValue?), setQueryParam(key, value) }.
 *             Replaces the entry instead of pushing, and supports a default value.
 *        The union keeps B's naming (singular, since each call handles one key) plus a plural
 *        `setQueryParams(object)` for multi-key updates and `createQueryString(object)` for callers that
 *        want the string without navigating. A's `path` override returns as an explicit `basePath` option
 *        that composes correctly with the query string.
 *        Router-free by design: both apps used react-router's useNavigate/useLocation, which would make
 *        react-router a peer and confine the hook to a Router subtree. This reads window.location and
 *        writes with history.pushState/replaceState, then dispatches a popstate event — which is exactly
 *        what react-router's own history listens to, so it stays in sync inside a Router and still works
 *        outside one. `useSyncExternalStore` keeps components subscribed to the search string.
 */

import { useCallback, useSyncExternalStore } from "react";

type SetOptions = {
	/** Push a new history entry instead of replacing the current one. A pushed, B replaced. */
	push?: boolean;
	/** Navigate to this path instead of the current one. */
	basePath?: string;
};

const subscribe = (onChange: () => void) => {
	window.addEventListener("popstate", onChange);
	return () => window.removeEventListener("popstate", onChange);
};

const getSearchSnapshot = () => window.location.search;

export function useQueryParams(defaultBasePath?: string) {
	const search = useSyncExternalStore(subscribe, getSearchSnapshot, () => "");

	const getQueryParam = useCallback(
		(key: string, defaultValue?: string) => new URLSearchParams(search).get(key) ?? defaultValue,
		[search],
	);

	/** Serializes `values` on top of the current query string. Undefined and null delete the key. */
	const createQueryString = useCallback(
		(values: Record<string, string | number | null | undefined>) => {
			const params = new URLSearchParams(search);
			for (const [key, value] of Object.entries(values)) {
				if (value === undefined || value === null) params.delete(key);
				else params.set(key, String(value));
			}
			return params.toString();
		},
		[search],
	);

	const setQueryParams = useCallback(
		(values: Record<string, string | number | null | undefined>, { push, basePath }: SetOptions = {}) => {
			const queryString = createQueryString(values);
			const path = basePath ?? defaultBasePath ?? window.location.pathname;
			const url = queryString ? `${path}?${queryString}` : path;

			window.history[push ? "pushState" : "replaceState"]({}, "", url);
			// react-router's history listens for popstate, so this keeps a Router in sync too.
			window.dispatchEvent(new PopStateEvent("popstate"));
		},
		[createQueryString, defaultBasePath],
	);

	const setQueryParam = useCallback(
		(key: string, value: string | number | null | undefined, options?: SetOptions) =>
			setQueryParams({ [key]: value }, options),
		[setQueryParams],
	);

	return { search, getQueryParam, setQueryParam, setQueryParams, createQueryString };
}

export default useQueryParams;
