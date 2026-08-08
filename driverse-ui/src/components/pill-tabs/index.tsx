/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/components/pill-tabs/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/components/pill-tabs/index.tsx
 * @status adopted-A
 * @notes A adopted: B dropped the `disabled` handling (cursor, opacity and the disabled attribute) that
 *        A still honours, and dropped the `fullWidth` prop. Buttons get an explicit type="button" —
 *        inside a form both apps' versions would submit — and aria-selected/role for the tab semantics
 *        the original markup lacked.
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
	fullWidth?: boolean;
	activeColor?: string;
	backgroundColor?: string;
	textColor?: string;
	activeTextColor?: string;
	action?: ReactNode;
};

const PillTabs: FC<Props> = ({
	items,
	activeTab,
	action,
	onTabChange,
	fullWidth = true,
	className = "",
	activeColor = "#5f8bfa",
	backgroundColor = "#e5e7eb",
	textColor = "#374151",
	activeTextColor = "#ffffff",
}) => {
	return (
		<div className="w-full overflow-x-auto">
			<div className="flex items-center justify-between w-full">
				{action && <div className="mb-4">{action}</div>}
				<div
					role="tablist"
					className={`flex gap-2 mb-3 py-1 px-1 rounded-lg  ${className}`}
					style={{
						backgroundColor,
						width: "100%",
						maxWidth: fullWidth ? "100%" : "fit-content",
					}}
				>
					{items.map((tab) => (
						<button
							type="button"
							role="tab"
							aria-selected={activeTab === tab.key}
							key={tab.key}
							onClick={() => onTabChange(tab.key)}
							style={{
								padding: "8px 16px",
								width: "fit-content",
								border: activeTab === tab.key ? `1px solid ${activeColor}` : "1px solid transparent",
								backgroundColor: activeTab === tab.key ? activeColor : "transparent",
								color: activeTab === tab.key ? activeTextColor : textColor,
								cursor: tab.disabled ? "not-allowed" : "pointer",
								opacity: tab.disabled ? 0.4 : 1,
								transition: "all 0.2s ease",
								borderRadius: 5,
								flex: 1,
								fontSize: "14px",
								fontWeight: "500",
								whiteSpace: "nowrap",
							}}
							disabled={tab.disabled}
						>
							{tab.label}
						</button>
					))}
				</div>
			</div>

			<div>{items.find((tab) => tab.key === activeTab)?.children}</div>
		</div>
	);
};

export default PillTabs;
