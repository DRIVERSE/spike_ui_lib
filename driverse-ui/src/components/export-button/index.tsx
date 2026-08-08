/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/components/export-button/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/components/export-button/index.tsx
 * @status merged
 * @notes Identical bar one line: B renders `t("sys.vehiclePark.fleets.table.export") || buttonText`,
 *        hard-coding a vehicle-park i18n key into a generic button (and, because i18next returns the key
 *        itself when a translation is missing, the `|| buttonText` fallback can never fire). Stripped —
 *        the label is the `label` prop, defaulting to "Export", so the library takes no i18next dependency
 *        and apps pass `label={t(...)}` with whatever key they want. `buttonText` is kept as a deprecated
 *        alias so existing call sites keep working.
 *        react-icons' LuDownload is rendered through <Iconify> — same substitution as total-card.
 *        `notify` is forwarded to useExport, which is where the toast decoupling from W4 landed.
 */

import { type ExportNotifyLevel, useExport } from "@/hooks/use-export";
import Iconify from "@/icons/iconify-icon";
import { Button } from "antd";

/**
 * The button's column shape: `key` is optional here (the apps' call sites omit it) and is filled in from
 * `dataIndex` before handing the columns to exportToCSV, whose ExportColumn requires it.
 */
type ExportColumn<T = any> = {
	key?: string;
	title: string;
	dataIndex: string;
	render?: (record: T) => string | number;
};

type ExportButtonProps<T = any> = {
	data: T[];
	columns: ExportColumn<T>[];
	filename: string;
	/** Button label. Apps localise by passing `label={t("…")}`. */
	label?: string;
	/** @deprecated Use `label`. */
	buttonText?: string;
	disabled?: boolean;
	includeTimestamp?: boolean;
	showNotifications?: boolean;
	notify?: (level: ExportNotifyLevel, message: string) => void;
	transformData?: (data: T[]) => any[];
	className?: string;
};

export default function ExportButton<T = any>({
	data,
	columns,
	filename,
	label,
	buttonText,
	disabled = false,
	includeTimestamp = true,
	showNotifications = true,
	notify,
	transformData,
	className = "flex items-center gap-2",
}: ExportButtonProps<T>) {
	const { isExporting, exportData } = useExport({
		filename,
		includeTimestamp,
		showNotifications,
		notify,
	});

	const handleExport = async () => {
		const transformedData = transformData
			? transformData(data)
			: data.map((item) => {
					const row: Record<string, any> = {};
					for (const col of columns) {
						if (col.render) {
							row[col.dataIndex] = col.render(item);
						} else {
							// Handle nested properties (e.g. "user.name")
							const value = col.dataIndex.split(".").reduce((obj, key) => obj?.[key], item as any);
							row[col.dataIndex] = value ?? "";
						}
					}
					return row;
				});

		await exportData(
			transformedData,
			columns.map((col) => ({ ...col, key: col.key ?? col.dataIndex })),
		);
	};

	return (
		<Button
			icon={<Iconify icon="solar:download-minimalistic-linear" size={16} />}
			className={className}
			onClick={handleExport}
			loading={isExporting}
			disabled={disabled || !data.length}
		>
			{label ?? buttonText ?? "Export"}
		</Button>
	);
}
