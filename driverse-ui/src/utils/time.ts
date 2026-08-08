/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/utils/time.ts
 *   B: Driverse_FE_Business   @ b96eda3 src/utils/time.ts
 * @status merged
 * @notes Same functions in both apps, declared in different orders with different indentation; every
 *        shared implementation is byte-equal once formatted, so nothing had to be reconciled. Union:
 *        B contributes `DATE_FORMAT`, A contributes the `formatTripDuration` doc comment. `formatTimeInHr`
 *        and `generateYearOptions` exist in both (A declares them mid-file, B at the end) and are deduped.
 */

import dayjs, { type Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import utc from "dayjs/plugin/utc";

dayjs.extend(isoWeek);
dayjs.extend(utc);

export const DATE_FORMAT = "MM-DD-YYYY";

export type QuickRangeKey = "today" | "yesterday" | "last3days" | "thisWeek" | "lastWeek" | "thisMonth" | "lastMonth";

export const QUICK_RANGES: { key: QuickRangeKey; label: string }[] = [
	{ key: "today", label: "Today" },
	{ key: "yesterday", label: "Yesterday" },
	{ key: "last3days", label: "Last 3 days" },
	{ key: "thisWeek", label: "This week" },
	{ key: "lastWeek", label: "Last week" },
	{ key: "thisMonth", label: "This month" },
	{ key: "lastMonth", label: "Last month" },
];

export const formatTime = (isoString: string): string => {
	const date = new Date(isoString);

	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};

export function formatTimeInHr(totalSeconds?: number | string | null): string {
	if (totalSeconds === undefined || totalSeconds === null || totalSeconds === "") {
		return "--:--";
	}

	const seconds = Number(totalSeconds);
	if (Number.isNaN(seconds) || seconds < 0) return "--:--";

	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);

	return `${hours}h ${minutes}m`;
}

export const relativeTime = (time: string | number): string => {
	const msPerMinute = 60 * 1000;
	const msPerHour = msPerMinute * 60;
	const msPerDay = msPerHour * 24;
	const msPerMonth = msPerDay * 30;
	const msPerYear = msPerDay * 365;

	const timeMilliseconds = typeof time === "string" ? new Date(time).getTime() : time;

	const elapsed = Date.now() - timeMilliseconds;

	if (elapsed < msPerMinute) {
		const seconds = Math.round(elapsed / 1000);
		return seconds < 1 ? "Just now" : seconds === 1 ? "1 second ago" : `${seconds} seconds ago`;
	}
	if (elapsed < msPerHour) {
		const minutes = Math.round(elapsed / msPerMinute);
		return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
	}
	if (elapsed < msPerDay) {
		const hours = Math.round(elapsed / msPerHour);
		return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
	}
	if (elapsed < msPerMonth) {
		const days = Math.round(elapsed / msPerDay);
		return days === 1 ? "1 day ago" : `${days} days ago`;
	}
	if (elapsed < msPerYear) {
		const months = Math.round(elapsed / msPerMonth);
		return months === 1 ? "1 month ago" : `${months} months ago`;
	}
	const years = Math.round(elapsed / msPerYear);
	return years === 1 ? "1 year ago" : `${years} years ago`;
};

export const generateYearOptions = () => {
	const currentYear = new Date().getFullYear();
	const futureYear = currentYear + 1;
	const startYear = 2010;
	const years = [];
	years.push(futureYear.toString());

	for (let year = currentYear; year >= startYear; year--) {
		years.push(year.toString());
	}

	return years;
};

export const formatTimestamp = (timestamp: string) => {
	try {
		return new Date(timestamp).toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hour12: false,
		});
	} catch {
		return timestamp;
	}
};

/**
 * Formats the duration between two ISO timestamps as "Xhrs : Ymin : Zsec".
 * Returns "—" when either timestamp is missing.
 */
export function formatTripDuration(startTime?: string | null, endTime?: string | null): string {
	if (!startTime || !endTime) return "—";
	const totalSecs = dayjs(endTime).diff(dayjs(startTime), "second");
	const h = Math.floor(totalSecs / 3600);
	const m = Math.floor((totalSecs % 3600) / 60);
	const s = totalSecs % 60;
	if (h > 0) return `${h}hrs : ${m}min : ${s}sec`;
	if (m > 0) return `${m}min : ${s}sec`;
	return `${s}sec`;
}

export const getQuickRange = (key: QuickRangeKey): { start: Dayjs; end: Dayjs } => {
	const now = dayjs();
	switch (key) {
		case "today":
			return { start: now.startOf("day"), end: now.endOf("day") };
		case "yesterday": {
			const yesterday = now.subtract(1, "day");
			return { start: yesterday.startOf("day"), end: yesterday.endOf("day") };
		}
		case "last3days":
			return {
				start: now.subtract(2, "day").startOf("day"),
				end: now.endOf("day"),
			};
		case "thisWeek":
			return { start: now.startOf("isoWeek"), end: now.endOf("day") };
		case "lastWeek": {
			const lastWeek = now.subtract(1, "week");
			return {
				start: lastWeek.startOf("isoWeek"),
				end: lastWeek.endOf("isoWeek"),
			};
		}
		case "thisMonth":
			return { start: now.startOf("month"), end: now.endOf("day") };
		case "lastMonth": {
			const lastMonth = now.subtract(1, "month");
			return {
				start: lastMonth.startOf("month"),
				end: lastMonth.endOf("month"),
			};
		}
	}
};

export const parseTripTime = (time?: string | null) => (time ? dayjs.utc(time).local() : null);
