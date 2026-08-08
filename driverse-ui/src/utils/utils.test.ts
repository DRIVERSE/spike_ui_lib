import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { capitalize } from "./capitalize";
import { cn } from "./cn";
import { type ExportColumn, exportToCSV, formatDate } from "./docs-download";
import {
	fBytes,
	fCurrency,
	fNumber,
	fPercent,
	fShortenNumber,
	formatAmount,
	formatAmountWithCurrency,
	formatNumberWithCommas,
} from "./format-number";
import {
	STATUS_CONFIG,
	calculateBearing,
	calculatePercentage,
	formatCompactCurrency,
	formatCurrency,
	formatText,
	getColSpan,
	getExtensionFromContentType,
	getMovementStatus,
	getPrefixBeforeAt,
	handleNumericInputChange,
	isValidDate,
	namespaceIds,
	normalize,
	normalizeFileName,
	normalizeFiles,
	removeUnderscore,
	safeDate,
	safeFormatDate,
	wait,
} from "./misc";
import { buildPermissionTree, initializePermissionState } from "./permission-tree";
import { clearItems, getItem, getStringItem, removeItem, setItem } from "./storage";
import {
	DATE_FORMAT,
	QUICK_RANGES,
	formatTime,
	formatTimeInHr,
	formatTimestamp,
	formatTripDuration,
	generateYearOptions,
	getQuickRange,
	parseTripTime,
	relativeTime,
} from "./time";
import { flattenTrees } from "./tree";

describe("cn", () => {
	it("merges conditional classes and lets later tailwind utilities win", () => {
		expect(cn("p-2", "p-4")).toBe("p-4");
		expect(cn("flex", false && "hidden", undefined, "gap-2")).toBe("flex gap-2");
	});
});

describe("capitalize", () => {
	it("capitalizes and lower-cases the tail", () => {
		expect(capitalize("HELLO WORLD")).toBe("Hello world");
	});

	it("turns underscores into spaces (Business's addition)", () => {
		expect(capitalize("UNDER_REVIEW")).toBe("Under review");
	});

	it("leaves emails untouched", () => {
		expect(capitalize("Ada@Example.com")).toBe("Ada@Example.com");
	});

	it("returns a dash for empty input", () => {
		expect(capitalize("")).toBe("-");
		expect(capitalize(undefined as unknown as string)).toBe("-");
	});
});

describe("flattenTrees", () => {
	it("flattens depth-first, parents before children", () => {
		type Node = { id: number; children?: Node[] };
		const tree: Node[] = [{ id: 1, children: [{ id: 2, children: [{ id: 3 }] }] }, { id: 4 }];
		expect(flattenTrees(tree).map((n) => n.id)).toEqual([1, 2, 3, 4]);
	});

	it("handles empty and childless input", () => {
		expect(flattenTrees()).toEqual([]);
		expect(flattenTrees<{ id: number; children?: { id: number }[] }>([{ id: 1 }])).toEqual([{ id: 1 }]);
	});
});

describe("storage", () => {
	afterEach(() => localStorage.clear());

	it("round-trips JSON values", () => {
		setItem("settings", { mode: "dark" });
		expect(getItem<{ mode: string }>("settings")).toEqual({ mode: "dark" });
		expect(getStringItem("settings")).toBe('{"mode":"dark"}');
	});

	it("returns null for a missing key", () => {
		expect(getItem("nope")).toBeNull();
		expect(getStringItem("nope")).toBeNull();
	});

	it("logs and returns null on malformed JSON instead of throwing", () => {
		const error = vi.spyOn(console, "error").mockImplementation(() => {});
		localStorage.setItem("broken", "{not json");
		expect(getItem("broken")).toBeNull();
		expect(error).toHaveBeenCalled();
		error.mockRestore();
	});

	it("removes and clears", () => {
		setItem("a", 1);
		setItem("b", 2);
		removeItem("a");
		expect(getItem("a")).toBeNull();
		clearItems();
		expect(getItem("b")).toBeNull();
	});
});

