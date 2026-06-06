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

const coordFromLngLat = ([lng, lat]: [number, number]): Coord => ({ lat, lng });

export const routeLength = (route: [number, number][]): number => {
	if (route.length < 2) return 0;
	let res = 0;
	for (let i = 1; i < route.length; i++)
		res += haversine(coordFromLngLat(route[i - 1]), coordFromLngLat(route[i]));
	return res;
};

export const interpolateAlongRoute = (route: [number, number][], t: number): Coord => {
	if (route.length === 0) return { lat: 0, lng: 0 };
	if (route.length === 1 || t <= 0) return coordFromLngLat(route[0]);
	if (t >= 1) return coordFromLngLat(route[route.length - 1]);

	const target = routeLength(route) * t;
	let traveled = 0;
	for (let i = 1; i < route.length; i++) {
		const a = coordFromLngLat(route[i - 1]);
		const b = coordFromLngLat(route[i]);
		const segLen = haversine(a, b);
		if (traveled + segLen >= target) {
			const segT = segLen > 0 ? (target - traveled) / segLen : 0;
			return interpolate(a, b, segT);
		}
		traveled += segLen;
	}
	return coordFromLngLat(route[route.length - 1]);
};

export const sliceRouteToProgress = (route: [number, number][], t: number): [number, number][] => {
	if (route.length === 0) return [];
	if (route.length === 1 || t <= 0) return [route[0]];
	if (t >= 1) return [...route];

	const target = routeLength(route) * t;
	const res: [number, number][] = [route[0]];
	let traveled = 0;
	for (let i = 1; i < route.length; i++) {
		const a = coordFromLngLat(route[i - 1]);
		const b = coordFromLngLat(route[i]);
		const segLen = haversine(a, b);
		if (traveled + segLen >= target) {
			const pos = interpolate(a, b, segLen > 0 ? (target - traveled) / segLen : 0);
			res.push([pos.lng, pos.lat]);
			return res;
		}
		traveled += segLen;
		res.push(route[i]);
	}
	return res;
};

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
