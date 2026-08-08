/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/hooks/useInsuranceHistoryTable.tsx (columns)
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/table/insurance-history-column.tsx
 * @status adopted-B
 * @notes A built its columns inline inside `useInsuranceHistoryTable`, a hook that also owns the edit-modal
 *        and preview-modal state (see `insurance-history-table.tsx`'s header for why that hook wasn't
 *        ported whole). B keeps the column defs in their own file with a plain `columnHandler` callback,
 *        which is what this module vendors. `@/components/icon`'s `IconButton` -> a plain button styled
 *        the same way; `dayjs.utc` plugin usage kept as-is (dayjs is a declared peer).
 */

import Chip from "@/components/chip";
import Iconify from "@/icons/iconify-icon";
import { capitalize } from "@/utils";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import type { InsurancePolicy } from "../types";

dayjs.extend(utc);

type Props = {
	columnHandler?: (record?: InsurancePolicy) => void;
};

export const insuranceHistoryColumns = ({ columnHandler }: Props): ColumnsType<InsurancePolicy> => {
	return [
		{
			title: <p className="text-base">Policy number</p>,
			dataIndex: "policy_number",
			key: "policy_number",
			width: 150,
			render: (_, policy) => <span className="capitalize">{policy?.policy_number}</span>,
		},
		{
			title: <p className="text-base">Insurance company</p>,
			dataIndex: "insurance_company",
			key: "insurance_company",
			width: 250,
			render: (text) => <span>{text}</span>,
		},
		{
			title: <p className="text-base">Coverage start date</p>,
			dataIndex: "coverage_start",
			key: "coverage_start",
			width: 150,
			render: (text) => <span>{text ? dayjs.utc(text).format("MMMM D, YYYY") : ""}</span>,
		},
		{
			title: <p className="text-base">Coverage end date</p>,
			dataIndex: "coverage_end",
			key: "coverage_end",
			width: 150,
			render: (text) => <span>{text ? dayjs.utc(text).format("MMMM D, YYYY") : ""}</span>,
		},
		{
			title: <p className="text-base">Status</p>,
			dataIndex: "status",
			key: "status",
			width: 150,
			render: (status) => (
				<Chip
					label={status ? capitalize(status?.replace("_", "")?.toLowerCase()) : ""}
					variant={status === "EXPIRED" ? "danger" : "success"}
				/>
			),
		},
		{
			title: <p className="text-base">Files</p>,
			dataIndex: "file",
			key: "file",
			width: 50,
			render: (file, record) => (
				<span className="font-medium">
					{file ? (
						<button
							type="button"
							onClick={() => columnHandler?.(record)}
							className="inline-flex items-center justify-center"
							aria-label="View file"
						>
							<Iconify icon="solar:file-text-bold" className="!text-primary text-2xl !font-semibold" />
						</button>
					) : (
						"-"
					)}
				</span>
			),
		},
	];
};
