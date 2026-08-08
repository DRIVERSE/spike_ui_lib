import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, renderHook, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useClientId } from "./use-client-id";
import useCopyToClipboard from "./use-copy-to-clipboard";
import { useDebounce } from "./use-debounce";
import { useDeleteFile } from "./use-delete-file";
import { useExport } from "./use-export";
import { useGetFileUrl } from "./use-get-fileurl";
import { readHasuraClaim } from "./use-jwt-claims";
import { between, down, up, useMediaQuery } from "./use-media-query";
import { Can, usePermission } from "./use-permission";
import { useQueryParams } from "./use-query-params";
import { ApiResourceError, useApiResource } from "./use-resource";
import { useTenantId } from "./use-tenant-id";
import { useFileUpload } from "./use-upload-file";

const FILES_API = "https://files.example.com/api/v1/files";

describe("useDebounce", () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it("holds the previous value until the delay elapses", () => {
		const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
			initialProps: { value: "a" },
		});
		expect(result.current).toBe("a");

		rerender({ value: "b" });
		expect(result.current).toBe("a");

		act(() => void vi.advanceTimersByTime(299));
		expect(result.current).toBe("a");

		act(() => void vi.advanceTimersByTime(1));
		expect(result.current).toBe("b");
	});

	it("restarts the timer on every change, so only the last value lands", () => {
		const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
			initialProps: { value: 0 },
		});
		for (const value of [1, 2, 3]) {
			rerender({ value });
			act(() => void vi.advanceTimersByTime(400));
		}
		expect(result.current).toBe(0);

		act(() => void vi.advanceTimersByTime(500));
		expect(result.current).toBe(3);
	});
});

describe("useMediaQuery", () => {
	const listeners = new Set<(e: MediaQueryListEvent) => void>();

	beforeEach(() => {
		listeners.clear();
		vi.stubGlobal(
			"matchMedia",
			vi.fn((query: string) => ({
				matches: query.includes("min-width: 1024px"),
				media: query,
				addEventListener: (_: string, handler: (e: MediaQueryListEvent) => void) => listeners.add(handler),
				removeEventListener: (_: string, handler: (e: MediaQueryListEvent) => void) => listeners.delete(handler),
			})),
		);
	});
	afterEach(() => vi.unstubAllGlobals());

	it("reports the initial match and reacts to changes", () => {
		const { result } = renderHook(() => useMediaQuery(up("lg")));
		expect(result.current).toBe(true);

		act(() => {
			for (const handler of listeners) handler({ matches: false } as MediaQueryListEvent);
		});
		expect(result.current).toBe(false);
	});

	it("builds a query string from a config object", () => {
		renderHook(() => useMediaQuery({ maxWidth: 768, orientation: "landscape", prefersReducedMotion: true }));
		expect(window.matchMedia).toHaveBeenCalledWith(
			"(max-width: 768px) and (orientation: landscape) and (prefers-reduced-motion: reduce)",
		);
	});

	it("accepts a raw query string unchanged", () => {
		renderHook(() => useMediaQuery("(orientation: portrait)"));
		expect(window.matchMedia).toHaveBeenCalledWith("(orientation: portrait)");
	});

	it("removes its listener on unmount", () => {
		const { unmount } = renderHook(() => useMediaQuery(up("md")));
		expect(listeners.size).toBe(1);
		unmount();
		expect(listeners.size).toBe(0);
	});

	it("breakpoint helpers keep up() and down() from overlapping", () => {
		expect(up("lg")).toEqual({ minWidth: 1024 });
		expect(down("lg")).toEqual({ maxWidth: 1023.95 });
		expect(between("sm", "lg")).toEqual({ minWidth: 576, maxWidth: 1023.95 });
	});
});

