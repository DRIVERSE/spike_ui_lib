/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/components/info-field/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/components/info-field/index.tsx
 * @status identical
 * @notes Byte-identical in both apps; lifted verbatim (reformatted by biome, ReactNode imported as a type).
 */

import type { FC, ReactNode } from "react";

interface InfoFieldProps {
	label: string;
	value?: ReactNode;
	className?: string;
	labelClassName?: string;
	valueClassName?: string;
}

const InfoField: FC<InfoFieldProps> = ({ label, value, className = "", labelClassName = "", valueClassName = "" }) => {
	return (
		<div className={className}>
			<p className={`text-base font-medium text-gray-600 ${labelClassName}`}>{label}</p>
			<p className={`font-medium text-lg ${valueClassName}`}>{value || null}</p>
		</div>
	);
};

export default InfoField;
