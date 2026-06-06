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

type OsrmResponse = {
	code: string;
	routes?: Array<{ geometry?: { coordinates?: RouteCoords } }>;
};

export const fetchDrivingRoute = async (from: Coord, to: Coord): Promise<RouteCoords> => {
	const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
	try {
		const res = await fetch(url);
		if (!res.ok) return straightRoute(from, to);
		const data = (await res.json()) as OsrmResponse;
		if (data.code !== "Ok") return straightRoute(from, to);
		const coords = data.routes?.[0]?.geometry?.coordinates;
		if (!coords || coords.length < 2) return straightRoute(from, to);
		return coords;
	} catch {
		return straightRoute(from, to);
	}
};

export const hydrateIncidentRoutes = async (
	incident: Incident,
	onRoute: (unitId: string, route: RouteCoords) => void,
) => {
	const destination = { lat: incident.lat, lng: incident.lng };
	const pending = incident.dispatchUnits.filter((unit) => isStraightFallback(unit, destination));
	if (pending.length === 0) return;

	await Promise.all(
		pending.map(async (unit) => {
			const route = await fetchDrivingRoute(unit.from, destination);
			onRoute(unit.id, route);
		}),
	);
};