describe("useCopyToClipboard", () => {
	afterEach(() => vi.restoreAllMocks());

	it("writes to the clipboard and reports through onSuccess", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		const onSuccess = vi.fn();
		Object.assign(navigator, { clipboard: { writeText } });

		const { result } = renderHook(() => useCopyToClipboard({ onSuccess }));
		await act(async () => {
			expect(await result.current.copyFn("ABC-123")).toBe(true);
		});

		expect(writeText).toHaveBeenCalledWith("ABC-123");
		expect(result.current.copiedText).toBe("ABC-123");
		expect(onSuccess).toHaveBeenCalledWith("ABC-123");
	});

	it("clears the copied text and reports through onError when the write fails", async () => {
		const onError = vi.fn();
		vi.spyOn(console, "warn").mockImplementation(() => {});
		Object.assign(navigator, { clipboard: { writeText: vi.fn().mockRejectedValue(new Error("denied")) } });

		const { result } = renderHook(() => useCopyToClipboard({ onError }));
		await act(async () => {
			expect(await result.current.copyFn("x")).toBe(false);
		});

		expect(result.current.copiedText).toBeNull();
		expect(onError).toHaveBeenCalled();
	});

	it("returns false when the browser has no clipboard API", async () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		Object.assign(navigator, { clipboard: undefined });

		const { result } = renderHook(() => useCopyToClipboard());
		await act(async () => {
			expect(await result.current.copyFn("x")).toBe(false);
		});
		expect(warn).toHaveBeenCalledWith("Clipboard not supported");
	});
});

describe("useApiResource", () => {
	const jsonResponse = (body: unknown, ok = true, status = 200) =>
		({ ok, status, statusText: ok ? "OK" : "Bad Request", text: async () => JSON.stringify(body) }) as Response;

	it("sends the bearer token and a JSON body", async () => {
		const fetchFn = vi.fn().mockResolvedValue(jsonResponse({ id: 1 }));
		const { result } = renderHook(() =>
			useApiResource({ getToken: () => "tok", baseUrl: "https://api.test", fetchFn }),
		);

		const data = await result.current({ path: "/things", method: "post", payload: { a: 1 } });

		expect(data).toEqual({ id: 1 });
		const [url, init] = fetchFn.mock.calls[0];
		expect(url).toBe("https://api.test/things");
		expect(init.method).toBe("POST");
		expect(init.headers).toEqual({ Authorization: "Bearer tok", "Content-Type": "application/json" });
		expect(init.body).toBe('{"a":1}');
	});

	it("leaves absolute paths alone and omits Authorization without a token", async () => {
		const fetchFn = vi.fn().mockResolvedValue(jsonResponse(null));
		const { result } = renderHook(() => useApiResource({ baseUrl: "https://api.test", fetchFn }));

		await result.current({ path: "https://other.test/x" });

		const [url, init] = fetchFn.mock.calls[0];
		expect(url).toBe("https://other.test/x");
		expect(init.headers.Authorization).toBeUndefined();
	});

	it("never sets Content-Type for FormData, so the browser can add the boundary", async () => {
		const fetchFn = vi.fn().mockResolvedValue(jsonResponse({}));
		const { result } = renderHook(() => useApiResource({ fetchFn }));

		const form = new FormData();
		form.append("files", new File(["x"], "a.pdf"));
		await result.current({ path: "/upload", method: "post", payload: form });

		const [, init] = fetchFn.mock.calls[0];
		expect(init.headers["Content-Type"]).toBeUndefined();
		expect(init.body).toBe(form);
	});

	it("throws an ApiResourceError carrying the status and parsed body", async () => {
		const fetchFn = vi.fn().mockResolvedValue(jsonResponse({ message: "nope" }, false, 422));
		const { result } = renderHook(() => useApiResource({ fetchFn }));

		await expect(result.current({ path: "/x" })).rejects.toBeInstanceOf(ApiResourceError);
		await expect(result.current({ path: "/x" })).rejects.toMatchObject({
			status: 422,
			body: { message: "nope" },
		});
	});

	it("passes non-JSON bodies through as text and empty bodies as null", async () => {
		const fetchFn = vi
			.fn()
			.mockResolvedValueOnce({ ok: true, status: 200, statusText: "", text: async () => "plain" } as Response)
			.mockResolvedValueOnce({ ok: true, status: 204, statusText: "", text: async () => "" } as Response);
		const { result } = renderHook(() => useApiResource({ fetchFn }));

		expect(await result.current({ path: "/a" })).toBe("plain");
		expect(await result.current({ path: "/b" })).toBeNull();
	});
});

