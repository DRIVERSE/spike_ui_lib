/** @lib-native */

import { useLocationName } from "@/hooks/use-location-name";
import { useCallback } from "react";
import { useTelemetryDataSource } from "../providers/telemetry-provider";

/**
 * Thin wrapper around the library's `useLocationName` that honours `TelemetryDataSource.resolveLocationName`
 * when a host app supplies one (e.g. to proxy Nominatim, or use an internal geocoder), and otherwise falls
 * back to the library's own reverse-geocoding exactly as `gps/live-map` and `tracking-gps/live-map` used it
 * before this seam existed.
 */
export function useTelemetryLocationName() {
	const { resolveLocationName } = useTelemetryDataSource();
	const { locationName, setLocationName, updateLocationName: updateViaLibrary } = useLocationName();

	const updateLocationName = useCallback(
		(lat: number, lng: number): Promise<string> => {
			if (!resolveLocationName) return updateViaLibrary(lat, lng);

			return resolveLocationName(lat, lng).then((name) => {
				setLocationName(name);
				return name;
			});
		},
		[resolveLocationName, updateViaLibrary, setLocationName],
	);

	return { locationName, updateLocationName };
}
