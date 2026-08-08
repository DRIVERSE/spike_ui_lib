/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/components/animate/variants/path.ts
 *   B: Driverse_FE_Business   @ b96eda3 src/components/animate/variants/path.ts
 * @status identical
 * @notes Byte-identical in both apps; lifted verbatim.
 */

// ----------------------------------------------------------------------

export const TRANSITION = {
	duration: 2,
	ease: [0.43, 0.13, 0.23, 0.96],
};

export const varPath = {
	animate: {
		fillOpacity: [0, 0, 1],
		pathLength: [1, 0.4, 0],
		transition: TRANSITION,
	},
};
