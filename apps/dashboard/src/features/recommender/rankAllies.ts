import { TOP_ALLY_COUNT } from "~/config/hk";
import type { MatchedCert } from "~/domain/certMapping";
import type { Ally, Incident } from "~/domain/types";
import { scoreAlly } from "~/features/recommender/scoreAlly";

export type RankedAlly = {
	ally: Ally;
	score: number;
	distanceKm: number;
	matchedCerts: MatchedCert[];
};

export const rankAllies = (incident: Incident, pool: Ally[]): RankedAlly[] => {
	const scored = pool
		.map((ally) => {
			const result = scoreAlly(incident.type, incident.coords, ally);
			if (!result) return null;
			return {
				ally,
				score: result.score,
				distanceKm: result.distanceKm,
				matchedCerts: result.matchedCerts,
			};
		})
		.filter((r): r is RankedAlly => r != null);

	scored.sort((a, b) => b.score - a.score || a.distanceKm - b.distanceKm);
	return scored.slice(0, TOP_ALLY_COUNT);
};

export const countRankedAllies = (incident: Incident, pool: Ally[]): number =>
	rankAllies(incident, pool).length;