describe("JWT claim hooks", () => {
	// { "https://hasura.io/jwt/claims": { "x-hasura-tenant-id": "t-1", "x-hasura-client-id": "c-9" } }
	const base64url = (value: object) =>
		btoa(JSON.stringify(value)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
	const token = `${base64url({ alg: "none" })}.${base64url({
		"https://hasura.io/jwt/claims": { "x-hasura-tenant-id": "t-1", "x-hasura-client-id": "c-9" },
	})}.`;

	it("reads tenant and client ids", () => {
		expect(renderHook(() => useTenantId(token)).result.current).toBe("t-1");
		expect(renderHook(() => useClientId(token)).result.current).toBe("c-9");
	});

	it("returns undefined without a token and null when decoding fails", () => {
		const error = vi.spyOn(console, "error").mockImplementation(() => {});
		expect(renderHook(() => useTenantId(null)).result.current).toBeUndefined();
		expect(readHasuraClaim("not-a-jwt", "x-hasura-tenant-id")).toBeNull();
		expect(error).toHaveBeenCalled();
		error.mockRestore();
	});

	it("returns null when the claim is absent", () => {
		const bare = `${base64url({ alg: "none" })}.${base64url({ sub: "1" })}.`;
		expect(readHasuraClaim(bare, "x-hasura-tenant-id")).toBeNull();
	});

	it("memoizes on the token", () => {
		const { result, rerender } = renderHook(({ t }) => useTenantId(t), { initialProps: { t: token } });
		const first = result.current;
		rerender({ t: token });
		expect(result.current).toBe(first);
	});
});

describe("useExport", () => {
	beforeEach(() => {
		vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
		URL.createObjectURL = vi.fn(() => "blob:mock");
		URL.revokeObjectURL = vi.fn();
	});
	afterEach(() => vi.restoreAllMocks());

	const columns = [{ key: "name", title: "Name", dataIndex: "name" }];

	it("warns through notify and skips the export when there is no data", async () => {
		const notify = vi.fn();
		const { result } = renderHook(() => useExport({ notify }));

		await act(() => result.current.exportData([], columns));

		expect(notify).toHaveBeenCalledWith("warning", "No data available to export");
		expect(result.current.isExporting).toBe(false);
	});

	it("runs the lifecycle callbacks and toggles isExporting", async () => {
		const onExportStart = vi.fn();
		const onExportComplete = vi.fn();
		const notify = vi.fn();
		const { result } = renderHook(() => useExport({ notify, onExportStart, onExportComplete }));

		await act(() => result.current.exportToCSV([{ name: "Ada" }], columns));

		expect(onExportStart).toHaveBeenCalled();
		expect(onExportComplete).toHaveBeenCalled();
		expect(notify).toHaveBeenCalledWith("success", "Data exported successfully");
		expect(result.current.isExporting).toBe(false);
	});

	it("stays silent when showNotifications is false", async () => {
		const notify = vi.fn();
		const { result } = renderHook(() => useExport({ notify, showNotifications: false }));

		await act(() => result.current.exportData([], columns));
		expect(notify).not.toHaveBeenCalled();
	});

	it("reports failures through onExportError", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		vi.spyOn(URL, "createObjectURL").mockImplementation(() => {
			throw new Error("boom");
		});
		const onExportError = vi.fn();
		const notify = vi.fn();
		const { result } = renderHook(() => useExport({ notify, onExportError }));

		await act(() => result.current.exportData([{ name: "Ada" }], columns));

		expect(onExportError).toHaveBeenCalled();
		expect(notify).toHaveBeenCalledWith("error", "Failed to export data");
	});
});

describe("useDeleteFile", () => {
	it("posts a delete for a single file and reports success", async () => {
		const apiResource = vi.fn().mockResolvedValue({ status: 200, detail: { successCount: 1 } });
		const onSuccess = vi.fn();
		const { result } = renderHook(() => useDeleteFile({ apiResource, filesApiUrl: FILES_API, onSuccess }));

		await act(async () => {
			await result.current.deleteFile({ bucketId: "b", fileId: "f" });
		});

		expect(apiResource).toHaveBeenCalledWith({
			path: FILES_API,
			method: "delete",
			payload: { files: [{ bucketId: "b", fileId: "f" }] },
		});
		expect(onSuccess).toHaveBeenCalled();
		expect(result.current.deleting).toBe(false);
	});

	it("routes errors to onError and always clears the deleting flag", async () => {
		const apiResource = vi.fn().mockRejectedValue(new Error("nope"));
		const onError = vi.fn();
		const { result } = renderHook(() => useDeleteFile({ apiResource, filesApiUrl: FILES_API, onError }));

		await act(async () => {
			await result.current.deleteFiles([{ bucketId: "b", fileId: "f" }]);
		});

		expect(onError).toHaveBeenCalled();
		expect(result.current.deleting).toBe(false);
	});
});

