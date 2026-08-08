/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/components/icon/svg-icon.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/components/icon/svg-icon.tsx
 * @status rewritten
 * @notes Byte-identical in both apps, but the implementation had to change: the apps rendered
 *        `<svg><use xlink:href="#icon-name"/></svg>` against a sprite injected by vite-plugin-svg-icons,
 *        which forced every consuming app to install and configure that plugin — the single biggest
 *        extraction risk in the plan. The library resolves the name through the svgr-generated
 *        `svgIconMap` instead, so no host plugin is needed.
 *        Public props are unchanged (icon, size, color, className, style) and the wrapper keeps the same
 *        class list, inline styles and aria-label. Two differences: `prefix` is accepted and ignored (it
 *        only selected the sprite symbol namespace, which no longer exists), and the `<title>` element is
 *        replaced by role="img" + aria-label because svgr owns the SVG's children.
 *        Unknown names render nothing and warn once instead of emitting an empty <svg>.
 */

import { cn } from "@/utils/cn";
import type { CSSProperties } from "react";
import { type SvgIconName, svgIconMap } from "./svg-map";

export interface SvgIconProps {
	/** Icon file name without extension, e.g. "ic-analysis" or "ic_file_pdf". */
	icon: SvgIconName | (string & {});
	/** @deprecated Sprite symbol prefix in the apps; accepted for call-site compatibility and ignored. */
	prefix?: string;
	color?: string;
	size?: string | number;
	className?: string;
	style?: CSSProperties;
}

// A missing icon is a bug, so it is reported in production too — but only once per name, since these
// render inside lists. `import.meta.env.DEV` is inlined to false when the library is built, which would
// make a dev-only guard invisible to consumers.
const warnedNames = new Set<string>();

export default function SvgIcon({
	icon,
	color = "currentColor",
	size = "1em",
	className = "",
	style = {},
}: SvgIconProps) {
	const Component = svgIconMap[icon as SvgIconName];

	if (!Component) {
		if (!warnedNames.has(icon)) {
			warnedNames.add(icon);
			console.warn(`[SvgIcon] unknown icon "${icon}". Available names are exported as \`svgIconNames\`.`);
		}
		return null;
	}

	const svgStyle: CSSProperties = {
		verticalAlign: "middle",
		width: size,
		height: size,
		color,
		...style,
	};

	return (
		<Component
			className={cn("anticon fill-current inline-block h-[1em] w-[1em] overflow-hidden outline-none", className)}
			style={svgStyle}
			aria-label={icon}
			role="img"
			// 9 of the source files were downloaded from Iconify and carry aria-hidden="true" in their
			// markup. svgr keeps root attributes, so it has to be overridden rather than omitted —
			// otherwise those icons vanish from the accessibility tree while the rest stay visible.
			aria-hidden={false}
		/>
	);
}
