import { create } from "zustand";

import type { Incident } from "~/domain/types";
import { type RankedResponder, rankResponders } from "~/features/recommender/rankResponders";
import { fetchDrivingRoute, type RouteCoords } from "~/lib/routing";

type RecommendationsState = {
	recommendationsByIncidentId: Record<string, RankedResponder[]>;
	loadingByIncidentId: Record<string, boolean>;
	selectedIncidentId: string | null;
	recommendForIncident: (incident: Incident) => void;
	updateResponderRoute: (incidentId: string, responderId: string, route: RouteCoords) => void;
	setSelectedIncident: (id: string | null) => void;
	getRecommendations: (incidentId: string) => RankedResponder[];
};

const hydrateRoutes = (
	incident: Incident,
	ranked: RankedResponder[],
	updateRoute: RecommendationsState["updateResponderRoute"],
) => {
	const destination = { lat: incident.lat, lng: incident.lng };
	void Promise.all(
		ranked.map(async ({ responder }) => {
			const from = { lat: responder.lat, lng: responder.lng };
			const { coords } = await fetchDrivingRoute(from, destination);
			updateRoute(incident.id, responder.id, coords);
		}),
	);
};

export const useRecommendationsStore = create<RecommendationsState>((set, get) => ({
	recommendationsByIncidentId: {},
	loadingByIncidentId: {},
	selectedIncidentId: null,

	recommendForIncident: (incident) => {
		set((state) => ({
			loadingByIncidentId: { ...state.loadingByIncidentId, [incident.id]: true },
			selectedIncidentId: incident.id,
		}));

		const ranked = rankResponders(incident);
		set((state) => ({
			recommendationsByIncidentId: { ...state.recommendationsByIncidentId, [incident.id]: ranked },
			loadingByIncidentId: { ...state.loadingByIncidentId, [incident.id]: false },
		}));

		hydrateRoutes(incident, ranked, get().updateResponderRoute);
	},

	updateResponderRoute: (incidentId, responderId, route) => {
		set((state) => {
			const current = state.recommendationsByIncidentId[incidentId];
			if (!current) return state;
			return {
				recommendationsByIncidentId: {
					...state.recommendationsByIncidentId,
					[incidentId]: current.map((r) => (r.responder.id === responderId ? { ...r, route } : r)),
				},
			};
		});
	},

	setSelectedIncident: (id) => set({ selectedIncidentId: id }),

	getRecommendations: (incidentId) => get().recommendationsByIncidentId[incidentId] ?? [],
}));
