/**
 * @extracted-from
 *   B: Driverse_FE_Business   @ b96eda3 src/components/confirm-modal/index.tsx
 * @status adopted-B
 * @notes Business-only component; Autocredit has no equivalent. Lifted verbatim. It overlaps heavily
 *        with action-modal (both wrap antd Modal) but keeps a distinct API — `open`/`onOpen` versus
 *        `show`/`setShow`, plus a `label` line above the children — so both ship rather than guessing
 *        at a consolidation. Consolidating them is a candidate for the hardening phase.
 */

import { Modal } from "antd";
import type { FC, ReactNode } from "react";

type Props = {
	title?: string;
	open: boolean;
	loading?: boolean;
	onOpen?: (value: boolean) => void;
	handleTrigger: () => void;
	okText?: string;
	cancelText?: string;
	label?: string;
	children?: ReactNode;
};

const ConfirmationModal: FC<Props> = ({
	open,
	loading,
	title,
	onOpen,
	handleTrigger,
	okText,
	cancelText,
	children,
	label,
}) => {
	return (
		<Modal
			title={title}
			open={open}
			onOk={handleTrigger}
			cancelText={cancelText || "Close"}
			onCancel={() => onOpen?.(false)}
			okText={okText || "Confirm"}
			okButtonProps={{ disabled: loading }}
			confirmLoading={loading}
			centered
		>
			{label && <p className="text-sm pb-4">{label}</p>}

			{children && <div className="mt-4">{children}</div>}
		</Modal>
	);
};

export default ConfirmationModal;
