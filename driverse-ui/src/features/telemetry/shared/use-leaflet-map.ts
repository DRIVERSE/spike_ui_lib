/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/hooks/useLeafletMap.ts
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/hooks/useLeafletMap.ts
 * @status adopted-B
 * @notes Lives outside the telemetry dir proper (`vehicles/hooks/`) and is used by both `gps/live-map` and
 *        `tracking-gps/live-map`, so it is vendored here rather than left as a cross-feature import.
 *        A and B diverge and B is adopted: A read/wrote zoom through a zustand `@/store/mapStore` and
 *        imported `MAP_STYLES` from a relative `../data`; B holds zoom in local `useState` (`DEFAULT_ZOOM`
 *        = 15) with no store dependency. B is already store-free, which is exactly what a library needs.
 *        `MAP_STYLES` is not re-vendored — it already exists at `@/features/fleet-tracking-map/map-styles`
 *        (lifted there in an earlier wave), so this imports it from there instead of making a second copy.
 */

import { MAP_STYLES } from "@/features/fleet-tracking-map/map-styles";
import L from "leaflet";
import type { RefObject } from "react";
import { useEffect, useRef, useState } from "react";

const DEFAULT_ZOOM = 15;

/**
 * Annotated rather than inferred: leaflet's `L.Polyline` is generic over a geojson type, so the inferred
 * return referenced `@types/geojson` by its node_modules path. `vite-plugin-dts` rejected that as
 * non-portable (TS2742) and emitted no declaration file at all for this module, which broke
 * `features/telemetry`'s whole type surface. Naming the type keeps the declaration self-contained.
 */
export type LeafletMapHandles = {
	mapRef: RefObject<HTMLDivElement | null>;
	leafletMapRef: RefObject<L.Map | null>;
	markerRef: RefObject<L.Marker | null>;
	polylineRef: RefObject<L.Polyline | null>;
	zoom: number;
};

export const useLeafletMap = (initialLocation: { lat: number; lng: number } | null): LeafletMapHandles => {
	const mapRef = useRef<HTMLDivElement>(null);
	const leafletMapRef = useRef<L.Map | null>(null);
	const markerRef = useRef<L.Marker | null>(null);
	const polylineRef = useRef<L.Polyline | null>(null);
	const mapInitializedRef = useRef(false);
	const [zoom, setZoom] = useState(DEFAULT_ZOOM);

	// biome-ignore lint/correctness/useExhaustiveDependencies: only re-runs when initialLocation flips between null/non-null, matching the source apps.
	useEffect(() => {
		if (mapInitializedRef.current || !mapRef.current || !initialLocation) return;

		leafletMapRef.current = L.map(mapRef.current, {
			scrollWheelZoom: true,
			dragging: true,
			touchZoom: true,
			doubleClickZoom: true,
			boxZoom: true,
			keyboard: true,
			zoomControl: false,
		}).setView([initialLocation.lat, initialLocation.lng], zoom);

		leafletMapRef.current.on("zoomend", () => {
			if (leafletMapRef.current) setZoom(leafletMapRef.current.getZoom());
		});

		L.tileLayer(MAP_STYLES.streets.url, {
			attribution: MAP_STYLES.streets.attribution,
			maxZoom: 20,
		}).addTo(leafletMapRef.current);

		polylineRef.current = L.polyline([], {
			color: "blue",
			weight: 4,
			opacity: 0.7,
			smoothFactor: 1,
		}).addTo(leafletMapRef.current);

		mapInitializedRef.current = true;

		return () => {
			mapInitializedRef.current = false;
			leafletMapRef.current?.remove();
			leafletMapRef.current = null;
			markerRef.current = null;
			polylineRef.current = null;
		};
	}, [!!initialLocation]);

	return { mapRef, leafletMapRef, markerRef, polylineRef, zoom };
};
