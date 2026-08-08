/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/components/upload/upload-box.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/components/upload/upload-box.tsx
 * @status identical
 * @notes Byte-identical in both apps; lifted verbatim. Icon import repointed at the library.
 */

import type { UploadProps } from "antd";
import Dragger from "antd/es/upload/Dragger";
import type { ReactElement } from "react";

import Iconify from "@/icons/iconify-icon";

import { StyledUploadBox } from "./styles";

interface Props extends UploadProps {
	placeholder?: ReactElement;
}
export function UploadBox({ placeholder, ...other }: Props) {
	return (
		<StyledUploadBox>
			<Dragger {...other} showUploadList={false}>
				<div className="opacity-60 hover:opacity-50">
					{placeholder || (
						<div className="m-auto flex h-16 w-16 items-center justify-center ">
							<Iconify icon="eva:cloud-upload-fill" size={28} />
						</div>
					)}
				</div>
			</Dragger>
		</StyledUploadBox>
	);
}
