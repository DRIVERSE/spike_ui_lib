/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/telemetry/components/gps/date-picker/index.tsx
 *                                     and .../components/tracking-gps/date-picker/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/telemetry/components/gps/date-picker/index.tsx
 *                                     and .../components/tracking-gps/date-picker/index.tsx
 * @status identical
 * @notes Byte-identical across all four copies (gps and tracking-gps each had their own, in both apps),
 *        so it dedupes to one file here. Neither view actually renders it — `gps/index.tsx` and
 *        `tracking-gps/index.tsx` never import a `DateFilterBar` in either app, and `Telemetry`'s own date
 *        handling flows through `useGpsDateFilter` and `TrackDateFilter` instead. Ported anyway per the
 *        established file list, since a consumer wiring a header date control has the exact original
 *        component available.
 *        `@/theme/colors`'s `colors.driverse_primary` (`#5F8BFA`) is `var(--brand-primary)`, the same
 *        substitution `fleet-tracking-map`'s `STATUS_COLOR` made for the identical hex.
 */

import Iconify from "@/icons/iconify-icon";
import { DatePicker } from "antd";
import type { Dayjs } from "dayjs";

type Props = {
	selectedDate: Dayjs;
	datePickerLabel: string;
	formattedLabel: string;
	isToday?: boolean;
	onChange: (date: Dayjs) => void;
};

export const DateFilterBar = ({ selectedDate, datePickerLabel, formattedLabel, onChange }: Props) => (
	<div className="flex items-center justify-between">
		<div>
			<p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Daily Report</p>
			<h2 className="text-lg font-bold text-gray-900 leading-tight mt-0.5">Trip Summary</h2>
			<p className="text-xs text-gray-400 mt-0.5">Vehicle activity and device status · {formattedLabel}</p>
		</div>

		<DatePicker
			value={selectedDate}
			onChange={(date) => date && onChange(date)}
			disabledDate={(d) => d.isAfter(new Date())}
			allowClear={false}
			suffixIcon={
				<Iconify icon="solar:calendar-bold-duotone" width={16} height={16} style={{ color: "var(--brand-primary)" }} />
			}
			format={() => datePickerLabel}
			className="border border-gray-200 rounded-lg px-3 py-1 text-sm font-medium text-gray-600 hover:border-blue-300 transition-colors"
		/>
	</div>
);
