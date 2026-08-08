/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/documents/document-inbox/components/table/pending-uploads-table.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/documents/document-inbox/components/table/pending-uploads-table.tsx
 * @status merged
 * @notes B is the base (adds `react-router`'s `useNavigate` for the completed-uploads row click, which A
 *        lacked; trims a stray leading space and trims the search input). Decoupled further:
 *          - `react-router` is not a library dependency. `useNavigate()` + the hard-coded
 *            `/vehicle-park/vehicles/:id` route is replaced by `onViewVehicle`, read off
 *            `useDocumentInbox()` (see `provider.tsx`) — the app supplies routing, the library supplies
 *            the click.
 *          - `@ant-design/icons`' `SearchOutlined` -> `<Iconify icon="solar:magnifer-outline">`.
 */

import Card from "@/components/card";
import Scrollbar from "@/components/scrollbar";
import Iconify from "@/icons/iconify-icon";
import { Input } from "antd";
import { Table } from "antd/lib";

import { usePendingAction } from "../../hooks/usePendingAction";
import { useDocumentInbox } from "../../provider";

type Props = {
	data?: any;
	isLoading?: boolean;
	showActions?: boolean;
};

export default function PendingUploadsTable({ showActions = true, data }: Props) {
	const { onViewVehicle } = useDocumentInbox();
	const { columnsData, filteredVehicles, search, setSearch, loading } = usePendingAction({ showActions });
	const dataSource = data || filteredVehicles || [];

	return (
		<>
			<Card className="flex-col">
				<header className="flex w-full justify-between mb-5">
					<Input
						placeholder="Search "
						value={search}
						onChange={(e) => setSearch(e.target.value?.trim())}
						style={{ maxWidth: 300 }}
						allowClear
						prefix={<Iconify icon="solar:magnifer-outline" size={16} />}
						disabled={loading}
					/>
				</header>
				<main className="w-full">
					<Scrollbar>
						<Table
							scroll={{ x: "max-content", y: 400 }}
							columns={columnsData}
							dataSource={dataSource}
							loading={loading}
							pagination={false}
							bordered
							sticky
							rowKey="id"
							{...(!showActions && {
								onRow: (record: any) => ({
									onClick: () => onViewVehicle?.(record?.form?.vehicle_id || record?.form?.vehicleId),
									style: { cursor: "pointer" },
								}),
							})}
						/>
					</Scrollbar>
				</main>
			</Card>
		</>
	);
}
