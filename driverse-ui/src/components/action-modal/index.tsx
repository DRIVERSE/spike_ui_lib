/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/components/action-modal/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/components/action-modal/index.tsx
 * @status identical
 * @notes Byte-identical in both apps; lifted verbatim.
 */

import { Modal, type ModalProps } from "antd";
import type { FC, ReactNode } from "react";

type Props = {
	children: ReactNode;
	show: boolean;
	loading?: boolean;
	title?: string;
	okText?: string;
	cancelText?: string;
	setShow: (value: boolean) => void;
	handleTrigger?: () => void;
} & ModalProps;

const TriggerActionModal: FC<Props> = ({
	show,
	loading,
	title,
	okText,
	cancelText,
	setShow,
	handleTrigger,
	children,
	...props
}) => {
	return (
		<Modal
			title={title || "Are you sure?"}
			open={show}
			onOk={handleTrigger}
			cancelText={cancelText || "Close"}
			onCancel={() => setShow(!show)}
			okText={okText || "Submit"}
			okButtonProps={{ disabled: loading }}
			cancelButtonProps={{ disabled: loading }}
			confirmLoading={loading}
			centered
			{...props}
		>
			{children}
		</Modal>
	);
};

export default TriggerActionModal;
