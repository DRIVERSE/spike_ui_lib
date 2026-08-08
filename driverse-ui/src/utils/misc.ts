/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/utils/index.ts
 *   B: Driverse_FE_Business   @ b96eda3 src/utils/index.ts
 * @status merged
 * @notes Both apps pile a grab-bag into utils/index.ts. Most of it is app domain logic — compliance
 *        rule engines (`getVehicleComplianceStatus`, `filterByCompliance`, `filterByNeedsAttention`,
 *        `filterByImmediateAction`), payment-schedule walking (`getNextScheduleItemFromStartDate`),
 *        `isStateExcluded` (reads an app constants table) and `customDomainValidation` (reads
 *        window.location.hostname) — all of which import `#/entity` or `@/constants` and stay app-side.
 *        What lands here is the generic remainder, as the union of both files:
 *          both:  wait, getExtensionFromContentType, normalize, normalizeFiles, calculateBearing,
 *                 getMovementStatus, STATUS_CONFIG, isValidDate, safeFormatDate, safeDate, namespaceIds
 *          A only: getPrefixBeforeAt, formatDate
 *          B only: formatCurrency, formatCompactCurrency, removeUnderscore, formatText, downloadCsv,
 *                  calculatePercentage, handleNumericInputChange, getColSpan, normalizeFileName
 *        Conflicts resolved:
 *          - `wait` returns Promise<boolean> (B) rather than Promise<unknown> (A); B's is the usable one.
 *          - `STATUS_CONFIG.idling` is text-yellow-400 in A and text-yellow-500 in B, and `offline` is
 *            text-red-500 in A and text-gray-500 in B. B adopted: gray reads as "no signal" where red
 *            reads as "fault", and yellow-500 matches the rest of B's palette. Flagged for design review.
 *          - `formatDate` exists here in A and in docs-download.ts in B, with identical bodies. It is
 *            re-exported from docs-download rather than duplicated.
 */

import dayjs from "dayjs";
import { formatDate } from "./docs-download";

export { formatDate };

/** Resolves after `ms`. */
export const wait = (ms: number): Promise<boolean> => new Promise((resolve) => setTimeout(() => resolve(true), ms));

/** MIME type or bare extension -> file extension, defaulting to "pdf". */
export const getExtensionFromContentType = (contentType: string): string => {
	if (!contentType) return "pdf";

	const value = contentType.toLowerCase().trim();

	// Already a bare extension (no "/" present) — return as-is
	if (!value.includes("/")) return value;

	const mimeMap: Record<string, string> = {
		"application/pdf": "pdf",
		"image/jpeg": "jpg",
		"image/jpg": "jpg",
		"image/png": "png",
		"image/gif": "gif",
		"image/webp": "webp",
		"image/svg+xml": "svg",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
		"application/vnd.ms-excel": "xls",
		"text/csv": "csv",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
		"application/msword": "doc",
	};

	return mimeMap[value] ?? value.split("/")[1] ?? "pdf";
};

/** Trim, strip diacritics, lower-case. Used for accent-insensitive comparisons. */
export const normalize = (str = "") =>
	str
		?.trim()
		?.normalize("NFD")
		// NFD splits accents off as separate code points; this range is exactly what strips them.
		// biome-ignore lint/suspicious/noMisleadingCharacterClass: matching combining marks is the point
		?.replace(/[\u0300-\u036f]/gu, "")
		?.toLowerCase();

export const normalizeFileName = (name: string) => name.replace(/[\s_]/g, "").toLowerCase();

export const getPrefixBeforeAt = (str: string) => str?.split("@")[0];

export function removeUnderscore(param: string): string {
	return param.replace(/_/g, "");
}

/** Underscores and dashes to spaces. B's counterpart to `removeUnderscore`. */
export function formatText(value: string) {
	return value.replace(/[_-]/g, " ");
}

export type NormalizedFile = {
	bucketId: string;
	fileName: string;
	contentType: string;
};

