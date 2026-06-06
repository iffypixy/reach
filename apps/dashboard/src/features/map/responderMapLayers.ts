import maplibregl, { type Map as MapLibreMap, type Marker } from "maplibre-gl";

import type { Incident } from "~/domain/types";
import type { RankedResponder } from "~/features/recommender/rankResponders";

const RESPONDER_LINE_PREFIX = "responder-line-";

const responderMarkerEl = (contacted: boolean) => {
	const el = document.createElement("div");
	el.style.cssText = `
		width: 12px; height: 12px; border-radius: 50%;
		background: ${contacted ? "#22c55e" : "#a855f7"};
		border: 2px solid white;
		box-shadow: 0 1px 4px rgba(0,0,0,0.45);
	`;
	return el;
};

export const syncResponderLayers = (
	map: MapLibreMap,
	incident: Incident | null,
	recommendations: RankedResponder[],
	responderMarkersRef: React.RefObject<Map<string, Marker>>,
	syncedLinesRef: React.RefObject<Set<string>>,
) => {
	const activeIds = new Set<string>();

	if (incident && !incident.incidentHandled) {
		for (const ranked of recommendations) {
			const { responder, route } = ranked;
			const lineId = `${RESPONDER_LINE_PREFIX}${responder.id}`;
			const contacted = incident.contactedResponderIds.includes(responder.id);
			activeIds.add(responder.id);

			if (!map.getSource(lineId)) {
				map.addSource(lineId, {
					type: "geojson",
					data: {
						type: "Feature",
						properties: {},
						geometry: { type: "LineString", coordinates: route },
					},
				});
				map.addLayer({
					id: lineId,
					type: "line",
					source: lineId,
					paint: {
						"line-color": contacted ? "#22c55e" : "#a855f7",
						"line-width": 2,
						"line-opacity": 0.6,
						"line-dasharray": [2, 2],
					},
				});
				syncedLinesRef.current?.add(lineId);
			} else {
				const source = map.getSource(lineId) as maplibregl.GeoJSONSource;
				source.setData({
					type: "Feature",
					properties: {},
					geometry: { type: "LineString", coordinates: route },
				});
				map.setPaintProperty(lineId, "line-color", contacted ? "#22c55e" : "#a855f7");
			}

			let marker = responderMarkersRef.current?.get(responder.id);
			if (!marker) {
				marker = new maplibregl.Marker({
					element: responderMarkerEl(contacted),
				})
					.setLngLat([responder.lng, responder.lat])
					.addTo(map);
				responderMarkersRef.current?.set(responder.id, marker);
			} else {
				marker.setLngLat([responder.lng, responder.lat]);
				const dot = marker.getElement().firstElementChild as HTMLElement | null;
				if (dot) dot.style.background = contacted ? "#22c55e" : "#a855f7";
				if (map.getLayer(lineId))
					map.setPaintProperty(lineId, "line-color", contacted ? "#22c55e" : "#a855f7");
			}
		}
	}

	for (const [responderId, marker] of responderMarkersRef.current ?? []) {
		if (activeIds.has(responderId)) continue;
		marker.remove();
		responderMarkersRef.current?.delete(responderId);
		const lineId = `${RESPONDER_LINE_PREFIX}${responderId}`;
		if (map.getLayer(lineId)) map.removeLayer(lineId);
		if (map.getSource(lineId)) map.removeSource(lineId);
		syncedLinesRef.current?.delete(lineId);
	}
};

export const updateResponderRoutesOnMap = (
	map: MapLibreMap,
	recommendations: RankedResponder[],
	incident: Incident,
) => {
	for (const ranked of recommendations) {
		const lineId = `${RESPONDER_LINE_PREFIX}${ranked.responder.id}`;
		const source = map.getSource(lineId) as maplibregl.GeoJSONSource | undefined;
		if (!source) continue;
		source.setData({
			type: "Feature",
			properties: {},
			geometry: { type: "LineString", coordinates: ranked.route },
		});
		const contacted = incident.contactedResponderIds.includes(ranked.responder.id);
		if (map.getLayer(lineId))
			map.setPaintProperty(lineId, "line-color", contacted ? "#22c55e" : "#a855f7");
	}
};
