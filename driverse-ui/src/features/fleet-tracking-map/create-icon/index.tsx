/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/components/fleet-tracking-map/create-icon/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/components/fleet-tracking-map/create-icon/index.tsx
 * @status identical
 * @notes Identical in both apps; lifted verbatim. Imports repointed at the library (icons, fallback,
 *        loading, movement helpers) and `TrackingRecord`/`MAP_STYLES` now come from local modules
 *        instead of the apps' `#/fleet` types and 1600-line vehicle-parks data file.
 */

import L from "leaflet";

const CAR_SVG = `<svg width="35px" height="35px" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns="http://www.w3.org/2000/svg" xmlns:cc="http://creativecommons.org/ns#" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:dc="http://purl.org/dc/elements/1.1/" viewBox="0 0 464.05 970.73" version="1.0" transform="rotate(90)">
  <defs>
    <linearGradient id="linearGradient1257"><stop stop-color="#ff0a31" offset="0"/><stop stop-color="#c60200" offset="1"/></linearGradient>
    <linearGradient id="linearGradient1253"><stop stop-color="#6b5635" offset="0"/><stop stop-color="#fff" offset="1"/></linearGradient>
    <radialGradient id="radialGradient2569" fx="208.68" fy="107.57" xlink:href="#linearGradient1253" gradientUnits="userSpaceOnUse" cy="106.33" cx="209.53" gradientTransform="matrix(.98293 0 0 1.0174 -141.49 -36.096)" r="88.778"/>
    <radialGradient id="radialGradient2572" fx="538.56" fy="113.43" xlink:href="#linearGradient1253" gradientUnits="userSpaceOnUse" cy="113.83" cx="537.79" gradientTransform="matrix(1.0195 0 0 .98091 -141.49 -36.096)" r="110.57"/>
    <linearGradient id="linearGradient2575" y2="313.28" xlink:href="#linearGradient1257" gradientUnits="userSpaceOnUse" x2="193.83" gradientTransform="matrix(.90597 0 0 1.1038 -141.49 -36.096)" y1="313.28" x1="156.18"/>
    <linearGradient id="linearGradient2578" y2="310.08" xlink:href="#linearGradient1257" gradientUnits="userSpaceOnUse" x2="681" gradientTransform="matrix(.88920 0 0 1.1246 -141.49 -36.096)" y1="310.08" x1="643.23"/>
    <radialGradient id="radialGradient2584" xlink:href="#linearGradient1257" gradientUnits="userSpaceOnUse" cy="346.26" cx="565.16" gradientTransform="matrix(.66292 0 0 1.5085 -141.49 -36.096)" r="420.99"/>
  </defs>
  <path d="m231.35 2.0918c175.61 6.1579 228.86 30.31 209.41 288.39-3.05 7.13-6.11 14.26-9.16 21.38 3.6 119.1 7.2 238.92 0 357.29 11.69 12.77 6.11 29.86 9.16 44.79 5 38.45 7.12 92.73 2.04 145.57-8.5 118.7-132.17 107.84-202.57 109.93-78.45-1.75-184.26 23.84-213.76-108.92-2.884-61.2-3.604-110.16-0.005-177.12 2.714-5.09 5.429-10.17 8.143-15.26-3.277-117.65-7.274-233.14-1.194-357.26-3.599-9.84-7.198-19.68-10.797-29.51-13.196-254.33 36.949-270.4 208.73-279.28z" fill-rule="evenodd" stroke="#000" stroke-width=".75" fill="url(#radialGradient2584)"/>
  <path d="m431.6 98.096c-37.32-74.309-122.49-83.47-203.59-85.506-86.18 3.733-154.04 5.429-197.47 96.7 11.872-34.606 0.336-104.84 198.49-108.92 179.84 3.3981 190.69 51.58 202.57 97.726z" fill-rule="evenodd" stroke="#000" stroke-width=".75" fill="#bf0000"/>
  <path d="m62.092 234.5c80.418-91.28 260.59-99.08 338.97 1.02-5.43 47.5-10.86 95-16.28 142.51-73.97-16.63-190.7-34.27-304.36 5.09-6.113-49.54-12.22-99.08-18.328-148.62z" fill-rule="evenodd" fill-opacity=".83065" stroke="#000" stroke-width="1pt"/>
  <path d="m93.648 706.82c99.082 10.52 191.03 16.96 278.91-5.09v145.56c-87.2 58.02-192.73 54.97-276.88 3.05-0.675-47.84-1.353-95.68-2.032-143.52z" fill-rule="evenodd" fill-opacity=".83065" stroke="#000" stroke-width="1pt"/>
  <path d="m440.25 292.01c23.24 10.69 27.15 35.63 19.85 41.23-8.14-0.85-20.36-12.39-28.5-14.25-0.17-2.38-0.34-4.75-0.51-7.13 3.39-6.45 5.77-13.4 9.16-19.85z" fill-rule="evenodd" fill-opacity=".75" stroke="#000" stroke-width="1pt" fill="url(#linearGradient2578)"/>
  <path d="m25.21 289.54c-23.691 9.66-28.686 34.4-21.645 40.31 8.173-0.49 20.884-11.47 29.102-12.98 0.274-2.37 0.548-4.73 0.822-7.1-3.106-6.59-5.173-13.64-8.279-20.23z" fill-rule="evenodd" fill-opacity=".75" stroke="#000" stroke-width="1pt" fill="url(#linearGradient2575)"/>
  <path d="m381.72 45.164c-24.94 6.107-20.87 19.34 3.06 39.699 19.51 14.081 31.38 16.457 32.57-5.09-1.7-12.554-30.37-33.252-35.63-34.609z" fill-opacity=".75" fill="url(#radialGradient2572)" fill-rule="evenodd"/>
  <path d="m83.154 44.172c25.346 4.076 22.356 17.594 0.157 39.816-18.311 15.608-29.957 18.932-32.878-2.447 0.679-12.65 27.588-35.593 32.721-37.369z" fill-rule="evenodd" fill-opacity=".75" stroke="#000" stroke-width="1pt" fill="url(#radialGradient2569)"/>
  <path d="m49.877 270.13c-9.161 147.26-7.125 283.32-2.036 425.49 4.072 25.11 7.126 51.24 11.197 76.34 12.385-61.92 20.189-192.55 14.251-315.55-5.259-66.17-13.572-123.68-23.412-186.28z" fill-rule="evenodd" fill-opacity=".83065" stroke="#000" stroke-width="1pt"/>
  <path d="m417.24 258.62c9.16 147.26 7.13 283.32 2.04 425.49-4.08 25.11-7.13 51.24-11.2 76.35-12.39-61.93-20.19-192.56-14.25-315.56 5.26-66.16 13.57-123.68 23.41-186.28z" fill-rule="evenodd" fill-opacity=".83065" stroke="#000" stroke-width="1pt"/>
  <path d="m354.44 918.38c5.52-10.08 49.18-28.08 57.58-21.6 6 18-25.43 36.71-38.15 41.03-10.8 0-20.15-8.64-19.43-19.43z" fill-rule="evenodd" fill-opacity=".71774" stroke="#000" stroke-width="1pt" fill="#f00"/>
  <path d="m118 920.24c-5.52-10.08-49.183-28.07-57.58-21.59-5.999 17.99 25.432 36.71 38.148 41.02 10.792 0 20.152-8.63 19.432-19.43z" fill-rule="evenodd" fill-opacity=".71774" stroke="#000" stroke-width="1pt" fill="#f00"/>
  <path d="m406.98 762.9c-4.8 112.29-68.62 181.39-169.87 172.75-86.85 2.88-169.39-50.38-178.5-159.79" stroke-opacity=".52419" stroke="#000" stroke-width="1.625" fill="none"/>
  <path d="m169.45 937.09c-0.36 5.64-2.16 10.56-4.32 15.84 47.63 2.63 99.21 3.11 148.28-2.88-3-3.84-4.92-9.12-5.76-15.84-43.91 4.56-91.41 4.8-138.2 2.88z" fill-rule="evenodd" stroke="#000" stroke-width="1pt" fill="#e1bd23"/>
</svg>`;

export const createCarIcon = (direction: number, isSelected: boolean, pulseColor: string) => {
	const adjustedRotation = direction - 90;
	const size = 50;
	const wrapSize = isSelected ? size + 40 : size;

	const carDiv = `<div style="width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;transform:rotate(${adjustedRotation}deg);transition:transform 0.5s ease-out;">${CAR_SVG}</div>`;

	const html = isSelected
		? `<div style="position:relative;width:${wrapSize}px;height:${wrapSize}px;display:flex;align-items:center;justify-content:center;">
         <div class="fleet-pulse" style="position:absolute;width:${size + 16}px;height:${size + 16}px;border-radius:50%;background:${pulseColor};"></div>
         ${carDiv}
       </div>`
		: carDiv;

	return L.divIcon({
		html,
		className: "",
		iconSize: [wrapSize, wrapSize],
		iconAnchor: [wrapSize / 2, wrapSize / 2],
		popupAnchor: [0, -(wrapSize / 2)],
	});
};
