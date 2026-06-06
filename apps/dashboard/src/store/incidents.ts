import { create } from "zustand";
import { persist } from "zustand/middleware";
import { HK_HOTSPOTS } from "~/data/hotspots";
import { clampEtaMinutes, createDispatchUnits } from "~/data/seed";
import { INCIDENT_CATEGORIES, INCIDENT_LABELS, INCIDENT_SERVICES } from "~/domain/mapping";
import type { Incident } from "~/domain/types";
import { bus } from "~/events/bus";
import { hydrateIncidentRoutes, type RouteCoords } from "~/lib/routing";
import { useRecommendationsStore } from "~/store/recommendations";

type IncidentsState = {
	incidents: Incident[];
	seedLoaded: boolean;
	loadSeed: () => void;
	addIncident: () => Incident;
	markUnitArrived: (incidentId: string, unitId: string) => void;
	updateUnitRoute: (
		incidentId: string,
		unitId: string,
		route: RouteCoords,
		etaMinutes?: number,
	) => void;
	toggleContactedResponder: (incidentId: string, responderId: string) => void;
	setIncidentHandled: (incidentId: string, handled: boolean) => void;
};

const pickRandom = <T>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

const fetchRoutesInBackground = (
	incident: Incident,
	updateUnitRoute: IncidentsState["updateUnitRoute"],
) => {
	void hydrateIncidentRoutes(incident, (unitId, route, durationMinutes) =>
		updateUnitRoute(
			incident.id,
			unitId,
			route,
			durationMinutes != null ? clampEtaMinutes(durationMinutes) : undefined,
		),
	);
};

type PersistedIncident = Incident & { respondersContacted?: boolean };

const normalizeIncident = (incident: PersistedIncident): Incident => ({
	...incident,
	contactedResponderIds: incident.contactedResponderIds ?? [],
	incidentHandled: incident.incidentHandled ?? false,
});

export const useIncidentsStore = create<IncidentsState>()(
	persist(
		(set, get) => ({
			incidents: [],
			seedLoaded: false,

			loadSeed: () => {
				const incidents = get()
					.incidents.filter((incident) => incident.source === "operator")
					.map(normalizeIncident);
				set({ incidents, seedLoaded: true });
				for (const incident of incidents) fetchRoutesInBackground(incident, get().updateUnitRoute);
			},

			addIncident: () => {
				const createdAt = Date.now();
				const category = pickRandom(INCIDENT_CATEGORIES);
				const hotspot = pickRandom(HK_HOTSPOTS);
				const dispatchUnits = createDispatchUnits(hotspot.lat, hotspot.lng, category, createdAt);
				const incident: Incident = {
					id: crypto.randomUUID(),
					category,
					title: INCIDENT_LABELS[category],
					severity: "medium",
					description: "Operator-registered incident",
					lat: hotspot.lat,
					lng: hotspot.lng,
					address: hotspot.name,
					createdAt,
					source: "operator",
					dispatchUnits,
					contactedResponderIds: [],
					incidentHandled: false,
				};

				set({ incidents: [...get().incidents, incident] });
				fetchRoutesInBackground(incident, get().updateUnitRoute);
				useRecommendationsStore.getState().recommendForIncident(incident);
				bus.emit("incident:created", {
					incidentId: incident.id,
					category: incident.category,
					lat: incident.lat,
					lng: incident.lng,
					services: INCIDENT_SERVICES[category],
				});
				return incident;
			},

			markUnitArrived: (incidentId, unitId) => {
				set({
					incidents: get().incidents.map((incident) =>
						incident.id !== incidentId
							? incident
							: {
									...incident,
									dispatchUnits: incident.dispatchUnits.map((unit) =>
										unit.id === unitId ? { ...unit, arrived: true } : unit,
									),
								},
					),
				});
			},

			updateUnitRoute: (incidentId, unitId, route, etaMinutes) => {
				set({
					incidents: get().incidents.map((incident) =>
						incident.id !== incidentId
							? incident
							: {
									...incident,
									dispatchUnits: incident.dispatchUnits.map((unit) =>
										unit.id === unitId
											? { ...unit, route, ...(etaMinutes != null && { etaMinutes }) }
											: unit,
									),
								},
					),
				});
			},

			toggleContactedResponder: (incidentId, responderId) => {
				set({
					incidents: get().incidents.map((incident) => {
						if (incident.id !== incidentId) return incident;
						const contacted = incident.contactedResponderIds.includes(responderId);
						return {
							...incident,
							contactedResponderIds: contacted
								? incident.contactedResponderIds.filter((id) => id !== responderId)
								: [...incident.contactedResponderIds, responderId],
						};
					}),
				});
			},

			setIncidentHandled: (incidentId, handled) => {
				set({
					incidents: get().incidents.map((incident) =>
						incident.id === incidentId ? { ...incident, incidentHandled: handled } : incident,
					),
				});
			},
		}),
		{
			name: "reach-incidents",
			version: 1,
			migrate: (persisted, version) => {
				const state = persisted as { incidents?: PersistedIncident[]; seedLoaded?: boolean };
				if (version === 0 && state.incidents)
					state.incidents = state.incidents.map(normalizeIncident);
				return state as IncidentsState;
			},
		},
	),
);
