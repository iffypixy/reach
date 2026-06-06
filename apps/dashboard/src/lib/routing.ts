import type { Coord, DispatchUnit, Incident } from "~/domain/types";

export type RouteCoords = [number, number][];

export const straightRoute = (from: Coord, to: Coord): RouteCoords => [
	[from.lng, from.lat],
	[to.lng, to.lat],
];

export const unitRoute = (unit: DispatchUnit, destination: Coord): RouteCoords =>
	unit.route?.length >= 2 ? unit.route : straightRoute(unit.from, destination);

const isStraightFallback = (unit: DispatchUnit, destination: Coord) =>
	unitRoute(unit, destination).length <= 2;

export type DrivingRoute = { coords: RouteCoords; durationMinutes: number | null };

type OsrmResponse = {
	code: string;
	routes?: Array<{ duration?: number; geometry?: { coordinates?: RouteCoords } }>;
};

export const fetchDrivingRoute = async (from: Coord, to: Coord): Promise<DrivingRoute> => {
	const fallback: DrivingRoute = { coords: straightRoute(from, to), durationMinutes: null };
	const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
	try {
		const res = await fetch(url);
		if (!res.ok) return fallback;
		const data = (await res.json()) as OsrmResponse;
		if (data.code !== "Ok") return fallback;
		const route = data.routes?.[0];
		const coords = route?.geometry?.coordinates;
		if (!coords || coords.length < 2) return fallback;
		return {
			coords,
			durationMinutes: typeof route.duration === "number" ? route.duration / 60 : null,
		};
	} catch {
		return fallback;
	}
};

export const hydrateIncidentRoutes = async (
	incident: Incident,
	onRoute: (unitId: string, route: RouteCoords, durationMinutes: number | null) => void,
) => {
	const destination = { lat: incident.lat, lng: incident.lng };
	const pending = incident.dispatchUnits.filter((unit) => isStraightFallback(unit, destination));
	if (pending.length === 0) return;

	await Promise.all(
		pending.map(async (unit) => {
			const { coords, durationMinutes } = await fetchDrivingRoute(unit.from, destination);
			onRoute(unit.id, coords, durationMinutes);
		}),
	);
};
