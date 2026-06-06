import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Cross, Flame, HandHelping, Shield } from "lucide-react";
import type { MapRef } from "react-map-gl/mapbox";
import { Layer, Map as MapGL, Marker, Source } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

// ── Types ─────────────────────────────────────────────────────────────────────

type IncidentType =
	| "cardiac-arrest"
	| "breathing-difficulty"
	| "stroke"
	| "severe-bleeding"
	| "seizure"
	| "overdose"
	| "diabetic-emergency"
	| "choking"
	| "anaphylaxis"
	| "childbirth"
	| "mental-health-crisis"
	| "language-barrier";

type ServiceType = "ambulance" | "police" | "fire-engine";

type EmergencyService = {
	id: string;
	type: ServiceType;
	callsign: string;
	coords: [number, number];
	etaMinutes: number;
};

type Incident = {
	id: string;
	type: IncidentType;
	coords: [number, number];
	address: string;
	receivedAt: number;
	callerPhone: string;
	emergencyServices: EmergencyService[];
};

type Ally = {
	id: string;
	name: string;
	phone: string;
	skills: IncidentType[];
	coords: [number, number];
	credentialScore: number;
};

type RouteData = {
	coords: [number, number][];
	distanceM: number;
	durationS: number;
};

// ── Static data ───────────────────────────────────────────────────────────────

const INCIDENTS: Incident[] = [
	{
		id: "inc-001",
		type: "cardiac-arrest",
		coords: [114.1558, 22.2844],
		address: "Des Voeux Rd Central, Central",
		receivedAt: Date.now() - 18000,
		callerPhone: "+852 9123 4567",
		emergencyServices: [
			{ id: "svc-001a", type: "ambulance", callsign: "AMB-10", coords: [114.1532, 22.2818], etaMinutes: 7 },
			{ id: "svc-001b", type: "police", callsign: "UNIT-01", coords: [114.1544, 22.2802], etaMinutes: 5 },
		],
	},
	{
		id: "inc-002",
		type: "choking",
		coords: [114.1567, 22.2866],
		address: "8 Finance St, Central",
		receivedAt: Date.now() - 32000,
		callerPhone: "+852 9456 7890",
		emergencyServices: [
			{ id: "svc-002a", type: "ambulance", callsign: "AMB-11", coords: [114.1532, 22.2818], etaMinutes: 9 },
			{ id: "svc-002b", type: "police", callsign: "UNIT-02", coords: [114.1544, 22.2802], etaMinutes: 6 },
		],
	},
	{
		id: "inc-003",
		type: "breathing-difficulty",
		coords: [114.1689, 22.3096],
		address: "Canton Rd, Tsim Sha Tsui",
		receivedAt: Date.now() - 45000,
		callerPhone: "+852 9234 5678",
		emergencyServices: [
			{ id: "svc-003a", type: "ambulance", callsign: "AMB-12", coords: [114.1958, 22.2898], etaMinutes: 11 },
			{ id: "svc-003b", type: "police", callsign: "UNIT-03", coords: [114.1718, 22.3048], etaMinutes: 7 },
		],
	},
	{
		id: "inc-004",
		type: "severe-bleeding",
		coords: [114.1711, 22.3107],
		address: "Nathan Rd, Mong Kok",
		receivedAt: Date.now() - 58000,
		callerPhone: "+852 9567 8901",
		emergencyServices: [
			{ id: "svc-004a", type: "ambulance", callsign: "AMB-13", coords: [114.1818, 22.3062], etaMinutes: 10 },
			{ id: "svc-004b", type: "police", callsign: "UNIT-04", coords: [114.1842, 22.3018], etaMinutes: 8 },
		],
	},
	{
		id: "inc-005",
		type: "stroke",
		coords: [114.1893, 22.2804],
		address: "Causeway Bay MTR Exit D",
		receivedAt: Date.now() - 75000,
		callerPhone: "+852 9345 6789",
		emergencyServices: [
			{ id: "svc-005a", type: "ambulance", callsign: "AMB-14", coords: [114.1532, 22.2818], etaMinutes: 8 },
			{ id: "svc-005b", type: "police", callsign: "UNIT-05", coords: [114.1544, 22.2802], etaMinutes: 5 },
		],
	},
	{
		id: "inc-006",
		type: "seizure",
		coords: [114.1732, 22.2793],
		address: "Exhibition Rd, Wan Chai",
		receivedAt: Date.now() - 90000,
		callerPhone: "+852 9678 9012",
		emergencyServices: [
			{ id: "svc-006a", type: "ambulance", callsign: "AMB-15", coords: [114.1532, 22.2818], etaMinutes: 10 },
			{ id: "svc-006b", type: "police", callsign: "UNIT-06", coords: [114.1544, 22.2802], etaMinutes: 6 },
		],
	},
	{
		id: "inc-007",
		type: "anaphylaxis",
		coords: [114.1655, 22.2773],
		address: "Pacific Place, Admiralty",
		receivedAt: Date.now() - 110000,
		callerPhone: "+852 9789 0123",
		emergencyServices: [
			{ id: "svc-007a", type: "ambulance", callsign: "AMB-16", coords: [114.1532, 22.2818], etaMinutes: 9 },
			{ id: "svc-007b", type: "police", callsign: "UNIT-07", coords: [114.1544, 22.2802], etaMinutes: 7 },
		],
	},
	{
		id: "inc-008",
		type: "breathing-difficulty",
		coords: [114.1717, 22.2956],
		address: "Middle Rd, Tsim Sha Tsui",
		receivedAt: Date.now() - 130000,
		callerPhone: "+852 9890 1234",
		emergencyServices: [
			{ id: "svc-008a", type: "ambulance", callsign: "AMB-17", coords: [114.1698, 22.3182], etaMinutes: 11 },
			{ id: "svc-008b", type: "police", callsign: "UNIT-08", coords: [114.1718, 22.3048], etaMinutes: 8 },
		],
	},
	{
		id: "inc-009",
		type: "overdose",
		coords: [114.1838, 22.2784],
		address: "Times Square, Causeway Bay",
		receivedAt: Date.now() - 155000,
		callerPhone: "+852 9901 2345",
		emergencyServices: [
			{ id: "svc-009a", type: "ambulance", callsign: "AMB-18", coords: [114.1532, 22.2818], etaMinutes: 9 },
			{ id: "svc-009b", type: "police", callsign: "UNIT-09", coords: [114.1544, 22.2802], etaMinutes: 5 },
		],
	},
	{
		id: "inc-010",
		type: "diabetic-emergency",
		coords: [114.1509, 22.2839],
		address: "Hollywood Rd, Sheung Wan",
		receivedAt: Date.now() - 185000,
		callerPhone: "+852 9012 3456",
		emergencyServices: [
			{ id: "svc-010a", type: "ambulance", callsign: "AMB-19", coords: [114.1532, 22.2818], etaMinutes: 8 },
			{ id: "svc-010b", type: "police", callsign: "UNIT-10", coords: [114.1544, 22.2802], etaMinutes: 6 },
		],
	},
	{
		id: "inc-011",
		type: "mental-health-crisis",
		coords: [114.1903, 22.2852],
		address: "Victoria Park Rd, Causeway Bay",
		receivedAt: Date.now() - 220000,
		callerPhone: "+852 9112 2334",
		emergencyServices: [
			{ id: "svc-011a", type: "ambulance", callsign: "AMB-20", coords: [114.1532, 22.2818], etaMinutes: 10 },
			{ id: "svc-011b", type: "police", callsign: "UNIT-11", coords: [114.1544, 22.2802], etaMinutes: 7 },
		],
	},
	{
		id: "inc-012",
		type: "childbirth",
		coords: [114.1776, 22.3256],
		address: "Prince Edward Rd, Mong Kok East",
		receivedAt: Date.now() - 260000,
		callerPhone: "+852 9223 3445",
		emergencyServices: [
			{ id: "svc-012a", type: "ambulance", callsign: "AMB-21", coords: [114.1958, 22.2898], etaMinutes: 12 },
			{ id: "svc-012b", type: "police", callsign: "UNIT-12", coords: [114.1718, 22.3048], etaMinutes: 8 },
		],
	},
	{
		id: "inc-013",
		type: "language-barrier",
		coords: [114.1729, 22.3033],
		address: "Austin Rd, Jordan",
		receivedAt: Date.now() - 310000,
		callerPhone: "+852 9334 4556",
		emergencyServices: [
			{ id: "svc-013a", type: "ambulance", callsign: "AMB-22", coords: [114.1818, 22.3062], etaMinutes: 7 },
			{ id: "svc-013b", type: "police", callsign: "UNIT-13", coords: [114.1842, 22.3018], etaMinutes: 5 },
		],
	},
	{
		id: "inc-014",
		type: "cardiac-arrest",
		coords: [114.1304, 22.2835],
		address: "Belcher's St, Kennedy Town",
		receivedAt: Date.now() - 360000,
		callerPhone: "+852 9445 5667",
		emergencyServices: [
			{ id: "svc-014a", type: "ambulance", callsign: "AMB-23", coords: [114.1532, 22.2818], etaMinutes: 9 },
			{ id: "svc-014b", type: "police", callsign: "UNIT-14", coords: [114.1544, 22.2802], etaMinutes: 6 },
		],
	},
	{
		id: "inc-015",
		type: "choking",
		coords: [114.1829, 22.3028],
		address: "Cheong Wan Rd, Hung Hom",
		receivedAt: Date.now() - 420000,
		callerPhone: "+852 9556 6778",
		emergencyServices: [
			{ id: "svc-015a", type: "ambulance", callsign: "AMB-24", coords: [114.1958, 22.2898], etaMinutes: 11 },
			{ id: "svc-015b", type: "police", callsign: "UNIT-15", coords: [114.1718, 22.3048], etaMinutes: 7 },
		],
	},
	{
		id: "inc-016",
		type: "severe-bleeding",
		coords: [114.1639, 22.2787],
		address: "Queensway, Admiralty",
		receivedAt: Date.now() - 510000,
		callerPhone: "+852 9667 7889",
		emergencyServices: [
			{ id: "svc-016a", type: "ambulance", callsign: "AMB-25", coords: [114.1532, 22.2818], etaMinutes: 10 },
			{ id: "svc-016b", type: "police", callsign: "UNIT-16", coords: [114.1544, 22.2802], etaMinutes: 8 },
		],
	},
];

