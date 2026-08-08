/**
 * @extracted-from
 *   B: Driverse_FE_Business   @ b96eda3 src/components/pill/index.tsx
 * @status adopted-B
 * @notes Business-only component; Autocredit has no equivalent. Lifted verbatim, with its
 *        `VARIANT_STYLES` import rewired to the library chip so the two stay in lockstep — that shared
 *        map is exactly why chip was merged rather than forked.
 */

import { VARIANT_STYLES } from "@/components/chip";
import type { ReactNode } from "react";

type PillProps = {
	variant?: string;
	children: ReactNode;
	className?: string;
};

export default function Pill({ variant, children, className = "" }: PillProps) {
	const normalizedVariant = variant || "default";
	const variantStyle =
		VARIANT_STYLES[normalizedVariant] || VARIANT_STYLES[normalizedVariant.toUpperCase()] || VARIANT_STYLES.default;

	return (
		<span
			className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium capitalize tracking-wide ${className}`.trim()}
			style={variantStyle}
		>
			{typeof children === "string" ? children.replaceAll("_", " ") : children}
		</span>
	);
}
