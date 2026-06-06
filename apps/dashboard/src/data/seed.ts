import { DEMO_TIME_SCALE } from "~/config/hk";
import { STATIONS } from "~/data/stations";
import { INCIDENT_SERVICES } from "~/domain/mapping";
import type { Coord, DispatchUnit, IncidentCategory, ServiceCategory, Station } from "~/domain/types";
import { haversine } from "~/lib/geo";
import { straightRoute } from "~/lib/routing";

/** assumed urban response speed (km/h) for estimating ETA before a road route arrives */
const URBAN_KMH = 28;
const ETA_MIN_MINUTES = 5;
const ETA_MAX_MINUTES = 65;

/** a responding unit must start at least this far from the incident (no trivial hops / U-turn loops) */
const MIN_ORIGIN_KM = 2.5;
const MAX_FIELD_KM = 9;

/** central urban band — keeps random field origins out of the sea, islands and Shenzhen */
const CENTRAL_BAND = { minLat: 22.27, maxLat: 22.4, minLng: 114.1, maxLng: 114.25 };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const clampEtaMinutes = (minutes: number) =>
	clamp(minutes, ETA_MIN_MINUTES, ETA_MAX_MINUTES);

const estimateEtaMinutes = (from: Coord, to: Coord) =>
	clampEtaMinutes((haversine(from, to) / URBAN_KMH) * 60);

const randomInBand = (): Coord => ({
	lat: CENTRAL_BAND.minLat + Math.random() * (CENTRAL_BAND.maxLat - CENTRAL_BAND.minLat),
	lng: CENTRAL_BAND.minLng + Math.random() * (CENTRAL_BAND.maxLng - CENTRAL_BAND.minLng),
});

const projectCoord = (origin: Coord, distKm: number, bearingRad: number): Coord => ({
	lat: origin.lat + (distKm / 111) * Math.cos(bearingRad),
	lng: origin.lng + (distKm / (111 * Math.cos((origin.lat * Math.PI) / 180))) * Math.sin(bearingRad),
});

/** random central-band point at least MIN_ORIGIN_KM from the incident */
const fieldOrigin = (incident: Coord): Coord => {
	for (let i = 0; i < 24; i++) {
		const candidate = randomInBand();
		const d = haversine(incident, candidate);
		if (d >= MIN_ORIGIN_KM && d <= MAX_FIELD_KM) return candidate;
	}
	const pushed = projectCoord(incident, MIN_ORIGIN_KM + 1.5, Math.random() * 2 * Math.PI);
	return {
		lat: clamp(pushed.lat, CENTRAL_BAND.minLat, CENTRAL_BAND.maxLat),
		lng: clamp(pushed.lng, CENTRAL_BAND.minLng, CENTRAL_BAND.maxLng),
	};
};

/** nearest station of the service that is far enough away to warrant a real route */
const nearestStationBeyond = (incident: Coord, service: ServiceCategory): Station | null => {
	let res: Station | null = null;
	let minDist = Infinity;
	for (const station of STATIONS) {
		if (station.service !== service) continue;
		const dist = haversine(incident, { lat: station.lat, lng: station.lng });
		if (dist < MIN_ORIGIN_KM || dist >= minDist) continue;
		minDist = dist;
		res = station;
	}
	return res;
};

/** small jitter (~±200 m) so a unit doesn't sit exactly on the station roof */
const jitterAroundStation = ({ lat, lng }: Coord): Coord => ({
	lat: lat + (Math.random() - 0.5) * 0.0036,
	lng: lng + (Math.random() - 0.5) * 0.0036,
});

const dispatchDurationMs = (etaMinutes: number) => (etaMinutes * 60 * 1000) / DEMO_TIME_SCALE;

const buildDispatchUnits = (
	incidentCoord: Coord,
	services: ServiceCategory[],
	createdAt: number,
): DispatchUnit[] =>
	services.map((service) => {
		const station = Math.random() < 0.5 ? nearestStationBeyond(incidentCoord, service) : null;
		const from = station ? jitterAroundStation(station) : fieldOrigin(incidentCoord);
		return {
			id: crypto.randomUUID(),
			service,
			stationId: station?.id ?? "field-unit",
			stationName: station?.name ?? "Field unit",
			from,
			route: straightRoute(from, incidentCoord),
			etaMinutes: estimateEtaMinutes(from, incidentCoord),
			createdAt,
			arrived: false,
		};
	});

export const createDispatchUnits = (
	lat: number,
	lng: number,
	category: IncidentCategory,
	createdAt = Date.now(),
): DispatchUnit[] => buildDispatchUnits({ lat, lng }, INCIDENT_SERVICES[category], createdAt);

export const computeUnitProgress = (unit: DispatchUnit, now = Date.now()) => {
	if (unit.arrived) return 1;
	const duration = dispatchDurationMs(unit.etaMinutes);
	if (duration <= 0) return 1;
	return Math.min(1, (now - unit.createdAt) / duration);
};

export const computeRemainingEtaMinutes = (unit: DispatchUnit, now = Date.now()) => {
	if (unit.arrived) return 0;
	return unit.etaMinutes * (1 - computeUnitProgress(unit, now));
};