describe("format-number", () => {
	it("formats with numeral", () => {
		expect(fNumber(1234.5)).toBe("1,235");
		expect(fCurrency(1234)).toBe("$1,234");
		expect(fCurrency(1234.56)).toBe("$1,234.56");
		expect(fPercent(25)).toBe("25%");
		expect(fShortenNumber(1500)).toBe("1.50k");
		// result() only strips the ".00" suffix, so a non-zero decimal survives.
		expect(fShortenNumber(1000)).toBe("1k");
		expect(fBytes(1024)).toBe("1 KB");
	});

	it("returns an empty string for falsy input, except fNumber", () => {
		expect(fCurrency(null)).toBe("");
		expect(fPercent(undefined)).toBe("");
		expect(fNumber(null)).toBe("0");
	});

	it("formatAmountWithCurrency maps symbols and honours decimals (Autocredit)", () => {
		expect(formatAmountWithCurrency(1234.5)).toBe("$1,234.50");
		expect(formatAmountWithCurrency(1234.5, "EUR")).toBe("€1,234.50");
		expect(formatAmountWithCurrency(1234.5, "mxn")).toBe("$1,234.50");
		expect(formatAmountWithCurrency(1234.5, "USD", 0)).toBe("$1,235");
		// Unknown codes fall back to the code itself.
		expect(formatAmountWithCurrency(10, "XYZ", 0)).toBe("XYZ10");
		expect(formatAmountWithCurrency("not a number")).toBe("$0");
	});

	it("formatNumberWithCommas groups thousands (Business)", () => {
		expect(formatNumberWithCommas("1234567")).toBe("1,234,567");
		expect(formatNumberWithCommas(0)).toBe("0");
		expect(formatNumberWithCommas("abc")).toBe("0");
	});

	it("formatAmount always returns two decimals and strips the sign", () => {
		expect(formatAmount(1234.5)).toBe("1,234.50");
		expect(formatAmount("-99.995")).toBe("100.00");
		expect(formatAmount("")).toBe("0.00");
		expect(formatAmount("nope")).toBe("0.00");
	});
});

describe("time", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-08-07T12:00:00Z"));
	});
	afterEach(() => vi.useRealTimers());

	it("exposes Business's DATE_FORMAT and the shared quick ranges", () => {
		expect(DATE_FORMAT).toBe("MM-DD-YYYY");
		expect(QUICK_RANGES.map((r) => r.key)).toEqual([
			"today",
			"yesterday",
			"last3days",
			"thisWeek",
			"lastWeek",
			"thisMonth",
			"lastMonth",
		]);
	});

	it("formatTime renders an ISO date", () => {
		expect(formatTime("2026-03-04T10:20:30Z")).toMatch(/^2026-03-0[34]$/);
	});

	it("formatTimeInHr handles seconds and every empty case (Autocredit)", () => {
		expect(formatTimeInHr(3900)).toBe("1h 5m");
		expect(formatTimeInHr("7200")).toBe("2h 0m");
		expect(formatTimeInHr(0)).toBe("0h 0m");
		for (const empty of [undefined, null, "", -1, "abc"]) {
			expect(formatTimeInHr(empty as number)).toBe("--:--");
		}
	});

	it("relativeTime scales its unit", () => {
		const now = Date.now();
		expect(relativeTime(now)).toBe("Just now");
		expect(relativeTime(now - 1000)).toBe("1 second ago");
		expect(relativeTime(now - 5 * 60_000)).toBe("5 minutes ago");
		expect(relativeTime(now - 3 * 3_600_000)).toBe("3 hours ago");
		expect(relativeTime(now - 2 * 86_400_000)).toBe("2 days ago");
		expect(relativeTime(now - 60 * 86_400_000)).toBe("2 months ago");
		expect(relativeTime(now - 800 * 86_400_000)).toBe("2 years ago");
	});

	it("generateYearOptions leads with next year then counts back to 2010 (Business)", () => {
		const years = generateYearOptions();
		expect(years[0]).toBe("2027");
		expect(years[1]).toBe("2026");
		expect(years.at(-1)).toBe("2010");
	});

	it("formatTimestamp returns the input when it is not a date", () => {
		expect(formatTimestamp("2026-08-07T13:04:05Z")).toMatch(/^\d{2}:\d{2}:\d{2}$/);
		expect(formatTimestamp("nonsense")).toBe("Invalid Date");
	});

	it("formatTripDuration drops empty leading units", () => {
		expect(formatTripDuration("2026-01-01T00:00:00Z", "2026-01-01T01:02:03Z")).toBe("1hrs : 2min : 3sec");
		expect(formatTripDuration("2026-01-01T00:00:00Z", "2026-01-01T00:02:03Z")).toBe("2min : 3sec");
		expect(formatTripDuration("2026-01-01T00:00:00Z", "2026-01-01T00:00:03Z")).toBe("3sec");
		expect(formatTripDuration(null, "2026-01-01T00:00:03Z")).toBe("—");
	});

	it("getQuickRange uses ISO weeks (Monday start)", () => {
		const { start, end } = getQuickRange("thisWeek");
		expect(start.isoWeekday()).toBe(1);
		expect(end.isAfter(start)).toBe(true);

		const yesterday = getQuickRange("yesterday");
		expect(yesterday.end.diff(yesterday.start, "hour")).toBe(23);
	});

	it("parseTripTime returns null without input", () => {
		expect(parseTripTime()).toBeNull();
		expect(parseTripTime("2026-01-01T00:00:00Z")?.isValid()).toBe(true);
	});
});

