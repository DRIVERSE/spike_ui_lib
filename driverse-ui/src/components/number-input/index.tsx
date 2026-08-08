/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/components/number-input/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/components/number-input/index.tsx
 * @status identical
 * @notes Byte-identical in both apps; lifted verbatim. `size` was destructured out and dropped on the
 *        floor by both copies — kept that way so antd's own sizing is not silently re-enabled, but it is
 *        now named `_size` to make the intent explicit rather than looking like an oversight.
 *        Type fix: both apps intersected their `onChange: (value: string) => void` with
 *        InputHTMLAttributes, producing an unsatisfiable intersection with the DOM ChangeEventHandler —
 *        no caller could pass a type-checking onChange. `onChange`/`value` are now omitted from the
 *        inherited attributes so the component's own signature wins.
 */

import { Input } from "antd";
import type { ChangeEvent, InputHTMLAttributes } from "react";

type Props = {
	value?: string | number;
	onChange: (value: string) => void;
	placeholder?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">;

const formatNumber = (num: string) => {
	const cleanNum = num.replace(/[^\d.]/g, "");
	const parts = cleanNum.split(".");
	if (parts.length > 2) {
		return `${parts[0]}.${parts.slice(1).join("")}`;
	}
	if (parts[0]) {
		parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

	return parts.join(".");
};

export const NumberInput = ({ value, onChange, placeholder, size: _size, ...props }: Props) => {
	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const formattedValue = formatNumber(e.target.value);
		e.target.value = formattedValue;
		onChange(formattedValue.replace(/,/g, ""));
	};

	const displayValue = value ? formatNumber(value.toString()) : "";

	return <Input {...props} value={displayValue} onChange={handleChange} placeholder={placeholder} />;
};

export default NumberInput;
