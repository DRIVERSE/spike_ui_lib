/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/components/loading/circle-loading.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/components/loading/circle-loading.tsx
 * @status adopted-B
 * @notes The files differ by one character: the default `size` is "default" in A and "large" in B.
 *        B adopted — it is the newer of the two and the size most call sites pass explicitly anyway.
 */

import { Spin } from "antd";

type Props = {
	size?: "small" | "default" | "large";
};

export function CircleLoading({ size = "large" }: Props) {
	return (
		<div className="flex h-full items-center justify-center">
			<Spin size={size} />
		</div>
	);
}
