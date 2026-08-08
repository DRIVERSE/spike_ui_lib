/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/components/tables/vehicle-insurance-history-table.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/table/vehicle-insurance-history-table.tsx
 * @status adopted-B
 * @notes This is the `@/features/vehicle-parks/table/vehicle-insurance-history-table` from the decoupling
 *        map — vendored, not a render prop, because its own JSX (export button, scrollable table) is
 *        genuinely self-contained UI over the library's `Table`/`Scrollbar`/`ExportButton`, exactly the
 *        kind of component the plan says to vendor.
 *        B adopted over A for portability, at the cost of one feature: A drives its columns and state
 *        through `useInsuranceHistoryTable`, a hook that also lazy-imports and renders `EditInsuranceForm`
 *        so clicking a policy row opens it for editing, in addition to the file-preview modal B also has.
 *        That hook is not one of the 14 listed files, lives outside this feature (`vehicles/hooks/`), and
 *        pulls in the same compliance `PreviewImageModal` both versions use. B is already self-contained
 *        (its own `insuranceHistoryColumns`, local `useState` for the preview modal, no extra hook) and
 *        decouples in one place instead of two, at the cost of the click-to-edit affordance — a real
 *        capability loss, noted in the module README.
 *        Decoupled: the compliance `PreviewImageModal` import -> `renderFilePreview` from
 *        `useVehicleInsurance()` (the same render prop `overview/index.tsx` uses, so both places share one
 *        seam instead of two lazy imports into the compliance feature).
 */

import ExportButton from "@/components/export-button";
import Scrollbar from "@/components/scrollbar";
import { capitalize } from "@/utils";
import { Table } from "antd";
import dayjs from "dayjs";
import { Suspense, useState } from "react";
import type { FC } from "react";
import { useVehicleInsurance } from "../provider";
import type { InsurancePolicy } from "../types";
import { insuranceHistoryColumns } from "./insurance-history-columns";

type Props = {
	loading?: boolean;
	data?: InsurancePolicy[];
};

export const InsuranceHistoryTable: FC<Props> = ({ data, loading }) => {
	const { renderFilePreview } = useVehicleInsurance();
	const [open, setOpen] = useState(false);
	const [fileInfo, setFileInfo] = useState({ bucketId: "", fileName: "", contentType: "" });

	const columns = insuranceHistoryColumns({
		columnHandler: (record) => {
			const file = record?.file as { bucket_name?: string; file_name?: string; content_type?: string } | undefined;
			setFileInfo({
				bucketId: file?.bucket_name || "",
				fileName: file?.file_name || "",
				contentType: file?.content_type || "",
			});
			setOpen(true);
		},
	});

	const exportColumns = [
		{ title: "Policy Number", dataIndex: "policy_number" },
		{ title: "Insurance Company", dataIndex: "insurance_company" },
		{ title: "Coverage Start Date", dataIndex: "coverage_start" },
		{ title: "Coverage End Date", dataIndex: "coverage_end" },
		{ title: "Status", dataIndex: "status" },
	];

	const transformInsuranceHistoryData = (rows: InsurancePolicy[]) =>
		rows.map((policy) => ({
			policy_number: policy?.policy_number || "",
			insurance_company: policy?.insurance_company || "",
			coverage_start: policy?.coverage_start ? dayjs(policy.coverage_start).format("MMMM D, YYYY") : "",
			coverage_end: policy?.coverage_end ? dayjs(policy.coverage_end).format("MMMM D, YYYY") : "",
			status: policy?.status ? capitalize(policy.status.replace("_", " ")?.toLowerCase()) : "",
		}));

	return (
		<div className="w-full">
			<div className="flex justify-end mb-4">
				<ExportButton
					data={data || []}
					columns={exportColumns}
					filename="Insurance-History"
					transformData={transformInsuranceHistoryData}
					buttonText="Export"
				/>
			</div>
			<main className="w-full">
				<Scrollbar>
					<Table
						scroll={{ x: "max-content", y: 400 }}
						loading={loading}
						columns={columns}
						bordered
						dataSource={data}
						sticky
					/>
				</Scrollbar>
			</main>

			{renderFilePreview && (
				<Suspense>
					{renderFilePreview({
						open,
						onOpenChange: setOpen,
						bucketId: fileInfo.bucketId,
						fileName: fileInfo.fileName,
						contentType: fileInfo.contentType,
					})}
				</Suspense>
			)}
		</div>
	);
};
