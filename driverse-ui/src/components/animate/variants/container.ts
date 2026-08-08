/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/components/animate/variants/container.ts
 *   B: Driverse_FE_Business   @ b96eda3 src/components/animate/variants/container.ts
 * @status identical
 * @notes Byte-identical in both apps; lifted verbatim.
 */

export type Props = {
	staggerIn?: number;
	delayIn?: number;
	staggerOut?: number;
};

export const varContainer = (props?: Props) => {
	const staggerIn = props?.staggerIn || 0.05;
	const delayIn = props?.staggerIn || 0.05;
	const staggerOut = props?.staggerIn || 0.05;

	return {
		animate: {
			transition: {
				staggerChildren: staggerIn,
				delayChildren: delayIn,
			},
		},
		exit: {
			transition: {
				staggerChildren: staggerOut,
				staggerDirection: -1,
			},
		},
	};
};
