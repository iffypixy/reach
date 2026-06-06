import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createDispatchUnits, generateSeedIncidents } from "~/data/seed";
import { INCIDENT_LABELS, INCIDENT_SERVICES } from "~/domain/mapping";
import type { AddIncidentInput, Incident } from "~/domain/types";
import { bus } from "~/events/bus";

type IncidentsState = {
	incidents: Incident[];
	seedLoaded: boolean;
	loadSeed: () => void;
	addIncident: (input: AddIncidentInput) => Incident;
	markUnitArrived: (incidentId: string, unitId: string) => void;
};

export const useIncidentsStore = create<IncidentsState>()(
	persist(
		(set, get) => ({
			incidents: [],
			seedLoaded: false,

			loadSeed: () => {
				const state = get();
				if (state.seedLoaded) return;
				if (state.incidents.length === 0)
					set({ incidents: generateSeedIncidents(), seedLoaded: true });
				else set({ seedLoaded: true });
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
		}),
		{ name: "reach-incidents" },
	),
);
