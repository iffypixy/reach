import {
	CERTIFICATION_LABELS,
	type Certification,
	type CertificationType,
} from "~/domain/responder";
import type { IncidentCategory } from "~/domain/types";

export type MatchedCert = {
	type: CertificationType;
	label: string;
	weight: number;
	verified: boolean;
};

const INCIDENT_CERT_WEIGHTS: Record<
	IncidentCategory,
	Partial<Record<CertificationType, number>>
> = {
	cardiacArrest: { medical_professional: 1.0, cpr_aed: 0.9 },
	injuryTrauma: { medical_professional: 1.0, cpr_aed: 0.7 },
	breathingDifficulty: { medical_professional: 1.0, cpr_aed: 0.8 },
	buildingFire: { fire_safety: 1.0, cpr_aed: 0.4 },
	gasLeak: { fire_safety: 1.0, cpr_aed: 0.4 },
	vehicleFire: { fire_safety: 1.0, cpr_aed: 0.4 },
	assault: { mental_health_first_aid: 0.8, cpr_aed: 0.5 },
	robbery: { mental_health_first_aid: 0.8, cpr_aed: 0.5 },
	trafficAccident: {
		road_accident_response: 1.0,
		medical_professional: 0.7,
		cpr_aed: 0.6,
	},
};

export const getMatchedCerts = (
	category: IncidentCategory,
	certifications: Certification[],
): MatchedCert[] => {
	const weights = INCIDENT_CERT_WEIGHTS[category];
	const res: MatchedCert[] = [];
	for (const cert of certifications) {
		const weight = weights[cert.type];
		if (weight == null) continue;
		res.push({
			type: cert.type,
			label:
				cert.type === "other"
					? (cert.customLabel ?? CERTIFICATION_LABELS.other)
					: CERTIFICATION_LABELS[cert.type],
			weight,
			verified: cert.verified,
		});
	}
	return res;
};

export const certRelevanceScore = (
	category: IncidentCategory,
	certifications: Certification[],
): { score: number; matched: MatchedCert[] } => {
	const matched = getMatchedCerts(category, certifications);
	if (matched.length === 0) return { score: 0, matched };
	let weightedSum = 0;
	let verifiedWeight = 0;
	for (const m of matched) {
		weightedSum += m.weight * (m.verified ? 1 : 0.5);
		verifiedWeight += m.weight;
	}
	return { score: weightedSum / Math.max(1, verifiedWeight), matched };
};