describe("useGetFileUrl", () => {
	const wrapper = ({ children }: { children: ReactNode }) => {
		const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
		return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
	};

	it("stays disabled until it has a bucket and a file name", () => {
		const apiResource = vi.fn();
		renderHook(
			() => useGetFileUrl({ apiResource, filesApiUrl: FILES_API, bucketId: "", fileName: "", enabled: true }),
			{
				wrapper,
			},
		);
		expect(apiResource).not.toHaveBeenCalled();
	});

	it("URL-encodes the query parameters", async () => {
		const apiResource = vi.fn().mockResolvedValue({ url: "https://cdn/x.pdf" });
		const { result } = renderHook(
			() =>
				useGetFileUrl({
					apiResource,
					filesApiUrl: FILES_API,
					bucketId: "my bucket",
					fileName: "a b.pdf",
					enabled: true,
				}),
			{ wrapper },
		);

		await waitFor(() => expect(result.current.data).toEqual({ url: "https://cdn/x.pdf" }));
		expect(apiResource).toHaveBeenCalledWith({
			path: `${FILES_API}/info?bucketId=my%20bucket&fileName=a%20b.pdf`,
		});
	});
});

describe("useFileUpload", () => {
	const pdf = () => new File(["%PDF-"], "doc.pdf", { type: "application/pdf" });
	const png = () => new File(["x"], "photo.png", { type: "image/png" });
	const changeEvent = (files: File[]) => ({ target: { files } }) as unknown as React.ChangeEvent<HTMLInputElement>;

	it("accepts PDFs and rejects everything else", () => {
		const notify = vi.fn();
		const { result } = renderHook(() => useFileUpload({ apiResource: vi.fn(), filesApiUrl: FILES_API, notify }));

		act(() => result.current.handleFileInput(changeEvent([pdf(), png()])));

		expect(result.current.files.map((f) => f.status)).toEqual(["success", "error"]);
		expect(notify).toHaveBeenCalledWith("error", "Only PDF files are allowed");
	});

	it("uploads valid files as FormData and calls onUploaded instead of refetching GraphQL", async () => {
		const apiResource = vi.fn().mockResolvedValue({ ok: true });
		const onUploaded = vi.fn();
		const setIsUpload = vi.fn();
		const notify = vi.fn();
		const { result } = renderHook(() =>
			useFileUpload({ apiResource, filesApiUrl: FILES_API, onUploaded, setIsUpload, notify }),
		);

		act(() => result.current.handleFileInput(changeEvent([pdf()])));
		await act(async () => {
			await result.current.uploadFiles({ customerId: "c1", category: "kyc" });
		});

		const [request] = apiResource.mock.calls[0];
		expect(request.path).toBe(`${FILES_API}/upload`);
		expect(request.payload).toBeInstanceOf(FormData);
		expect((request.payload as FormData).get("customerId")).toBe("c1");
		expect(onUploaded).toHaveBeenCalledWith({ ok: true });
		expect(setIsUpload).toHaveBeenCalledWith(false);
		expect(notify).toHaveBeenCalledWith("success", "File uploaded successfully!");
		expect(result.current.files).toEqual([]);
	});

	it("reports upload failures and stops loading", async () => {
		const apiResource = vi.fn().mockRejectedValue(new Error("500"));
		const notify = vi.fn();
		const { result } = renderHook(() => useFileUpload({ apiResource, filesApiUrl: FILES_API, notify }));

		act(() => result.current.handleFileInput(changeEvent([pdf()])));
		await act(async () => {
			await result.current.uploadFiles({});
		});

		expect(notify).toHaveBeenCalledWith("error", "Failed to upload file(s)");
		expect(result.current.loading).toBe(false);
	});

	it("tracks drag state and removes files by id", () => {
		const { result } = renderHook(() => useFileUpload({ apiResource: vi.fn(), filesApiUrl: FILES_API }));
		const dragEvent = {
			preventDefault: vi.fn(),
			stopPropagation: vi.fn(),
		} as unknown as React.DragEvent<HTMLDivElement>;

		act(() => result.current.handleDragEnter(dragEvent));
		expect(result.current.isDragging).toBe(true);

		act(() => result.current.handleDragLeave(dragEvent));
		expect(result.current.isDragging).toBe(false);

		act(() => result.current.handleFileInput(changeEvent([pdf()])));
		const id = result.current.files[0].id;
		act(() => result.current.removeFile(id));
		expect(result.current.files).toEqual([]);
	});
});

