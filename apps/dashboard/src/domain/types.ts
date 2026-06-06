export type ServiceCategory = "police" | "medical" | "fire";

export type IncidentCategory =
	| "cardiacArrest"
	| "injuryTrauma"
	| "breathingDifficulty"
	| "buildingFire"
	| "gasLeak"
	| "vehicleFire"
	| "assault"
	| "robbery"
	| "trafficAccident";

export type Coord = { lat: number; lng: number };

export type Station = {
	id: string;
	name: string;
	service: ServiceCategory;
	lat: number;
	lng: number;
};

export type DispatchUnit = {
	id: string;
	service: ServiceCategory;
	stationId: string;
	stationName: string;
	from: Coord;
	route: [number, number][];
	etaMinutes: number;
	createdAt: number;
	arrived: boolean;
};

export type Incident = {
	id: string;
	category: IncidentCategory;
	title: string;
	severity: "low" | "medium" | "high";
	description: string;
	lat: number;
	lng: number;
	address?: string;
	createdAt: number;
	source: "seed" | "operator";
	dispatchUnits: DispatchUnit[];
	respondersContacted: boolean;
};

export type AddIncidentInput = {
	category: IncidentCategory;
	lat: number;
	lng: number;
	address?: string;
};
