/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/components/fleet-tracking-map/fleet-map/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/components/fleet-tracking-map/fleet-map/index.tsx
 * @status adopted-B
 * @notes A and B differ here; B adopted (it carries the tile-layer style switcher A lacks).
 *        Imports repointed as above; `MAP_STYLES` is vendored into map-styles.ts because the apps kept it
 *        in a 1600-line constants module the library will not take.
 */

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { getMovementStatus } from "@/utils/misc";
import L from "leaflet";
import { STATUS_COLOR } from "..";
import { createCarIcon } from "../create-icon";
import { MAP_STYLES } from "../map-styles";
import type { TrackingRecord } from "../types";

type FleetMapProps = {
	vehicles: TrackingRecord[];
	selectedId: string | null;
	onSelect: (v: TrackingRecord) => void;
};

const injectPulseStyle = () => {
	if (document.getElementById("fleet-pulse-style")) return;
	const style = document.createElement("style");
	style.id = "fleet-pulse-style";
	style.textContent = `
    @keyframes fleet-pulse {
      0%, 100% { transform: scale(1); opacity: 0.5; }
      50% { transform: scale(2.4); opacity: 0; }
    }
    .fleet-pulse { animation: fleet-pulse 1.5s ease-in-out infinite; }
  `;
	document.head.appendChild(style);
};

export const FleetMap = ({ vehicles, selectedId, onSelect }: FleetMapProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const leafletRef = useRef<L.Map | null>(null);
	const markersRef = useRef<Map<string, L.Marker>>(new Map());
	const initializedRef = useRef(false);
	const onSelectRef = useRef(onSelect);
	const vehiclesRef = useRef(vehicles);
	onSelectRef.current = onSelect;
	vehiclesRef.current = vehicles;

	useEffect(() => {
		if (initializedRef.current || !containerRef.current) return;

		injectPulseStyle();

		leafletRef.current = L.map(containerRef.current, {
			zoomControl: false,
			scrollWheelZoom: true,
		}).setView([20, 0], 3);

		L.tileLayer(MAP_STYLES.streets.url, {
			attribution: MAP_STYLES.streets.attribution,
			maxZoom: 20,
		}).addTo(leafletRef.current);

		L.control.zoom({ position: "bottomright" }).addTo(leafletRef.current);

		initializedRef.current = true;

		const ro = new ResizeObserver(() => {
			leafletRef.current?.invalidateSize();
		});
		ro.observe(containerRef.current);

		return () => {
			ro.disconnect();
			initializedRef.current = false;
			leafletRef.current?.remove();
			leafletRef.current = null;
			markersRef.current.clear();
		};
	}, []);

	useEffect(() => {
		if (!leafletRef.current) return;
		const map = leafletRef.current;
		const markers = markersRef.current;
		const incomingIds = new Set(vehicles.map((v) => v.id));

		for (const [id, marker] of markers.entries()) {
			if (!incomingIds.has(id)) {
				marker.remove();
				markers.delete(id);
			}
		}

		for (const v of vehicles) {
			if (!v.latitude || !v.longitude) return;
			const color = STATUS_COLOR[getMovementStatus(v.acc_status, v.speed)];
			const isSelected = v.id === selectedId;
			const icon = createCarIcon(Number(v.direction) || 0, isSelected, color);

			if (markers.has(v.id)) {
				markers.get(v.id)?.setLatLng([v.latitude, v.longitude]).setIcon(icon);
			} else {
				const id = v.id;
				const marker = L.marker([v.latitude, v.longitude], { icon })
					.addTo(map)
					.on("click", () => {
						const vehicle = vehiclesRef.current.find((x) => x.id === id);
						if (vehicle) onSelectRef.current(vehicle);
					});
				markers.set(id, marker);
			}
		}

		if (vehicles.length > 0 && !selectedId) {
			const coords = vehicles
				.filter((v) => v.latitude && v.longitude)
				.map((v) => [v.latitude, v.longitude] as L.LatLngTuple);
			if (coords.length > 0) {
				map.fitBounds(L.latLngBounds(coords), { padding: [40, 40] });
			}
		}
	}, [vehicles, selectedId]);

	useEffect(() => {
		if (!leafletRef.current || !selectedId) return;
		const marker = markersRef.current.get(selectedId);
		if (marker) {
			leafletRef.current.panTo(marker.getLatLng(), { animate: true, duration: 0.5 });
		}
	}, [selectedId]);

	return <div ref={containerRef} className="w-full h-full" />;
};
