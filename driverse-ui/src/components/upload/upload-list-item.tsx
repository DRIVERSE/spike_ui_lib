/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/components/upload/upload-list-item.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/components/upload/upload-list-item.tsx
 * @status identical
 * @notes Byte-identical in both apps; lifted verbatim. Imports repointed at the library's animate variants, icons and fBytes.
 */

import { Card, Image, Tooltip, Typography } from "antd";
import type { ItemRender } from "antd/es/upload/interface";
import { m } from "framer-motion";
import { useEffect, useState } from "react";

import { varFade } from "@/components/animate/variants";
import Iconify from "@/icons/iconify-icon";
import SvgIcon from "@/icons/svg-icon";
import { fBytes } from "@/utils/format-number";

import { getBlobUrl, getFileFormat, getFileThumb } from "./utils";

type Props = {
	file: Parameters<ItemRender>["1"];
	actions: Parameters<ItemRender>["3"];
	thumbnail?: boolean;
};

export default function UploadListItem({ file, actions, thumbnail = false }: Props) {
	const { name, size } = file;
	const thumb = getFileThumb(name);
	const format = getFileFormat(name);
	const [imgThumbUrl, setImgThumbUrl] = useState("");

	useEffect(() => {
		// TODO: mock upload sucess, you should delete 'error' in the production environment
		if (file.status && ["done", "error"].includes(file.status) && format === "img") {
			if (file.originFileObj) {
				setImgThumbUrl(getBlobUrl(file.originFileObj));
			}
		}
	}, [file, format]);

	const closeButton = (
		<button
			type="button"
			className="ml-auto h-6 w-6 cursor-pointer rounded-full text-center hover:bg-gray-400 hover:bg-opacity-20"
			onClick={actions.remove}
		>
			<Iconify icon="mingcute:close-line" size={14} className="text-gray-600" />
		</button>
	);

	const thumbList = (
		<Card
			className="relative flex items-center justify-center"
			style={{ width: 80, height: 80, marginTop: "8px", marginRight: "8px" }}
		>
			<Tooltip title={name}>
				{format === "img" ? (
					<Image src={imgThumbUrl} preview={false} width={40} height={40} />
				) : (
					<SvgIcon icon={thumb} size={40} />
				)}
			</Tooltip>
			<div className="absolute right-0 top-0">{closeButton}</div>
		</Card>
	);
	const cardList = (
		<Card
			styles={{
				body: {
					display: "flex",
					alignItems: "center",
					padding: "8px 12px",
				},
			}}
			style={{ marginTop: "8px" }}
		>
			{format === "img" ? (
				<Image src={imgThumbUrl} preview={false} width={32} height={32} />
			) : (
				<SvgIcon icon={thumb} size={32} />
			)}
			<div className="ml-4 flex flex-col">
				<Typography.Text className="!text-sm !font-medium">{name}</Typography.Text>
				<Typography.Text type="secondary" className="!text-xs">
					{fBytes(size)}
				</Typography.Text>
			</div>
			{closeButton}
		</Card>
	);
	return (
		<m.div initial="initial" animate="animate" exit="exit" variants={varFade().inUp}>
			{thumbnail ? thumbList : cardList}
		</m.div>
	);
}
