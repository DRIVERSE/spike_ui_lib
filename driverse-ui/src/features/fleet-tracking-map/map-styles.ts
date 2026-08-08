/**
 * @extracted-from
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/data/index.ts (MAP_STYLES)
 * @status adopted-B
 * @notes Four leaflet tile layers, lifted verbatim out of a 1600-line app constants module that also
 *        holds currency lists, car-type options and compliance tables — none of which belongs in the
 *        library. Only MAP_STYLES came across.
 */

export const MAP_STYLES = {
	streets: {
		name: "Streets (Google-like)",
		url: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
		attribution: "© Google Maps",
	},
	satellite: {
		name: "Satellite",
		url: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
		attribution: "© Google Maps",
	},
	hybrid: {
		name: "Hybrid",
		url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
		attribution: "© Google Maps",
	},
	terrain: {
		name: "Terrain",
		url: "https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",
		attribution: "© Google Maps",
	},
};

export type MapStyleKey = keyof typeof MAP_STYLES;
