import maplibregl, {
	type GeoJSONSource,
	type Map as MapLibreMap,
	type Marker,
	type Popup,
} from "maplibre-gl";
import { useEffect, useRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import "maplibre-gl/dist/maplibre-gl.css";

import { HK_BEARING, HK_CENTER, HK_MIN_ZOOM, HK_PITCH, HK_ZOOM, MAP_STYLE } from "~/config/hk";
import { computeUnitProgress } from "~/data/seed";
import { SERVICE_COLORS } from "~/domain/mapping";
import type { Coord, Incident } from "~/domain/types";
import { IncidentPopupContent } from "~/features/incidents/IncidentPopup";
import {
	addEmergencyBuildingLayers,
	applyMapTheme,
	fitHongKong,
	HK_MAX_BOUNDS,
	updateEmergencyBuildingFootprints,
} from "~/features/map/mapTheme";
import { fetchEmergencyFootprints } from "~/lib/overpass";
import { useDispatchAnimation } from "~/features/map/useDispatchAnimation";
import { interpolateAlongRoute } from "~/lib/geo";
import { unitRoute } from "~/lib/routing";
import { useIncidentsStore } from "~/store/incidents";

type Props = {
	isAddingMode: boolean;
	pendingLocation: Coord | null;
	onMapClick: (coord: Coord) => void;
	flyToLocation: Coord | null;
};

type PointFeatureCollection = {
	type: "FeatureCollection";
	features: Array<{
		type: "Feature";
		properties: Record<string, string>;
		geometry: { type: "Point"; coordinates: [number, number] };
	}>;
};

const incidentsGeoJson = (incidents: Incident[]): PointFeatureCollection => ({
	type: "FeatureCollection",
	features: incidents.map((i) => ({
		type: "Feature",
		properties: {
			id: i.id,
			category: i.category,
			title: i.title,
			source: i.source,
		},
		geometry: { type: "Point", coordinates: [i.lng, i.lat] },
	})),
});

const unitMarkerEl = (color: string) => {
	const el = document.createElement("div");
	el.className = "dispatch-unit-marker";
	el.style.cssText = `
		width: 14px; height: 14px; border-radius: 50%;
		background: ${color}; border: 2px solid white;
		box-shadow: 0 1px 4px rgba(0,0,0,0.4);
	`;
	return el;
};

const pendingMarkerEl = () => {
	const el = document.createElement("div");
	el.style.cssText = `
		width: 18px; height: 18px; border-radius: 50%;
		background: #f59e0b; border: 3px solid white;
		box-shadow: 0 2px 6px rgba(0,0,0,0.35);
	`;
	return el;
};

export const MapView = ({ isAddingMode, pendingLocation, onMapClick, flyToLocation }: Props) => {
	const incidents = useIncidentsStore((s) => s.incidents);
	const containerRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<MapLibreMap | null>(null);
	const unitMarkersRef = useRef<Map<string, Marker>>(new Map());
	const pendingMarkerRef = useRef<Marker | null>(null);
	const popupRef = useRef<Popup | null>(null);
	const popupRootRef = useRef<Root | null>(null);
	const syncedLinesRef = useRef<Set<string>>(new Set());
	const incidentsRef = useRef(incidents);
	const isAddingModeRef = useRef(isAddingMode);
	const onMapClickRef = useRef(onMapClick);

	incidentsRef.current = incidents;
	isAddingModeRef.current = isAddingMode;
	onMapClickRef.current = onMapClick;

	useDispatchAnimation(mapRef, incidents, unitMarkersRef);

	useEffect(() => {
		if (!containerRef.current || mapRef.current) return;

		const map = new maplibregl.Map({
			container: containerRef.current,
			style: MAP_STYLE,
			center: [HK_CENTER.lng, HK_CENTER.lat],
			zoom: HK_ZOOM,
			minZoom: HK_MIN_ZOOM,
			maxBounds: HK_MAX_BOUNDS,
			pitch: HK_PITCH,
			bearing: HK_BEARING,
		});

		map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");

		map.on("load", () => {
			applyMapTheme(map);
			addEmergencyBuildingLayers(map);
			fitHongKong(map);
			void fetchEmergencyFootprints().then((footprints) => {
				if (footprints.length > 0) updateEmergencyBuildingFootprints(map, footprints);
			});

			map.addSource("incidents", {
				type: "geojson",
				data: incidentsGeoJson(incidentsRef.current),
			});
			map.addLayer({
				id: "incidents",
				type: "circle",
				source: "incidents",
				paint: {
					"circle-radius": 10,
					"circle-color": "#f97316",
					"circle-stroke-width": 3,
					"circle-stroke-color": "#ffffff",
				},
			});

			map.on("click", "incidents", (e) => {
				const feature = e.features?.[0];
				if (!feature?.properties?.id) return;
				const incident = incidentsRef.current.find((i) => i.id === feature.properties?.id);
				if (!incident) return;
				showIncidentPopup(map, incident, popupRef, popupRootRef);
			});

			map.on("mouseenter", "incidents", () => {
				map.getCanvas().style.cursor = "pointer";
			});
			map.on("mouseleave", "incidents", () => {
				map.getCanvas().style.cursor = "";
			});
		});

		map.on("click", (e) => {
			const features = map.queryRenderedFeatures(e.point, { layers: ["incidents"] });
			if (features.length > 0) return;
			if (isAddingModeRef.current) onMapClickRef.current({ lat: e.lngLat.lat, lng: e.lngLat.lng });
		});

		mapRef.current = map;
		return () => {
			popupRootRef.current?.unmount();
			popupRef.current?.remove();
			for (const marker of unitMarkersRef.current.values()) marker.remove();
			unitMarkersRef.current.clear();
			pendingMarkerRef.current?.remove();
			map.remove();
			mapRef.current = null;
		};
	}, []);

	useEffect(() => {
		const map = mapRef.current;
		if (!map) return;
		const sync = () => {
			const source = map.getSource("incidents") as GeoJSONSource | undefined;
			source?.setData(incidentsGeoJson(incidents));
		};
		if (map.isStyleLoaded()) sync();
		else map.once("load", sync);
	}, [incidents]);

	useEffect(() => {
		const map = mapRef.current;
		if (!map) return;
		const sync = () => syncDispatchLayers(map, incidents, unitMarkersRef, syncedLinesRef);
		if (map.isStyleLoaded()) sync();
		else map.once("load", sync);
	}, [incidents]);

	useEffect(() => {
		const map = mapRef.current;
		if (!map) return;
		map.getCanvas().style.cursor = isAddingMode ? "crosshair" : "";
	}, [isAddingMode]);

	useEffect(() => {
		const map = mapRef.current;
		if (!map) return;

		pendingMarkerRef.current?.remove();
		pendingMarkerRef.current = null;

		if (!pendingLocation) return;

		pendingMarkerRef.current = new maplibregl.Marker({
			element: pendingMarkerEl(),
		})
			.setLngLat([pendingLocation.lng, pendingLocation.lat])
			.addTo(map);
	}, [pendingLocation]);

	useEffect(() => {
		const map = mapRef.current;
		if (!map || !flyToLocation) return;
		map.flyTo({
			center: [flyToLocation.lng, flyToLocation.lat],
			zoom: 14,
			duration: 1200,
		});
	}, [flyToLocation]);

	return (
		<div className="relative h-full w-full">
			<div ref={containerRef} className="h-full w-full" />
			<div className="pointer-events-none absolute bottom-4 left-4 rounded-lg border border-white/10 bg-black/80 px-3 py-2 text-xs text-slate-200 shadow backdrop-blur">
				<p className="font-medium text-white">Legend</p>
				<div className="mt-1 flex flex-wrap gap-3">
					<span className="flex items-center gap-1">
						<span className="size-2 rounded-sm bg-blue-600" /> Police
					</span>
					<span className="flex items-center gap-1">
						<span className="size-2 rounded-sm bg-green-600" /> Medical
					</span>
					<span className="flex items-center gap-1">
						<span className="size-2 rounded-sm bg-red-600" /> Fire
					</span>
					<span className="flex items-center gap-1">
						<span className="size-2 rounded-full bg-orange-500" /> Incident
					</span>
				</div>
				<p className="mt-1.5 text-[10px] text-slate-500">Other buildings: grey 70%</p>
			</div>
		</div>
	);
};

const showIncidentPopup = (
	map: MapLibreMap,
	incident: Incident,
	popupRef: React.RefObject<Popup | null>,
	popupRootRef: React.RefObject<Root | null>,
) => {
	popupRootRef.current?.unmount();
	popupRef.current?.remove();

	const container = document.createElement("div");
	popupRootRef.current = createRoot(container);
	popupRootRef.current.render(<IncidentPopupContent incident={incident} />);

	popupRef.current = new maplibregl.Popup({ offset: 16, maxWidth: "320px" })
		.setLngLat([incident.lng, incident.lat])
		.setDOMContent(container)
		.addTo(map);
};

const syncDispatchLayers = (
	map: MapLibreMap,
	incidents: Incident[],
	unitMarkersRef: React.RefObject<Map<string, Marker>>,
	syncedLinesRef: React.RefObject<Set<string>>,
) => {
	const activeUnitIds = new Set<string>();
	for (const incident of incidents) {
		for (const unit of incident.dispatchUnits) {
			activeUnitIds.add(unit.id);
			const lineId = `dispatch-line-${unit.id}`;
			const color = SERVICE_COLORS[unit.service];
			const destination = { lat: incident.lat, lng: incident.lng };
			const route = unitRoute(unit, destination);

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
						"line-color": color,
						"line-width": 3,
						"line-opacity": 0.75,
					},
				});
				syncedLinesRef.current?.add(lineId);
			}

			if (!unitMarkersRef.current?.has(unit.id)) {
				const progress = computeUnitProgress(unit);
				const pos = interpolateAlongRoute(route, progress);
				const marker = new maplibregl.Marker({ element: unitMarkerEl(color) })
					.setLngLat([pos.lng, pos.lat])
					.addTo(map);
				unitMarkersRef.current?.set(unit.id, marker);
			}
		}
	}

	for (const [unitId, marker] of unitMarkersRef.current ?? []) {
		if (activeUnitIds.has(unitId)) continue;
		marker.remove();
		unitMarkersRef.current?.delete(unitId);
		const lineId = `dispatch-line-${unitId}`;
		if (map.getLayer(lineId)) map.removeLayer(lineId);
		if (map.getSource(lineId)) map.removeSource(lineId);
		syncedLinesRef.current?.delete(lineId);
	}
};
