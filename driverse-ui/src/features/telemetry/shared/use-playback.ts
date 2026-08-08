/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/hooks/usePlayback.ts
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/hooks/usePlayback.ts
 * @status identical
 * @notes Byte-identical in both apps and lives outside the telemetry dir proper (`vehicles/hooks/`), so it
 *        is vendored in here rather than left as a cross-feature import. Pure state machine — trail in,
 *        location/rotation/location-name callbacks out — with no app dependencies beyond `calculateBearing`,
 *        which the library already exports from `@/utils`. Used by both `gps/live-map` and
 *        `tracking-gps/live-map`, which is exactly why it belongs here rather than in either view.
 */

import { calculateBearing } from "@/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import type { TrailPoint } from "../types";

type UsePlaybackProps = {
	trail: TrailPoint[];
	onLocationChange: (lat: number, lng: number) => void;
	onRotationChange: (rotation: number) => void;
	onLocationNameUpdate: (lat: number, lng: number) => void;
};

export const usePlayback = ({ trail, onLocationChange, onRotationChange, onLocationNameUpdate }: UsePlaybackProps) => {
	const [isPlaybackMode, setIsPlaybackMode] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);
	const [playbackIndex, setPlaybackIndex] = useState(0);
	const [playbackSpeed, setPlaybackSpeed] = useState(1);
	const [isMinimized, setIsMinimized] = useState(false);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const applyTrailPoint = useCallback(
		(point: TrailPoint, index: number) => {
			onLocationChange(point.lat, point.lng);
			onLocationNameUpdate(point.lat, point.lng);

			if (point.direction) {
				onRotationChange(Number(point.direction));
			} else if (index > 0 && trail[index - 1]) {
				onRotationChange(calculateBearing(trail[index - 1].lat, trail[index - 1].lng, point.lat, point.lng));
			} else if (index < trail.length - 1 && trail[index + 1]) {
				onRotationChange(calculateBearing(point.lat, point.lng, trail[index + 1].lat, trail[index + 1].lng));
			}
		},
		[trail, onLocationChange, onRotationChange, onLocationNameUpdate],
	);

	const enterPlayback = useCallback(() => {
		if (trail.length === 0) return;
		setIsPlaybackMode(true);
		setIsPlaying(false);
		setPlaybackIndex(0);
		applyTrailPoint(trail[0], 0);
	}, [trail, applyTrailPoint]);

	const exitPlayback = useCallback(
		(restoreLocation?: { lat: number; lng: number; direction?: number }) => {
			setIsPlaybackMode(false);
			setIsPlaying(false);
			setPlaybackIndex(0);
			if (restoreLocation) {
				onLocationChange(restoreLocation.lat, restoreLocation.lng);
				onRotationChange(restoreLocation.direction ?? 0);
				onLocationNameUpdate(restoreLocation.lat, restoreLocation.lng);
			}
		},
		[onLocationChange, onRotationChange, onLocationNameUpdate],
	);

	const togglePlayback = useCallback(() => setIsPlaying((p) => !p), []);

	const cycleSpeed = useCallback(() => {
		const speeds = [1, 4, 8, 12];
		setPlaybackSpeed((prev) => {
			const next = speeds[(speeds.indexOf(prev) + 1) % speeds.length];
			return next;
		});
	}, []);

	const seekTo = useCallback(
		(index: number) => {
			setPlaybackIndex(index);
			const point = trail[index];
			if (point) applyTrailPoint(point, index);
		},
		[trail, applyTrailPoint],
	);

	useEffect(() => {
		if (!isPlaying || !isPlaybackMode || trail.length === 0) return;

		intervalRef.current = setInterval(() => {
			setPlaybackIndex((prev) => {
				if (prev >= trail.length - 1) {
					setIsPlaying(false);
					return prev;
				}
				const next = prev + 1;
				applyTrailPoint(trail[next], next);
				return next;
			});
		}, 1000 / playbackSpeed);

		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current);
		};
	}, [isPlaying, isPlaybackMode, playbackSpeed, trail, applyTrailPoint]);

	return {
		isPlaybackMode,
		isPlaying,
		playbackIndex,
		playbackSpeed,
		isMinimized,
		setIsMinimized,
		enterPlayback,
		exitPlayback,
		togglePlayback,
		cycleSpeed,
		seekTo,
		currentPoint: trail[playbackIndex] ?? null,
	};
};
