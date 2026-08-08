/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/components/animate/motion-viewport.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/components/animate/motion-viewport.tsx
 * @status identical
 * @notes Byte-identical in both apps; lifted verbatim apart from the props type: the apps declared
 *        `extends MotionProps`, which does not carry `className`. That only compiled under their
 *        @types/react 18 setup; on React 19 it has to be HTMLMotionProps<"div">, which is what the
 *        component always rendered anyway. Runtime behaviour is unchanged.
 *        Related: framer-motion 10 (what both apps pin) types m.div through the pre-React-19 global
 *        JSX namespace, so every prop resolves to unknown under @types/react 19. The library needs
 *        framer-motion >= 11.11.17 — a required app upgrade at adoption, tracked for W5/W6.
 */

import { type HTMLMotionProps, m } from "framer-motion";

import { varContainer } from "./variants";

interface Props extends HTMLMotionProps<"div"> {
	className?: string;
}
/**
 * [whileInView: 元素可以在进出视口时设置动画](https://www.framer.com/motion/scroll-animations/#scroll-triggered-animations)
 *
 * + viewport: [视口](https://www.framer.com/motion/scroll-animations/###viewport)
 *
 *    + once: 仅触发一次
 */
export default function MotionViewport({ children, className, ...other }: Props) {
	return (
		<m.div
			initial="initial"
			whileInView="animate"
			viewport={{ once: true, amount: 0.3 }}
			variants={varContainer()}
			className={className}
			{...other}
		>
			{children}
		</m.div>
	);
}
