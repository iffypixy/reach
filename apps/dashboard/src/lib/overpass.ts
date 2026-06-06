import { STATIONS } from "~/data/stations";
import type { ServiceCategory } from "~/domain/types";

type OsmNode = { type: "node"; id: number; lat: number; lon: number };
type OsmWay = { type: "way"; id: number; nodes: number[]; tags?: Record<string, string> };
type OsmElement = OsmNode | OsmWay;

export type EmergencyFootprint = {
	stationId: string;
	service: ServiceCategory;
	name: string;
	coordinates: [number, number][];
};

const CACHE_KEY = "reach-emergency-footprints-v1";
const HK_BBOX = "22.15,113.83,22.55,114.4";

const AMENITY: Record<ServiceCategory, string> = {
	medical: "hospital",
	fire: "fire_station",
	police: "police",
};

const centroid = (coords: [number, number][]): [number, number] => {
	const [sx, sy] = coords.reduce(([ax, ay], [x, y]) => [ax + x, ay + y], [0, 0]);
	return [sx / coords.length, sy / coords.length];
};

const dist = ([ax, ay]: [number, number], [bx, by]: [number, number]) =>
	Math.hypot(ax - bx, ay - by);

export const fetchEmergencyFootprints = async (): Promise<EmergencyFootprint[]> => {
	const cached = localStorage.getItem(CACHE_KEY);
	if (cached) return JSON.parse(cached) as EmergencyFootprint[];

	const amenityFilters = Object.values(AMENITY)
		.map((a) => `way["amenity"="${a}"](${HK_BBOX});`)
		.join("\n");
	const query = `[out:json][timeout:30];\n(\n${amenityFilters}\n);\nout body;\n>;\nout skel qt;`;

	try {
		const res = await fetch("https://overpass-api.de/api/interpreter", {
			method: "POST",
			body: query,
		});
		if (!res.ok) return [];
		const data = (await res.json()) as { elements: OsmElement[] };

		const nodeMap = new Map<number, [number, number]>();
		for (const el of data.elements)
			if (el.type === "node") nodeMap.set(el.id, [el.lon, el.lat]);

		const ways: Array<{ amenity: string; coords: [number, number][]; center: [number, number] }> =
			[];
		for (const el of data.elements) {
			if (el.type !== "way" || !el.tags?.amenity) continue;
			const coords = el.nodes
				.map((id) => nodeMap.get(id))
				.filter((c): c is [number, number] => !!c);
			if (coords.length < 3) continue;
			ways.push({ amenity: el.tags.amenity, coords, center: centroid(coords) });
		}

		const footprints: EmergencyFootprint[] = [];
		for (const station of STATIONS) {
			const targetAmenity = AMENITY[station.service];
			const stationPos: [number, number] = [station.lng, station.lat];
			const candidates = ways.filter((w) => w.amenity === targetAmenity);
			if (!candidates.length) continue;
			const nearest = candidates.reduce((best, w) =>
				dist(w.center, stationPos) < dist(best.center, stationPos) ? w : best,
			);
			if (dist(nearest.center, stationPos) > 0.005) continue;
			footprints.push({
				stationId: station.id,
				service: station.service,
				name: station.name,
				coordinates: nearest.coords,
			});
		}

		localStorage.setItem(CACHE_KEY, JSON.stringify(footprints));
		return footprints;
	} catch {
		return [];
	}
};
