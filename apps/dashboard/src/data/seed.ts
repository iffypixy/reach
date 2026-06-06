import { DEMO_TIME_SCALE } from "~/config/hk";
import { STATIONS } from "~/data/stations";
import {
	INCIDENT_CATEGORIES,
	INCIDENT_LABELS,
	INCIDENT_SERVICES,
	randomEtaMinutes,
} from "~/domain/mapping";
import type { DispatchUnit, Incident, IncidentCategory, ServiceCategory } from "~/domain/types";
import { nearestStation, randomCoordInHk } from "~/lib/geo";

const SEVERITIES = ["low", "medium", "high"] as const;

const GOVT_REF_PREFIX = ["GOV", "CAD", "EMS", "FSD"];

const buildDispatchUnits = (
	incidentCoord: { lat: number; lng: number },
	services: ServiceCategory[],
	createdAt: number,
): DispatchUnit[] =>
	services.map((service) => {
		const station = nearestStation(incidentCoord, service, STATIONS);
		return {
			id: crypto.randomUUID(),
			service,
			stationId: station.id,
			stationName: station.name,
			from: { lat: station.lat, lng: station.lng },
			etaMinutes: randomEtaMinutes(),
			createdAt,
			arrived: false,
		};
	});

const dispatchDurationMs = (etaMinutes: number) => (etaMinutes * 60 * 1000) / DEMO_TIME_SCALE;

export const createDispatchUnits = (
	lat: number,
	lng: number,
	category: IncidentCategory,
	createdAt = Date.now(),
): DispatchUnit[] => buildDispatchUnits({ lat, lng }, INCIDENT_SERVICES[category], createdAt);

export const computeUnitProgress = (unit: DispatchUnit, now = Date.now()) => {
	if (unit.arrived) return 1;
	const elapsed = now - unit.createdAt;
	const duration = dispatchDurationMs(unit.etaMinutes);
	if (duration <= 0) return 1;
	return Math.min(1, elapsed / duration);
};

export const computeRemainingEtaMinutes = (unit: DispatchUnit, now = Date.now()) => {
	if (unit.arrived) return 0;
	return unit.etaMinutes * (1 - computeUnitProgress(unit, now));
};

export const generateSeedIncidents = (): Incident[] => {
	const count = Math.floor(Math.random() * 3) + 7;
	const usedCategories = [...INCIDENT_CATEGORIES].sort(() => Math.random() - 0.5).slice(0, count);

	return usedCategories.map((category, i) => {
		const coord = randomCoordInHk();
		const minutesAgo = Math.floor(Math.random() * 45) + 5;
		const createdAt = Date.now() - minutesAgo * 60 * 1000;
		const dispatchUnits = createDispatchUnits(coord.lat, coord.lng, category, createdAt).map(
			(unit) => ({
				...unit,
				arrived: computeUnitProgress(unit, Date.now()) >= 1,
			}),
		);

		return {
			id: crypto.randomUUID(),
			category,
			title: INCIDENT_LABELS[category],
			severity: SEVERITIES[i % SEVERITIES.length] ?? "medium",
			description: `External CAD feed — ${INCIDENT_LABELS[category].toLowerCase()} reported via emergency hotline`,
			lat: coord.lat,
			lng: coord.lng,
			address: `HK Grid Ref ${GOVT_REF_PREFIX[i % GOVT_REF_PREFIX.length]}-${1000 + i * 137}`,
			createdAt,
			source: "seed" as const,
			dispatchUnits,
			respondersContacted: Math.random() > 0.6,
		};
	});
};
