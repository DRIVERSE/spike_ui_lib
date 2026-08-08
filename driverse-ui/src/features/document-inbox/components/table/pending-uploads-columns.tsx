/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/documents/document-inbox/components/table/pending-uploads-columns.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/documents/document-inbox/components/table/pending-uploads-columns.tsx
 * @status decoupled
 * @notes Byte-identical in both apps except:
 *          - `react-icons/gr`'s `GrView` -> `<Iconify icon="solar:eye-outline">` (react-icons is not a
 *            library dependency and isn't installed).
 *          - `DOCUMENT_TYPE_OPTIONS` now optionally comes from the caller (`documentTypeOptions` prop,
 *            defaulting to the module's own `../../data`) so a host app can narrow the set — see
 *            `data/index.ts`'s note on the A/B feature-flag difference.
 *          - `@/utils/capitalize` / `@/utils/time` collapse to the library's `@/utils` barrel, which
 *            re-exports both.
 */

import Chip from "@/components/chip";
import IconButton from "@/icons/icon-button";
import Iconify from "@/icons/iconify-icon";
import { capitalize, relativeTime } from "@/utils";
import { Select, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";

import { DOCUMENT_TYPE_OPTIONS } from "../../data";
import type { DocumentTypeOption } from "../../types";

type Props = {
	onView?: (value: any) => void;
	onFlag?: (value: any) => void;
	onMark?: (value: any) => void;
	onDelete?: (value: any) => void;
	onLogsView?: (value: any) => void;
	documentTypes?: Record<string, string>;
	documentTypeOptions?: DocumentTypeOption[];
	onDocumentTypeChange?: (value: string, record: any) => void;
	showActions?: boolean;
};

export const columns = ({
	onView,
	onLogsView,
	onDocumentTypeChange,
	documentTypes = {},
	documentTypeOptions = DOCUMENT_TYPE_OPTIONS,
	showActions = true,
}: Props): ColumnsType<any> => [
	{
		title: <p className="text-base">File Name</p>,
		dataIndex: "file_name",
		key: "name",
		width: 200,
	},
	{
		title: <p className="text-base">Document Type</p>,
		dataIndex: "document_type",
		key: "type",
		width: 180,
		render: (value, record) => {
			const formattedValue = record?.ocr_data?.document_type?.category || "";

			const resolvedValue = documentTypes[record.id] || formattedValue;

			if (!showActions) {
				return <span className="capitalize">{value?.replaceAll("_", " ")}</span>;
			}
			return (
				<Select
					size="small"
					placeholder="Select type"
					style={{ width: "100%", height: 32 }}
					value={resolvedValue === "unknown" ? undefined : resolvedValue}
					options={documentTypeOptions}
					onChange={(val) => onDocumentTypeChange?.(val, record)}
				/>
			);
		},
	},
	{
		title: <p className="text-base">Entity</p>,
		dataIndex: "entity",
		key: "entity",
		width: 150,
		render: (_) => {
			return (
				<Tag
					color="blue"
					className="text-common-white bg-primary rounded-lg"
					style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
				>
					<Iconify icon="carbon:car" size={14} />
					<span>vehicle</span>
				</Tag>
			);
		},
	},
	{
		title: <p className="text-base">Assigned To</p>,
		dataIndex: "assigned_to",
		key: "assigned_to",
		width: 150,
		render: (_, file) => {
			const extractedData = file?.ocr_data?.extracted_data || {};
			return (
				<span className="capitalize font-semibold">
					{extractedData?.vin && (
						<>
							{extractedData.vehicle_brand} {extractedData.vehicle_model_line} {extractedData.vehicle_year}
						</>
					)}

					<span className="block text-xs ">{extractedData?.vin ?? "-"}</span>
				</span>
			);
		},
	},
	{
		title: <p className="text-base">Process Status</p>,
		dataIndex: "status",
		key: "status",
		width: 150,
		render: (_, file) => (
			<span className="capitalize">
				<Chip label={capitalize(file.status?.replaceAll("_", " "))} variant={file.status || "default"} />
			</span>
		),
	},
	...(!showActions
		? [
				{
					title: <p className="text-base">Workflow Status</p>,
					dataIndex: "status",
					key: "status",
					width: 150,
					render: (_: any, file: any) => {
						const success = file?.logs?.success === true && file?.logs?.data?.status === 200;

						return (
							<span className="capitalize">
								<Chip label={success ? "Success" : "Failed"} variant={success ? "success" : "danger"} />
							</span>
						);
					},
				},
			]
		: []),

	...(!showActions
		? [
				{
					title: <p className="text-base">Date Completed</p>,
					dataIndex: "confirmed_at",
					key: "confirmed_at",
					width: 150,
					render: (file: string) => <span className="capitalize">{file && relativeTime(file)}</span>,
				},
			]
		: [
				{
					title: <p className="text-base">Date Uploaded</p>,
					dataIndex: "created_at",
					key: "created_at",
					width: 150,
					render: (file: string) => <span className="capitalize">{file && relativeTime(file)}</span>,
				},
			]),
	...(showActions
		? ([
				{
					title: <p className="text-base">Actions</p>,
					dataIndex: "user_id",
					key: "user_id",
					fixed: "right" as const,
					width: 100,
					render: (_: any, data: any) => {
						const isDisabled = data?.status === "CONFIRMATION_PENDING";
						return (
							<div className="flex gap-2 justify-center" onClick={(e) => e.stopPropagation()}>
								<IconButton
									onClick={() => {
										if (!isDisabled) {
											onView?.(data);
										}
									}}
									disabled={isDisabled}
								>
									<Iconify icon="solar:eye-outline" size={18} />
								</IconButton>
							</div>
						);
					},
				},
			] as ColumnsType<any>)
		: []),
	...(!showActions
		? ([
				{
					title: <p className="text-base">Logs</p>,
					dataIndex: "user_id",
					key: "user_id",
					fixed: "right" as const,
					width: 100,
					render: (_: any, data: any) => {
						return (
							<>
								{data?.logs && (
									<IconButton
										onClick={(e) => {
											e.stopPropagation();
											onLogsView?.(data);
										}}
									>
										<Iconify icon="solar:eye-outline" size={18} />
									</IconButton>
								)}
							</>
						);
					},
				},
			] as ColumnsType<any>)
		: []),
];
