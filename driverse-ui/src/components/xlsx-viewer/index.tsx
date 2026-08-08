/**
 * @extracted-from
 *   B: Driverse_FE_Business   @ b96eda3 src/components/previewers/XlsxViewer.tsx
 * @status adopted-B
 * @notes Business-only; Autocredit has no spreadsheet preview. Lifted verbatim. `xlsx` is an optional peer —
 *        only importers of this component need it.
 */

import { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";

type SheetData = {
	name: string;
	headers: string[];
	rows: (string | number | boolean | null)[][];
};

type Props = {
	url: string;
	height?: string;
};

export default function XlsxViewer({ url, height = "600px" }: Props) {
	const [sheets, setSheets] = useState<SheetData[]>([]);
	const [activeSheet, setActiveSheet] = useState(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const tableRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!url) return;

		setLoading(true);
		setError(null);

		fetch(url)
			.then((res) => {
				if (!res.ok) throw new Error("Failed to fetch file");
				return res.arrayBuffer();
			})
			.then((buffer) => {
				const workbook = XLSX.read(buffer, { type: "array" });

				const parsed: SheetData[] = workbook.SheetNames.map((name) => {
					const worksheet = workbook.Sheets[name];
					const jsonData: (string | number | boolean | null)[][] = XLSX.utils.sheet_to_json(worksheet, {
						header: 1,
						defval: null,
					});

					const headers = (jsonData[0] ?? []).map((h) => (h !== null && h !== undefined ? String(h) : ""));
					const rows = jsonData.slice(1);

					return { name, headers, rows };
				});

				setSheets(parsed);
				setActiveSheet(0);
			})
			.catch((err) => {
				setError(err.message || "Failed to parse file");
			})
			.finally(() => setLoading(false));
	}, [url]);

	if (loading) {
		return (
			<div className="flex items-center justify-center" style={{ height }}>
				<div className="flex flex-col items-center gap-3 text-gray-500">
					<div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
					<span className="text-sm">Loading spreadsheet…</span>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center" style={{ height }}>
				<p className="text-red-500 text-sm">{error}</p>
			</div>
		);
	}

	if (!sheets.length) {
		return (
			<div className="flex items-center justify-center" style={{ height }}>
				<p className="text-gray-400 text-sm">No data found in file</p>
			</div>
		);
	}

	const current = sheets[activeSheet];

	return (
		<div className="flex flex-col" style={{ height }}>
			{/* Sheet tabs */}
			{sheets.length > 1 && (
				<div className="flex gap-1 px-3 pt-2 border-b border-gray-200 bg-gray-50 flex-shrink-0 overflow-x-auto">
					{sheets.map((sheet, idx) => (
						<button
							type="button"
							key={sheet.name}
							onClick={() => setActiveSheet(idx)}
							className={`px-3 py-1.5 text-xs font-medium rounded-t whitespace-nowrap transition-colors ${
								idx === activeSheet
									? "bg-white border border-b-white border-gray-200 -mb-px text-blue-600"
									: "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
							}`}
						>
							{sheet.name}
						</button>
					))}
				</div>
			)}

			{/* Table */}
			<div className="flex-1 overflow-auto" ref={tableRef}>
				<table className="min-w-full border-collapse text-sm">
					<thead className="sticky top-0 z-10 bg-gray-100">
						<tr>
							{/* Row number header */}
							<th className="w-10 min-w-[2.5rem] border border-gray-200 bg-gray-200 text-gray-400 text-xs font-normal px-2 py-1.5 text-center select-none" />
							{current.headers.map((header, colIdx) => (
								<th
									// biome-ignore lint/suspicious/noArrayIndexKey: a spreadsheet cell has no identity but its position
									key={colIdx}
									className="border border-gray-200 bg-gray-100 text-gray-700 font-semibold px-3 py-1.5 text-left whitespace-nowrap text-xs tracking-wide"
								>
									{header}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{current.rows.map((row, rowIdx) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: a spreadsheet row has no identity but its position
							<tr key={rowIdx} className={rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
								{/* Row number */}
								<td className="border border-gray-200 text-gray-400 text-xs text-center px-2 py-1.5 select-none bg-gray-50 font-mono">
									{rowIdx + 2}
								</td>
								{current.headers.map((_, colIdx) => {
									const cell = row[colIdx];
									const isNumber = typeof cell === "number";
									return (
										<td
											// biome-ignore lint/suspicious/noArrayIndexKey: a spreadsheet cell has no identity but its position
											key={colIdx}
											className={`border border-gray-200 px-3 py-1.5 whitespace-nowrap text-xs text-gray-700 max-w-[200px] overflow-hidden text-ellipsis ${
												isNumber ? "text-right font-mono" : ""
											}`}
											title={cell !== null && cell !== undefined ? String(cell) : ""}
										>
											{cell !== null && cell !== undefined ? String(cell) : ""}
										</td>
									);
								})}
							</tr>
						))}
						{current.rows.length === 0 && (
							<tr>
								<td colSpan={current.headers.length + 1} className="text-center text-gray-400 text-sm py-8">
									No rows in this sheet
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{/* Footer info */}
			<div className="flex-shrink-0 px-3 py-1.5 border-t border-gray-100 bg-gray-50 text-xs text-gray-400 flex items-center justify-between">
				<span>
					{current.rows.length} row{current.rows.length !== 1 ? "s" : ""} · {current.headers.length} column
					{current.headers.length !== 1 ? "s" : ""}
				</span>
				{sheets.length > 1 && (
					<span>
						Sheet {activeSheet + 1} of {sheets.length}
					</span>
				)}
			</div>
		</div>
	);
}
