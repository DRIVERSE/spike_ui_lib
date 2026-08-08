/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/components/column-details-layout/index.tsx
 * @status adopted-A
 * @notes Autocredit-only component; Business has no equivalent. Lifted verbatim apart from biome
 *        formatting, a stable React key (the original used the array index) and hoisting the inner
 *        DetailRow out of the component body, where it was redeclared — and therefore remounted — on
 *        every render.
 */

import type { FC, ReactNode } from "react";

type DetailRowProps = {
	label: ReactNode;
	value: ReactNode;
};

type DataItem = {
	label: ReactNode;
	value: ReactNode;
};

type ColumnDetailsLayoutProps = {
	data?: DataItem[];
};

const DetailRow: FC<DetailRowProps> = ({ label, value }) => (
	<div style={{ padding: "12px 0", minHeight: 80, borderBottom: "1px solid #f0f0f0" }}>
		<div style={{ fontWeight: 500, marginBottom: "6px", color: "#666" }}>{label}</div>
		<div className="text-[black] text-[16px] font-medium">{value}</div>
	</div>
);

const ColumnDetailsLayout: FC<ColumnDetailsLayoutProps> = ({ data = [] }) => {
	const midpoint = Math.ceil(data.length / 2);
	const leftColumnData = data.slice(0, midpoint);
	const rightColumnData = data.slice(midpoint);

	return (
		<div style={{ maxWidth: "100%", margin: "0 auto", padding: "12px" }}>
			<div style={{ display: "flex", gap: "48px" }}>
				<div style={{ flex: "1" }}>
					{leftColumnData.map((item) => (
						<DetailRow key={String(item.label)} label={item.label} value={item.value} />
					))}
				</div>
				<div style={{ flex: "1" }}>
					{rightColumnData.map((item) => (
						<DetailRow key={String(item.label)} label={item.label} value={item.value} />
					))}
				</div>
			</div>
		</div>
	);
};

export default ColumnDetailsLayout;