const ALLIES: Ally[] = [
	{ id: "ally-001", name: "Chan Siu Ming", phone: "+85291234567", skills: ["cardiac-arrest", "severe-bleeding", "choking", "anaphylaxis"], coords: [114.1563, 22.2839], credentialScore: 72 },
	{ id: "ally-002", name: "Dr Lee Wai Yee", phone: "+85294567890", skills: ["choking", "cardiac-arrest", "anaphylaxis"], coords: [114.1572, 22.286], credentialScore: 73 },
	{ id: "ally-003", name: "Priya Nair", phone: "+85292345678", skills: ["breathing-difficulty", "cardiac-arrest", "anaphylaxis", "seizure"], coords: [114.1693, 22.3102], credentialScore: 74 },
	{ id: "ally-004", name: "James Cheung", phone: "+85295678901", skills: ["severe-bleeding", "cardiac-arrest", "choking"], coords: [114.1715, 22.3113], credentialScore: 75 },
	{ id: "ally-005", name: "Wong Ka Wai", phone: "+85293456789", skills: ["stroke", "cardiac-arrest", "breathing-difficulty", "seizure"], coords: [114.1898, 22.2798], credentialScore: 76 },
	{ id: "ally-006", name: "Mei Lin Wong", phone: "+85296789012", skills: ["seizure", "cardiac-arrest", "breathing-difficulty"], coords: [114.1736, 22.2787], credentialScore: 77 },
	{ id: "ally-007", name: "Ali Hassan", phone: "+85297890123", skills: ["anaphylaxis", "cardiac-arrest", "choking", "severe-bleeding"], coords: [114.1659, 22.2767], credentialScore: 78 },
	{ id: "ally-008", name: "Sarah Ng", phone: "+85298901234", skills: ["breathing-difficulty", "cardiac-arrest", "anaphylaxis", "seizure"], coords: [114.1722, 22.2962], credentialScore: 79 },
	{ id: "ally-009", name: "David Chan", phone: "+85299012345", skills: ["overdose", "mental-health-crisis", "seizure"], coords: [114.1843, 22.2779], credentialScore: 80 },
	{ id: "ally-010", name: "Maria Santos", phone: "+85290123456", skills: ["diabetic-emergency", "cardiac-arrest", "stroke", "breathing-difficulty"], coords: [114.1513, 22.2833], credentialScore: 81 },
	{ id: "ally-011", name: "Kevin Lam", phone: "+85291122334", skills: ["mental-health-crisis", "language-barrier", "overdose"], coords: [114.1907, 22.2846], credentialScore: 82 },
	{ id: "ally-012", name: "Fiona Tsang", phone: "+85292233445", skills: ["childbirth", "severe-bleeding", "breathing-difficulty"], coords: [114.178, 22.3262], credentialScore: 83 },
	{ id: "ally-013", name: "Raj Patel", phone: "+85293344556", skills: ["language-barrier", "mental-health-crisis", "childbirth"], coords: [114.1733, 22.3039], credentialScore: 84 },
	{ id: "ally-014", name: "Emily Ho", phone: "+85294455667", skills: ["cardiac-arrest", "severe-bleeding", "choking", "anaphylaxis"], coords: [114.1308, 22.2829], credentialScore: 85 },
	{ id: "ally-015", name: "Tommy Yip", phone: "+85295566778", skills: ["choking", "cardiac-arrest", "anaphylaxis"], coords: [114.1834, 22.3034], credentialScore: 86 },
	{ id: "ally-016", name: "Grace Liu", phone: "+85296677889", skills: ["severe-bleeding", "cardiac-arrest", "choking"], coords: [114.1643, 22.2782], credentialScore: 87 },
	{ id: "ally-017", name: "Dr Lee Wai Yee", phone: "+85294567890", skills: ["cardiac-arrest", "stroke", "breathing-difficulty", "diabetic-emergency", "seizure"], coords: [114.1683, 22.2798], credentialScore: 98 },
	{ id: "ally-018", name: "David Chan", phone: "+85299012345", skills: ["choking", "cardiac-arrest", "severe-bleeding", "anaphylaxis"], coords: [114.1703, 22.3178], credentialScore: 91 },
	{ id: "ally-019", name: "Priya Nair", phone: "+85292345678", skills: ["mental-health-crisis", "overdose", "language-barrier"], coords: [114.1822, 22.2783], credentialScore: 71 },
	{ id: "ally-020", name: "Sarah Ng", phone: "+85298901234", skills: ["childbirth", "breathing-difficulty", "anaphylaxis", "diabetic-emergency"], coords: [114.1693, 22.3128], credentialScore: 85 },
];

// ── Design tokens ─────────────────────────────────────────────────────────────

