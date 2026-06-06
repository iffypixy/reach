export const HK_CENTER = { lng: 114.1694, lat: 22.3193 } as const;
export const HK_ZOOM = 10.8;
export const HK_PITCH = 55;
export const HK_BEARING = -17;
export const HK_MIN_ZOOM = 10;

export const HK_BOUNDS = {
	minLng: 113.83,
	minLat: 22.15,
	maxLng: 114.4,
	maxLat: 22.55,
} as const;

/** scales real ETA minutes down for demo (20 min ETA ≈ 20 sec on screen) */
export const DEMO_TIME_SCALE = 60;

export const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY ?? "";

export const MAP_STYLE = MAPTILER_KEY
	? `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`
	: "https://demotiles.maplibre.org/style.json";

export const geocodeUrl = (query: string) =>
	`https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${MAPTILER_KEY}&bbox=${HK_BOUNDS.minLng},${HK_BOUNDS.minLat},${HK_BOUNDS.maxLng},${HK_BOUNDS.maxLat}&limit=5`;
