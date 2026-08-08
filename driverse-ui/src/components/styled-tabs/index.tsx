/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/components/tab/index.tsx
 * @status decoupled
 * @notes Autocredit-only; `tab/open-tab.tsx` is deliberately not extracted (it is multi-tab shell wiring,
 *        tracked for W8). The colours came from the app-local `@/theme/colors` module the brand contract
 *        replaced, so they now read the `--brand-*` CSS variables the provider writes — which is what
 *        makes this component brand-agnostic instead of hard-coded to Autocredit's palette.
 *        `selectedAction` also becomes a controlled-optional `value`/`defaultValue` pair: the original
 *        kept selection purely internal, so a parent could never reset or restore the active tab. The
 *        selection key also moves from the option's array index to its `value`, so reordering options no
 *        longer silently moves the highlight.
 *        Directory renamed tab -> styled-tabs to match the exported name.
 */

import { brandCssVar } from "@/tokens/brand";
import { Button } from "antd";
import { type FC, useState } from "react";

type FilterOptionType = { label: string; value: string };

export type StyledTabsProps = {
	options: FilterOptionType[];
	loading?: boolean;
	onSelect?: (item: FilterOptionType) => void;
	/** Controlled active value. Falls back to internal state when omitted. */
	value?: string;
	defaultValue?: string;
};

export const StyledTabs: FC<StyledTabsProps> = ({ options, onSelect, value, defaultValue }) => {
	const [internalValue, setInternalValue] = useState(defaultValue ?? options?.[0]?.value);
	const active = value ?? internalValue;

	return (
		<div className="flex gap-1">
			{options?.map((tab) => (
				<Button
					key={tab?.value}
					style={{
						color: `var(${brandCssVar("white")})`,
						background:
							tab.value === active ? `var(${brandCssVar("driverse_primary")})` : `var(${brandCssVar("driverse_gray")})`,
						padding: "0 25px",
						borderRadius: "7px",
						border: "none",
						height: "30px",
					}}
					onClick={() => {
						if (value === undefined) setInternalValue(tab.value);
						onSelect?.(tab);
					}}
				>
					{tab?.label}
				</Button>
			))}
		</div>
	);
};

export default StyledTabs;
