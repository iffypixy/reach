import { RESPONDER_MAX_RADIUS_KM } from "~/config/hk";
import type { MatchedCert } from "~/domain/certMapping";
import { getMatchedCerts } from "~/domain/certMapping";
import type { Responder } from "~/domain/responder";
import type { Incident } from "~/domain/types";
import { haversine } from "~/lib/geo";

const DISTANCE_WEIGHT = 0.45;
const CERT_WEIGHT = 0.55;

export type ResponderScore = {
	score: number;
	distanceKm: number;
	distanceScore: number;
	certScore: number;
	verifiedMultiplier: number;
	matchedCerts: MatchedCert[];
};

export const scoreResponder = (incident: Incident, responder: Responder): ResponderScore | null => {
	const distanceKm = haversine(
		{ lat: responder.lat, lng: responder.lng },
		{ lat: incident.lat, lng: incident.lng },
	);
	if (distanceKm > RESPONDER_MAX_RADIUS_KM) return null;

	const distanceScore = 1 / (1 + distanceKm);
	const matchedCerts = getMatchedCerts(incident.category, responder.certifications);
	const certScore = matchedCerts.reduce((sum, m) => sum + m.weight, 0);
	const verifiedMultiplier =
		matchedCerts.length === 0
			? 0
			: matchedCerts.reduce((sum, m) => sum + (m.verified ? 1 : 0.5), 0) / matchedCerts.length;

	const score = DISTANCE_WEIGHT * distanceScore + CERT_WEIGHT * certScore * verifiedMultiplier;

	return { score, distanceKm, distanceScore, certScore, verifiedMultiplier, matchedCerts };
};