describe("useQueryParams", () => {
	const setUrl = (url: string) => window.history.replaceState({}, "", url);

	beforeEach(() => setUrl("/fleet"));

	it("reads a param, with A's and B's default-value behaviour", () => {
		setUrl("/fleet?status=active");
		const { result } = renderHook(() => useQueryParams());

		expect(result.current.getQueryParam("status")).toBe("active");
		expect(result.current.getQueryParam("missing")).toBeUndefined();
		expect(result.current.getQueryParam("missing", "all")).toBe("all");
	});

	it("replaces by default, matching B, and pushes on request, matching A", () => {
		const { result } = renderHook(() => useQueryParams());
		const before = window.history.length;

		act(() => result.current.setQueryParam("status", "active"));
		expect(window.location.search).toBe("?status=active");
		expect(window.history.length).toBe(before);

		act(() => result.current.setQueryParam("page", "2", { push: true }));
		expect(window.location.search).toBe("?status=active&page=2");
	});

	it("re-renders subscribers when the query string changes", () => {
		const { result } = renderHook(() => useQueryParams());
		expect(result.current.getQueryParam("status")).toBeUndefined();

		act(() => result.current.setQueryParam("status", "archived"));
		expect(result.current.getQueryParam("status")).toBe("archived");
	});

	it("sets several params at once and deletes on null/undefined", () => {
		const { result } = renderHook(() => useQueryParams());

		act(() => result.current.setQueryParams({ status: "active", page: 3 }));
		expect(window.location.search).toBe("?status=active&page=3");

		act(() => result.current.setQueryParams({ page: null }));
		expect(window.location.search).toBe("?status=active");
	});

	it("createQueryString serializes without navigating", () => {
		setUrl("/fleet?status=active");
		const { result } = renderHook(() => useQueryParams());

		expect(result.current.createQueryString({ page: 2 })).toBe("status=active&page=2");
		expect(window.location.search).toBe("?status=active");
	});

	it("honours a base path, which A's version silently dropped the query string for", () => {
		const { result } = renderHook(() => useQueryParams("/vehicles"));

		act(() => result.current.setQueryParam("status", "active"));
		expect(window.location.pathname).toBe("/vehicles");
		expect(window.location.search).toBe("?status=active");
	});

	it("drops the ? entirely when the last param is removed", () => {
		setUrl("/fleet?status=active");
		const { result } = renderHook(() => useQueryParams());

		act(() => result.current.setQueryParam("status", undefined));
		expect(window.location.search).toBe("");
		expect(window.location.pathname).toBe("/fleet");
	});
});

describe("usePermission", () => {
	it("answers has/hasAny/hasAll/getAll over the injected list", () => {
		const { result } = renderHook(() => usePermission(["vehicles:read", "vehicles:write"]));

		expect(result.current.has("vehicles:read")).toBe(true);
		expect(result.current.has("vehicles:delete")).toBe(false);
		expect(result.current.hasAny(["vehicles:delete", "vehicles:read"])).toBe(true);
		expect(result.current.hasAll(["vehicles:read", "vehicles:write"])).toBe(true);
		expect(result.current.hasAll(["vehicles:read", "vehicles:delete"])).toBe(false);
		expect(result.current.getAll().sort()).toEqual(["vehicles:read", "vehicles:write"]);
	});

	it("treats a missing list as no permissions", () => {
		const { result } = renderHook(() => usePermission(null));
		expect(result.current.has("anything")).toBe(false);
		expect(result.current.hasAny(["a", "b"])).toBe(false);
		// hasAll over an empty request is vacuously true, as in the original.
		expect(result.current.hasAll([])).toBe(true);
	});

	it("Can renders children only with the permission, and the fallback otherwise", () => {
		const { rerender } = render(
			<Can permission="vehicles:write" permissions={["vehicles:write"]}>
				<span>editor</span>
			</Can>,
		);
		expect(screen.getByText("editor")).toBeInTheDocument();

		rerender(
			<Can permission="vehicles:write" permissions={["vehicles:read"]} fallback={<span>read only</span>}>
				<span>editor</span>
			</Can>,
		);
		expect(screen.getByText("read only")).toBeInTheDocument();
		expect(screen.queryByText("editor")).not.toBeInTheDocument();
	});
});
