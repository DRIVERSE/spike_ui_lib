/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/components/table-tab/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/components/table-tab/index.tsx
 * @status adopted-B
 * @notes B adopted for its `w-full` content wrapper and `whitespace-nowrap` tab labels, which fix the
 *        tab strip wrapping that A still has. Same button hardening as pill-tabs: explicit type="button"
 *        plus role/aria-selected.
 */

import type { FC, ReactNode } from "react";

export interface TabItem {
	key: string;
	label: string;
	children: ReactNode;
	disabled?: boolean;
}

type Props = {
	items: TabItem[];
	activeTab: string;
	onTabChange: (key: string) => void;
	className?: string;
	activeColor?: string;
	backgroundColor?: string;
	textColor?: string;
	activeTextColor?: string;
	action?: ReactNode;
};

const TableTabs: FC<Props> = ({
	items,
	activeTab,
	action,
	onTabChange,
	className = "",
	activeColor = "#5f8bfa",
	backgroundColor = "#fff",
	textColor = "#111",
	activeTextColor = "#ffffff",
}) => {
	return (
		<div className="w-full">
			<div className="flex items-center justify-between w-full mb-6">
				{action && <div className="w-full">{action}</div>}
				<div role="tablist" className={`flex gap-2 ${className}`}>
					{items.map((tab) => (
						<button
							type="button"
							role="tab"
							aria-selected={activeTab === tab.key}
							key={tab.key}
							onClick={() => onTabChange(tab.key)}
							className={`px-4 py-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 border ${
								activeTab === tab.key ? "border-blue-500 shadow-sm" : "border-gray-300"
							}`}
							style={{
								backgroundColor: activeTab === tab.key ? activeColor : backgroundColor,
								color: activeTab === tab.key ? activeTextColor : textColor,
							}}
							disabled={tab.disabled}
						>
							{tab.label}
						</button>
					))}
				</div>
			</div>

			<div className="w-full">{items.find((tab) => tab.key === activeTab)?.children}</div>
		</div>
	);
};

export default TableTabs;
