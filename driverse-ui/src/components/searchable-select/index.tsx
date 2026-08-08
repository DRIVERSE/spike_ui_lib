/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/components/searchable-select/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/components/searchable-select/index.tsx
 * @status identical
 * @notes Byte-identical in both apps; lifted verbatim. The wave brief expected two near-duplicate
 *        internal variants to consolidate — there is only one implementation, so nothing was merged.
 *        Two non-behavioural fixes: the props were typed `any` and are now a real interface over antd's
 *        SelectProps, and `highlightMatch` built a `/g` regex and then called `.test()` on it in a loop,
 *        where lastIndex carries between calls and makes alternating matches drop their <strong>. The
 *        split parts are compared case-insensitively against the search term instead.
 */

import { Select, type SelectProps, Tooltip } from "antd";
import { type ReactNode, useState } from "react";

export type SearchableSelectOption = {
	value: string | number;
	label?: ReactNode;
	[key: string]: unknown;
};

export type SearchableSelectProps = Omit<SelectProps, "options" | "showSearch" | "filterOption"> & {
	options: SearchableSelectOption[];
	onSearch?: (value: string) => void;
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const highlightMatch = (text: string, search: string): ReactNode => {
	if (!search) return text;

	const parts = text.split(new RegExp(`(${escapeRegExp(search)})`, "gi"));
	const needle = search.toLowerCase();

	return parts.map((part, index) =>
		part.toLowerCase() === needle ? (
			// biome-ignore lint/suspicious/noArrayIndexKey: split parts have no identity beyond position
			<strong key={index}>{part}</strong>
		) : (
			part
		),
	);
};

export const SearchableSelect = ({
	options,
	placeholder,
	disabled,
	value,
	onChange,
	onSearch,
	...props
}: SearchableSelectProps) => {
	const [searchValue, setSearchValue] = useState("");

	const handleSearch = (next: string) => {
		setSearchValue(next);
		onSearch?.(next);
	};

	const filteredOptions = options.map((option) => {
		const originalLabel = typeof option.label === "string" ? option.label : String(option.value);

		return {
			...option,
			label: (
				<Tooltip title={originalLabel.length > 25 ? originalLabel : null} placement="rightTop">
					<div className="truncate max-w-full capitalize">{highlightMatch(originalLabel, searchValue)}</div>
				</Tooltip>
			),
		};
	});

	return (
		<Select
			{...props}
			value={value}
			onChange={onChange}
			placeholder={placeholder}
			disabled={disabled}
			showSearch
			onSearch={handleSearch}
			filterOption={(input, option) =>
				String(option?.value ?? "")
					.toLowerCase()
					.includes(input.toLowerCase())
			}
			options={filteredOptions}
		/>
	);
};

export default SearchableSelect;