const Z = {
	primary: "#EC0016",
	secondary: "#0C3992",
	text: "#d8dce3",
	muted: "rgba(216, 220, 227, 0.52)",
	bg: "#0b0d12",
	surface: "#12151b",
	border: "rgba(255, 255, 255, 0.08)",
	borderSubtle: "rgba(255, 255, 255, 0.04)",
	font: '"DB Screen Sans", "Inter", system-ui, -apple-system, sans-serif',
	fontHead: '"DB Screen Head", "DB Screen Sans", "Inter", system-ui, sans-serif',
	ambulance: "#EF4444",
	police: "#60A5FA",
	fire: "#F97316",
} as const;

const panelLabel: CSSProperties = {
	color: Z.muted,
	fontSize: 11,
	fontWeight: 500,
	marginBottom: 6,
};

// ── Labels, icons & colors per type ──────────────────────────────────────────

const TYPE_COLOR: Record<IncidentType, string> = {
	"cardiac-arrest":       "#EF4444",
	"breathing-difficulty": "#F97316",
	"stroke":               "#7C3AED",
	"severe-bleeding":      "#DC2626",
	"seizure":              "#9333EA",
	"overdose":             "#0891B2",
	"diabetic-emergency":   "#D97706",
	"choking":              "#EA580C",
	"anaphylaxis":          "#BE123C",
	"childbirth":           "#BE185D",
	"mental-health-crisis": "#4338CA",
	"language-barrier":     "#475569",
};

const TYPE_CODE: Record<IncidentType, string> = {
	"cardiac-arrest":       "CA",
	"breathing-difficulty": "BD",
	"stroke":               "ST",
	"severe-bleeding":      "SB",
	"seizure":              "SZ",
	"overdose":             "OD",
	"diabetic-emergency":   "DI",
	"choking":              "CK",
	"anaphylaxis":          "AX",
	"childbirth":           "CB",
	"mental-health-crisis": "MH",
	"language-barrier":     "LB",
};

const TYPE_LABEL: Record<IncidentType, string> = {
	"cardiac-arrest":       "Cardiac Arrest",
	"breathing-difficulty": "Breathing Difficulty",
	"stroke":               "Stroke",
	"severe-bleeding":      "Severe Bleeding",
	"seizure":              "Seizure",
	"overdose":             "Overdose / Poisoning",
	"diabetic-emergency":   "Diabetic Emergency",
	"choking":              "Choking",
	"anaphylaxis":          "Anaphylaxis",
	"childbirth":           "Childbirth Emergency",
	"mental-health-crisis": "Mental Health Crisis",
	"language-barrier":     "Language Barrier",
};

// Lower number = higher clinical urgency. Used for queue order and map pulse.
const TYPE_PRIORITY: Record<IncidentType, number> = {
	"cardiac-arrest":       1,
	"choking":              1,
	"anaphylaxis":          1,
	"severe-bleeding":      1,
	"stroke":               2,
	"breathing-difficulty": 2,
	"seizure":              2,
	"overdose":             2,
	"diabetic-emergency":   3,
	"childbirth":           3,
	"mental-health-crisis": 3,
	"language-barrier":     4,
};

const PRIORITY_PULSE: Record<number, string> = { 1: "1.5s", 2: "2.8s" };

const compareIncidents = (a: Incident, b: Incident): number =>
	TYPE_PRIORITY[a.type] - TYPE_PRIORITY[b.type] || a.receivedAt - b.receivedAt;

const MAP_ICON_SIZE = 13;
const MAP_ICON_STROKE = 2.5;

const SVC_ICON: Record<ServiceType, ReactNode> = {
	ambulance:     <Cross        size={MAP_ICON_SIZE} color="white" strokeWidth={MAP_ICON_STROKE} />,
	police:        <Shield       size={MAP_ICON_SIZE} color="white" strokeWidth={MAP_ICON_STROKE} />,
	"fire-engine": <Flame        size={MAP_ICON_SIZE} color="white" strokeWidth={MAP_ICON_STROKE} />,
};

const SVC_LABEL: Record<ServiceType, string> = {
	ambulance:     "Ambulance",
	police:        "Police",
	"fire-engine": "Fire Engine",
};

