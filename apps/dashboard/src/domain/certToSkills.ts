import type { CertificationType, IncidentType } from "~/domain/types";

export const CERT_TO_SKILLS: Record<CertificationType, IncidentType[]> = {
	cpr_aed: ["cardiac-arrest", "choking", "breathing-difficulty", "drowning", "anaphylaxis"],
	medical_professional: [
		"cardiac-arrest",
		"stroke",
		"breathing-difficulty",
		"severe-bleeding",
		"seizure",
		"overdose",
		"diabetic-emergency",
		"anaphylaxis",
		"childbirth",
	],
	water_rescue: ["drowning"],
	mountain_wilderness_rescue: ["severe-bleeding", "drowning"],
	fire_safety: ["severe-bleeding"],
	road_accident_response: ["severe-bleeding", "cardiac-arrest"],
	mental_health_first_aid: ["mental-health-crisis", "overdose", "language-barrier", "seizure"],
	other: ["language-barrier"],
};

export const skillsFromCertifications = (types: CertificationType[]): IncidentType[] => {
	const set = new Set<IncidentType>();
	for (const type of types) for (const skill of CERT_TO_SKILLS[type]) set.add(skill);
	return [...set];
};
