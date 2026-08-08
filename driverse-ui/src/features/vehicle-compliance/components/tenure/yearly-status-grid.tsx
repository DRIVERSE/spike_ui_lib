/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/compliance/components/tenure/payments-history.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/compliance/components/tenure/payments-history.tsx
 * @status adopted-B
 * @notes Tenure-only: a `Card` > `Header` > `Table` of "which fiscal years are paid" (year / refrendo /
 *        tenencia, each a colored icon+label), not a document/payment ledger — no files column, no row
 *        actions, no edit/delete. Different enough in shape from circulation's/verification's history
 *        table (which lists individual document records) that folding it into
 *        `compliance-table/history-table.tsx` would have meant a `variant` prop threading through a
 *        table that otherwise never needed one, for a component with exactly one caller. Kept as its own
 *        small component instead — this is the "genuinely-distinct component ported on top" the task
 *        allows for. B adopted (A/B differ only in formatting). `Icon` (`@iconify/react`) -> `Iconify`.
 */

import { Header } from "@/components/page-header";
import Scrollbar from "@/components/scrollbar";
import Iconify from "@/icons/iconify-icon";
import { Card, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { YearStatus } from "../../types";

const STATUS_ICON: Record<string, { icon: string; color: string; label: string }> = {
	NOT_PAID: { icon: "tabler:circle-x", color: "red", label: "Not paid" },
	PAID: { icon: "fluent-mdl2:check-mark", color: "#0d9d0d", label: "Paid" },
};

const statusCell = (text?: string) => {
	const entry = text ? STATUS_ICON[text] : undefined;
	return (
		<span className="flex items-center gap-2 text-base" style={{ color: entry?.color ?? "gray" }}>
			<Iconify icon={entry?.icon ?? "iconamoon:unavailable-thin"} className="text-xl" />
			{entry?.label ?? text}
		</span>
	);
};

const columns: ColumnsType<YearStatus> = [
	{ title: "Year", dataIndex: "year", key: "year" },
	{ title: "Renewal Fee", dataIndex: "refrendoStatus", key: "refrendoStatus", render: statusCell },
	{ title: "Tenure", dataIndex: "tenenciaStatus", key: "tenenciaStatus", render: statusCell },
];

export type TenureYearlyStatusGridProps = {
	years: YearStatus[];
};

export const TenureYearlyStatusGrid = ({ years }: TenureYearlyStatusGridProps) => (
	<Card style={{ minHeight: 170 }}>
		<div className="flex flex-col gap-3">
			<Header title="Payment History by Year" />
			<main className="w-full">
				<Scrollbar>
					<Table scroll={{ x: "max-content" }} columns={columns} bordered dataSource={years} />
				</Scrollbar>
			</main>
		</div>
	</Card>
);

export default TenureYearlyStatusGrid;
