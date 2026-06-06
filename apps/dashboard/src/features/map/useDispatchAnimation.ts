import type { GeoJSONSource, Map as MapLibreMap, Marker } from "maplibre-gl";
import { useEffect } from "react";

import { DEMO_TIME_SCALE } from "~/config/hk";
import { computeRemainingEtaMinutes, computeUnitProgress } from "~/data/seed";
import type { Incident } from "~/domain/types";
import { interpolateAlongRoute, sliceRouteToProgress } from "~/lib/geo";
import { unitRoute } from "~/lib/routing";
import { useIncidentsStore } from "~/store/incidents";

export const formatEta = (minutes: number) => {
	if (minutes <= 0) return "Arrived";
	if (minutes < 1) return "< 1 min";
	return `${Math.ceil(minutes)} min`;
};

export const getUnitEtaLabel = (unit: Incident["dispatchUnits"][number], now = Date.now()) =>
	formatEta(computeRemainingEtaMinutes(unit, now));

export const useDispatchAnimation = (
	mapRef: React.RefObject<MapLibreMap | null>,
	incidents: Incident[],
	unitMarkersRef: React.RefObject<Map<string, Marker>>,
) => {
	const markUnitArrived = useIncidentsStore((s) => s.markUnitArrived);

	useEffect(() => {
		let frame = 0;
		const tick = () => {
			const map = mapRef.current;
			if (map) {
				const now = Date.now();
				for (const incident of incidents) {
					for (const unit of incident.dispatchUnits) {
						const progress = computeUnitProgress(unit, now);
						const destination = { lat: incident.lat, lng: incident.lng };
						const route = unitRoute(unit, destination);
						const pos = interpolateAlongRoute(route, progress);
						unitMarkersRef.current?.get(unit.id)?.setLngLat([pos.lng, pos.lat]);

						const source = map.getSource(`dispatch-line-${unit.id}`) as GeoJSONSource | undefined;
						if (source) {
							source.setData({
								type: "Feature",
								properties: {},
								geometry: {
									type: "LineString",
									coordinates: sliceRouteToProgress(route, progress),
								},
							});
						}

						if (progress >= 1 && !unit.arrived) markUnitArrived(incident.id, unit.id);
					}
				}
			}
			frame = requestAnimationFrame(tick);
		};

		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, [incidents, mapRef, markUnitArrived, unitMarkersRef]);
};

export { DEMO_TIME_SCALE };
