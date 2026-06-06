import type { GeoJSONSource, Map as MapLibreMap } from "maplibre-gl";

import { HK_BOUNDS } from "~/config/hk";
import { STATIONS } from "~/data/stations";
import { SERVICE_COLORS } from "~/domain/mapping";
import type { EmergencyFootprint } from "~/lib/overpass";

const OUR_LAYER_PREFIXES = ["emergency-", "station-", "incidents", "dispatch-line-"];

const isOurLayer = (id: string) =>
	OUR_LAYER_PREFIXES.some((prefix) => id.startsWith(prefix) || id === prefix);

/** base-map labels to keep on the dark HK view */
const ALLOWED_LABEL_LAYERS = new Set([
	"Place labels",
	"Town labels",
	"City labels",
	"Public",
	"Sport",
	"Education",
	"Tourism",
	"Culture",
	"Shopping",
	"Food",
	"Transport",
	"Park",
	"Healthcare",
	"Station",
	"Airport",
	"River labels",
	"Lake labels",
]);

const styleVisibleLabel = (map: MapLibreMap, layerId: string) => {
	map.setLayoutProperty(layerId, "visibility", "visible");
	try {
		map.setPaintProperty(layerId, "text-color", "#cbd5e1");
		map.setPaintProperty(layerId, "text-halo-color", "#000000");
		map.setPaintProperty(layerId, "text-halo-width", 1.2);
	} catch {
		// some symbol layers are icon-only
	}
	try {
		map.setPaintProperty(layerId, "icon-opacity", 0.85);
	} catch {
		// not all symbol layers have icons
	}
};

/** ~35 m footprint at HK latitude */
const BUILDING_HALF_SIZE = 0.00016;

const squareRing = (lng: number, lat: number): [number, number][] => {
	const d = BUILDING_HALF_SIZE;
	return [
		[lng - d, lat - d],
		[lng + d, lat - d],
		[lng + d, lat + d],
		[lng - d, lat + d],
		[lng - d, lat - d],
	];
};

export const emergencyBuildingsGeoJson = (footprints?: EmergencyFootprint[]) => {
	const footprintMap = new Map(footprints?.map((f) => [f.stationId, f]));
	return {
		type: "FeatureCollection" as const,
		features: STATIONS.map((s) => {
			const fp = footprintMap.get(s.id);
			return {
				type: "Feature" as const,
				properties: { id: s.id, name: s.name, service: s.service },
				geometry: {
					type: "Polygon" as const,
					coordinates: [fp ? fp.coordinates : squareRing(s.lng, s.lat)],
				},
			};
		}),
	};
};

export const updateEmergencyBuildingFootprints = (
	map: MapLibreMap,
	footprints: EmergencyFootprint[],
) => {
	const source = map.getSource("emergency-buildings") as GeoJSONSource | undefined;
	source?.setData(emergencyBuildingsGeoJson(footprints));
};

export const applyMapTheme = (map: MapLibreMap) => {
	const layers = map.getStyle().layers ?? [];
	const hasExtrusion = layers.some((layer) => layer.type === "fill-extrusion");

	for (const layer of layers) {
		if (layer.type === "background")
			map.setPaintProperty(layer.id, "background-color", "#000000");

		if (layer.type === "symbol" && !isOurLayer(layer.id)) {
			if (ALLOWED_LABEL_LAYERS.has(layer.id)) styleVisibleLabel(map, layer.id);
			else map.setLayoutProperty(layer.id, "visibility", "none");
		}

		// hide flat 2D building footprints when 3D extrusions are available
		if (layer.type === "fill" && hasExtrusion && /building/i.test(layer.id))
			map.setLayoutProperty(layer.id, "visibility", "none");

		if (layer.type === "fill" && !/building/i.test(layer.id))
			map.setPaintProperty(layer.id, "fill-color", "#0a0a0a");

		if (layer.type === "line")
			map.setPaintProperty(layer.id, "line-color", "#1a1a1a");

		if (layer.type === "fill-extrusion") {
			map.setLayoutProperty(layer.id, "visibility", "visible");
			map.setPaintProperty(layer.id, "fill-extrusion-color", "#888888");
			map.setPaintProperty(layer.id, "fill-extrusion-opacity", 0.7);
		}
	}
};

export const addEmergencyBuildingLayers = (map: MapLibreMap) => {
	map.addSource("emergency-buildings", {
		type: "geojson",
		data: emergencyBuildingsGeoJson(),
	});

	map.addLayer({
		id: "emergency-buildings",
		type: "fill-extrusion",
		source: "emergency-buildings",
		paint: {
			"fill-extrusion-color": [
				"match",
				["get", "service"],
				"police",
				SERVICE_COLORS.police,
				"medical",
				SERVICE_COLORS.medical,
				"fire",
				SERVICE_COLORS.fire,
				"#666666",
			],
			"fill-extrusion-height": 40,
			"fill-extrusion-opacity": 1,
		},
	});

	map.addLayer({
		id: "station-labels",
		type: "symbol",
		source: "emergency-buildings",
		minzoom: 11,
		layout: {
			"text-field": ["get", "name"],
			"text-size": 11,
			"text-offset": [0, 1.4],
			"text-anchor": "top",
			"text-max-width": 12,
		},
		paint: {
			"text-color": "#e2e8f0",
			"text-halo-color": "#000000",
			"text-halo-width": 1.5,
		},
	});
};

export const fitHongKong = (map: MapLibreMap) => {
	map.fitBounds(
		[
			[HK_BOUNDS.minLng, HK_BOUNDS.minLat],
			[HK_BOUNDS.maxLng, HK_BOUNDS.maxLat],
		],
		{ padding: 40, pitch: 55, bearing: -17, duration: 0 },
	);
	if (map.getZoom() < 11) map.setZoom(11);
};

export const HK_MAX_BOUNDS: [[number, number], [number, number]] = [
	[HK_BOUNDS.minLng, HK_BOUNDS.minLat],
	[HK_BOUNDS.maxLng, HK_BOUNDS.maxLat],
];
