/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/telemetry/components/gps/live-map/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/telemetry/components/gps/live-map/index.tsx
 * @status decoupled
 * @notes A and B differ only in the hook import paths (`vehicle-park` vs `vehicle-parks`); B adopted.
 *        This is the "today"/live view's map, genuinely different from `tracking-gps/live-map` — no
 *        `PlaybackControls` panel, no auto-enter-playback effect, no trail polyline, no `onLocationChange`
 *        callback. It still calls `usePlayback` (kept, unused in practice: `GPS` never passes
 *        `trailHistory`, so `trail` is always empty and playback mode is never entered) — verbatim from
 *        source rather than trimmed, since removing it would be a behaviour change beyond decoupling.
 *        Decouplings: `usePlayback`/`useLeafletMap` came from the apps' `vehicles/hooks/`, now
 *        `../../shared/use-playback` / `../../shared/use-leaflet-map`. `useLocationName` came from the same
 *        app hooks dir; the library's `@/hooks/use-location-name` is byte-identical to it, but this module
 *        goes through `../../shared/use-telemetry-location-name` instead so a host app's
 *        `TelemetryDataSource.resolveLocationName` (if supplied) is honoured. `@iconify/react`'s `Icon` is
 *        the library's `<Iconify>`.
 */

import Iconify from "@/icons/iconify-icon";
import { Tooltip } from "antd";
import { useEffect, useMemo, useState } from "react";
import "leaflet/dist/leaflet.css";
import Fallback from "@/components/fallback";
import { calculateBearing } from "@/utils";
import L from "leaflet";
import { createRotatedCarIcon } from "../../shared/car-icon";
import { MapStatusBar } from "../../shared/map-status-bar";
import { useLeafletMap } from "../../shared/use-leaflet-map";
import { usePlayback } from "../../shared/use-playback";
import { useTelemetryLocationName } from "../../shared/use-telemetry-location-name";
import type { TrailHistoryPoint, TrailPoint, VehicleTrackingData } from "../../types";

type Props = {
	data?: VehicleTrackingData;
	trailHistory?: TrailHistoryPoint[];
	onAddressChange?: (address: string) => void;
};

const DEFAULT_RECENTER_ZOOM = 15;