const svcColor = (type: ServiceType): string => {
	if (type === "ambulance") return Z.ambulance;
	if (type === "police") return Z.police;
	if (type === "fire-engine") return Z.fire;
	const _: never = type;
	return _;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatElapsed = (epochMs: number): string => {
	const secs = Math.floor((Date.now() - epochMs) / 1000);
	if (secs < 60) return `${secs}s`;
	if (secs < 3600) return `${Math.floor(secs / 60)}m`;
	return `${Math.floor(secs / 3600)}h`;
};

const formatDuration = (secs: number): string =>
	secs < 90 ? `<1 min` : `${Math.round(secs / 60)} min`;

const formatDist = (m: number): string =>
	m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;

type MapFocus = { kind: "ally"; id: string } | { kind: "service"; id: string };

const allyMapLabel = (rank: number): string => (rank === 0 ? "Best Ally" : `Ally #${rank + 1}`);

const serviceMapLabel = (svc: EmergencyService, all: EmergencyService[]): string => {
	const peers = all.filter((s) => s.type === svc.type);
	if (peers.length <= 1) return SVC_LABEL[svc.type];
	return `${SVC_LABEL[svc.type]} #${peers.findIndex((s) => s.id === svc.id) + 1}`;
};

const mapPillStyle = (
	color: string,
	emphasis: "primary" | "secondary",
	focused: boolean,
): CSSProperties => ({
	display: "flex",
	alignItems: "center",
	gap: 5,
	background: color,
	borderRadius: 20,
	padding: "5px 9px 5px 7px",
	border: `1px solid rgba(255,255,255,${emphasis === "primary" ? "0.2" : "0.14"})`,
	boxShadow: "0 1px 4px rgba(0,0,0,0.35)",
	outline: focused ? `2px solid ${color}` : "none",
	outlineOffset: 1,
	whiteSpace: "nowrap",
	fontFamily: Z.font,
	cursor: "pointer",
});

const routeKey = (from: [number, number], to: [number, number], profile: string) =>
	`${from[0].toFixed(4)},${from[1].toFixed(4)};${to[0].toFixed(4)},${to[1].toFixed(4)};${profile}`;

function haversineM([lng1, lat1]: [number, number], [lng2, lat2]: [number, number]): number {
	const R = 6_371_000;
	const dLat = ((lat2 - lat1) * Math.PI) / 180;
	const dLng = ((lng2 - lng1) * Math.PI) / 180;
	const a =
		Math.sin(dLat / 2) ** 2 +
		Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
	return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function fetchRoute(
	from: [number, number],
	to: [number, number],
	profile: "walking" | "driving",
	token: string,
): Promise<RouteData> {
	const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${from[0]},${from[1]};${to[0]},${to[1]}?geometries=geojson&access_token=${token}`;
	try {
		const res = await fetch(url);
		const json = (await res.json()) as {
			routes?: Array<{
				geometry: { coordinates: [number, number][] };
				distance: number;
				duration: number;
			}>;
		};
		const route = json.routes?.[0];
		if (!route) throw new Error("no route");
		return { coords: route.geometry.coordinates, distanceM: route.distance, durationS: route.duration };
	} catch {
		const d = haversineM(from, to);
		return {
			coords: [from, to],
			distanceM: d,
			durationS: profile === "walking" ? d / 1.4 : d / 8,
		};
	}
}

function interpolateRoute(coords: [number, number][], t: number): [number, number] {
	if (coords.length < 2) return coords[0] ?? [0, 0];
	if (t <= 0) return coords[0];
	if (t >= 1) return coords[coords.length - 1];
	let totalLen = 0;
	const segLens: number[] = [];
	for (let i = 1; i < coords.length; i++) {
		const dx = coords[i][0] - coords[i - 1][0];
		const dy = coords[i][1] - coords[i - 1][1];
		const len = Math.sqrt(dx * dx + dy * dy);
		segLens.push(len);
		totalLen += len;
	}
	let acc = 0;
	const target = t * totalLen;
	for (let i = 0; i < segLens.length; i++) {
		if (acc + segLens[i] >= target) {
			const segT = (target - acc) / segLens[i];
			return [
				coords[i][0] + segT * (coords[i + 1][0] - coords[i][0]),
				coords[i][1] + segT * (coords[i + 1][1] - coords[i][1]),
			];
		}
		acc += segLens[i];
	}
	return coords[coords.length - 1];
}

const buildRadiusGeoJSON = (
	[lng, lat]: [number, number],
	radiusKm: number,
): GeoJSON.Feature<GeoJSON.Polygon> => {
	const steps = 64;
	const coords = Array.from({ length: steps + 1 }, (_, i) => {
		const angle = ((i % steps) / steps) * 2 * Math.PI;
		return [
			lng + (radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180))) * Math.sin(angle),
			lat + (radiusKm / 111.32) * Math.cos(angle),
		] as [number, number];
	});
	return { type: "Feature", geometry: { type: "Polygon", coordinates: [coords] }, properties: {} };
};

// ── Module-level route cache ───────────────────────────────────────────────────
const routeCache = new Map<string, RouteData>();

const estimateWalkS = (from: [number, number], to: [number, number]): number =>
	haversineM(from, to) / 1.4;

const bestAllyEtaS = (incident: Incident): number | null => {
	const matched = ALLIES.filter((a) => a.skills.includes(incident.type));
	if (!matched.length) return null;
	return Math.min(
		...matched.map((a) => {
			const cached = routeCache.get(routeKey(a.coords, incident.coords, "walking"));
			return cached?.durationS ?? estimateWalkS(a.coords, incident.coords);
		}),
	);
};

const fastestServiceEtaS = (incident: Incident): number =>
	Math.min(
		...incident.emergencyServices.map((svc) => {
			const cached = routeCache.get(routeKey(svc.coords, incident.coords, "driving"));
			return cached?.durationS ?? svc.etaMinutes * 60;
		}),
	);

const isAllyViable = (incident: Incident): boolean => {
	const allyEta = bestAllyEtaS(incident);
	if (allyEta === null) return false;
	return allyEta < fastestServiceEtaS(incident);
};

// ── Components ────────────────────────────────────────────────────────────────

const IncidentSidebar = ({
	incidents,
	selectedId,
	onSelect,
}: {
	incidents: Incident[];
	selectedId: string | null;
	onSelect: (id: string) => void;
}) => (
	<div
		style={{
			position: "absolute",
			top: 0,
			left: 0,
			width: 272,
			height: "100%",
			background: Z.bg,
			borderRight: `1px solid ${Z.border}`,
			display: "flex",
			flexDirection: "column",
			zIndex: 10,
			fontFamily: Z.font,
		}}
	>
		<div
			style={{
				padding: "16px 16px 14px",
				borderBottom: `1px solid ${Z.border}`,
			}}
		>
			<div
				style={{
					fontFamily: Z.fontHead,
					fontSize: 17,
					fontWeight: 900,
					color: Z.text,
					letterSpacing: "0.06em",
					textTransform: "uppercase",
					lineHeight: 1,
				}}
			>
				Soteria
			</div>
			<div style={{ color: Z.muted, fontSize: 11, marginTop: 5 }}>
				{incidents.length} in queue
			</div>
		</div>

		{/* List — clinical priority, then longest waiting */}
		<div style={{ flex: 1, overflowY: "auto" }}>
			{incidents.length === 0 ? (
				<div style={{ padding: "16px", color: Z.muted, fontSize: 12, lineHeight: 1.5 }}>
					Queue empty
				</div>
			) : (
				incidents.map((inc) => (
					<IncidentCard
						key={inc.id}
						incident={inc}
						selected={inc.id === selectedId}
						onSelect={() => onSelect(inc.id)}
					/>
				))
			)}
		</div>

		<div
			style={{
				padding: "10px 16px",
				borderTop: `1px solid ${Z.borderSubtle}`,
				color: Z.muted,
				fontSize: 11,
			}}
		>
			999 dispatch · shift 4
		</div>
	</div>
);

const IncidentCard = ({
	incident,
	selected,
	onSelect,
}: {
	incident: Incident;
	selected: boolean;
	onSelect: () => void;
}) => {
	const typeColor = TYPE_COLOR[incident.type];
	return (
		<button
			type="button"
			onClick={onSelect}
			style={{
				width: "100%",
				background: selected ? Z.surface : "transparent",
				border: "none",
				borderLeft: `3px solid ${selected ? typeColor : "transparent"}`,
				borderBottom: `1px solid ${Z.borderSubtle}`,
				padding: "11px 16px",
				cursor: "pointer",
				textAlign: "left",
				fontFamily: Z.font,
			}}
		>
			<div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 3 }}>
				<span style={{ color: Z.text, fontSize: 12, fontWeight: 600 }}>
					{TYPE_LABEL[incident.type]}
				</span>
				<span style={{ color: Z.muted, fontSize: 11, flexShrink: 0 }}>
					{formatElapsed(incident.receivedAt)}
				</span>
			</div>
			<div
				style={{
					color: Z.muted,
					fontSize: 11,
					lineHeight: 1.4,
					overflow: "hidden",
					textOverflow: "ellipsis",
					whiteSpace: "nowrap",
				}}
			>
				{incident.address}
			</div>
		</button>
	);
};

const IncidentMarker = ({
	incident,
	selected,
	onClick,
}: {
	incident: Incident;
	selected: boolean;
	onClick: () => void;
}) => {
	const typeColor = TYPE_COLOR[incident.type];
	const pulseDuration = PRIORITY_PULSE[TYPE_PRIORITY[incident.type]];
	const showPulse = !!pulseDuration;
	return (
		<Marker longitude={incident.coords[0]} latitude={incident.coords[1]} anchor="center">
			<button
				type="button"
				onClick={onClick}
				style={{
					background: "none",
					border: "none",
					padding: 0,
					cursor: "pointer",
					width: 54,
					height: 54,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					position: "relative",
					transition: "opacity 0.2s",
				}}
				aria-label={`${TYPE_LABEL[incident.type]} incident`}
			>
				{showPulse && (
					<>
						<span
							style={{
								position: "absolute",
								inset: 0,
								borderRadius: "50%",
								border: `1.5px solid ${typeColor}`,
								animation: `pulseRing ${pulseDuration} cubic-bezier(0.215, 0.61, 0.355, 1) infinite`,
							}}
						/>
						<span
							style={{
								position: "absolute",
								inset: 0,
								borderRadius: "50%",
								border: `1.5px solid ${typeColor}`,
								animation: `pulseRing ${pulseDuration} cubic-bezier(0.215, 0.61, 0.355, 1) infinite`,
								animationDelay: `${parseFloat(pulseDuration) * 0.5}s`,
							}}
						/>
					</>
				)}

				{/* Type-coloured badge — matches responding unit pill style */}
				<span
					style={{
						position: "relative",
						zIndex: 1,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						background: typeColor,
						borderRadius: 20,
						padding: "5px 10px",
						color: "#fff",
						fontSize: 10,
						fontWeight: 800,
						letterSpacing: "0.04em",
						fontFamily: Z.font,
						border: "1.5px solid rgba(255,255,255,0.25)",
						outline: selected ? `2px solid #fff` : "none",
						outlineOffset: 2,
						boxShadow: "0 1px 5px rgba(0,0,0,0.4)",
					}}
				>
					{TYPE_CODE[incident.type]}
				</span>
			</button>
		</Marker>
	);
};

