/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/hooks/web/use-export.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/hooks/web/use-export.tsx
 * @status decoupled
 * @notes Byte-identical in both apps. One decoupling: the apps called sonner's toast directly for the
 *        three notification paths, gated by `showNotifications`. The library swaps that for an optional
 *        `notify` callback with the same three levels, keeping `showNotifications` as the gate — apps
 *        wire `notify={(level, message) => toast[level](message)}` in one line, and W6's toast becomes
 *        the default. `exportOptions` is memoized: in the apps it was a fresh object on every render,
 *        so the `exportToCSV` callback's dependency array never held.
 */

import { type ExportColumn, type ExportOptions, exportToCSV } from "@/utils/docs-download";
import { useCallback, useMemo, useState } from "react";

export type ExportNotifyLevel = "success" | "warning" | "error";

export interface UseExportOptions extends ExportOptions {
	onExportStart?: () => void;
	onExportComplete?: () => void;
	onExportError?: (error: Error) => void;
	showNotifications?: boolean;
	notify?: (level: ExportNotifyLevel, message: string) => void;
}

export interface UseExportReturn<T = any> {
	isExporting: boolean;
	exportData: (data: T[], columns: ExportColumn<T>[]) => Promise<void>;
	exportToCSV: (data: T[], columns: ExportColumn<T>[]) => Promise<void>;
}

export const useExport = <T = any>(options: UseExportOptions = {}): UseExportReturn<T> => {
	const [isExporting, setIsExporting] = useState(false);

	const {
		onExportStart,
		onExportComplete,
		onExportError,
		showNotifications = true,
		notify,
		filename,
		dateFormat,
		includeTimestamp,
		fileExtension,
	} = options;

	const exportOptions = useMemo<ExportOptions>(
		() => ({ filename, dateFormat, includeTimestamp, fileExtension }),
		[filename, dateFormat, includeTimestamp, fileExtension],
	);

	const announce = useCallback(
		(level: ExportNotifyLevel, message: string) => {
			if (showNotifications) notify?.(level, message);
		},
		[showNotifications, notify],
	);

	const exportToCSVHandler = useCallback(
		async (data: T[], columns: ExportColumn<T>[]) => {
			if (!data || data.length === 0) {
				announce("warning", "No data available to export");
				return;
			}

			setIsExporting(true);
			onExportStart?.();

			try {
				await new Promise((resolve) => setTimeout(resolve, 100));

				exportToCSV(data, columns, exportOptions);

				announce("success", "Data exported successfully");
				onExportComplete?.();
			} catch (error) {
				const errorMessage = error instanceof Error ? error : new Error("Export failed");
				console.error("Export error:", errorMessage);

				announce("error", "Failed to export data");
				onExportError?.(errorMessage);
			} finally {
				setIsExporting(false);
			}
		},
		[announce, exportOptions, onExportStart, onExportComplete, onExportError],
	);

	return {
		isExporting,
		exportData: exportToCSVHandler,
		exportToCSV: exportToCSVHandler,
	};
};
