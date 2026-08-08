/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/documents/document-inbox/components/table/selected-files-columns.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/documents/document-inbox/components/table/selected-files-columns.tsx
 * @status decoupled
 * @notes Byte-identical in both apps except two substitutions:
 *          - `colors.driverse_black` (`@/theme/colors`, `#000`) -> the library's `commonColors.black`
 *            token (also `#000000`).
 *          - `react-icons/md`'s `MdCancel` -> the library's `<Iconify>` (`solar:close-circle-outline`),
 *            since react-icons is not a library dependency and isn't installed.
 */

import IconButton from "@/icons/icon-button";
import Iconify from "@/icons/iconify-icon";
import { commonColors } from "@/tokens";
import type { ColumnsType } from "antd/es/table";

type Props = {
	onAction?: (value: any) => void;
};
export const columns = ({ onAction }: Props): ColumnsType<any> => [
	{
		title: <p className="text-base">File Name</p>,
		dataIndex: "name",
		key: "name",
		width: 200,
	},
	{
		title: <p className="text-base">Type</p>,
		dataIndex: "type",
		key: "type",
		width: 100,
	},
	{
		title: <p className="text-base">Size</p>,
		dataIndex: "size",
		key: "size",
		width: 150,
		render: (_, file) => <span className="capitalize">{(file.size / 1024 / 1024).toFixed(2)}MB</span>,
	},

	{
		title: <p className="text-base" />,
		dataIndex: "user_id",
		key: "user_id",
		fixed: "right",
		width: 100,
		render: (_, data) => {
			return (
				<div className="flex justify-center">
					<IconButton onClick={() => onAction?.(data)}>
						<Iconify icon="solar:close-circle-outline" size={18} color={commonColors.black} />
					</IconButton>
				</div>
			);
		},
	},
];
