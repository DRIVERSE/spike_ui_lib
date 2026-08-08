/**
 * @extracted-from
 *   B: Driverse_FE_Business   @ b96eda3 src/components/coming-soon/index.tsx
 * @status adopted-B
 * @notes Business-only component; Autocredit has no equivalent. Lifted verbatim.
 */

import { Card } from "antd";
import type { FC } from "react";

const ComingSoon: FC = () => (
	<Card className="w-full">
		<div className="flex flex-col items-center justify-center h-64 bg-white">
			<span className="text-4xl mb-4">🚧</span>
			<h2 className="text-2xl font-semibold text-gray-800 mb-2">Coming Soon</h2>
			<p className="text-gray-500">This feature is under development. Please check back later!</p>
		</div>
	</Card>
);

export default ComingSoon;