const AllyMarker = ({
	ally,
	rank,
	focused,
	onClick,
}: {
	ally: Ally;
	rank: number;
	focused: boolean;
	onClick: () => void;
}) => {
	const isPrimary = rank === 0;
	const dimmed = !isPrimary && !focused;
	return (
		<Marker longitude={ally.coords[0]} latitude={ally.coords[1]} anchor="center">
			<div
				style={{
					position: "relative",
					width: isPrimary ? 72 : 56,
					height: isPrimary ? 48 : 36,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					opacity: dimmed ? 0.42 : 1,
					transition: "opacity 0.2s ease",
				}}
			>
				{isPrimary && (
					<>
						<span
							style={{
								position: "absolute",
								inset: 0,
								borderRadius: "50%",
								border: `1.5px solid ${Z.secondary}`,
								animation: "pulseRing 2.4s cubic-bezier(0.215, 0.61, 0.355, 1) infinite",
							}}
						/>
						<span
							style={{
								position: "absolute",
								inset: 0,
								borderRadius: "50%",
								border: `1.5px solid ${Z.secondary}`,
								animation: "pulseRing 2.4s cubic-bezier(0.215, 0.61, 0.355, 1) infinite",
								animationDelay: "1.2s",
							}}
						/>
					</>
				)}
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						onClick();
					}}
					style={{
						...mapPillStyle(
							isPrimary || focused ? Z.secondary : "rgba(12, 57, 146, 0.55)",
							isPrimary ? "primary" : "secondary",
							focused,
						),
						position: "relative",
						zIndex: 1,
					}}
					aria-label={`${allyMapLabel(rank)} — tap for details`}
				>
					<HandHelping size={MAP_ICON_SIZE} color="white" strokeWidth={MAP_ICON_STROKE} />
					<span style={{ color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: "0.04em" }}>
						{allyMapLabel(rank)}
					</span>
				</button>
			</div>
		</Marker>
	);
};

const VehicleMarker = ({
	svc,
	pos,
	label,
	focused,
	onClick,
}: {
	svc: EmergencyService;
	pos: [number, number];
	label: string;
	focused: boolean;
	onClick: () => void;
}) => {
	const color = svcColor(svc.type);
	return (
		<Marker longitude={pos[0]} latitude={pos[1]} anchor="center">
			<button
				type="button"
				onClick={(e) => {
					e.stopPropagation();
					onClick();
				}}
				style={mapPillStyle(color, "primary", focused)}
				aria-label={`${label} — tap for details`}
			>
				{SVC_ICON[svc.type]}
				<span style={{ color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: "0.04em" }}>
					{label}
				</span>
			</button>
		</Marker>
	);
};

// Fixed source/layer IDs — only data updates when the selected incident changes.
const visibleAllyRoutes = (allies: Ally[], focusedAllyId: string | null): Ally[] => {
	if (!allies.length) return [];
	const primary = allies[0];
	if (!focusedAllyId || focusedAllyId === primary.id) return [primary];
	return allies.filter((a) => a.id === focusedAllyId);
};

const RouteLayer = ({
	allies,
	allyRoutes,
	services,
	serviceRoutes,
	incident,
	focusedAllyId,
}: {
	allies: Ally[];
	allyRoutes: Record<string, RouteData>;
	services: EmergencyService[];
	serviceRoutes: Record<string, RouteData>;
	incident: Incident;
	focusedAllyId: string | null;
}) => {
	const routedAllies = useMemo(
		() => visibleAllyRoutes(allies, focusedAllyId),
		[allies, focusedAllyId],
	);

	const data = useMemo(
		(): GeoJSON.FeatureCollection => ({
			type: "FeatureCollection",
			features: [
				...routedAllies.map((ally) => ({
					type: "Feature" as const,
					geometry: {
						type: "LineString" as const,
						coordinates: allyRoutes[ally.id]?.coords ?? [ally.coords, incident.coords],
					},
					properties: { routeType: "ally" },
				})),
				...services.map((svc) => ({
					type: "Feature" as const,
					geometry: {
						type: "LineString" as const,
						coordinates: serviceRoutes[svc.id]?.coords ?? [svc.coords, incident.coords],
					},
					properties: { routeType: "service", svcType: svc.type },
				})),
			],
		}),
		[routedAllies, allyRoutes, services, serviceRoutes, incident],
	);

	return (
		<Source id="sel-routes" type="geojson" data={data}>
			<Layer
				id="sel-ally-routes"
				type="line"
				filter={["==", ["get", "routeType"], "ally"]}
				layout={{ "line-join": "round", "line-cap": "round" }}
				paint={{
					"line-color": "#3B82F6",
					"line-width": 2.5,
					"line-opacity": 0.9,
					"line-dasharray": [5, 4],
				}}
			/>
			<Layer
				id="sel-svc-routes"
				type="line"
				filter={["==", ["get", "routeType"], "service"]}
				layout={{ "line-join": "round", "line-cap": "round" }}
				paint={{
					"line-color": [
						"match", ["get", "svcType"],
						"ambulance", Z.ambulance,
						"police", Z.police,
						"fire-engine", Z.fire,
						"#888",
					],
					"line-width": 1.8,
					"line-opacity": 0.7,
				}}
			/>
		</Source>
	);
};

const RadiusCircle = ({ coords }: { coords: [number, number] }) => (
	<Source id="sel-radius" type="geojson" data={buildRadiusGeoJSON(coords, 5)}>
		<Layer
			id="sel-radius-fill"
			type="fill"
			paint={{ "fill-color": Z.secondary, "fill-opacity": 0.04 }}
		/>
		<Layer
			id="sel-radius-line"
			type="line"
			paint={{
				"line-color": Z.secondary,
				"line-width": 0.75,
				"line-opacity": 0.22,
				"line-dasharray": [4, 3],
			}}
		/>
	</Source>
);