/** Accepts an array, a keyed object or a single file record and normalizes the snake/camel key drift. */
export function normalizeFiles(fileData: any): NormalizedFile[] {
	if (!fileData) return [];

	const mapFile = (f: any): NormalizedFile => ({
		bucketId: f?.bucket_name || f?.bucketId || "",
		fileName: f?.file_name || f?.fileName || "",
		contentType: f?.content_type || f?.contentType || "",
	});

	const isComplete = (f: NormalizedFile) => f.bucketId && f.fileName && f.contentType;

	if (Array.isArray(fileData)) {
		return fileData.map(mapFile).filter(isComplete);
	}

	if (typeof fileData === "object") {
		const values = Object.values(fileData);

		if (values.length > 0 && typeof values[0] === "object") {
			return values.map(mapFile).filter(isComplete);
		}

		return [mapFile(fileData)];
	}

	return [];
}

export const formatCurrency = (amount: number) =>
	new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(amount);

export const formatCompactCurrency = (amount: number) =>
	new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		notation: "compact",
		compactDisplay: "short",
		maximumFractionDigits: 1,
	}).format(amount);

/** Percentage of `total`, clamped to 100 and rounded. Returns 0 rather than dividing by zero. */
export function calculatePercentage(value: number, total: number): number {
	if (total === 0) {
		return 0;
	}

	return Math.round(Math.min((value / total) * 100, 100));
}

/** antd Col span for an N-column grid. */
export function getColSpan(columns?: 1 | 2 | 3 | 4) {
	switch (columns) {
		case 1:
			return 24;
		case 2:
			return 12;
		case 3:
			return 8;
		case 4:
			return 6;
		default:
			return 24;
	}
}

/** Digits-only input guard: ignores the keystroke rather than rejecting after the fact. */
export const handleNumericInputChange = (e: { target: { value: string } }, setter: (val: string) => void): void => {
	const rawValue = e.target.value;

	if (/^\d*$/.test(rawValue)) {
		setter(rawValue);
	}
};

export function downloadCsv(assetPath: string, filename: string) {
	const link = document.createElement("a");
	link.href = assetPath;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

/** Initial bearing in degrees from one lat/lng to another. */
export const calculateBearing = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
	const dLng = ((lng2 - lng1) * Math.PI) / 180;
	const lat1Rad = (lat1 * Math.PI) / 180;
	const lat2Rad = (lat2 * Math.PI) / 180;
	const y = Math.sin(dLng) * Math.cos(lat2Rad);
	const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
	return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
};

export type MovementStatus = "moving" | "parked" | "idling" | "offline";

/** Telematics ACC + speed + online flag -> movement state. */
export const getMovementStatus = (
	accStatus: string | number,
	speed: number,
	status?: string | number,
): MovementStatus => {
	if (Number(status) === 0) return "offline";

	const acc = Number(accStatus);
	const spd = Number(speed);

	if (acc === 1 && spd > 0) return "moving";
	if (acc === 1 && spd === 0) return "idling";
	return "parked";
};

export const STATUS_CONFIG: Record<MovementStatus, { label: string; color: string; icon: string }> = {
	moving: { label: "Moving", color: "text-green-500", icon: "mdi:circle" },
	idling: { label: "Idling", color: "text-yellow-500", icon: "mdi:circle" },
	parked: { label: "Parked", color: "text-primary", icon: "mdi:circle" },
	offline: { label: "Offline", color: "text-gray-500", icon: "mdi:circle" },
};

export const isValidDate = (val?: string) => !val || (val !== "Invalid Date" && !Number.isNaN(new Date(val).getTime()));

export const safeFormatDate = (val?: string | null): string | null => {
	if (!val || val === "undefined" || val === "null") return null;
	const result = formatDate(val);
	return result === "Invalid Date" ? null : result;
};

/** Passes the value through when dayjs can parse it, otherwise undefined (for antd DatePicker props). */
export const safeDate = (val?: string) => (val && dayjs(val).isValid() ? val : undefined);

/**
 * Namespaces every id/xlink:href/fill(url(#…)) in an inline SVG string, so several copies of the same
 * sprite can coexist on one page without their gradient ids colliding.
 */
export const namespaceIds = (svg: string, uid: string) =>
	svg.replace(/\b(id|xlink:href|fill)="([^"]*)"/g, (match, attr, val) => {
		if (attr === "id") return `id="${val}-${uid}"`;
		if (attr === "xlink:href" && val.startsWith("#")) return `xlink:href="#${val.slice(1)}-${uid}"`;
		if (attr === "fill" && val.startsWith("url(#")) {
			const id = val.slice(5, -1);
			return `fill="url(#${id}-${uid})"`;
		}
		return match;
	});
