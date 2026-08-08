/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/telemetry/components/gps/live-map/PlaybackControls.tsx
 *                                     and .../components/tracking-gps/live-map/PlaybackControls.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/telemetry/components/gps/live-map/PlaybackControls.tsx
 *                                     and .../components/tracking-gps/live-map/PlaybackControls.tsx
 * @status merged
 * @notes The plan flagged "does PlaybackControls diverge between QA and BD" as an open question. It
 *        doesn't: `tracking-gps/live-map/PlaybackControls.tsx` is functionally identical between the two
 *        apps (the 93-vs-174 line gap is prettier formatting plus one commented-out block BD left in), and
 *        likewise for `gps/live-map/PlaybackControls.tsx`. The real divergence is *within* each app,
 *        between the gps and tracking-gps copies:
 *          - `gps/live-map/PlaybackControls.tsx` has an `onExit` prop with an Exit button, skip-to-start /
 *            skip-to-end buttons, a live "current time / total time" readout in the header, and a plain
 *            black slider (`track: #000`).
 *          - `tracking-gps/live-map/PlaybackControls.tsx` has a Minimize button instead of Exit, "Start
 *            time" / "End time" labels under the slider instead of a header readout, and a branded
 *            `#5F8BFA` slider with a styled handle.
 *        Neither ever imports the other, and `gps/live-map/PlaybackControls.tsx` is dead code in both
 *        apps — nothing under `gps/` imports it; only `tracking-gps/live-map/index.tsx` renders one.
 *        This module ships ONE `PlaybackControls`: the tracking-gps variant (the one actually wired up) is
 *        the base, and the gps variant's extra controls — `onExit`, `onSkipToStart`/`onSkipToEnd`, and the
 *        header current/total timestamp readout — are restored as optional props, rendered only when
 *        supplied. With none of them passed, rendering is byte-equivalent to the tracking-gps original.
 */

import Iconify from "@/icons/iconify-icon";
import { formatTimestamp } from "@/utils/time";
import { Button, Slider } from "antd";
import type { TrailPoint } from "../types";

export type PlaybackControlsProps = {
	trail: TrailPoint[];
	playbackIndex: number;
	isPlaying: boolean;
	playbackSpeed: number;
	isMinimized: boolean;
	onTogglePlay: () => void;
	onSeek: (index: number) => void;
	onCycleSpeed: () => void;
	onToggleMinimize: () => void;
	/** Exits playback mode entirely. Was the gps variant's Exit button; omitted, no Exit button renders. */
	onExit?: () => void;
	/** Jumps to the first trail point. Was the gps variant's skip-to-start button. */
	onSkipToStart?: () => void;
	/** Jumps to the last trail point. Was the gps variant's skip-to-end button. */
	onSkipToEnd?: () => void;
};

export const PlaybackControls = ({
	trail,
	playbackIndex,
	isPlaying,
	playbackSpeed,
	isMinimized,
	onTogglePlay,
	onSeek,
	onCycleSpeed,
	onToggleMinimize,
	onExit,
	onSkipToStart,
	onSkipToEnd,
}: PlaybackControlsProps) => {
	const atEnd = playbackIndex >= trail.length - 1;
	const showExtendedControls = !!onExit;

	if (isMinimized) {
		return (
			<div className="flex items-center gap-3 p-3">
				<Iconify icon="mdi:history" width={20} height={20} className="text-gray-600" />
				<span className="font-medium text-sm">Playback</span>
				<Button
					type="primary"
					size="small"
					onClick={onTogglePlay}
					disabled={atEnd}
					icon={<Iconify icon={isPlaying ? "mdi:pause" : "solar:play-bold"} width={14} height={14} />}
					className="bg-black hover:bg-gray-800"
				/>
				<div
					onClick={onCycleSpeed}
					className="border border-gray-300 flex items-center gap-1 px-2 py-1 rounded cursor-pointer hover:bg-gray-100 text-xs"
				>
					<Iconify icon="mdi:speedometer" width={16} height={16} /> {playbackSpeed}x
				</div>
				<button type="button" onClick={onToggleMinimize} className="ml-2 hover:bg-gray-100 p-1 rounded">
					<Iconify icon="mdi:chevron-up" width={20} height={20} className="text-gray-600" />
				</button>
			</div>
		);
	}

	return (
		<div className="p-4">
			<div className="flex items-center gap-3 mb-3">
				<Iconify icon="mdi:history" width={24} height={24} className="text-gray-600" />
				<span className="font-semibold text-gray-900">Playback Controls</span>
				<span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">PLAYBACK MODE</span>
				{showExtendedControls && (
					<div className="ml-auto text-sm font-medium text-gray-700">
						{formatTimestamp(trail[playbackIndex]?.time)} / {formatTimestamp(trail[trail.length - 1]?.time)}
					</div>
				)}
				<button
					type="button"
					onClick={onToggleMinimize}
					className={showExtendedControls ? "hover:bg-gray-100 p-1 rounded" : "ml-auto hover:bg-gray-100 p-1 rounded"}
				>
					<Iconify icon="mdi:chevron-down" width={24} height={24} className="text-gray-600" />
				</button>
			</div>

			<div className="mb-4">
				<Slider
					min={0}
					max={trail.length - 1}
					value={playbackIndex}
					onChange={onSeek}
					tooltip={{ formatter: (v) => (trail[v ?? 0]?.time ? formatTimestamp(trail[v ?? 0].time) : "") }}
					styles={{
						track: { backgroundColor: "#5F8BFA", height: 6 },
						rail: { backgroundColor: "#e5e7eb", height: 6 },
						handle: { borderColor: "#5F8BFA" },
					}}
				/>
				<div className="flex justify-between text-xs text-gray-600 mt-2">
					<div className="flex flex-col items-start">
						<span className="text-[10px] uppercase tracking-wide mb-0.5">Start time</span>
						<span>{formatTimestamp(trail[0]?.time)}</span>
					</div>
					<div className="flex flex-col items-end">
						<span className="text-[10px] uppercase tracking-wide mb-0.5">End time</span>
						<span>{formatTimestamp(trail[trail.length - 1]?.time)}</span>
					</div>
				</div>
			</div>

			<div className="flex items-center gap-2">
				{onExit && (
					<Button onClick={onExit} className="border border-gray-300">
						Exit
					</Button>
				)}
				<Button onClick={onToggleMinimize} size="large" className="border  border-gray-300">
					Minimize
				</Button>
				{onSkipToStart && (
					<Button
						onClick={onSkipToStart}
						disabled={playbackIndex === 0}
						className="border border-gray-300"
						icon={<Iconify icon="solar:rewind-back-bold" width={18} height={18} />}
					/>
				)}
				<Button
					type="primary"
					onClick={onTogglePlay}
					disabled={atEnd}
					size="large"
					icon={<Iconify icon={isPlaying ? "mdi:pause" : "solar:play-bold"} width={18} height={18} />}
					className="bg-black hover:bg-gray-800 px-6"
				/>
				{onSkipToEnd && (
					<Button
						onClick={onSkipToEnd}
						disabled={atEnd}
						className="border border-gray-300"
						icon={<Iconify icon="solar:rewind-forward-bold" width={18} height={18} />}
					/>
				)}
				<Button onClick={onCycleSpeed} className="border h-20 border-gray-300 ml-auto" size="large">
					<Iconify icon="icon-park-outline:speed-one" width={18} height={18} /> {playbackSpeed}x
				</Button>
			</div>
		</div>
	);
};
