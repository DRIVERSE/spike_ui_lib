/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/components/logo/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/components/logo/index.tsx
 * @status decoupled
 * @notes Identical in both apps, and unusable as-is: it hard-coded the placeholder template icon
 *        (`solar:code-square-bold` tinted with the primary color) and wrapped it in react-router's
 *        <NavLink to="/">, which would drag a router peer into every consumer.
 *        The library version takes the brand mark as `src`/`alt` props — logos are per-app assets, the
 *        same reason ic_logo_nav.svg is excluded from the icon set — and renders a plain <a> only when
 *        `href` is given, so apps that route client-side wrap it in their own Link instead.
 */

import type { CSSProperties } from "react";

interface Props {
	/** Brand mark URL. Apps inject their own — the library ships no logo asset. */
	src: string;
	alt: string;
	size?: number | string;
	href?: string;
	className?: string;
	style?: CSSProperties;
}

export default function Logo({ src, alt, size = 50, href, className, style }: Props) {
	const image = (
		<img
			src={src}
			alt={alt}
			width={typeof size === "number" ? size : undefined}
			height={typeof size === "number" ? size : undefined}
			className={className}
			style={{ width: size, height: size, objectFit: "contain", ...style }}
		/>
	);

	if (!href) return image;

	return (
		<a href={href} style={{ display: "inline-flex" }}>
			{image}
		</a>
	);
}
