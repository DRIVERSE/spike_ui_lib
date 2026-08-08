/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/components/page-header/header.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/components/page-header/header.tsx
 * @status identical
 * @notes Byte-identical in both apps; lifted verbatim. `icon` was typed `any` with a commented-out
 *        `ElementType` alternative and is rendered as a node, not constructed — so it is typed ReactNode,
 *        matching what every call site actually passes.
 */

import type { FC, ReactNode } from "react";

type Props = {
	title?: string;
	icon?: ReactNode;
	description?: string;
};

export const Header: FC<Props> = ({ title, icon, description }) => {
	return (
		<div className="flex flex-col gap-1">
			<div className="flex items-center gap-2">
				{icon}
				<p className="text-lg font-medium">{title}</p>
			</div>
			<p className="text-md font-normal flex flex-col">{description}</p>
		</div>
	);
};

export default Header;
