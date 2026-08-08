/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/documents/document-inbox/components/table/fleet-vehicles-table.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/documents/document-inbox/components/table/fleet-vehicles-table.tsx
 * @status decoupled
 * @notes Byte-identical in both apps (despite the filename, this renders the *selected-for-upload* files
 *        table, not fleet vehicles — kept as-is to preserve the origin path) except one substitution:
 *        `@ant-design/icons`' `SearchOutlined` -> `<Iconify icon="solar:magnifer-outline">`, the same swap
 *        `pending-uploads-table.tsx` makes for the same icon. No other app coupling: it's driven entirely
 *        by props, and `Card`/`Scrollbar` are both already in the library.
 */

import Card from "@/components/card";
import Scrollbar from "@/components/scrollbar";
import Iconify from "@/icons/iconify-icon";
import { Button, Input } from "antd";
import { Table } from "antd/lib";
import { useState } from "react";

import { columns } from "./selected-files-columns";

type Props = {
	data?: any;
	isLoading?: boolean;
	onAction?: (value: any) => void;
	handleProcess?: () => void;
	handleCancel?: () => void;
};

export default function SelectedFilesTable({ data, isLoading, onAction, handleProcess, handleCancel }: Props) {
	const [search, setSearch] = useState("");

	const filteredVehicles = (data || []).filter((file: File) => {
		return [file.size, file.name, file.type].join(" ").toLowerCase().includes(search.toLowerCase());
	});
	const columnsData = columns({
		onAction: (data) => {
			if (onAction) {
				onAction(data);
			}
		},
	});
	return (
		<>
			<Card className="flex-col">
				<header className="flex w-full justify-between mb-5">
					<Input
						placeholder="Search "
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						style={{ maxWidth: 300 }}
						allowClear
						prefix={<Iconify icon="solar:magnifer-outline" size={16} />}
					/>
					<div className="flex items-center gap-3">
						<Button
							type="primary"
							className="flex items-center gap-2"
							loading={isLoading}
							disabled={filteredVehicles.length < 1 || isLoading}
							onClick={() => handleProcess?.()}
						>
							Start Processing
						</Button>
						<Button disabled={isLoading} className="flex items-center gap-2" onClick={() => handleCancel?.()}>
							Cancel
						</Button>
					</div>
				</header>
				<main className="w-full">
					<Scrollbar>
						<Table
							scroll={{ x: "max-content", y: 400 }}
							columns={columnsData}
							bordered
							dataSource={filteredVehicles}
							sticky
						/>
					</Scrollbar>
				</main>
			</Card>
		</>
	);
}
