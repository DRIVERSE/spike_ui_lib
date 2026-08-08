/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/compliance/components/circulation/history.tsx
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/compliance/components/tenure/history.tsx
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/compliance/components/verification/history.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/compliance/components/circulation/history.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/compliance/components/tenure/history.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/compliance/components/verification/history.tsx
 * @status merged
 * @notes This is the clearest of the three duplicated shapes: `Card` > `Header` (+ optional Edit button
 *        for verification/tenure) > `Table` inside `Scrollbar`, plus a lazily-loaded preview modal and an
 *        optional lazily-loaded edit form / delete-confirm modal. Only the `columns` array and the delete
 *        affordance differ per kind — circulation deletes a whole row (via
 *        `useCirculationCardHistory`, folded into the circulation config's `deleteRow`), tenure/
 *        verification edit a row instead. B adopted throughout (A/B differ only in formatting/i18n keys;
 *        B's tenure `history.tsx` additionally guards the edit column behind `useCan`, kept here as the
 *        `canEdit` prop). `columns` stays a plain antd `ColumnsType<any>` built by the caller (it already
 *        needs `t` and per-row click handlers it owns) rather than a config schema this component would
 *        have to re-interpret — the file/status/actions cell renderers are the only truly shared bits,
 *        and each kind's config re-uses `Chip`/`IconButton`-style renderers directly.
 */

import { Header } from "@/components/page-header";
import Scrollbar from "@/components/scrollbar";
import { Card, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { ReactNode } from "react";

export type ComplianceHistoryTableProps<Row = Record<string, unknown>> = {
	title: string;
	columns: ColumnsType<Row>;
	dataSource: Row[];
	/** Edit button next to the title (verification/tenure history) or nothing (circulation). */
	headerAction?: ReactNode;
	/** Preview / edit / delete-confirm modals the caller lazily mounts alongside the table. */
	modals?: ReactNode;
};

export const ComplianceHistoryTable = <Row,>({
	title,
	columns,
	dataSource,
	headerAction,
	modals,
}: ComplianceHistoryTableProps<Row>) => {
	return (
		<>
			<Card style={{ minHeight: 170 }}>
				<div className="flex flex-col gap-3">
					<div className="flex justify-between items-center">
						<Header title={title} />
						{headerAction}
					</div>
					<main className="w-full">
						<Scrollbar>
							<Table scroll={{ x: "max-content" }} columns={columns} bordered dataSource={dataSource} />
						</Scrollbar>
					</main>
				</div>
			</Card>
			{modals}
		</>
	);
};

export default ComplianceHistoryTable;
