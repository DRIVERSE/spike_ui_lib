/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/hooks/useLocationName.ts
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/hooks/useLocationName.ts
 * @status identical
 * @notes One of the two blockers the plan flagged for fleet-tracking-map. It turned out to have no app
 *        dependencies at all — just fetch, an in-module cache and Nominatim rate limiting — so it lifts
 *        verbatim and the blocker dissolves.
 *        Note it calls the public OpenStreetMap Nominatim endpoint directly, which has a 1 req/s policy
 *        the hook already respects. Apps behind a proxy should wrap it rather than reconfigure it.
 */

import { useCallback, useEffect, useRef, useState } from "react";

// Nominatim's usage policy caps public requests at 1/second per client.
// Playback ticks and slider scrubbing can otherwise fire many requests per
// second, which get rate-limited and silently show as "Unknown Location".
const MIN_REQUEST_INTERVAL_MS = 1000;

// ~11m precision — good enough to treat "same spot" as a cache hit without
// re-hitting the network for every minor GPS jitter or scrub-back.
const cacheKeyFor = (lat: number, lng: number) => `${lat.toFixed(4)},${lng.toFixed(4)}`;

const locationNameCache = new Map<string, string>();

export const useLocationName = () => {
	const [locationName, setLocationName] = useState("");
	const lastRequestAtRef = useRef(0);
	const latestRequestIdRef = useRef(0);
	const pendingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const fetchLocationName = useCallback(async (lat: number, lng: number): Promise<string> => {
		const cacheKey = cacheKeyFor(lat, lng);
		const cached = locationNameCache.get(cacheKey);
		if (cached) return cached;

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 5000);

		try {
			const response = await fetch(
				`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
				{ signal: controller.signal },
			);
			if (!response.ok) throw new Error(`Nominatim ${response.status}`);
			const data = await response.json();

			let name: string;
			if (data.address) {
				const parts = [
					data.address.road || data.address.street,
					data.address.city || data.address.town || data.address.village,
					data.address.state,
				].filter(Boolean);
				name = parts.length > 0 ? parts.join(", ") : data.display_name;
			} else {
				name = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
			}

			locationNameCache.set(cacheKey, name);
			return name;
		} catch {
			return "Unknown Location";
		} finally {
			clearTimeout(timeoutId);
		}
	}, []);

	const updateLocationName = useCallback(
		(lat: number, lng: number): Promise<string> => {
			const requestId = ++latestRequestIdRef.current;

			if (pendingTimeoutRef.current) clearTimeout(pendingTimeoutRef.current);

			const elapsed = Date.now() - lastRequestAtRef.current;
			const delay = Math.max(0, MIN_REQUEST_INTERVAL_MS - elapsed);

			return new Promise((resolve) => {
				pendingTimeoutRef.current = setTimeout(async () => {
					lastRequestAtRef.current = Date.now();
					const name = await fetchLocationName(lat, lng);
					if (requestId === latestRequestIdRef.current) {
						setLocationName(name);
					}
					resolve(name);
				}, delay);
			});
		},
		[fetchLocationName],
	);

	useEffect(() => {
		return () => {
			if (pendingTimeoutRef.current) clearTimeout(pendingTimeoutRef.current);
		};
	}, []);

	return {
		locationName,
		setLocationName,
		updateLocationName,
		fetchLocationName,
	};
};
