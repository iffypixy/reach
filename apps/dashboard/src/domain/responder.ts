export type CertificationType =
	| "cpr_aed"
	| "medical_professional"
	| "water_rescue"
	| "mountain_wilderness_rescue"
	| "fire_safety"
	| "road_accident_response"
	| "mental_health_first_aid"
	| "other";

export type Certification = {
	id: string;
	type: CertificationType;
	customLabel?: string;
	verified: boolean;
};

export type Responder = {
	id: string;
	firstName: string;
	lastName: string;
	email?: string;
	phone?: string;
	createdAt: string;
	lat: number;
	lng: number;
	certifications: Certification[];
};

export const CERTIFICATION_TYPES: CertificationType[] = [
	"cpr_aed",
	"medical_professional",
	"water_rescue",
	"mountain_wilderness_rescue",
	"fire_safety",
	"road_accident_response",
	"mental_health_first_aid",
	"other",
];

export const CERTIFICATION_LABELS: Record<CertificationType, string> = {
	cpr_aed: "CPR / AED",
	medical_professional: "Medical Professional",
	water_rescue: "Water Rescue",
	mountain_wilderness_rescue: "Mountain / Wilderness Rescue",
	fire_safety: "Fire Safety / First Responder",
	road_accident_response: "Road Traffic Accident Response",
	mental_health_first_aid: "Mental Health First Aid",
	other: "Other",
};
