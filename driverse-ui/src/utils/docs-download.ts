/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/utils/docs-download.ts
 *   B: Driverse_FE_Business   @ b96eda3 src/utils/docs-download.ts
 * @status merged
 * @notes The two files differ only in that B commented out the unused `dateFormat` destructure and the
 *        stray `console.log({dateFormat})` that A ships in production. Both are removed outright here.
 *        `ExportOptions.dateFormat` stays in the public type: it is part of both call signatures, and
 *        neither implementation ever consumed it — flagged for W5, which owns export-button.
 *        Lint-only rewrites: the inner columns.forEach became a for...of and isNaN became Number.isNaN.
 */

export interface ExportColumn<T = any> {
	key: string;
	title: string;
	dataIndex?: string;
	render?: (value: any, record: T, index: number) => any;
	width?: number;
}

export interface ExportOptions {
	filename?: string;
	dateFormat?: string;
	includeTimestamp?: boolean;
	fileExtension?: "csv" | "xlsx";
}

export const exportToCSV = <T = any>(data: T[], columns: ExportColumn<T>[], options: ExportOptions = {}): void => {
	const { filename = "export", includeTimestamp = true, fileExtension = "csv" } = options;

	if (!data || data.length === 0) {
		console.warn("No data available to export");
		return;
	}
	// Generate export data based on column configuration
	const exportData = data.map((record, index) => {
		const row: Record<string, any> = {};

		for (const column of columns) {
			let value: any;

			if (column.render) {
				// Use custom render function
				const rawValue = column.dataIndex ? getNestedValue(record, column.dataIndex) : record;
				value = column.render(rawValue, record, index);
			} else if (column.dataIndex) {
				// Get value from dataIndex path
				value = getNestedValue(record, column.dataIndex);
			} else {
				// Use the entire record
				value = record;
			}

			// Clean up the value for CSV export
			value = sanitizeValueForExport(value);

			row[column.title] = value;
		}

		return row;
	});

	// Convert to CSV
	const headers = columns.map((col) => col.title);
	const csvContent = [
		headers.join(","),
		...exportData.map((row) =>
			headers
				.map((header) => {
					const value = row[header];
					// Escape CSV special characters
					if (typeof value === "string" && (value.includes(",") || value.includes('"') || value.includes("\n"))) {
						return `"${value.replace(/"/g, '""')}"`;
					}
					return value || "";
				})
				.join(","),
		),
	].join("\n");

	// Generate filename
	const timestamp = includeTimestamp ? `-${new Date().toISOString().split("T")[0]}` : "";
	const fullFilename = `${filename}${timestamp}.${fileExtension}`;

	// Create and trigger download
	const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
	const link = document.createElement("a");
	const url = URL.createObjectURL(blob);

	link.setAttribute("href", url);
	link.setAttribute("download", fullFilename);
	link.style.visibility = "hidden";

	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
};

const getNestedValue = (obj: any, path: string): any => {
	return path.split(".").reduce((current, key) => {
		return current && current[key] !== undefined ? current[key] : undefined;
	}, obj);
};

const sanitizeValueForExport = (value: any): string => {
	// Handle null/undefined
	if (value === null || value === undefined) {
		return "N/A";
	}

	// Handle primitives
	if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
		return String(value);
	}

	// Handle dates
	if (value instanceof Date) {
		return formatDate(value);
	}

	// Handle objects - convert to string representation or return 'N/A'
	if (typeof value === "object") {
		// If it has a meaningful toString method or specific properties, use those
		if (value.toString && value.toString() !== "[object Object]") {
			return value.toString();
		}
		// Otherwise, return N/A to avoid [object Object]
		return "N/A";
	}

	return String(value);
};

export const formatDate = (date: string | Date, format = "YYYY-MM-DD"): string => {
	const dateObj = typeof date === "string" ? new Date(date) : date;

	if (Number.isNaN(dateObj.getTime())) {
		return "Invalid Date";
	}

	const year = dateObj.getFullYear();
	const month = String(dateObj.getMonth() + 1).padStart(2, "0");
	const day = String(dateObj.getDate()).padStart(2, "0");

	return format.replace("YYYY", String(year)).replace("MM", month).replace("DD", day);
};
