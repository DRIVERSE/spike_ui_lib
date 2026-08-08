/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/telemetry/components/tracking-gps/side-panel/track-date-filter.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/telemetry/components/tracking-gps/side-panel/track-date-filter.tsx
 * @status identical
 * @notes Byte-identical in both apps. tracking-gps-only — `gps` has no date-range control, since it always
 *        shows "today". `@iconify/react`'s `Icon` is the library's `<Iconify>`; `QUICK_RANGES` /
 *        `getQuickRange` / `QuickRangeKey` already exist in `@/utils/time`.
 */

import Iconify from "@/icons/iconify-icon";
import { QUICK_RANGES, type QuickRangeKey, getQuickRange } from "@/utils/time";
import { Button, DatePicker, TimePicker } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useState } from "react";

type Props = {
	start: Dayjs;
	end: Dayjs;
	loading?: boolean;
	onApply: (start: Dayjs, end: Dayjs) => void;
	activeQuickKey?: QuickRangeKey | null;
};

export const TrackDateFilter = ({ start, end, onApply, loading, activeQuickKey = "last3days" }: Props) => {
	const [localStart, setLocalStart] = useState<Dayjs>(start);
	const [localEnd, setLocalEnd] = useState<Dayjs>(end);
	const [activeKey, setActiveKey] = useState<QuickRangeKey | null>(activeQuickKey ?? null);

	const mergeDate = (base: Dayjs, date: Dayjs) =>
		base.set("year", date.year()).set("month", date.month()).set("date", date.date());

	const mergeTime = (base: Dayjs, time: Dayjs) =>
		base.set("hour", time.hour()).set("minute", time.minute()).set("second", time.second());

	const handleQuickSelect = (key: QuickRangeKey) => {
		const range = getQuickRange(key);
		setLocalStart(range.start);
		setLocalEnd(range.end);
		setActiveKey(key);
	};

	return (
		<div className="bg-white p-6 rounded-[20px] border border-[#ECECEC]">
			<p className="text-base font-medium mb-2 text-gray-700">Start</p>
			<div className="flex items-center gap-2 mb-4">
				<DatePicker
					className="flex-1 border border-gray-200 rounded-lg px-3 py-2"
					value={localStart}
					format="MMMM Do, YYYY"
					allowClear={false}
					disabledDate={(d) => d.isAfter(localEnd, "day")}
					suffixIcon={<Iconify icon="solar:calendar-bold-duotone" width={16} />}
					onChange={(date) => {
						if (!date) return;
						setLocalStart(mergeDate(localStart, date));
						setActiveKey(null);
					}}
				/>
				<TimePicker
					className="w-[110px] border border-gray-200 rounded-lg px-3 py-2"
					value={localStart}
					format="h:mm a"
					use12Hours
					allowClear={false}
					suffixIcon={<Iconify icon="solar:clock-circle-bold-duotone" width={16} />}
					onChange={(time) => {
						if (!time) return;
						setLocalStart(mergeTime(localStart, time));
						setActiveKey(null);
					}}
				/>
			</div>

			<p className="text-sm font-semibold mb-2 text-gray-700">End</p>
			<div className="flex items-center gap-2 mb-5">
				<DatePicker
					className="flex-1 border border-gray-200 rounded-lg px-3 py-2"
					value={localEnd}
					format="MMMM Do, YYYY"
					allowClear={false}
					disabledDate={(d) => d.isBefore(localStart, "day") || d.isAfter(dayjs(), "day")}
					suffixIcon={<Iconify icon="solar:calendar-bold-duotone" width={16} />}
					onChange={(date) => {
						if (!date) return;
						setLocalEnd(mergeDate(localEnd, date));
						setActiveKey(null);
					}}
				/>
				<TimePicker
					className="w-[110px] border border-gray-200 rounded-lg px-3 py-2"
					value={localEnd}
					format="h:mm a"
					use12Hours
					allowClear={false}
					suffixIcon={<Iconify icon="solar:clock-circle-bold-duotone" width={16} />}
					onChange={(time) => {
						if (!time) return;
						setLocalEnd(mergeTime(localEnd, time));
						setActiveKey(null);
					}}
				/>
			</div>

			<p className="text-base font-medium mb-2 text-gray-700">Quick Select</p>
			<div className="grid grid-cols-2 gap-2 mb-5">
				{QUICK_RANGES.map(({ key, label }) => (
					<button
						key={key}
						type="button"
						onClick={() => handleQuickSelect(key)}
						className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
							activeKey === key
								? "bg-[#5F8BFA] border-[#5F8BFA] text-white"
								: "border-gray-400 text-gray-700 hover:border-gray-300"
						}`}
					>
						{label}
					</button>
				))}
			</div>

			<Button
				type="primary"
				block
				size="middle"
				loading={loading}
				disabled={loading}
				onClick={() => onApply(localStart, localEnd)}
			>
				Load Tracks
			</Button>
		</div>
	);
};
