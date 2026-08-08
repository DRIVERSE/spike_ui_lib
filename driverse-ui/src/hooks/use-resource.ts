/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/hooks/web/use-resource.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/hooks/web/use-resource.tsx
 * @status decoupled
 * @notes Near-identical in both apps (formatting only). Two couplings removed:
 *        1. `useKeycloak()` from @react-keycloak/web supplied the bearer token. The library takes a
 *           `getToken` callback instead, so apps keep owning auth — pass `() => keycloak.token`.
 *        2. axios is replaced by fetch. The apps only ever used method/url/data/headers, all of which
 *           fetch covers; this drops an axios peer dependency for every consumer. Behavioural deltas to
 *           know about: a non-2xx response now throws an `ApiResourceError` carrying `status` and the
 *           parsed body (axios threw an AxiosError with `response.data`), and FormData payloads are sent
 *           without an explicit Content-Type so the browser adds the multipart boundary — passing
 *           "multipart/form-data" by hand, as the upload hook did, produces a boundary-less header that
 *           some servers reject.
 */

import { useCallback } from "react";

export type ApiResourceMethod = "get" | "post" | "put" | "patch" | "delete";

export type ApiResourceRequest = {
	path: string;
	method?: ApiResourceMethod;
	payload?: unknown;
	authHeader?: Record<string, string>;
};

export type ApiResourceConfig = {
	/** Returns the bearer token for the request, or null/undefined to send none. */
	getToken?: () => string | null | undefined;
	/** Prefixed to `path` when the path is not already absolute. */
	baseUrl?: string;
	/** Swap in a custom fetch (tests, instrumentation, a polyfill). */
	fetchFn?: typeof fetch;
};

export class ApiResourceError extends Error {
	readonly status: number;
	readonly body: unknown;

	constructor(status: number, statusText: string, body: unknown) {
		super(`Request failed with status ${status}${statusText ? `: ${statusText}` : ""}`);
		this.name = "ApiResourceError";
		this.status = status;
		this.body = body;
	}
}

const parseBody = async (response: Response) => {
	const text = await response.text();
	if (!text) return null;
	try {
		return JSON.parse(text);
	} catch {
		return text;
	}
};

export function useApiResource({ getToken, baseUrl = "", fetchFn }: ApiResourceConfig = {}) {
	return useCallback(
		async ({ path, method = "get", payload, authHeader }: ApiResourceRequest) => {
			const url = /^https?:\/\//.test(path) ? path : `${baseUrl}${path}`;
			const token = getToken?.();
			const isFormData = typeof FormData !== "undefined" && payload instanceof FormData;

			const headers: Record<string, string> = { ...authHeader };
			if (token) headers.Authorization = `Bearer ${token}`;
			// Let the browser set multipart boundaries itself.
			if (payload !== undefined && !isFormData && !headers["Content-Type"]) {
				headers["Content-Type"] = "application/json";
			}

			const doFetch = fetchFn ?? fetch;
			const response = await doFetch(url, {
				method: method.toUpperCase(),
				headers,
				...(payload !== undefined && {
					body: isFormData ? (payload as FormData) : JSON.stringify(payload),
				}),
			});

			const body = await parseBody(response);
			if (!response.ok) {
				throw new ApiResourceError(response.status, response.statusText, body);
			}
			return body;
		},
		[getToken, baseUrl, fetchFn],
	);
}

export default useApiResource;