const MapEntityDetail = ({
	focus,
	incident,
	allies,
	allyRoutes,
	serviceRoutes,
	serviceProgress,
	onClose,
}: {
	focus: MapFocus;
	incident: Incident;
	allies: Ally[];
	allyRoutes: Record<string, RouteData>;
	serviceRoutes: Record<string, RouteData>;
	serviceProgress: Record<string, number>;
	onClose: () => void;
}) => {
	if (focus.kind === "ally") {
		const rank = allies.findIndex((a) => a.id === focus.id);
		const ally = allies[rank];
		if (!ally) return null;
		const route = allyRoutes[ally.id];
		const label = allyMapLabel(rank);
		return (
			<div
				style={{
					background: Z.surface,
					border: `1px solid ${Z.border}`,
					borderRadius: 6,
					padding: "14px 16px",
					maxWidth: 380,
					width: "100%",
					boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
					fontFamily: Z.font,
					pointerEvents: "auto",
				}}
			>
				<div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
					<div
						style={{
							width: 32,
							height: 32,
							borderRadius: 4,
							background: Z.secondary,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							flexShrink: 0,
						}}
					>
						<HandHelping size={MAP_ICON_SIZE} color="white" strokeWidth={MAP_ICON_STROKE} />
					</div>
					<div style={{ flex: 1, minWidth: 0 }}>
						<div style={{ color: Z.text, fontSize: 14, fontWeight: 600, marginBottom: 2 }}>
							{ally.name}
						</div>
						<div style={{ color: Z.muted, fontSize: 12, marginBottom: 6 }}>{label}</div>
						<div style={{ color: Z.muted, fontSize: 11, lineHeight: 1.5 }}>
							{route ? (
								<>
									{formatDuration(route.durationS)} walk · {formatDist(route.distanceM)}
								</>
							) : (
								"route pending"
							)}
							{" · "}
							{ally.credentialScore} cred
						</div>
					</div>
					<button
						type="button"
						onClick={onClose}
						style={{
							background: "none",
							border: "none",
							color: Z.muted,
							cursor: "pointer",
							fontSize: 18,
							padding: 0,
							lineHeight: 1,
							flexShrink: 0,
						}}
						aria-label="Close"
					>
						×
					</button>
				</div>
				<a
					href={`tel:${ally.phone}`}
					style={{
						display: "block",
						textAlign: "center",
						background: Z.primary,
						color: "#fff",
						fontSize: 12,
						fontWeight: 600,
						padding: "9px 0",
						borderRadius: 4,
						textDecoration: "none",
						marginTop: 12,
					}}
				>
					Call
				</a>
			</div>
		);
	}

	const svc = incident.emergencyServices.find((s) => s.id === focus.id);
	if (!svc) return null;
	const color = svcColor(svc.type);
	const label = serviceMapLabel(svc, incident.emergencyServices);
	const route = serviceRoutes[svc.id];
	const progress = serviceProgress[svc.id] ?? 0;
	const etaRemaining = route
		? Math.max(0, route.durationS * (1 - progress))
		: svc.etaMinutes * 60 * (1 - progress);
	const pct = Math.min(progress * 100, 100);

	return (
		<div
			style={{
				background: Z.surface,
				border: `1px solid ${Z.border}`,
				borderRadius: 6,
				padding: "14px 16px",
				maxWidth: 380,
				width: "100%",
				boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
				fontFamily: Z.font,
				pointerEvents: "auto",
			}}
		>
			<div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
				<div
					style={{
						width: 32,
						height: 32,
						borderRadius: 4,
						background: color,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						flexShrink: 0,
					}}
				>
					{SVC_ICON[svc.type]}
				</div>
				<div style={{ flex: 1, minWidth: 0 }}>
					<div style={{ color: Z.text, fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{label}</div>
					<div style={{ color: Z.muted, fontSize: 12, marginBottom: 8 }}>{svc.callsign}</div>
					<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
						<span style={{ color: Z.muted, fontSize: 11 }}>
							{pct >= 99 ? "On scene" : "ETA"}
						</span>
						<span style={{ color, fontSize: 12, fontWeight: 600 }}>
							{pct >= 99 ? "Arrived" : formatDuration(etaRemaining)}
						</span>
					</div>
					<div
						style={{
							height: 3,
							background: Z.borderSubtle,
							borderRadius: 2,
							overflow: "hidden",
						}}
					>
						<div
							style={{
								height: "100%",
								width: `${pct}%`,
								background: color,
								borderRadius: 2,
								transition: "width 0.2s linear",
							}}
						/>
					</div>
					{route && (
						<div style={{ color: Z.muted, fontSize: 11, marginTop: 6 }}>
							{formatDist(route.distanceM)} out
						</div>
					)}
				</div>
				<button
					type="button"
					onClick={onClose}
					style={{
						background: "none",
						border: "none",
						color: Z.muted,
						cursor: "pointer",
						fontSize: 18,
						padding: 0,
						lineHeight: 1,
						flexShrink: 0,
					}}
					aria-label="Close"
				>
					×
				</button>
			</div>
		</div>
	);
};

const AllyPanel = ({
	incident,
	allies,
	allyRoutes,
	serviceRoutes,
	serviceProgress,
	mapFocus,
	onMapFocus,
	onClose,
}: {
	incident: Incident;
	allies: Ally[];
	allyRoutes: Record<string, RouteData>;
	serviceRoutes: Record<string, RouteData>;
	serviceProgress: Record<string, number>;
	mapFocus: MapFocus | null;
	onMapFocus: (focus: MapFocus | null) => void;
	onClose: () => void;
}) => {
	const typeColor = TYPE_COLOR[incident.type];
	return (
		<div
			style={{
				position: "absolute",
				top: 0,
				right: 0,
				width: 292,
				height: "100%",
				background: Z.bg,
				borderLeft: `1px solid ${Z.border}`,
				display: "flex",
				flexDirection: "column",
				zIndex: 10,
				fontFamily: Z.font,
			}}
		>
			{/* Panel header */}
			<div
				style={{
					padding: "14px 16px 12px",
					borderBottom: `1px solid ${Z.border}`,
					display: "flex",
					alignItems: "flex-start",
					gap: 10,
				}}
			>
				<div
					style={{
						width: 3,
						alignSelf: "stretch",
						borderRadius: 1,
						background: typeColor,
						flexShrink: 0,
					}}
				/>

				<div style={{ flex: 1, minWidth: 0 }}>
					<div style={{ marginBottom: 2 }}>
						<span style={{ color: Z.text, fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>
							{TYPE_LABEL[incident.type]}
						</span>
					</div>
					<div
						style={{
							color: Z.muted,
							fontSize: 11,
							lineHeight: 1.4,
							overflow: "hidden",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap",
						}}
					>
						{incident.address}
					</div>
					<div style={{ color: Z.muted, fontSize: 10, marginTop: 2 }}>
						{incident.callerPhone} · {formatElapsed(incident.receivedAt)} ago
					</div>
				</div>

				<button
					type="button"
					onClick={onClose}
					style={{
						background: "none",
						border: "none",
						color: Z.muted,
						cursor: "pointer",
						fontSize: 18,
						padding: "0 2px",
						lineHeight: 1,
						flexShrink: 0,
						marginTop: -2,
					}}
					aria-label="Close"
				>
					×
				</button>
			</div>

			<div style={{ flex: 1, overflowY: "auto" }}>
				<div style={{ padding: "12px 14px 0" }}>
					<div style={panelLabel}>Nearest ally</div>
					{allies[0] ? (
						<AllyHeroCard
							ally={allies[0]}
							route={allyRoutes[allies[0].id]}
							focused={mapFocus?.kind === "ally" && mapFocus.id === allies[0].id}
							onSelect={() => onMapFocus({ kind: "ally", id: allies[0].id })}
						/>
					) : (
						<div
							style={{
								color: Z.muted,
								fontSize: 12,
								padding: "12px 0",
								lineHeight: 1.5,
							}}
						>
							No trained allies nearby
						</div>
					)}
				</div>

				{/* Compact list for remaining allies */}
				{allies.length > 1 && (
					<div style={{ padding: "12px 14px 4px" }}>
						<div style={panelLabel}>Backup ({allies.length - 1})</div>
						{allies.slice(1).map((ally, i) => (
							<AllyCompactRow
								key={ally.id}
								ally={ally}
								rank={i + 2}
								route={allyRoutes[ally.id]}
								focused={mapFocus?.kind === "ally" && mapFocus.id === ally.id}
								onSelect={() => onMapFocus({ kind: "ally", id: ally.id })}
							/>
						))}
					</div>
				)}

				{/* Responding units — secondary info */}
				<div
					style={{
						height: 1,
						background: Z.borderSubtle,
						margin: "8px 14px 0",
					}}
				/>
				<div style={{ padding: "10px 14px 4px" }}>
					<div style={panelLabel}>Units</div>
					{incident.emergencyServices.map((svc) => (
						<ServiceRow
							key={svc.id}
							svc={svc}
							label={serviceMapLabel(svc, incident.emergencyServices)}
							route={serviceRoutes[svc.id]}
							progress={serviceProgress[svc.id] ?? 0}
							focused={mapFocus?.kind === "service" && mapFocus.id === svc.id}
							onSelect={() => onMapFocus({ kind: "service", id: svc.id })}
						/>
					))}
				</div>

				<div style={{ height: 12 }} />
			</div>
		</div>
	);
};

const AllyHeroCard = ({
	ally,
	route,
	focused,
	onSelect,
}: {
	ally: Ally;
	route?: RouteData;
	focused: boolean;
	onSelect: () => void;
}) => (
	<div
		style={{
			background: focused ? Z.surface : "transparent",
			border: `1px solid ${focused ? Z.border : Z.borderSubtle}`,
			borderRadius: 4,
			padding: "12px 14px",
			fontFamily: Z.font,
		}}
	>
		<button
			type="button"
			onClick={onSelect}
			style={{
				width: "100%",
				display: "flex",
				alignItems: "flex-start",
				justifyContent: "space-between",
				gap: 10,
				marginBottom: 10,
				background: "none",
				border: "none",
				padding: 0,
				cursor: "pointer",
				textAlign: "left",
				fontFamily: Z.font,
			}}
		>
			<div style={{ flex: 1, minWidth: 0 }}>
				<div style={{ color: Z.text, fontSize: 14, fontWeight: 600, lineHeight: 1.2 }}>
					{ally.name}
				</div>
				<div style={{ color: Z.muted, fontSize: 11, marginTop: 3 }}>
					{ally.credentialScore} cred
				</div>
			</div>
			<HandHelping size={16} color={Z.muted} strokeWidth={2} style={{ flexShrink: 0, marginTop: 2 }} />
		</button>

		{route ? (
			<div style={{ color: Z.muted, fontSize: 12, marginBottom: 12 }}>
				{formatDuration(route.durationS)} walk · {formatDist(route.distanceM)}
			</div>
		) : (
			<div style={{ color: Z.muted, fontSize: 11, marginBottom: 12 }}>route pending</div>
		)}

		<a
			href={`tel:${ally.phone}`}
			style={{
				display: "block",
				textAlign: "center",
				background: Z.primary,
				color: "#fff",
				fontSize: 12,
				fontWeight: 600,
				padding: "9px 0",
				borderRadius: 4,
				textDecoration: "none",
			}}
		>
			Call
		</a>
	</div>
);

const AllyCompactRow = ({
	ally,
	rank,
	route,
	focused,
	onSelect,
}: {
	ally: Ally;
	rank: number;
	route?: RouteData;
	focused: boolean;
	onSelect: () => void;
}) => (
	<div
		style={{
			display: "flex",
			alignItems: "center",
			gap: 8,
			padding: "7px 4px",
			background: focused ? "rgba(12, 57, 146, 0.12)" : "transparent",
			borderTop: `1px solid ${Z.borderSubtle}`,
			fontFamily: Z.font,
			borderRadius: 4,
			opacity: focused ? 1 : 0.55,
			transition: "opacity 0.2s ease",
		}}
	>
		<button
			type="button"
			onClick={onSelect}
			style={{
				flex: 1,
				display: "flex",
				alignItems: "center",
				gap: 8,
				background: "none",
				border: "none",
				padding: 0,
				cursor: "pointer",
				textAlign: "left",
				fontFamily: Z.font,
				minWidth: 0,
			}}
		>
			<div
				style={{
					width: 22,
					height: 22,
					borderRadius: 4,
					background: focused ? Z.secondary : "rgba(12, 57, 146, 0.45)",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					flexShrink: 0,
				}}
			>
				<HandHelping size={11} color="white" strokeWidth={2.5} />
			</div>
			<span
				style={{
					flex: 1,
					color: focused ? Z.text : Z.muted,
					fontSize: 12,
					fontWeight: 500,
					overflow: "hidden",
					textOverflow: "ellipsis",
					whiteSpace: "nowrap",
				}}
			>
				{ally.name}
			</span>
			<span style={{ color: Z.muted, fontSize: 11, flexShrink: 0 }}>
				{route ? formatDuration(route.durationS) : "—"}
			</span>
		</button>
		<a
			href={`tel:${ally.phone}`}
			style={{
				flexShrink: 0,
				color: Z.primary,
				fontSize: 11,
				fontWeight: 500,
				textDecoration: "none",
			}}
		>
			Call
		</a>
	</div>
);

const ServiceRow = ({
	svc,
	label,
	route,
	progress,
	focused,
	onSelect,
}: {
	svc: EmergencyService;
	label: string;
	route?: RouteData;
	progress: number;
	focused: boolean;
	onSelect: () => void;
}) => {
	const color = svcColor(svc.type);
	const etaRemaining = route
		? Math.max(0, route.durationS * (1 - progress))
		: svc.etaMinutes * 60 * (1 - progress);
	const pct = Math.min(progress * 100, 100);
	return (
		<button
			type="button"
			onClick={onSelect}
			style={{
				width: "100%",
				padding: "9px 16px",
				display: "flex",
				alignItems: "center",
				gap: 10,
				background: focused ? color + "12" : "transparent",
				border: "none",
				borderBottom: `1px solid ${Z.borderSubtle}`,
				cursor: "pointer",
				fontFamily: Z.font,
				textAlign: "left",
			}}
		>
			<div
				style={{
					width: 22,
					height: 22,
					borderRadius: 4,
					background: color,
					color: "#fff",
					fontSize: 9,
					fontWeight: 700,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					flexShrink: 0,
				}}
			>
				{SVC_ICON[svc.type]}
			</div>

			<div style={{ flex: 1, minWidth: 0 }}>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						marginBottom: 5,
					}}
				>
					<div style={{ minWidth: 0 }}>
						<div style={{ color: Z.text, fontSize: 11, fontWeight: 600 }}>{label}</div>
						<div style={{ color: Z.muted, fontSize: 9, marginTop: 1 }}>{svc.callsign}</div>
					</div>
					<span style={{ color, fontSize: 10, fontWeight: 600 }}>
						{pct >= 99 ? "On scene" : formatDuration(etaRemaining)}
					</span>
				</div>
				<div
					style={{
						height: 2,
						background: Z.borderSubtle,
						borderRadius: 1,
						overflow: "hidden",
					}}
				>
					<div
						style={{
							height: "100%",
							width: `${pct}%`,
							background: color,
							borderRadius: 1,
							transition: "width 0.2s linear",
						}}
					/>
				</div>
			</div>
		</button>
	);
};

// ── Root ──────────────────────────────────────────────────────────────────────

export const SoteriaMap = () => {
	const mapRef = useRef<MapRef>(null);
	const selectedIdRef = useRef<string | null>(null);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [mapFocus, setMapFocus] = useState<MapFocus | null>(null);
	const [allyRoutes, setAllyRoutes] = useState<Record<string, RouteData>>({});
	const [serviceRoutes, setServiceRoutes] = useState<Record<string, RouteData>>({});
	const [serviceProgress, setServiceProgress] = useState<Record<string, number>>({});
	const [, setTick] = useState(0);

	const eligibleIncidents = useMemo(
		() => [...INCIDENTS].filter(isAllyViable).sort(compareIncidents),
		[],
	);

	const selectedIncident = useMemo(
		() => eligibleIncidents.find((i) => i.id === selectedId) ?? null,
		[selectedId, eligibleIncidents],
	);

	useEffect(() => {
		if (selectedId && !eligibleIncidents.some((i) => i.id === selectedId)) setSelectedId(null);
	}, [selectedId, eligibleIncidents]);

	const rankedAllies = useMemo(() => {
		if (!selectedIncident) return [];
		return ALLIES.filter((a) => a.skills.includes(selectedIncident.type)).sort((a, b) => {
			const ar = allyRoutes[a.id];
			const br = allyRoutes[b.id];
			if (ar && br) return ar.durationS - br.durationS;
			if (ar) return -1;
			if (br) return 1;
			return b.credentialScore - a.credentialScore;
		});
	}, [selectedIncident, allyRoutes]);

	// 1-second ticker for elapsed time displays
	useEffect(() => {
		const id = setInterval(() => setTick((t) => t + 1), 1000);
		return () => clearInterval(id);
	}, []);

	// Fetch routes when selected incident changes
	useEffect(() => {
		selectedIdRef.current = selectedId;
		setMapFocus(null);
		setAllyRoutes({});
		setServiceRoutes({});

		if (!selectedId) {
			setServiceProgress({});
			return;
		}

		const incident = INCIDENTS.find((i) => i.id === selectedId);
		if (!incident) return;

		setServiceProgress(Object.fromEntries(incident.emergencyServices.map((s) => [s.id, 0])));

		const token = import.meta.env.VITE_MAPBOX_TOKEN as string;
		const matched = ALLIES.filter((a) => a.skills.includes(incident.type));

		for (const ally of matched) {
			const key = routeKey(ally.coords, incident.coords, "walking");
			const cached = routeCache.get(key);
			if (cached) {
				setAllyRoutes((prev) => ({ ...prev, [ally.id]: cached }));
				continue;
			}
			fetchRoute(ally.coords, incident.coords, "walking", token).then((data) => {
				if (selectedIdRef.current !== selectedId) return;
				routeCache.set(key, data);
				setAllyRoutes((prev) => ({ ...prev, [ally.id]: data }));
			});
		}

		for (const svc of incident.emergencyServices) {
			const key = routeKey(svc.coords, incident.coords, "driving");
			const cached = routeCache.get(key);
			if (cached) {
				setServiceRoutes((prev) => ({ ...prev, [svc.id]: cached }));
				continue;
			}
			fetchRoute(svc.coords, incident.coords, "driving", token).then((data) => {
				if (selectedIdRef.current !== selectedId) return;
				routeCache.set(key, data);
				setServiceRoutes((prev) => ({ ...prev, [svc.id]: data }));
			});
		}
	}, [selectedId]);

	// Animate service vehicles along their routes
	useEffect(() => {
		if (Object.keys(serviceRoutes).length === 0) return;
		const id = setInterval(() => {
			setServiceProgress((prev) => {
				const next: Record<string, number> = {};
				for (const [svcId, route] of Object.entries(serviceRoutes)) {
					const cur = prev[svcId] ?? 0;
					next[svcId] = cur >= 1 ? 1 : cur + 200 / (route.durationS * 1000);
				}
				return next;
			});
		}, 200);
		return () => clearInterval(id);
	}, [serviceRoutes]);

	// Fly to selected incident
	useEffect(() => {
		if (!selectedIncident) return;
		mapRef.current?.flyTo({
			center: selectedIncident.coords,
			zoom: 14.5,
			pitch: 52,
			bearing: -12,
			duration: 900,
			essential: true,
		});
	}, [selectedId]);

	const handleSelect = (id: string) => setSelectedId((prev) => (prev === id ? null : id));

	const handleMapFocus = (focus: MapFocus | null) =>
		setMapFocus((prev) =>
			focus && prev?.kind === focus.kind && prev.id === focus.id ? null : focus,
		);

	return (
		<div style={{ width: "100vw", height: "100vh", position: "relative" }}>
			<MapGL
				ref={mapRef}
				mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
				mapStyle="mapbox://styles/mapbox/dark-v11"
				style={{ width: "100%", height: "100%" }}
				initialViewState={{ longitude: 114.175, latitude: 22.29, zoom: 10, pitch: 0, bearing: 0 }}
				onClick={() => setMapFocus(null)}
				onLoad={() => {
					mapRef.current?.flyTo({
						center: [114.175, 22.295],
						zoom: 12.5,
						pitch: 38,
						bearing: -8,
						duration: 2400,
						essential: true,
						curve: 1.2,
					});
				}}
				fog={{
					color: "#0a0f14",
					"high-color": "#111827",
					"horizon-blend": 0.06,
					"space-color": "#000008",
					"star-intensity": 0.08,
					range: [0.5, 8],
				}}
			>
				{/* 3D buildings */}
				<Layer
					id="3d-buildings"
					source="composite"
					source-layer="building"
					type="fill-extrusion"
					minzoom={14}
					filter={["==", "extrude", "true"]}
					paint={{
						"fill-extrusion-color": "#111827",
						"fill-extrusion-height": [
							"interpolate", ["linear"], ["zoom"],
							14, 0, 14.05, ["get", "height"],
						],
						"fill-extrusion-base": [
							"interpolate", ["linear"], ["zoom"],
							14, 0, 14.05, ["get", "min_height"],
						],
						"fill-extrusion-opacity": 0.8,
					}}
				/>

				{/* Selected incident overlays (fixed IDs, only data changes) */}
				{selectedIncident && (
					<>
						<RadiusCircle coords={selectedIncident.coords} />
						<RouteLayer
							allies={rankedAllies}
							allyRoutes={allyRoutes}
							services={selectedIncident.emergencyServices}
							serviceRoutes={serviceRoutes}
							incident={selectedIncident}
							focusedAllyId={mapFocus?.kind === "ally" ? mapFocus.id : null}
						/>
					</>
				)}

				{/* Incident markers — hide others when one is selected */}
				{eligibleIncidents.filter((inc) => !selectedId || inc.id === selectedId).map((inc) => (
					<IncidentMarker
						key={inc.id}
						incident={inc}
						selected={inc.id === selectedId}
						onClick={() => handleSelect(inc.id)}
					/>
				))}

				{/* Ally markers (only for selected incident) */}
				{selectedIncident &&
					rankedAllies.map((ally, rank) => (
						<AllyMarker
							key={ally.id}
							ally={ally}
							rank={rank}
							focused={mapFocus?.kind === "ally" && mapFocus.id === ally.id}
							onClick={() => handleMapFocus({ kind: "ally", id: ally.id })}
						/>
					))}

				{/* Animated emergency vehicles */}
				{selectedIncident &&
					selectedIncident.emergencyServices.map((svc) => {
						const coords = serviceRoutes[svc.id]?.coords ?? null;
						const pos = coords
							? interpolateRoute(coords, serviceProgress[svc.id] ?? 0)
							: svc.coords;
						return (
							<VehicleMarker
								key={svc.id}
								svc={svc}
								pos={pos}
								label={serviceMapLabel(svc, selectedIncident.emergencyServices)}
								focused={mapFocus?.kind === "service" && mapFocus.id === svc.id}
								onClick={() => handleMapFocus({ kind: "service", id: svc.id })}
							/>
						);
					})}
			</MapGL>

			{/* Left sidebar — sorted by urgency */}
			<IncidentSidebar
				incidents={eligibleIncidents}
				selectedId={selectedId}
				onSelect={handleSelect}
			/>

			{selectedIncident && mapFocus && (
				<div
					style={{
						position: "absolute",
						bottom: 20,
						left: 272,
						right: 292,
						display: "flex",
						justifyContent: "center",
						zIndex: 20,
						pointerEvents: "none",
					}}
				>
					<MapEntityDetail
						focus={mapFocus}
						incident={selectedIncident}
						allies={rankedAllies}
						allyRoutes={allyRoutes}
						serviceRoutes={serviceRoutes}
						serviceProgress={serviceProgress}
						onClose={() => setMapFocus(null)}
					/>
				</div>
			)}

			{/* Right detail panel */}
			{selectedIncident && (
				<AllyPanel
					incident={selectedIncident}
					allies={rankedAllies}
					allyRoutes={allyRoutes}
					serviceRoutes={serviceRoutes}
					serviceProgress={serviceProgress}
					mapFocus={mapFocus}
					onMapFocus={handleMapFocus}
					onClose={() => setSelectedId(null)}
				/>
			)}
		</div>
	);
};
