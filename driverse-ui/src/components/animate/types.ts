/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/components/animate/types.ts
 *   B: Driverse_FE_Business   @ b96eda3 src/components/animate/types.ts
 * @status identical
 * @notes Byte-identical in both apps; lifted verbatim.
 */

export type VariantsType = {
	durationIn?: number;
	durationOut?: number;
	easeIn?: [];
	easeOut?: [];
	distance?: number;
};

export type TranHoverType = {
	duration?: number;
	ease?: [];
};
export type TranEnterType = {
	durationIn?: number;
	easeIn?: [];
};
export type TranExitType = {
	durationOut?: number;
	easeOut?: [];
};

export type BackgroundType = {
	duration?: number;
	ease?: [];
	colors?: string[];
};
