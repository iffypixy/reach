import type { Coord, ServiceCategory, Station } from "~/domain/types";

export const haversine = (a: Coord, b: Coord): number => {
	const toRad = (deg: number) => (deg * Math.PI) / 180;
	const dLat = toRad(b.lat - a.lat);
	const dLng = toRad(b.lng - a.lng);
	const lat1 = toRad(a.lat);
	const lat2 = toRad(b.lat);
	const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
	return 2 * 6371 * Math.asin(Math.sqrt(h));
};

export const interpolate = (a: Coord, b: Coord, t: number): Coord => ({
	lat: a.lat + (b.lat - a.lat) * t,
	lng: a.lng + (b.lng - a.lng) * t,
});

export const nearestStation = (
	coord: Coord,
	service: ServiceCategory,
	stations: Station[],
): Station => {
	let res = stations[0];
	let minDist = Infinity;
	for (const station of stations) {
		if (station.service !== service) continue;
		const dist = haversine(coord, { lat: station.lat, lng: station.lng });
		if (dist < minDist) {
			minDist = dist;
			res = station;
		}
	}
	return res;
};

export const randomCoordInHk = (): Coord => ({
	lat: 22.15 + Math.random() * (22.55 - 22.15),
	lng: 113.83 + Math.random() * (114.4 - 113.83),
});
