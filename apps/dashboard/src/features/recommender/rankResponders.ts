import { TOP_RESPONDER_COUNT } from "~/config/hk";
import { RESPONDERS } from "~/data/responders";
import type { MatchedCert } from "~/domain/certMapping";
import type { Responder } from "~/domain/responder";
import type { Incident } from "~/domain/types";
import { scoreResponder } from "~/features/recommender/score";
import type { RouteCoords } from "~/lib/routing";
import { straightRoute } from "~/lib/routing";

export type RankedResponder = {
	responder: Responder;
	score: number;
	distanceKm: number;
	matchedCerts: MatchedCert[];
	route: RouteCoords;
};

export const rankResponders = (
	incident: Incident,
	pool: Responder[] = RESPONDERS,
): RankedResponder[] => {
	const destination = { lat: incident.lat, lng: incident.lng };
	const scored = pool
		.map((responder) => {
			const result = scoreResponder(incident, responder);
			if (!result) return null;
			return {
				responder,
				score: result.score,
				distanceKm: result.distanceKm,
				matchedCerts: result.matchedCerts,
				route: straightRoute({ lat: responder.lat, lng: responder.lng }, destination),
			};
		})
		.filter((r): r is RankedResponder => r != null);

	scored.sort((a, b) => b.score - a.score || a.distanceKm - b.distanceKm);
	return scored.slice(0, TOP_RESPONDER_COUNT);
};
