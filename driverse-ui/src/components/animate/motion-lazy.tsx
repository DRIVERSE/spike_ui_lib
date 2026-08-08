/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/components/animate/motion-lazy.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/components/animate/motion-lazy.tsx
 * @status identical
 * @notes Byte-identical in both apps. Only change: React types imported explicitly instead of relying on the apps' ambient global React namespace.
 */

import { LazyMotion, domMax, m } from "framer-motion";
import type { ReactNode } from "react";

type Props = {
	children: ReactNode;
};
/**
 * [Reduce bundle size by lazy-loading a subset of Motion's features](https://www.framer.com/motion/lazy-motion/)
 */
export function MotionLazy({ children }: Props) {
	return (
		<LazyMotion strict features={domMax}>
			<m.div style={{ height: "100%" }}> {children} </m.div>
		</LazyMotion>
	);
}
