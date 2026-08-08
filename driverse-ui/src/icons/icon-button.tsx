/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/components/icon/icon-button.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/components/icon/icon-button.tsx
 * @status adopted-B
 * @notes B is a strict superset of A: it narrows the props to `Omit<ButtonProps, "type">` (the rendered
 *        element is a native <button type="button">, so antd's `type` would collide), forwards `disabled`
 *        to the element plus an opacity/pointer-events class, and spreads the remaining props. A dropped
 *        every prop except children/className/style/onClick.
 */

import { cn } from "@/utils/cn";
import type { ButtonProps } from "antd";
import type { CSSProperties, ReactNode } from "react";

type Props = {
	children: ReactNode;
	className?: string;
	style?: CSSProperties;
} & Omit<ButtonProps, "type">;

export default function IconButton({ children, className, style, onClick, disabled, ...rest }: Props) {
	return (
		<button
			type="button"
			style={style}
			className={cn(
				"flex cursor-pointer items-center justify-center rounded-full p-2 hover:bg-hover",
				disabled && "opacity-50 pointer-events-none",
				className,
			)}
			onClick={onClick}
			disabled={disabled}
			{...rest}
		>
			{children}
		</button>
	);
}