export const LiveMap = ({ data, trailHistory, onAddressChange }: Props) => {
	const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
	const [rotation, setRotation] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const [hasInitialLocation, setHasInitialLocation] = useState(false);

	const { locationName, updateLocationName } = useTelemetryLocationName();

	const trail = useMemo<TrailPoint[]>(() => {
		if (!trailHistory?.length) return [];
		return trailHistory
			.filter((i) => i.latitude && i.longitude)
			.map((i) => ({
				lat: i.latitude,
				lng: i.longitude,
				time: i.gps_time,
				direction: i.direction,
				speed: i.speed,
				acc_status: i.acc_status,
			}))
			.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
	}, [trailHistory]);

	const handleLocationChange = (lat: number, lng: number) => setLocation({ lat, lng });

	const playback = usePlayback({
		trail,
		onLocationChange: handleLocationChange,
		onRotationChange: setRotation,
		onLocationNameUpdate: (lat, lng) => {
			updateLocationName(lat, lng).then((name) => {
				onAddressChange?.(name);
			});
		},
	});

	const { mapRef, leafletMapRef, markerRef, zoom } = useLeafletMap(hasInitialLocation ? location : null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: matches source apps' dependency list
	useEffect(() => {
		if (playback.isPlaybackMode) return;
		if (!data?.latitude || !data?.longitude) {
			setLocation(null);
			setError("No GPS data available for this vehicle.");
			return;
		}
		const { latitude: lat, longitude: lng } = data;
		if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
			setError("Invalid GPS coordinates.");
			setLocation(null);
			return;
		}
		if (data.direction != null) {
			setRotation(Number(data.direction));
		} else if (trail.length > 0) {
			const last = trail[trail.length - 1];
			setRotation(calculateBearing(last.lat, last.lng, lat, lng));
		}
		setLocation({ lat, lng });
		setError(null);
		updateLocationName(lat, lng).then((name) => {
			onAddressChange?.(name);
		});
	}, [data, trail, playback.isPlaybackMode]);

	useEffect(() => {
		if (location && !hasInitialLocation) setHasInitialLocation(true);
	}, [location, hasInitialLocation]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: matches source apps' dependency list
	useEffect(() => {
		if (!leafletMapRef.current || !location) return;
		if (!markerRef.current) {
			markerRef.current = L.marker([location.lat, location.lng], { icon: createRotatedCarIcon(rotation) })
				.addTo(leafletMapRef.current)
				.bindPopup("Vehicle Location");
			leafletMapRef.current.setView([location.lat, location.lng], zoom);
		} else {
			const latlng = L.latLng(location.lat, location.lng);
			markerRef.current.setLatLng(latlng).setIcon(createRotatedCarIcon(rotation));
			leafletMapRef.current.panTo(latlng, { animate: true, duration: 1 });
		}
	}, [location, rotation, hasInitialLocation]);

	const statusData =
		playback.isPlaybackMode && playback.currentPoint
			? {
					gpsTime: playback.currentPoint.time,
					speed: playback.currentPoint.speed,
					accStatus: playback.currentPoint.acc_status,
				}
			: {
					gpsTime: data?.gps_time,
					speed: data?.speed,
					accStatus: data?.acc_status,
				};

	const showStatusBar = false;

	const handleRecenterMap = () => {
		if (!leafletMapRef.current || !location) return;
		leafletMapRef.current.setView([location.lat, location.lng], DEFAULT_RECENTER_ZOOM, { animate: true });
	};

	const handleZoomIn = () => leafletMapRef.current?.zoomIn();
	const handleZoomOut = () => leafletMapRef.current?.zoomOut();

	return (
		<div className="relative w-full h-full min-h-0 overflow-hidden bg-[#fff]">
			{!location ? (
				<div className="absolute inset-0 flex items-center justify-center">
					<Fallback
						height={580}
						icon={
							<div className="h-20 w-20 rounded-3xl bg-slate-100 flex items-center justify-center">
								<Iconify icon="streamline-ultimate:trip-road" width={50} />
							</div>
						}
						title="No Vehicle Activity Found"
						description={
							<div className="text-center">
								<p className="text-base text-gray-500 max-w-lg">
									Trips and GPS updates will appear here once activity is recorded. Check that the tracker is online and
									has GPS coverage.
								</p>
							</div>
						}
					/>
				</div>
			) : (
				<div className="relative h-full">
					{data && location && !error && showStatusBar && (
						<MapStatusBar
							locationName={locationName}
							gpsTime={statusData.gpsTime}
							speed={statusData.speed}
							accStatus={statusData.accStatus}
							currentMileage={!playback.isPlaybackMode ? data?.current_mileage : undefined}
							trackerOil={!playback.isPlaybackMode ? data?.tracker_oil : undefined}
							onlineStatus={!playback.isPlaybackMode ? data?.status : undefined}
							isPlaybackMode={playback.isPlaybackMode}
						/>
					)}

					<div ref={mapRef} className="w-full h-full" />

					<div className="absolute left-3 top-3 z-[500] flex flex-col gap-2">
						<div className="overflow-hidden bg-[#FFF] rounded-md border border-gray-300 bg-white shadow-sm">
							<button
								type="button"
								onClick={handleZoomIn}
								className="flex h-10 w-10 items-center justify-center text-2xl font-semibold leading-none text-black transition hover:bg-gray-50"
								title="Zoom in"
								aria-label="Zoom in"
							>
								<Iconify icon="stash:plus-solid" width={20} className="text-black" />
							</button>
							<div className="h-px w-full bg-gray-200" />
							<button
								type="button"
								onClick={handleZoomOut}
								className="flex h-10 w-10 items-center justify-center text-2xl font-semibold leading-none text-black transition hover:bg-gray-50"
								title="Zoom out"
								aria-label="Zoom out"
							>
								<Iconify icon="ic:sharp-minus" width={20} className="text-black" />
							</button>
						</div>

						<Tooltip
							placement="right"
							mouseEnterDelay={0.1}
							title={<div className="text-xs font-medium tracking-wide">Center Map On Vehicle</div>}
							color="#0f172a"
						>
							<button
								type="button"
								onClick={handleRecenterMap}
								className="flex h-10 w-10 bg-[#FFF] items-center justify-center rounded-md border border-gray-300 bg-white shadow-sm transition hover:bg-gray-50"
								aria-label="Center map on vehicle"
							>
								<Iconify icon="mdi:crosshairs-gps" width={22} className="text-black" />
							</button>
						</Tooltip>
					</div>
				</div>
			)}
		</div>
	);
};
