import type { IncidentCategory, ServiceCategory } from "~/domain/types";

export const INCIDENT_SERVICES: Record<IncidentCategory, ServiceCategory[]> = {
	cardiacArrest: ["medical"],
	injuryTrauma: ["medical"],
	breathingDifficulty: ["medical"],
	buildingFire: ["fire"],
	gasLeak: ["fire"],
	vehicleFire: ["fire"],
	assault: ["police"],
	robbery: ["police"],
	trafficAccident: ["medical", "police"],
};

export const SERVICE_COLORS: Record<ServiceCategory, string> = {
	police: "#2563eb",
	medical: "#16a34a",
	fire: "#dc2626",
};

export const SERVICE_LABELS: Record<ServiceCategory, string> = {
	police: "Police",
	medical: "Medical",
	fire: "Fire",
};

export const INCIDENT_LABELS: Record<IncidentCategory, string> = {
	cardiacArrest: "Cardiac arrest",
	injuryTrauma: "Injury / trauma",
	breathingDifficulty: "Breathing difficulty",
	buildingFire: "Building fire",
	gasLeak: "Gas leak",
	vehicleFire: "Vehicle fire",
	assault: "Assault",
	robbery: "Robbery",
	trafficAccident: "Traffic accident",
};

export const INCIDENT_CATEGORIES = Object.keys(INCIDENT_LABELS) as IncidentCategory[];

export const randomEtaMinutes = () => Math.floor(Math.random() * (27 - 15 + 1)) + 15;
