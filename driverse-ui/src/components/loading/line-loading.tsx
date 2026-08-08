/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/components/loading/line-loading.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/components/loading/line-loading.tsx
 * @status identical
 * @notes Byte-identical in both apps; lifted verbatim. Only the themeVars/rgbAlpha import paths changed.
 */

import { rgbAlpha } from "@/tokens/css-var-utils";
import { themeVars } from "@/tokens/theme.css";
import { Progress } from "antd";
import { useEffect, useState } from "react";

export function LineLoading() {
	const [percent, setPercent] = useState(10);
	const [increasing, setIncreasing] = useState(true);

	useEffect(() => {
		const interval = setInterval(() => {
			if (increasing) {
				setPercent((prevPercent) => prevPercent + 20);
				if (percent === 100) {
					setIncreasing(false);
				}
			} else {
				setPercent(0);
				setIncreasing(true);
			}
		}, 50);

		return () => {
			clearInterval(interval);
		};
	}, [percent, increasing]);

	return (
		<div className="m-auto flex h-full w-96 items-center justify-center">
			<Progress
				percent={percent}
				trailColor={rgbAlpha(themeVars.colors.palette.primary.default, 0.8)}
				strokeColor={themeVars.colors.palette.primary.default}
				showInfo={false}
				size="small"
			/>
		</div>
	);
}
