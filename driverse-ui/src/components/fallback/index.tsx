/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/components/fallback/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/components/fallback/index.tsx
 * @status adopted-B
 * @notes The only difference is A's `description?: string | React.ReactNode`, which is just ReactNode
 *        with an extra redundant branch; B's cleaner signature adopted. The raw @iconify/react `Icon`
 *        default is kept rather than swapping to the library's <Iconify> wrapper, so the fallback icon
 *        keeps its exact original box (Iconify adds an inline-flex wrapper).
 */

import { cn } from "@/utils/cn";
import { Icon } from "@iconify/react";
import type { FC, ReactNode } from "react";

type Props = {
	title?: ReactNode;
	description?: ReactNode;
	action?: ReactNode;
	icon?: ReactNode;
	hideIcon?: boolean;
	height?: string | number;
	className?: string;
	hideDesc?: boolean;
};

const Fallback: FC<Props> = ({ title, description, action, icon, height = 500, hideIcon, className }) => (
	<div
		style={{
			minHeight: typeof height === "number" ? `${height}px` : height,
		}}
		className={cn("flex flex-col items-center justify-center py-12", className)}
	>
		{!hideIcon && (
			<div className="mb-4 text-4xl text-gray-400">
				{icon || <Icon icon="solar:file-text-bold-duotone" width={30} height={30} />}
			</div>
		)}
		<h2 className="text-xl font-semibold mb-2">{title}</h2>
		<p className="text-gray-700 mb-4">{description}</p>
		{action}
	</div>
);

export default Fallback;
