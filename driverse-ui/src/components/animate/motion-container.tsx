/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/components/animate/motion-container.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/components/animate/motion-container.tsx
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

import { varContainer } from "./variants/container";

interface Props extends HTMLMotionProps<"div"> {
	className?: string;
}

/**
 * Motion 通用容器
 *
 * variants: [变体可以用于使用单个动画道具为组件的整个子树设置动画](https://www.framer.com/motion/animation/#variants)
 *
 * Variants 是一组预定义的对象
 * const variants = {
 *   visible: { opacity: 1 },
 *   hidden: { opacity: 0 },
 * }
 *
 * 需要指定 inital 和 animate 属性名
 * <motion.div
 *  initial="hidden"
 *  animate="visible"
 *  variants={variants}
 * />
 */
export default function MotionContainer({ children, className }: Props) {
	return (
		<m.div
			// 这里指定 initial、animate和exit的属性名后，子组件就不需要再重复指定
			initial="initial"
			animate="animate"
			exit="exit"
			variants={varContainer()}
			className={className}
		>
			{children}
		</m.div>
	);
}