describe("docs-download", () => {
	const columns: ExportColumn<{ name: string; nested: { count: number } }>[] = [
		{ key: "name", title: "Name", dataIndex: "name" },
		{ key: "count", title: "Count", dataIndex: "nested.count" },
	];

	let click: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		click = vi.fn();
		vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(click);
		URL.createObjectURL = vi.fn(() => "blob:mock");
		URL.revokeObjectURL = vi.fn();
	});
	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
	});

	it("formatDate honours the format string and rejects invalid dates", () => {
		expect(formatDate("2026-08-07T00:00:00")).toBe("2026-08-07");
		expect(formatDate("2026-08-07T00:00:00", "DD/MM/YYYY")).toBe("07/08/2026");
		expect(formatDate("nope")).toBe("Invalid Date");
	});

	it("warns and does nothing when there is no data", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		exportToCSV([], columns);
		expect(warn).toHaveBeenCalledWith("No data available to export");
		expect(click).not.toHaveBeenCalled();
	});

	it("resolves nested dataIndex paths and triggers a download", () => {
		exportToCSV([{ name: "Ada", nested: { count: 3 } }], columns, { filename: "people", includeTimestamp: false });
		expect(click).toHaveBeenCalledTimes(1);
		expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock");
	});

	it("substitutes N/A for null and unrenderable objects", () => {
		let captured = "";
		vi.stubGlobal(
			"Blob",
			class {
				constructor(parts: string[]) {
					captured = parts.join("");
				}
			},
		);

		exportToCSV([{ name: null, nested: {} }] as any, columns, { includeTimestamp: false });
		expect(captured).toContain("Name,Count");
		expect(captured).toContain("N/A");
	});
});

describe("permission-tree", () => {
	const source = [
		{
			id: "fleet",
			label: "Fleet",
			name: "fleet",
			route: "/fleet",
			children: [
				{ id: "vehicles", label: "Vehicles", name: "vehicles", children: [{ id: "vin", label: "VIN", name: "vin" }] },
				{ id: "secret", label: "Secret", name: "secret", hide: true },
			],
		},
		{ id: "hidden-root", label: "Hidden", name: "hidden", hide: true },
	];

	it("builds a nested tree and drops hidden nodes by default", () => {
		const tree = buildPermissionTree(source);
		expect(tree.map((n) => n.id)).toEqual(["fleet"]);
		expect(tree[0].children?.map((n) => n.id)).toEqual(["vehicles"]);
		expect(tree[0].children?.[0].children?.map((n) => n.id)).toEqual(["vin"]);
	});

	it("keeps hidden nodes when asked", () => {
		const tree = buildPermissionTree(source, true);
		expect(tree.map((n) => n.id)).toEqual(["fleet", "hidden-root"]);
		expect(tree[0].children?.map((n) => n.id)).toEqual(["vehicles", "secret"]);
	});

	it("initializes every node to none, keeping parents that have grandchildren", () => {
		const state = initializePermissionState(buildPermissionTree(source));

		// The original recursed with processNode(child), which overwrote the parent entry here.
		expect(state.fleet).toEqual({ level: "none", submodules: { vehicles: "none" } });
		expect(state.vehicles).toEqual({ level: "none", submodules: { vin: "none" } });
	});
});

