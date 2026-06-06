import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createDispatchUnits, generateSeedIncidents } from "~/data/seed";
import { INCIDENT_LABELS, INCIDENT_SERVICES } from "~/domain/mapping";
import type { AddIncidentInput, Incident } from "~/domain/types";
import { bus } from "~/events/bus";
import { hydrateIncidentRoutes, type RouteCoords } from "~/lib/routing";

type IncidentsState = {
	incidents: Incident[];
	seedLoaded: boolean;
	loadSeed: () => void;
	addIncident: (input: AddIncidentInput) => Incident;
	markUnitArrived: (incidentId: string, unitId: string) => void;
	updateUnitRoute: (incidentId: string, unitId: string, route: RouteCoords) => void;
};

const fetchRoutesInBackground = (
	incident: Incident,
	updateUnitRoute: IncidentsState["updateUnitRoute"],
) => {
	void hydrateIncidentRoutes(incident, (unitId, route) =>
		updateUnitRoute(incident.id, unitId, route),
	);
};

export const useIncidentsStore = create<IncidentsState>()(
	persist(
		(set, get) => ({
			incidents: [],
			seedLoaded: false,

			loadSeed: () => {
				const state = get();
				const incidents = state.incidents.length === 0 ? generateSeedIncidents() : state.incidents;
				if (!state.seedLoaded) set({ incidents, seedLoaded: true });
				for (const incident of incidents) fetchRoutesInBackground(incident, get().updateUnitRoute);
			},

			addIncident: (input) => {
				const createdAt = Date.now();
				const dispatchUnits = createDispatchUnits(input.lat, input.lng, input.category, createdAt);
				const incident: Incident = {
					id: crypto.randomUUID(),
					category: input.category,
					title: INCIDENT_LABELS[input.category],
					severity: "medium",
					description: "Operator-registered incident",
					lat: input.lat,
					lng: input.lng,
					address: input.address,
					createdAt,
					source: "operator",
					dispatchUnits,
					respondersContacted: false,
				};

				set({ incidents: [...get().incidents, incident] });
				fetchRoutesInBackground(incident, get().updateUnitRoute);
				bus.emit("incident:created", {
					incidentId: incident.id,
					category: incident.category,
					lat: incident.lat,
					lng: incident.lng,
					services: INCIDENT_SERVICES[input.category],
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

			updateUnitRoute: (incidentId, unitId, route) => {
				set({
					incidents: get().incidents.map((incident) =>
						incident.id !== incidentId
							? incident
							: {
									...incident,
									dispatchUnits: incident.dispatchUnits.map((unit) =>
										unit.id === unitId ? { ...unit, route } : unit,
									),
								},
					),
				});
			},
		}),
		{ name: "reach-incidents" },
	),
);
