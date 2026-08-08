/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/components/scroll-progress/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/components/scroll-progress/index.tsx
 * @status identical
 * @notes Byte-identical in both apps; lifted verbatim. The only change is the useTheme source: the
 *        library hook exposes the resolved token bag as `tokens` where the apps called it `themeTokens`.
 *        https://www.framer.com/motion/scroll-animations/##spring-smoothing
 */

import { useTheme } from "@/theme/use-theme";
import { type HTMLMotionProps, type MotionValue, m, useSpring } from "framer-motion";
import type { CSSProperties } from "react";

interface Props extends HTMLMotionProps<"div"> {
	color?: string;
	scrollYProgress: MotionValue<number>;
	height?: number;
}

export default function ScrollProgress({ scrollYProgress, height = 4, color, ...other }: Props) {
	const scaleX = useSpring(scrollYProgress, {
		stiffness: 100,
		damping: 30,
		restDelta: 0.001,
	});

	const { tokens } = useTheme();

	const backgroundColor = color || tokens.color.palette.primary.default;

	const style: CSSProperties = {
		transformOrigin: "0%",
		height,
		backgroundColor,
	};

	return <m.div style={{ scaleX, ...style }} {...other} />;
}