describe("misc", () => {
	it("getExtensionFromContentType handles MIME types, bare extensions and junk", () => {
		expect(getExtensionFromContentType("application/pdf")).toBe("pdf");
		expect(getExtensionFromContentType("image/jpeg")).toBe("jpg");
		expect(getExtensionFromContentType("PNG")).toBe("png");
		expect(getExtensionFromContentType("application/x-unknown")).toBe("x-unknown");
		expect(getExtensionFromContentType("")).toBe("pdf");
	});

	it("normalize strips accents and case", () => {
		expect(normalize("  Nuevo LEÓN ")).toBe("nuevo leon");
		expect(normalize()).toBe("");
		expect(normalizeFileName("My File_01.pdf")).toBe("myfile01.pdf");
	});

	it("normalizeFiles accepts arrays, keyed objects and single records", () => {
		const complete = { bucket_name: "b", file_name: "f.pdf", content_type: "application/pdf" };
		const expected = [{ bucketId: "b", fileName: "f.pdf", contentType: "application/pdf" }];

		expect(normalizeFiles([complete])).toEqual(expected);
		expect(normalizeFiles({ one: complete })).toEqual(expected);
		expect(normalizeFiles(complete)).toEqual(expected);
		// Incomplete records are dropped from collections.
		expect(normalizeFiles([{ bucket_name: "b" }])).toEqual([]);
		expect(normalizeFiles(null)).toEqual([]);
	});

	it("getMovementStatus follows the ACC/speed/online truth table", () => {
		expect(getMovementStatus(1, 40)).toBe("moving");
		expect(getMovementStatus(1, 0)).toBe("idling");
		expect(getMovementStatus(0, 0)).toBe("parked");
		// status 0 wins over everything else.
		expect(getMovementStatus(1, 40, 0)).toBe("offline");
		expect(Object.keys(STATUS_CONFIG).sort()).toEqual(["idling", "moving", "offline", "parked"]);
	});

	it("calculateBearing returns compass degrees", () => {
		expect(Math.round(calculateBearing(0, 0, 1, 0))).toBe(0);
		expect(Math.round(calculateBearing(0, 0, 0, 1))).toBe(90);
		expect(Math.round(calculateBearing(0, 0, -1, 0))).toBe(180);
	});

	it("calculatePercentage clamps and never divides by zero", () => {
		expect(calculatePercentage(25, 200)).toBe(13);
		expect(calculatePercentage(300, 200)).toBe(100);
		expect(calculatePercentage(1, 0)).toBe(0);
	});

	it("getColSpan maps column counts onto antd's 24-unit grid", () => {
		expect([1, 2, 3, 4].map((n) => getColSpan(n as 1))).toEqual([24, 12, 8, 6]);
		expect(getColSpan()).toBe(24);
	});

	it("handleNumericInputChange only forwards digit-only values", () => {
		const setter = vi.fn();
		handleNumericInputChange({ target: { value: "123" } }, setter);
		expect(setter).toHaveBeenCalledWith("123");

		setter.mockClear();
		handleNumericInputChange({ target: { value: "12a" } }, setter);
		expect(setter).not.toHaveBeenCalled();
	});

	it("text helpers strip underscores two different ways", () => {
		expect(removeUnderscore("UNDER_REVIEW")).toBe("UNDERREVIEW");
		expect(formatText("UNDER_REVIEW-2")).toBe("UNDER REVIEW 2");
		expect(getPrefixBeforeAt("ada@example.com")).toBe("ada");
	});

	it("currency helpers use Intl", () => {
		expect(formatCurrency(1234.5)).toBe("$1,234.50");
		expect(formatCompactCurrency(1234567)).toBe("$1.2M");
	});

	it("date guards reject invalid input", () => {
		expect(isValidDate("2026-08-07")).toBe(true);
		expect(isValidDate("Invalid Date")).toBe(false);
		expect(isValidDate()).toBe(true);
		expect(safeFormatDate("nope")).toBeNull();
		expect(safeFormatDate("null")).toBeNull();
		expect(safeFormatDate("2026-08-07T00:00:00")).toBe("2026-08-07");
		expect(safeDate("not a date")).toBeUndefined();
		expect(safeDate("2026-08-07")).toBe("2026-08-07");
	});

	it("namespaceIds rewrites ids, hrefs and fill urls so two copies can coexist", () => {
		const svg = '<svg><linearGradient id="BG"/><path fill="url(#BG)"/><use xlink:href="#BG"/></svg>';
		const out = namespaceIds(svg, "x1");
		expect(out).toContain('id="BG-x1"');
		expect(out).toContain('fill="url(#BG-x1)"');
		expect(out).toContain('xlink:href="#BG-x1"');
	});

	it("wait resolves after the delay", async () => {
		vi.useFakeTimers();
		const promise = wait(500);
		vi.advanceTimersByTime(500);
		await expect(promise).resolves.toBe(true);
		vi.useRealTimers();
	});
});
