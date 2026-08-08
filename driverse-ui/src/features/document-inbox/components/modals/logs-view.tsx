/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/documents/document-inbox/components/modals/logs-view.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/documents/document-inbox/components/modals/logs-view.tsx
 * @status decoupled
 * @notes Byte-identical in both apps except for one dependency: `react-json-view`'s `<ReactJson>` (an
 *        interactive collapsible tree) is not a library dependency and isn't installed. It's replaced with
 *        a plain `JSON.stringify(..., null, 2)` block inside the library's `Scrollbar`, which shows the
 *        same information — the original was already rendered fully expanded
 *        (`collapsed={false}`) with clipboard/data-type/object-size chrome all turned off, so the
 *        interactive tree wasn't doing much beyond formatting.
 */

import Scrollbar from "@/components/scrollbar";
import { Modal, Tag, Typography } from "antd";

const { Text, Title } = Typography;

interface Props {
	open: boolean;
	onClose?: () => void;
	logs?: any;
}

const isSuccess = (logs: any) => logs?.success === true && logs?.data?.status === 200;
const parseDetail = (detail: any) => {
	if (!detail) return null;
	if (typeof detail === "object") return detail;
	try {
		return JSON.parse(detail);
	} catch {
		return null;
	}
};

export const LogsView = ({ open, onClose, logs }: Props) => {
	if (!logs) return null;

	const success = isSuccess(logs);
	const responseData = logs?.data ?? {};

	const status = responseData?.status;
	const message = responseData?.message;
	const errorDetail =
		!success && responseData?.detail ? (parseDetail(responseData.detail) ?? { detail: responseData.detail }) : null;

	return (
		<Modal
			open={open}
			footer={null}
			onCancel={onClose}
			centered
			title={
				<div className="flex items-center gap-2">
					<span>Response Logs</span>
					<Tag color={success ? "success" : "error"}>{success ? "Success" : "Failed"}</Tag>
				</div>
			}
		>
			<div className="flex flex-col gap-4 py-2">
				<div className="flex items-center gap-3">
					<Text type="secondary">Status:</Text>
					<Tag color={status === 200 ? "blue" : "red"}>{status}</Tag>
				</div>

				<div className="flex items-start gap-3">
					<Text type="secondary">Message:</Text>
					<Text className="font-medium">{message ?? responseData?.title ?? "—"}</Text>
				</div>

				{!success && errorDetail && (
					<div className="flex flex-col gap-1">
						<Title level={5} className="!mb-1">
							Detail
						</Title>
						<Scrollbar style={{ maxHeight: 320 }}>
							<pre
								style={{
									fontSize: 13,
									borderRadius: 8,
									padding: "12px",
									margin: 0,
									background: "#f6f8fa",
									whiteSpace: "pre-wrap",
									wordBreak: "break-word",
								}}
							>
								{JSON.stringify(errorDetail, null, 2)}
							</pre>
						</Scrollbar>
					</div>
				)}
			</div>
		</Modal>
	);
};
