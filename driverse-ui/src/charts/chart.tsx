/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/components/chart/chart.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/components/chart/chart.tsx
 * @status identical
 * @notes Byte-identical in both apps; lifted verbatim. apexcharts/react-apexcharts are optional peers
 *        behind the "./charts" subpath, so apps that never render a chart do not pay for them.
 */

import { memo } from "react";
import ApexChart, { type Props as ApexChartProps } from "react-apexcharts";
import { chartWrapper } from "./styles.css";

function Chart(props: ApexChartProps) {
	return (
		<div className={chartWrapper}>
			<ApexChart {...props} />
		</div>
	);
}

export default memo(Chart);
