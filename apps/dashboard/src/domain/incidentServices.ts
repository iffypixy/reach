import type { IncidentType, ServiceType } from "~/domain/types";

export const INCIDENT_SERVICES: Record<IncidentType, ServiceType[]> = {
	"cardiac-arrest": ["ambulance", "police"],
	"breathing-difficulty": ["ambulance"],
	stroke: ["ambulance", "police"],
	"severe-bleeding": ["ambulance", "police"],
	seizure: ["ambulance", "police"],
	overdose: ["ambulance", "police"],
	drowning: ["ambulance", "police", "fire-engine"],
	"diabetic-emergency": ["ambulance"],
	choking: ["ambulance", "police"],
	anaphylaxis: ["ambulance", "police"],
	childbirth: ["ambulance", "police"],
	"mental-health-crisis": ["ambulance", "police"],
	"language-barrier": ["ambulance", "police"],
};

export const INCIDENT_TYPES = Object.keys(INCIDENT_SERVICES) as IncidentType[];

export const TYPE_LABEL: Record<IncidentType, string> = {
	"cardiac-arrest": "Cardiac Arrest",
	"breathing-difficulty": "Breathing Difficulty",
	stroke: "Stroke",
	"severe-bleeding": "Severe Bleeding",
	seizure: "Seizure",
	overdose: "Overdose / Poisoning",
	drowning: "Drowning",
	"diabetic-emergency": "Diabetic Emergency",
	choking: "Choking",
	anaphylaxis: "Anaphylaxis",
	childbirth: "Childbirth Emergency",
	"mental-health-crisis": "Mental Health Crisis",
	"language-barrier": "Language Barrier",
};
