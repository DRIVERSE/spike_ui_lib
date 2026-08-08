/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/components/animate/variants/action.ts
 *   B: Driverse_FE_Business   @ b96eda3 src/components/animate/variants/action.ts
 * @status identical
 * @notes Byte-identical in both apps; lifted verbatim.
 */

/**
 * https://www.framer.com/motion/gestures/
 * @param hover
 * @param tap
 */
export const varHover = (hover = 1.09, tap = 0.97) => ({
	hover: { scale: hover },
	tap: { scale: tap },
});
