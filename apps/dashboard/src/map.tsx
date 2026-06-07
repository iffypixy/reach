import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
	ChevronRight,
	Cross,
	Flame,
	LocateFixed,
	Phone,
	PhoneOff,
	Route,
	Shield,
	Star,
	UserRound,
} from "lucide-react";
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
	| "mental-health-crisis";

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
	verified: boolean;
};

type RouteData = {
	coords: [number, number][];
	distanceM: number;
	durationS: number;
};

type IncidentRouteBundle = {
	allies: Record<string, RouteData>;
	services: Record<string, RouteData>;
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
		],
	},
	{
		id: "inc-013",
		type: "breathing-difficulty",
		coords: [114.1729, 22.3033],
		address: "Austin Rd, Jordan",
		receivedAt: Date.now() - 310000,
		callerPhone: "+852 9334 4556",
		emergencyServices: [
			{ id: "svc-013a", type: "ambulance", callsign: "AMB-22", coords: [114.1818, 22.3062], etaMinutes: 7 },
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
	{ id: "ally-001", name: "Chan Siu Ming", phone: "+85291234567", skills: ["cardiac-arrest", "severe-bleeding", "choking", "anaphylaxis"], coords: [114.1563, 22.2839], verified: true },
	{ id: "ally-002", name: "Dr Lee Wai Yee", phone: "+85294567890", skills: ["choking", "cardiac-arrest", "anaphylaxis"], coords: [114.1572, 22.286], verified: true },
	{ id: "ally-003", name: "Priya Nair", phone: "+85292345678", skills: ["breathing-difficulty", "cardiac-arrest", "anaphylaxis", "seizure"], coords: [114.1693, 22.3102], verified: false },
	{ id: "ally-004", name: "James Cheung", phone: "+85295678901", skills: ["severe-bleeding", "cardiac-arrest", "choking"], coords: [114.1715, 22.3113], verified: false },
	{ id: "ally-005", name: "Wong Ka Wai", phone: "+85293456789", skills: ["stroke", "cardiac-arrest", "breathing-difficulty", "seizure"], coords: [114.1898, 22.2798], verified: true },
	{ id: "ally-006", name: "Mei Lin Wong", phone: "+85296789012", skills: ["seizure", "cardiac-arrest", "breathing-difficulty"], coords: [114.1736, 22.2787], verified: false },
	{ id: "ally-007", name: "Ali Hassan", phone: "+85297890123", skills: ["anaphylaxis", "cardiac-arrest", "choking", "severe-bleeding"], coords: [114.1659, 22.2767], verified: true },
	{ id: "ally-008", name: "Sarah Ng", phone: "+85298901234", skills: ["breathing-difficulty", "cardiac-arrest", "anaphylaxis", "seizure"], coords: [114.1722, 22.2962], verified: false },
	{ id: "ally-009", name: "David Chan", phone: "+85299012345", skills: ["overdose", "mental-health-crisis", "seizure"], coords: [114.1843, 22.2779], verified: false },
	{ id: "ally-010", name: "Maria Santos", phone: "+85290123456", skills: ["diabetic-emergency", "cardiac-arrest", "stroke", "breathing-difficulty"], coords: [114.1513, 22.2833], verified: true },
	{ id: "ally-011", name: "Kevin Lam", phone: "+85291122334", skills: ["mental-health-crisis", "overdose", "breathing-difficulty"], coords: [114.1907, 22.2846], verified: false },
	{ id: "ally-012", name: "Fiona Tsang", phone: "+85292233445", skills: ["childbirth", "severe-bleeding", "breathing-difficulty"], coords: [114.178, 22.3262], verified: true },
	{ id: "ally-013", name: "Raj Patel", phone: "+85293344556", skills: ["mental-health-crisis", "childbirth", "breathing-difficulty"], coords: [114.1733, 22.3039], verified: false },
	{ id: "ally-014", name: "Emily Ho", phone: "+85294455667", skills: ["cardiac-arrest", "severe-bleeding", "choking", "anaphylaxis"], coords: [114.1308, 22.2829], verified: true },
	{ id: "ally-015", name: "Tommy Yip", phone: "+85295566778", skills: ["choking", "cardiac-arrest", "anaphylaxis"], coords: [114.1834, 22.3034], verified: false },
	{ id: "ally-016", name: "Grace Liu", phone: "+85296677889", skills: ["severe-bleeding", "cardiac-arrest", "choking"], coords: [114.1643, 22.2782], verified: true },
	{ id: "ally-017", name: "Dr Lee Wai Yee", phone: "+85294567890", skills: ["cardiac-arrest", "stroke", "breathing-difficulty", "diabetic-emergency", "seizure"], coords: [114.1683, 22.2798], verified: true },
	{ id: "ally-018", name: "David Chan", phone: "+85299012345", skills: ["choking", "cardiac-arrest", "severe-bleeding", "anaphylaxis"], coords: [114.1703, 22.3178], verified: true },
	{ id: "ally-019", name: "Priya Nair", phone: "+85292345678", skills: ["mental-health-crisis", "overdose", "seizure"], coords: [114.1822, 22.2783], verified: false },
	{ id: "ally-020", name: "Sarah Ng", phone: "+85298901234", skills: ["childbirth", "breathing-difficulty", "anaphylaxis", "diabetic-emergency"], coords: [114.1693, 22.3128], verified: true },
];

// ── Design tokens ─────────────────────────────────────────────────────────────

const LAYOUT = {
	panelInset: 12,
	queue: 272,
	detail: 292,
	gap: 16,
	toolbarWidth: 236,
} as const;

const sp = { xs: 4, sm: 8, md: 16 } as const;

const Z = {
	primary: "#EC0016",
	secondary: "#5B8DEF",
	accentMuted: "rgba(91, 141, 239, 0.18)",
	accentBorder: "rgba(91, 141, 239, 0.35)",
	text: "#e4e7ec",
	muted: "rgba(228, 231, 236, 0.5)",
	bg: "#0b0d12",
	surface: "#12151b",
	elevated: "#1a1e26",
	border: "rgba(255, 255, 255, 0.08)",
	borderSubtle: "rgba(255, 255, 255, 0.04)",
	font: '"DB Screen Sans", "Inter", system-ui, -apple-system, sans-serif',
	fontHead: '"DB Screen Head", "DB Screen Sans", "Inter", system-ui, sans-serif',
	radiusSm: 4,
	radiusMd: 8,
	success: "#34D399",
	successBg: "rgba(52, 211, 153, 0.12)",
	successBorder: "rgba(52, 211, 153, 0.28)",
	ambulance: "#EF4444",
	police: "#60A5FA",
	fire: "#F97316",
} as const;

const type = {
	caption: {
		fontSize: 11,
		fontWeight: 500,
		lineHeight: 1.4,
		color: Z.muted,
		fontFamily: Z.font,
	} satisfies CSSProperties,
	body: {
		fontSize: 13,
		fontWeight: 400,
		lineHeight: 1.45,
		color: Z.text,
		fontFamily: Z.font,
	} satisfies CSSProperties,
	bodyStrong: {
		fontSize: 13,
		fontWeight: 600,
		lineHeight: 1.45,
		color: Z.text,
		fontFamily: Z.font,
	} satisfies CSSProperties,
	title: {
		fontFamily: Z.fontHead,
		fontSize: 15,
		fontWeight: 900,
		lineHeight: 1.2,
		color: Z.text,
	} satisfies CSSProperties,
	headline: {
		fontFamily: Z.fontHead,
		fontSize: 16,
		fontWeight: 900,
		lineHeight: 1.15,
		color: Z.text,
	} satisfies CSSProperties,
	label: {
		fontSize: 11,
		fontWeight: 600,
		letterSpacing: "0.04em",
		textTransform: "uppercase" as const,
		color: Z.muted,
		fontFamily: Z.font,
	} satisfies CSSProperties,
};

const panelLabel: CSSProperties = { ...type.label, marginBottom: sp.sm };

const cardSurface: CSSProperties = {
	background: "rgba(22, 26, 34, 0.92)",
	border: `1px solid ${Z.border}`,
	borderRadius: Z.radiusMd,
	fontFamily: Z.font,
};

const metaChipStyle = (urgent: boolean): CSSProperties => ({
	...type.caption,
	fontWeight: 600,
	padding: `${sp.xs - 1}px ${sp.sm}px`,
	borderRadius: Z.radiusSm,
	background: urgent ? "rgba(236, 0, 22, 0.12)" : Z.surface,
	border: `1px solid ${urgent ? "rgba(236, 0, 22, 0.28)" : Z.border}`,
	color: urgent ? Z.text : Z.muted,
});

const iconBtn: CSSProperties = {
	background: Z.surface,
	border: `1px solid ${Z.border}`,
	borderRadius: Z.radiusSm,
	color: Z.muted,
	cursor: "pointer",
	padding: sp.xs,
	lineHeight: 1,
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
};

const dismissBtn: CSSProperties = {
	background: "none",
	border: "none",
	color: Z.muted,
	cursor: "pointer",
	fontSize: 16,
	padding: 0,
	lineHeight: 1,
	flexShrink: 0,
};

const panelFrame = (side: "left" | "right"): CSSProperties => ({
	position: "absolute",
	top: LAYOUT.panelInset,
	bottom: LAYOUT.panelInset,
	width: side === "left" ? LAYOUT.queue : LAYOUT.detail,
	...(side === "left" ? { left: LAYOUT.panelInset } : { right: LAYOUT.panelInset }),
	zIndex: 10,
	fontFamily: Z.font,
});

const AllyVerifiedBadge = ({ verified }: { verified: boolean }) => (
	<span
		style={{
			fontSize: 11,
			fontWeight: 500,
			lineHeight: 1.2,
			color: verified ? Z.success : "rgba(228, 231, 236, 0.35)",
			flexShrink: 0,
		}}
	>
		{verified ? "Verified" : "Unverified"}
	</span>
);

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
};

const PRIORITY_PULSE: Record<number, string> = { 1: "1.5s", 2: "2.8s" };

const DISPATCHES_POLICE: Record<IncidentType, boolean> = {
	"cardiac-arrest": false,
	"breathing-difficulty": false,
	"stroke": false,
	"severe-bleeding": true,
	"seizure": false,
	"overdose": true,
	"diabetic-emergency": false,
	"choking": false,
	"anaphylaxis": false,
	"childbirth": false,
	"mental-health-crisis": true,
};

const incidentUnits = (incident: Incident): EmergencyService[] =>
	incident.emergencyServices.filter(
		(svc) => svc.type !== "police" || DISPATCHES_POLICE[incident.type],
	);

const compareIncidents = (a: Incident, b: Incident): number => {
	const byType = TYPE_PRIORITY[a.type] - TYPE_PRIORITY[b.type];
	if (byType !== 0) return byType;
	return a.receivedAt - b.receivedAt;
};

const sortIncidentsByUrgency = (incidents: Incident[]): Incident[] =>
	[...incidents].sort(compareIncidents);

const MAP_ICON_SIZE = 13;
const MAP_ICON_STROKE = 2.5;
const INCIDENT_MARKER_SIZE = 48;
const INCIDENT_MARKER_SIZE_SELECTED = 52;
const INCIDENT_ICON_SIZE = 22;
const INCIDENT_RING_SIZE = 72;

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

type CallPhase = "ready" | "calling" | "in-call" | "wrap-up";

const allyMapLabel = (rank: number): string => (rank === 0 ? "Best ally" : `Ally #${rank + 1}`);

const serviceMapLabel = (svc: EmergencyService, all: EmergencyService[]): string => {
	const peers = all.filter((s) => s.type === svc.type);
	if (peers.length <= 1) return SVC_LABEL[svc.type];
	return `${SVC_LABEL[svc.type]} #${peers.findIndex((s) => s.id === svc.id) + 1}`;
};

const mapIncidentMarkerStyle = (
	color: string,
	size: number,
	selected: boolean,
): CSSProperties => ({
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	width: size,
	height: size,
	background: color,
	borderRadius: "50%",
	border: "2px solid rgba(255,255,255,0.35)",
	boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
	outline: selected ? `3px solid ${Z.secondary}` : "none",
	outlineOffset: 2,
	cursor: "pointer",
	fontFamily: Z.font,
	padding: 0,
	position: "relative",
	zIndex: 2,
});

const mapAllyMarkerStyle = (
	color: string,
	size: number,
	focused: boolean,
): CSSProperties => ({
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	width: size,
	height: size,
	background: color,
	borderRadius: "50%",
	border: "1px solid rgba(255,255,255,0.2)",
	boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
	outline: focused ? `2px solid ${color}` : "none",
	outlineOffset: 1,
	cursor: "pointer",
	fontFamily: Z.font,
	padding: 0,
	position: "relative",
	zIndex: 1,
});

const mapPillStyle = (
	color: string,
	emphasis: "primary" | "secondary",
	focused: boolean,
): CSSProperties => ({
	display: "flex",
	alignItems: "center",
	gap: 5,
	background: color,
	borderRadius: Z.radiusSm,
	padding: "5px 8px",
	border: `1px solid rgba(255,255,255,${emphasis === "primary" ? "0.2" : "0.14"})`,
	boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
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

const MAP_PITCH = 0;
const MAP_BEARING = 0;
const MAP_UI_OFFSET: [number, number] = [8, -72];
const MAP_FIT_PADDING = {
	top: 72 + LAYOUT.panelInset,
	bottom: 168 + LAYOUT.panelInset,
	left: LAYOUT.panelInset + LAYOUT.queue + LAYOUT.gap,
	right: LAYOUT.panelInset + LAYOUT.detail + LAYOUT.gap + LAYOUT.toolbarWidth,
} as const;
const MAP_ZOOM_MIN = 15;

const zoomForPair = (distM: number): number => {
	if (distM < 300) return 18;
	if (distM < 600) return 17.6;
	if (distM < 1000) return 17.2;
	if (distM < 1800) return 16.8;
	if (distM < 3000) return 16.4;
	return 16;
};

const pairBounds = (
	incident: Incident,
	ally: Ally,
): [[number, number], [number, number]] => {
	const lngSpan = Math.abs(incident.coords[0] - ally.coords[0]);
	const latSpan = Math.abs(incident.coords[1] - ally.coords[1]);
	const lngPad = Math.max(lngSpan * 0.14, 0.0007);
	const latPad = Math.max(latSpan * 0.14, 0.0007);
	return [
		[
			Math.min(incident.coords[0], ally.coords[0]) - lngPad,
			Math.min(incident.coords[1], ally.coords[1]) - latPad,
		],
		[
			Math.max(incident.coords[0], ally.coords[0]) + lngPad,
			Math.max(incident.coords[1], ally.coords[1]) + latPad,
		],
	];
};

const sceneBounds = (points: [number, number][]): [[number, number], [number, number]] => {
	const lngs = points.map((p) => p[0]);
	const lats = points.map((p) => p[1]);
	const lngSpan = Math.max(...lngs) - Math.min(...lngs);
	const latSpan = Math.max(...lats) - Math.min(...lats);
	const lngPad = Math.max(lngSpan * 0.2, 0.0012);
	const latPad = Math.max(latSpan * 0.2, 0.0012);
	return [
		[Math.min(...lngs) - lngPad, Math.min(...lats) - latPad],
		[Math.max(...lngs) + lngPad, Math.max(...lats) + latPad],
	];
};

const serviceMapPositions = (
	units: EmergencyService[],
	serviceRoutes: Record<string, RouteData>,
	serviceProgress: Record<string, number>,
): [number, number][] =>
	units.map((svc) => {
		const route = serviceRoutes[svc.id];
		if (route) return interpolateRoute(route.coords, serviceProgress[svc.id] ?? 0);
		return svc.coords;
	});

const fitMapToIncidentAndAlly = (map: MapRef, incident: Incident, ally: Ally | null) => {
	const m = map.getMap();
	const anim = { pitch: MAP_PITCH, bearing: MAP_BEARING, duration: 900, essential: true };
	if (!ally) {
		m.flyTo({ ...anim, center: incident.coords, zoom: 17.2, offset: MAP_UI_OFFSET });
		return;
	}
	const distM = haversineM(incident.coords, ally.coords);
	m.fitBounds(pairBounds(incident, ally), {
		...anim,
		padding: MAP_FIT_PADDING,
		maxZoom: zoomForPair(distM),
		minZoom: MAP_ZOOM_MIN,
	});
};

const fitMapToIncidentScene = (
	map: MapRef,
	incident: Incident,
	ally: Ally | null,
	units: EmergencyService[],
	serviceRoutes: Record<string, RouteData>,
	serviceProgress: Record<string, number>,
	showServices: boolean,
) => {
	if (!showServices) {
		fitMapToIncidentAndAlly(map, incident, ally);
		return;
	}
	const m = map.getMap();
	const anim = { pitch: MAP_PITCH, bearing: MAP_BEARING, duration: 900, essential: true };
	const points: [number, number][] = [incident.coords];
	if (ally) points.push(ally.coords);
	points.push(...serviceMapPositions(units, serviceRoutes, serviceProgress));
	const allyDistM = ally ? haversineM(incident.coords, ally.coords) : 0;
	const maxZoom = Math.min(14.8, ally ? zoomForPair(allyDistM) - 1.6 : 15.2);
	if (points.length === 1) {
		m.flyTo({ ...anim, center: incident.coords, zoom: 15, offset: MAP_UI_OFFSET });
		return;
	}
	m.fitBounds(sceneBounds(points), {
		...anim,
		padding: MAP_FIT_PADDING,
		maxZoom,
		minZoom: MAP_ZOOM_MIN,
	});
};

const MOCK_RING_MS_MIN = 2400;
const MOCK_RING_MS_MAX = 3600;

const mockRingMs = (allyId: string): number => {
	let h = 0;
	for (const c of allyId) h = (h * 31 + c.charCodeAt(0)) | 0;
	const base = MOCK_RING_MS_MIN + (Math.abs(h) % (MOCK_RING_MS_MAX - MOCK_RING_MS_MIN + 1));
	const jitter = Math.floor(Math.random() * 500) - 250;
	return Math.max(MOCK_RING_MS_MIN, Math.min(MOCK_RING_MS_MAX, base + jitter));
};

const formatPhone = (raw: string): string => {
	const digits = raw.replace(/\D/g, "");
	if (digits.startsWith("852") && digits.length === 11)
		return `+852 ${digits.slice(3, 7)} ${digits.slice(7)}`;
	return raw;
};

const mockDialAlly = (signal: AbortSignal, ringMs: number): Promise<void> =>
	new Promise((resolve, reject) => {
		if (signal.aborted) {
			reject(new DOMException("aborted", "AbortError"));
			return;
		}
		const id = setTimeout(resolve, ringMs);
		signal.addEventListener("abort", () => {
			clearTimeout(id);
			reject(new DOMException("aborted", "AbortError"));
		});
	});

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

const unitEtaS = (
	incident: Incident,
	serviceRoutes: Record<string, RouteData>,
): number =>
	Math.min(
		...incidentUnits(incident).map((svc) => {
			const cached = serviceRoutes[svc.id];
			return cached?.durationS ?? svc.etaMinutes * 60;
		}),
	);

const nearestResponderArrival = (
	incident: Incident,
	serviceRoutes: Record<string, RouteData>,
	serviceProgress: Record<string, number>,
): { etaS: number; distanceM: number | null; label: string } => {
	let etaS = Infinity;
	let distanceM: number | null = null;
	let label = "Responder";
	for (const svc of incidentUnits(incident)) {
		const route = serviceRoutes[svc.id];
		const progress = serviceProgress[svc.id] ?? 0;
		const totalS = route?.durationS ?? svc.etaMinutes * 60;
		const remaining = Math.max(0, totalS * (1 - progress));
		if (remaining < etaS) {
			etaS = remaining;
			distanceM = route?.distanceM ?? null;
			label = SVC_LABEL[svc.type];
		}
	}
	return { etaS: etaS === Infinity ? 0 : etaS, distanceM, label };
};

const serviceEtaRemainingS = (
	svc: EmergencyService,
	route: RouteData | undefined,
	progress: number,
): number => {
	const totalS = route?.durationS ?? svc.etaMinutes * 60;
	return Math.max(0, totalS * (1 - progress));
};

const allyWalkEtaS = (
	ally: Ally,
	incident: Incident,
	allyRoutes: Record<string, RouteData>,
): number => allyRoutes[ally.id]?.durationS ?? estimateWalkS(ally.coords, incident.coords);

const isAllyFasterThanUnits = (
	ally: Ally,
	incident: Incident,
	allyRoutes: Record<string, RouteData>,
	serviceRoutes: Record<string, RouteData>,
): boolean => allyWalkEtaS(ally, incident, allyRoutes) < unitEtaS(incident, serviceRoutes);

const rankAlliesForIncident = (
	incident: Incident,
	excluded: Set<string>,
	allyRoutes: Record<string, RouteData>,
	serviceRoutes: Record<string, RouteData>,
): Ally[] => {
	const matched = ALLIES.filter(
		(a) =>
			a.skills.includes(incident.type) &&
			!excluded.has(a.id) &&
			isAllyFasterThanUnits(a, incident, allyRoutes, serviceRoutes),
	);
	const allRouted = matched.every((a) => allyRoutes[a.id]);
	return matched.sort((a, b) => {
		if (a.verified !== b.verified) return a.verified ? -1 : 1;
		if (allRouted) return allyRoutes[a.id]!.durationS - allyRoutes[b.id]!.durationS;
		return allyWalkEtaS(a, incident, allyRoutes) - allyWalkEtaS(b, incident, allyRoutes);
	});
};

const incidentRoutesReady = (incident: Incident, routes?: IncidentRouteBundle): boolean => {
	if (!routes) return false;
	const matched = ALLIES.filter((a) => a.skills.includes(incident.type));
	if (!matched.length) return false;
	if (!matched.every((a) => routes.allies[a.id])) return false;
	if (!incidentUnits(incident).every((s) => routes.services[s.id])) return false;
	return true;
};

const hasActionableAlly = (
	incident: Incident,
	routes: IncidentRouteBundle | undefined,
	excluded: Set<string>,
): boolean => {
	if (!incidentRoutesReady(incident, routes)) return false;
	return rankAlliesForIncident(incident, excluded, routes!.allies, routes!.services).length > 0;
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
}) => {
	const queue = useMemo(() => sortIncidentsByUrgency(incidents), [incidents]);

	return (
	<div className="soteria-panel" style={{ ...panelFrame("left"), display: "flex", flexDirection: "column" }}>
		<div className="soteria-panel-header" style={{ padding: sp.md }}>
			<div style={{ display: "flex", alignItems: "center", gap: sp.sm }}>
				<div style={type.title}>Soteria</div>
				<span className="soteria-live-dot" title="Live queue" />
			</div>
			<div style={{ ...type.caption, marginTop: sp.xs }}>
				{incidents.length} in queue · most urgent first
			</div>
		</div>

		<div className="soteria-queue-scroll" style={{ flex: 1, overflowY: "auto" }}>
			{queue.length === 0 ? (
				<div style={{ padding: sp.md, ...type.caption, lineHeight: 1.5 }}>
					Queue empty
				</div>
			) : (
				queue.map((inc, idx) => (
					<IncidentCard
						key={inc.id}
						incident={inc}
						selected={inc.id === selectedId}
						priority={idx === 0}
						onSelect={() => onSelect(inc.id)}
					/>
				))
			)}
		</div>

		<div
			style={{
				padding: `${sp.sm + 2}px ${sp.md}px`,
				borderTop: "1px solid rgba(255, 255, 255, 0.06)",
				...type.caption,
			}}
		>
			999 dispatch · shift 4
		</div>
	</div>
	);
};

const IncidentCard = ({
	incident,
	selected,
	priority,
	onSelect,
}: {
	incident: Incident;
	selected: boolean;
	priority: boolean;
	onSelect: () => void;
}) => {
	const typeColor = TYPE_COLOR[incident.type];
	return (
		<button
			type="button"
			onClick={onSelect}
			className={`soteria-queue-item${selected ? " soteria-queue-item--selected" : ""}`}
			style={{
				background: selected ? undefined : "transparent",
				borderLeft: `3px solid ${selected || priority ? typeColor : "transparent"}`,
				padding: `${sp.sm + 3}px ${sp.md - 4}px`,
			}}
		>
			<div style={{ display: "flex", justifyContent: "space-between", gap: sp.sm, marginBottom: sp.xs - 1 }}>
				<span style={type.bodyStrong}>{TYPE_LABEL[incident.type]}</span>
				<span style={{ ...type.caption, flexShrink: 0 }}>{formatElapsed(incident.receivedAt)}</span>
			</div>
			<div
				style={{
					...type.caption,
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
	const markerSize = selected ? INCIDENT_MARKER_SIZE_SELECTED : INCIDENT_MARKER_SIZE;
	const ringSize = showPulse ? INCIDENT_RING_SIZE : markerSize;
	return (
		<Marker longitude={incident.coords[0]} latitude={incident.coords[1]} anchor="center">
			<div
				style={{
					position: "relative",
					width: ringSize,
					height: ringSize,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				{showPulse && (
					<>
						<span
							style={{
								position: "absolute",
								inset: 0,
								borderRadius: "50%",
								border: `2px solid ${typeColor}`,
								animation: `pulseRing ${pulseDuration} cubic-bezier(0.215, 0.61, 0.355, 1) infinite`,
							}}
						/>
						<span
							style={{
								position: "absolute",
								inset: 0,
								borderRadius: "50%",
								border: `2px solid ${typeColor}`,
								animation: `pulseRing ${pulseDuration} cubic-bezier(0.215, 0.61, 0.355, 1) infinite`,
								animationDelay: `${parseFloat(pulseDuration) * 0.5}s`,
							}}
						/>
					</>
				)}
				<button
					type="button"
					onClick={onClick}
					style={mapIncidentMarkerStyle(typeColor, markerSize, selected)}
					aria-label={`${TYPE_LABEL[incident.type]} incident`}
				>
					<UserRound
						size={INCIDENT_ICON_SIZE}
						color="white"
						fill="white"
						strokeWidth={2}
					/>
				</button>
			</div>
		</Marker>
	);
};

// Option 3: compact call chip on the map, dock takes over once dialling starts
const AllyCallChip = ({
	ally,
	route,
	onDial,
}: {
	ally: Ally;
	route?: RouteData;
	onDial: () => void;
}) => (
	<Marker longitude={ally.coords[0]} latitude={ally.coords[1]} anchor="center" offset={[0, 40]}>
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				pointerEvents: "auto",
			}}
		>
			<span
				style={{
					width: 2,
					height: 10,
					background: Z.secondary,
					borderRadius: 1,
					opacity: 0.65,
				}}
			/>
			<button
				type="button"
				onClick={(e) => {
					e.stopPropagation();
					onDial();
				}}
				style={{
					display: "flex",
					alignItems: "center",
					gap: 6,
					background: Z.primary,
					color: "#fff",
					fontSize: 13,
					fontWeight: 600,
					padding: `${sp.sm + 1}px ${sp.md}px`,
					borderRadius: Z.radiusSm,
					border: "1px solid rgba(255,255,255,0.2)",
					cursor: "pointer",
					fontFamily: Z.font,
					boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
					whiteSpace: "nowrap",
				}}
			>
				<Phone size={15} strokeWidth={2} />
				Call
				{route && (
					<span style={{ fontWeight: 500, opacity: 0.9 }}>
						· {formatDuration(route.durationS)}
					</span>
				)}
			</button>
		</div>
	</Marker>
);

const AllyMarker = ({
	ally,
	rank,
	active,
	focused,
	onClick,
}: {
	ally: Ally;
	rank: number;
	active: boolean;
	focused: boolean;
	onClick: () => void;
}) => {
	const isPrimary = rank === 0 || active;
	const dimmed = !isPrimary && !focused && !active;
	const markerSize = isPrimary ? 36 : 30;
	const ringSize = isPrimary ? 52 : markerSize;
	return (
		<Marker longitude={ally.coords[0]} latitude={ally.coords[1]} anchor="center">
			<div
				style={{
					position: "relative",
					width: ringSize,
					height: ringSize,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					opacity: dimmed ? 0.6 : 1,
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
					style={mapAllyMarkerStyle(
						isPrimary || focused ? Z.secondary : Z.accentMuted,
						markerSize,
						focused,
					)}
					aria-label={`${allyMapLabel(rank)} — tap for details`}
				>
					<Star
						size={isPrimary ? MAP_ICON_SIZE : 11}
						color="white"
						fill={isPrimary ? "white" : "none"}
						strokeWidth={MAP_ICON_STROKE}
					/>
				</button>
			</div>
		</Marker>
	);
};

const VehicleMarker = ({
	svc,
	pos,
	label,
	etaLabel,
	focused,
	onClick,
}: {
	svc: EmergencyService;
	pos: [number, number];
	label: string;
	etaLabel?: string;
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
				aria-label={`${label}${etaLabel ? ` — ${etaLabel} away` : ""} — tap for details`}
			>
				{SVC_ICON[svc.type]}
				<span style={{ ...type.caption, color: "#fff", fontWeight: 700 }}>
					{label}
					{etaLabel && (
						<span style={{ fontWeight: 500, opacity: 0.9 }}> · {etaLabel}</span>
					)}
				</span>
			</button>
		</Marker>
	);
};

// Fixed source/layer IDs — only data updates when the selected incident changes.
const visibleAllyRoutes = (
	allies: Ally[],
	focusedAllyId: string | null,
	activeAllyId: string | null,
): Ally[] => {
	if (!allies.length) return [];
	if (focusedAllyId) {
		const focused = allies.find((a) => a.id === focusedAllyId);
		if (focused) return [focused];
	}
	if (activeAllyId) {
		const active = allies.find((a) => a.id === activeAllyId);
		if (active) return [active];
	}
	return [allies[0]];
};

const RouteLayer = ({
	allies,
	allyRoutes,
	services,
	serviceRoutes,
	incident,
	focusedAllyId,
	activeAllyId,
	showServiceRoutes,
}: {
	allies: Ally[];
	allyRoutes: Record<string, RouteData>;
	services: EmergencyService[];
	serviceRoutes: Record<string, RouteData>;
	incident: Incident;
	focusedAllyId: string | null;
	activeAllyId: string | null;
	showServiceRoutes: boolean;
}) => {
	const routedAllies = useMemo(
		() => visibleAllyRoutes(allies, focusedAllyId, activeAllyId),
		[allies, focusedAllyId, activeAllyId],
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
				...(showServiceRoutes
					? services.map((svc) => ({
							type: "Feature" as const,
							geometry: {
								type: "LineString" as const,
								coordinates: serviceRoutes[svc.id]?.coords ?? [svc.coords, incident.coords],
							},
							properties: { routeType: "service", svcType: svc.type },
						}))
					: []),
			],
		}),
		[routedAllies, allyRoutes, services, serviceRoutes, incident, showServiceRoutes],
	);

	return (
		<Source id="sel-routes" type="geojson" data={data}>
			<Layer
				id="sel-ally-routes"
				type="line"
				filter={["==", ["get", "routeType"], "ally"]}
				layout={{ "line-join": "round", "line-cap": "round" }}
				paint={{
					"line-color": Z.secondary,
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
					"line-width": 2.8,
					"line-opacity": 0.92,
				}}
			/>
		</Source>
	);
};

const MapToolbar = ({
	showUnitRoutes,
	onToggleUnitRoutes,
	incident,
	serviceRoutes,
	serviceProgress,
	allyName,
	onReset,
}: {
	showUnitRoutes: boolean;
	onToggleUnitRoutes: () => void;
	incident: Incident;
	serviceRoutes: Record<string, RouteData>;
	serviceProgress: Record<string, number>;
	allyName: string | null;
	onReset: () => void;
}) => {
	const nearest = nearestResponderArrival(incident, serviceRoutes, serviceProgress);
	const nearestHint = nearest.etaS
		? `Nearest ${nearest.label.toLowerCase()} · ${formatDuration(nearest.etaS)}${
				nearest.distanceM ? ` · ${formatDist(nearest.distanceM)}` : ""
			}`
		: "See how far emergency services are";
	return (
		<div
			className="soteria-map-toolbar"
			style={{
				position: "absolute",
				top: LAYOUT.panelInset,
				right: LAYOUT.panelInset + LAYOUT.detail + LAYOUT.gap,
				zIndex: 15,
			}}
		>
			<button
				type="button"
				className="soteria-map-toolbar-btn"
				onClick={onToggleUnitRoutes}
				aria-pressed={showUnitRoutes}
				aria-label={
					showUnitRoutes
						? "emergency service routes shown on map — tap to hide"
						: `show emergency service routes on map — ${nearestHint}`
				}
			>
				<Route
					size={18}
					color={showUnitRoutes ? Z.secondary : Z.muted}
					strokeWidth={2}
					style={{ flexShrink: 0 }}
				/>
				<div style={{ flex: 1, minWidth: 0 }}>
					<div style={type.bodyStrong}>
						{showUnitRoutes ? "Emergency routes on map" : "Show emergency routes"}
					</div>
					<div style={{ ...type.caption, marginTop: 2 }}>
						{showUnitRoutes ? "Ambulance & other services" : nearestHint}
					</div>
				</div>
				<span
					style={{
						width: 28,
						height: 16,
						borderRadius: 8,
						background: showUnitRoutes ? Z.secondary : "rgba(255, 255, 255, 0.12)",
						position: "relative",
						transition: "background 0.15s ease",
						flexShrink: 0,
					}}
				>
					<span
						style={{
							position: "absolute",
							top: 2,
							left: showUnitRoutes ? 14 : 2,
							width: 12,
							height: 12,
							borderRadius: "50%",
							background: "#fff",
							transition: "left 0.15s ease",
						}}
					/>
				</span>
			</button>
			<div className="soteria-map-toolbar-divider" />
			<button
				type="button"
				className="soteria-map-toolbar-btn"
				onClick={onReset}
				aria-label={
					allyName
						? `reset map view to show incident and ${allyName}`
						: "reset map view to show selected incident"
				}
				title="Reset view"
			>
				<LocateFixed size={18} color={Z.secondary} strokeWidth={2} style={{ flexShrink: 0 }} />
				<div style={{ flex: 1, minWidth: 0 }}>
					<div style={type.bodyStrong}>Reset view</div>
					<div style={{ ...type.caption, marginTop: 2 }}>
						{allyName ? "Incident & ally" : "Incident only"}
					</div>
				</div>
			</button>
		</div>
	);
};

const MapCallCard = ({
	ally,
	route,
	phase,
	hasBackupAlly,
	callStartedAt,
	onDial,
	onEndCall,
	onAccepted,
	onCantHelp,
}: {
	ally: Ally | null;
	route?: RouteData;
	phase: CallPhase;
	hasBackupAlly: boolean;
	callStartedAt: number | null;
	onDial: () => void;
	onEndCall: () => void;
	onAccepted: () => void;
	onCantHelp: () => void;
}) => {
	const cardStyle: CSSProperties = {
		...cardSurface,
		padding: sp.md,
		maxWidth: 480,
		width: "100%",
		pointerEvents: "auto",
		animation: "slideInUp 0.18s ease-out",
	};
	const dockClass = "soteria-dock";

	const outcomeBtn = (
		label: string,
		onClick: () => void,
		variant: "primary" | "secondary" | "ghost",
	): ReactNode => {
		const styles: Record<typeof variant, CSSProperties> = {
			primary: { background: Z.successBg, color: Z.success, border: `1px solid ${Z.successBorder}` },
			secondary: { background: Z.accentMuted, color: Z.secondary, border: `1px solid ${Z.border}` },
			ghost: { background: "transparent", color: Z.muted, border: `1px solid ${Z.borderSubtle}` },
		};
		return (
			<button
				type="button"
				onClick={onClick}
				style={{
					flex: 1,
					padding: `${sp.sm + 3}px ${sp.sm}px`,
					borderRadius: Z.radiusSm,
					...type.bodyStrong,
					cursor: "pointer",
					...styles[variant],
				}}
			>
				{label}
			</button>
		);
	};

	const callBtn = (
		<button
			type="button"
			onClick={onDial}
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				gap: sp.sm,
				background: Z.primary,
				...type.bodyStrong,
				color: "#fff",
				padding: `${sp.sm + 4}px ${sp.md + 8}px`,
				borderRadius: Z.radiusSm,
				border: "none",
				cursor: "pointer",
				flexShrink: 0,
			}}
		>
			<Phone size={16} strokeWidth={2} />
			Call
		</button>
	);

	if (!ally) return null;

	if (phase === "calling") {
		return (
			<div className={dockClass} style={cardStyle}>
				<div style={{ display: "flex", alignItems: "center", gap: sp.sm, marginBottom: sp.xs }}>
					<span
						style={{
							width: 6,
							height: 6,
							borderRadius: "50%",
							background: Z.primary,
							animation: "liveBlip 1.2s ease infinite",
						}}
					/>
					<span style={type.bodyStrong}>Calling…</span>
				</div>
				<div style={{ display: "flex", alignItems: "center", gap: sp.sm - 2, flexWrap: "wrap" }}>
					<span style={type.title}>{ally.name}</span>
					<AllyVerifiedBadge verified={ally.verified} />
				</div>
				<div style={{ ...type.caption, marginTop: sp.xs - 1 }}>{formatPhone(ally.phone)}</div>
			</div>
		);
	}

	if (phase === "in-call") {
		return (
			<div className={dockClass} style={{ ...cardStyle, borderColor: Z.successBorder }}>
				<div style={{ display: "flex", alignItems: "flex-start", gap: sp.md - 4 }}>
					<div style={{ flex: 1, minWidth: 0 }}>
						<div style={{ display: "flex", alignItems: "center", gap: sp.sm - 2, marginBottom: sp.xs }}>
							<span
								style={{
									width: 6,
									height: 6,
									borderRadius: "50%",
									background: Z.success,
									animation: "liveBlip 1.2s ease infinite",
								}}
							/>
							<span style={{ ...type.bodyStrong, color: Z.success }}>In call</span>
							{callStartedAt && (
								<span style={type.caption}>· {formatElapsed(callStartedAt)}</span>
							)}
						</div>
						<div style={{ display: "flex", alignItems: "center", gap: sp.sm - 2, flexWrap: "wrap" }}>
							<span style={type.title}>{ally.name}</span>
							<AllyVerifiedBadge verified={ally.verified} />
						</div>
						<div style={{ ...type.caption, marginTop: sp.xs - 1 }}>{formatPhone(ally.phone)}</div>
					</div>
					<button
						type="button"
						onClick={onEndCall}
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							gap: sp.sm - 2,
							background: "rgba(236, 0, 22, 0.12)",
							...type.bodyStrong,
							color: Z.primary,
							padding: `${sp.sm + 3}px ${sp.md - 2}px`,
							borderRadius: Z.radiusSm,
							border: `1px solid rgba(236, 0, 22, 0.25)`,
							cursor: "pointer",
							flexShrink: 0,
						}}
					>
						<PhoneOff size={15} strokeWidth={2} />
						End call
					</button>
				</div>
			</div>
		);
	}

	if (phase === "wrap-up") {
		return (
			<div className={dockClass} style={cardStyle}>
				<div style={{ ...type.caption, marginBottom: sp.sm }}>How did the call go?</div>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: sp.sm - 2,
						flexWrap: "wrap",
						marginBottom: sp.md - 2,
					}}
				>
					<span style={type.bodyStrong}>
						{ally.name}
						<span style={{ color: Z.muted, fontWeight: 500 }}> · {formatPhone(ally.phone)}</span>
					</span>
					<AllyVerifiedBadge verified={ally.verified} />
				</div>
				<div style={{ display: "flex", gap: sp.sm }}>
					{outcomeBtn("Will help", onAccepted, "primary")}
					{outcomeBtn("Can't help", onCantHelp, "secondary")}
				</div>
				<div style={{ ...type.caption, marginTop: sp.sm, lineHeight: 1.45 }}>
					{hasBackupAlly
						? "Can't help will call the next nearest ally"
						: "Can't help will close this incident — emergency services are responding"}
				</div>
			</div>
		);
	}

	return (
		<div className={dockClass} style={cardStyle}>
			<div style={{ display: "flex", alignItems: "center", gap: sp.md - 4 }}>
				<div style={{ flex: 1, minWidth: 0 }}>
					<div
						style={{
							...type.title,
							overflow: "hidden",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap",
						}}
					>
						{ally.name}
					</div>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: sp.sm - 2,
							flexWrap: "wrap",
							marginTop: sp.xs - 1,
						}}
					>
						<span style={type.caption}>
							Best ally{route ? ` · ${formatDuration(route.durationS)} walk` : ""}
						</span>
						<AllyVerifiedBadge verified={ally.verified} />
					</div>
				</div>
				{callBtn}
			</div>
		</div>
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
				className="soteria-elevated-card"
				style={{
					...cardSurface,
					padding: sp.md,
					maxWidth: 380,
					width: "100%",
					pointerEvents: "auto",
				}}
			>
				<div style={{ display: "flex", alignItems: "flex-start", gap: sp.md - 4 }}>
					<div
						style={{
							width: 28,
							height: 28,
							borderRadius: Z.radiusSm,
							background: Z.secondary,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							flexShrink: 0,
							...type.caption,
							fontWeight: 700,
							color: "#fff",
						}}
					>
						{rank + 1}
					</div>
					<div style={{ flex: 1, minWidth: 0 }}>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: sp.sm - 2,
								flexWrap: "wrap",
								marginBottom: sp.xs - 1,
							}}
						>
							<span style={type.bodyStrong}>{ally.name}</span>
							<AllyVerifiedBadge verified={ally.verified} />
						</div>
						<div style={{ ...type.caption, marginBottom: sp.sm - 2 }}>{label}</div>
						<div style={type.caption}>
							{route ? (
								<>
									{formatDuration(route.durationS)} walk · {formatDist(route.distanceM)}
								</>
							) : (
								"route pending"
							)}
						</div>
					</div>
					<button type="button" onClick={onClose} style={dismissBtn} aria-label="Close">
						×
					</button>
				</div>
			</div>
		);
	}

	const units = incidentUnits(incident);
	const svc = units.find((s) => s.id === focus.id);
	if (!svc) return null;
	const color = svcColor(svc.type);
	const label = serviceMapLabel(svc, units);
	const route = serviceRoutes[svc.id];
	const progress = serviceProgress[svc.id] ?? 0;
	const etaRemaining = serviceEtaRemainingS(svc, route, progress);
	const pct = Math.min(progress * 100, 100);

	return (
		<div
			className="soteria-elevated-card"
			style={{
				...cardSurface,
				padding: sp.md,
				maxWidth: 380,
				width: "100%",
				pointerEvents: "auto",
			}}
		>
			<div style={{ display: "flex", alignItems: "flex-start", gap: sp.md - 4 }}>
				<div
					style={{
						width: 28,
						height: 28,
						borderRadius: Z.radiusSm,
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
					<div style={{ ...type.bodyStrong, marginBottom: sp.xs - 1 }}>{label}</div>
					<div style={{ ...type.caption, marginBottom: sp.sm }}>{svc.callsign}</div>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							marginBottom: sp.sm - 2,
						}}
					>
						<span style={type.caption}>{pct >= 99 ? "On scene" : "ETA"}</span>
						<span style={{ ...type.caption, color, fontWeight: 600 }}>
							{pct >= 99 ? "Arrived" : formatDuration(etaRemaining)}
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
					{route && (
						<div style={{ ...type.caption, marginTop: sp.sm - 2 }}>
							{formatDist(route.distanceM)} out
						</div>
					)}
				</div>
				<button type="button" onClick={onClose} style={dismissBtn} aria-label="Close">
					×
				</button>
			</div>
		</div>
	);
};

const IncidentPanelHeader = ({
	incident,
	onAdvance,
}: {
	incident: Incident;
	onAdvance: () => void;
}) => {
	const typeColor = TYPE_COLOR[incident.type];
	const urgent = TYPE_PRIORITY[incident.type] <= 2;
	const elapsed = formatElapsed(incident.receivedAt);

	return (
		<div
			className="soteria-incident-header"
			style={{
				padding: sp.md,
				borderLeft: `3px solid ${typeColor}`,
				...({ "--incident-glow": `${typeColor}22` } as CSSProperties),
			}}
		>
			<div
				style={{
					position: "relative",
					display: "flex",
					alignItems: "flex-start",
					justifyContent: "space-between",
					gap: sp.sm,
				}}
			>
				<div style={{ flex: 1, minWidth: 0 }}>
					<div style={type.headline}>{TYPE_LABEL[incident.type]}</div>
					<div
						style={{
							...type.body,
							color: Z.muted,
							marginTop: sp.xs,
							display: "-webkit-box",
							WebkitLineClamp: 2,
							WebkitBoxOrient: "vertical",
							overflow: "hidden",
						}}
					>
						{incident.address}
					</div>
				</div>
				<button
					type="button"
					onClick={onAdvance}
					style={{ ...iconBtn, flexShrink: 0 }}
					aria-label="Next incident"
					title="Next incident"
				>
					<ChevronRight size={16} strokeWidth={2} />
				</button>
			</div>

			<div
				style={{
					position: "relative",
					display: "flex",
					flexWrap: "wrap",
					gap: sp.sm - 2,
					marginTop: sp.sm,
				}}
			>
				<span style={metaChipStyle(urgent)}>{elapsed} waiting</span>
				<span style={metaChipStyle(false)}>{formatPhone(incident.callerPhone)}</span>
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
	activeAllyId,
	showUnitRoutes,
	onMapFocus,
	onToggleUnitRoutes,
	onAdvance,
}: {
	incident: Incident;
	allies: Ally[];
	allyRoutes: Record<string, RouteData>;
	serviceRoutes: Record<string, RouteData>;
	serviceProgress: Record<string, number>;
	mapFocus: MapFocus | null;
	activeAllyId: string | null;
	showUnitRoutes: boolean;
	onMapFocus: (focus: MapFocus | null) => void;
	onToggleUnitRoutes: () => void;
	onAdvance: () => void;
}) => {
	return (
		<div
			className="soteria-panel"
			style={{ ...panelFrame("right"), display: "flex", flexDirection: "column" }}
		>
			<IncidentPanelHeader incident={incident} onAdvance={onAdvance} />

			<div style={{ flex: 1, overflowY: "auto" }}>
				<div style={{ padding: `${sp.md - 4}px ${sp.md}px 0` }}>
					<div style={panelLabel}>Nearest ally</div>
					{allies[0] ? (
						<AllyHeroCard
							ally={allies[0]}
							route={allyRoutes[allies[0].id]}
							active={activeAllyId === allies[0].id}
							focused={mapFocus?.kind === "ally" && mapFocus.id === allies[0].id}
							onSelect={() => onMapFocus({ kind: "ally", id: allies[0].id })}
						/>
					) : (
						<div style={{ ...type.caption, padding: `${sp.sm + 4}px 0`, lineHeight: 1.5 }}>
							No allies faster than units
						</div>
					)}
				</div>

				{/* Compact list for remaining allies */}
				{allies.length > 1 && (
					<div style={{ padding: `${sp.md - 4}px ${sp.md}px ${sp.xs}px` }}>
						<div style={panelLabel}>Backup ({allies.length - 1})</div>
						{allies.slice(1).map((ally, i) => (
							<AllyCompactRow
								key={ally.id}
								ally={ally}
								rank={i + 2}
								route={allyRoutes[ally.id]}
								active={activeAllyId === ally.id}
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
						margin: `${sp.sm}px ${sp.md}px 0`,
					}}
				/>
				<div style={{ padding: `${sp.sm + 2}px ${sp.md}px ${sp.xs}px` }}>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							marginBottom: sp.sm - 2,
						}}
					>
						<div style={{ ...panelLabel, marginBottom: 0 }}>Emergency services</div>
						<button
							type="button"
							onClick={onToggleUnitRoutes}
							style={{
								background: showUnitRoutes ? Z.accentMuted : "transparent",
								border: `1px solid ${showUnitRoutes ? Z.accentBorder : Z.borderSubtle}`,
								borderRadius: Z.radiusSm,
								...type.caption,
								color: showUnitRoutes ? Z.text : Z.muted,
								fontWeight: 600,
								cursor: "pointer",
								padding: `${sp.xs - 1}px ${sp.sm}px`,
								flexShrink: 0,
							}}
						>
							{showUnitRoutes ? "On map" : "Show on map"}
						</button>
					</div>
					{incidentUnits(incident).map((svc) => (
						<ServiceRow
							key={svc.id}
							svc={svc}
							label={serviceMapLabel(svc, incidentUnits(incident))}
							route={serviceRoutes[svc.id]}
							progress={serviceProgress[svc.id] ?? 0}
							focused={mapFocus?.kind === "service" && mapFocus.id === svc.id}
							onSelect={() => onMapFocus({ kind: "service", id: svc.id })}
						/>
					))}
				</div>

				<div style={{ height: sp.md - 4 }} />
			</div>
		</div>
	);
};

const AllyHeroCard = ({
	ally,
	route,
	active,
	focused,
	onSelect,
}: {
	ally: Ally;
	route?: RouteData;
	active: boolean;
	focused: boolean;
	onSelect: () => void;
}) => (
	<div
		className="soteria-elevated-card"
		style={{
			...cardSurface,
			background: focused || active ? "rgba(26, 30, 38, 0.95)" : "rgba(18, 21, 27, 0.88)",
			borderColor: active ? Z.accentBorder : focused ? Z.border : Z.borderSubtle,
			borderTop: active ? `2px solid ${Z.secondary}` : `2px solid transparent`,
			padding: `${sp.sm + 4}px ${sp.md - 4}px`,
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
				gap: sp.sm + 2,
				marginBottom: sp.sm,
				background: "none",
				border: "none",
				padding: 0,
				cursor: "pointer",
				textAlign: "left",
				fontFamily: Z.font,
			}}
		>
			<div style={{ flex: 1, minWidth: 0 }}>
				<div style={{ display: "flex", alignItems: "center", gap: sp.sm - 2, flexWrap: "wrap" }}>
					<span style={type.bodyStrong}>{ally.name}</span>
					<AllyVerifiedBadge verified={ally.verified} />
				</div>
			</div>
		</button>

		{route ? (
			<div style={type.caption}>
				{formatDuration(route.durationS)} walk · {formatDist(route.distanceM)}
			</div>
		) : (
			<div style={type.caption}>route pending</div>
		)}

	</div>
);

const AllyCompactRow = ({
	ally,
	rank,
	route,
	active,
	focused,
	onSelect,
}: {
	ally: Ally;
	rank: number;
	route?: RouteData;
	active: boolean;
	focused: boolean;
	onSelect: () => void;
}) => (
	<div
		style={{
			display: "flex",
			alignItems: "center",
			gap: sp.sm,
			padding: `${sp.sm - 1}px 0`,
			background: focused || active ? Z.elevated : "transparent",
			borderTop: `1px solid ${Z.borderSubtle}`,
			borderRadius: Z.radiusSm,
			fontFamily: Z.font,
		}}
	>
		<button
			type="button"
			onClick={onSelect}
			style={{
				flex: 1,
				display: "flex",
				alignItems: "center",
				gap: sp.sm,
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
					width: 20,
					height: 20,
					borderRadius: Z.radiusSm,
					background: focused || active ? Z.secondary : Z.accentMuted,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					flexShrink: 0,
					...type.caption,
					fontWeight: 700,
					color: focused || active ? "#fff" : Z.muted,
				}}
			>
				{rank}
			</div>
			<span
				style={{
					flex: 1,
					...(focused || active ? type.bodyStrong : type.caption),
					color: focused || active ? Z.text : Z.muted,
					overflow: "hidden",
					textOverflow: "ellipsis",
					whiteSpace: "nowrap",
					minWidth: 0,
				}}
			>
				{ally.name}
			</span>
			<AllyVerifiedBadge verified={ally.verified} />
			<span style={{ ...type.caption, flexShrink: 0 }}>
				{route ? formatDuration(route.durationS) : "—"}
			</span>
		</button>
		{active && (
			<span style={{ ...type.caption, flexShrink: 0, color: Z.secondary, fontWeight: 600 }}>
				Active
			</span>
		)}
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
	const etaRemaining = serviceEtaRemainingS(svc, route, progress);
	const pct = Math.min(progress * 100, 100);
	return (
		<button
			type="button"
			onClick={onSelect}
			style={{
				width: "100%",
				padding: `${sp.sm + 1}px 0`,
				display: "flex",
				alignItems: "center",
				gap: sp.sm + 2,
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
					width: 20,
					height: 20,
					borderRadius: Z.radiusSm,
					background: color,
					color: "#fff",
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
						marginBottom: sp.xs,
					}}
				>
					<div style={{ minWidth: 0 }}>
						<div style={type.bodyStrong}>{label}</div>
						<div style={{ ...type.caption, marginTop: 1 }}>{svc.callsign}</div>
					</div>
					<span style={{ ...type.caption, color, fontWeight: 600 }}>
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
	const dialAbortRef = useRef<AbortController | null>(null);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [mapFocus, setMapFocus] = useState<MapFocus | null>(null);
	const [incidentRoutes, setIncidentRoutes] = useState<Record<string, IncidentRouteBundle>>({});
	const [serviceProgress, setServiceProgress] = useState<Record<string, number>>({});
	const [showUnitRoutes, setShowUnitRoutes] = useState(false);
	const [callPhase, setCallPhase] = useState<CallPhase>("ready");
	const [resolvedIncidentIds, setResolvedIncidentIds] = useState<Set<string>>(() => new Set());
	const [excludedAllyIds, setExcludedAllyIds] = useState<Record<string, string[]>>({});
	const [callStartedAt, setCallStartedAt] = useState<number | null>(null);
	const [, setTick] = useState(0);

	const eligibleIncidents = useMemo(
		() =>
			sortIncidentsByUrgency(
				INCIDENTS.filter((inc) => !resolvedIncidentIds.has(inc.id)).filter((inc) =>
					hasActionableAlly(
						inc,
						incidentRoutes[inc.id],
						new Set(excludedAllyIds[inc.id] ?? []),
					),
				),
			),
		[resolvedIncidentIds, incidentRoutes, excludedAllyIds],
	);

	const selectedRoutes = selectedId ? incidentRoutes[selectedId] : undefined;
	const allyRoutes = selectedRoutes?.allies ?? {};
	const serviceRoutes = selectedRoutes?.services ?? {};

	const selectedIncident = useMemo(
		() => eligibleIncidents.find((i) => i.id === selectedId) ?? null,
		[selectedId, eligibleIncidents],
	);

	const dispatchedUnits = useMemo(
		() => (selectedIncident ? incidentUnits(selectedIncident) : []),
		[selectedIncident],
	);

	// Always pre-select the most urgent incident — first in the sorted queue
	useEffect(() => {
		if (!eligibleIncidents.length) {
			setSelectedId(null);
			return;
		}
		setSelectedId(eligibleIncidents[0]!.id);
	}, [eligibleIncidents]);

	const rankedAllies = useMemo(() => {
		if (!selectedIncident) return [];
		return rankAlliesForIncident(
			selectedIncident,
			new Set(excludedAllyIds[selectedIncident.id] ?? []),
			allyRoutes,
			serviceRoutes,
		);
	}, [selectedIncident, allyRoutes, serviceRoutes, excludedAllyIds]);

	const activeAlly = rankedAllies[0] ?? null;
	const showCallCard = !!activeAlly;

	const resetCallFlow = () => {
		dialAbortRef.current?.abort();
		dialAbortRef.current = null;
		setCallPhase("ready");
		setCallStartedAt(null);
	};

	// Reset call flow when incident changes
	useEffect(() => {
		resetCallFlow();
		setShowUnitRoutes(false);
	}, [selectedId]);

	useEffect(() => () => dialAbortRef.current?.abort(), []);

	// 1-second ticker for elapsed time displays
	useEffect(() => {
		const id = setInterval(() => setTick((t) => t + 1), 1000);
		return () => clearInterval(id);
	}, []);

	// Prefetch routes for every incident so the queue only lists confirmed viable ones
	useEffect(() => {
		const token = import.meta.env.VITE_MAPBOX_TOKEN as string;

		const patchAlly = (incidentId: string, allyId: string, data: RouteData) =>
			setIncidentRoutes((prev) => ({
				...prev,
				[incidentId]: {
					allies: { ...prev[incidentId]?.allies, [allyId]: data },
					services: prev[incidentId]?.services ?? {},
				},
			}));

		const patchService = (incidentId: string, svcId: string, data: RouteData) =>
			setIncidentRoutes((prev) => ({
				...prev,
				[incidentId]: {
					allies: prev[incidentId]?.allies ?? {},
					services: { ...prev[incidentId]?.services, [svcId]: data },
				},
			}));

		for (const incident of INCIDENTS) {
			for (const ally of ALLIES.filter((a) => a.skills.includes(incident.type))) {
				const key = routeKey(ally.coords, incident.coords, "walking");
				const cached = routeCache.get(key);
				if (cached) {
					patchAlly(incident.id, ally.id, cached);
					continue;
				}
				fetchRoute(ally.coords, incident.coords, "walking", token).then((data) => {
					routeCache.set(key, data);
					patchAlly(incident.id, ally.id, data);
				});
			}

			for (const svc of incidentUnits(incident)) {
				const key = routeKey(svc.coords, incident.coords, "driving");
				const cached = routeCache.get(key);
				if (cached) {
					patchService(incident.id, svc.id, cached);
					continue;
				}
				fetchRoute(svc.coords, incident.coords, "driving", token).then((data) => {
					routeCache.set(key, data);
					patchService(incident.id, svc.id, data);
				});
			}
		}
	}, []);

	useEffect(() => {
		selectedIdRef.current = selectedId;
		setMapFocus(null);

		if (!selectedId) {
			setServiceProgress({});
			return;
		}

		const incident = INCIDENTS.find((i) => i.id === selectedId);
		if (!incident) return;

		setServiceProgress(Object.fromEntries(incidentUnits(incident).map((s) => [s.id, 0])));
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

	// Fit map on incident + active ally; zoom out to include services when routes shown
	useEffect(() => {
		if (!selectedIncident || !mapRef.current) return;
		fitMapToIncidentScene(
			mapRef.current,
			selectedIncident,
			activeAlly,
			dispatchedUnits,
			serviceRoutes,
			serviceProgress,
			showUnitRoutes,
		);
	}, [selectedId, activeAlly?.id, showUnitRoutes]);

	const handleSelect = (id: string) => setSelectedId(id);

	const handleAdvance = () => {
		if (!eligibleIncidents.length || !selectedId) return;
		const idx = eligibleIncidents.findIndex((i) => i.id === selectedId);
		const next = eligibleIncidents[(idx + 1) % eligibleIncidents.length];
		setSelectedId(next.id);
	};

	const handleDial = async () => {
		if (!activeAlly || callPhase !== "ready") return;
		dialAbortRef.current?.abort();
		const ctrl = new AbortController();
		dialAbortRef.current = ctrl;
		setCallPhase("calling");
		try {
			await mockDialAlly(ctrl.signal, mockRingMs(activeAlly.id));
			if (ctrl.signal.aborted) return;
			setCallStartedAt(Date.now());
			setCallPhase("in-call");
		} catch (err) {
			if (err instanceof DOMException && err.name === "AbortError") return;
			setCallPhase("ready");
		} finally {
			if (dialAbortRef.current === ctrl) dialAbortRef.current = null;
		}
	};

	const handleEndCall = () => {
		if (callPhase !== "in-call") return;
		setCallStartedAt(null);
		setCallPhase("wrap-up");
	};

	const dismissIncident = (incidentId: string) => {
		setResolvedIncidentIds((prev) => new Set([...prev, incidentId]));
	};

	const handleCallAccepted = () => {
		if (callPhase !== "wrap-up" || !selectedId) return;
		dismissIncident(selectedId);
		resetCallFlow();
	};

	const handleCallCantHelp = () => {
		if (callPhase !== "wrap-up" || !activeAlly || !selectedId || !selectedIncident) return;
		if (rankedAllies.length > 1) {
			const excluded = new Set([...(excludedAllyIds[selectedId] ?? []), activeAlly.id]);
			const remaining = rankAlliesForIncident(
				selectedIncident,
				excluded,
				allyRoutes,
				serviceRoutes,
			);
			setExcludedAllyIds((prev) => ({ ...prev, [selectedId]: [...excluded] }));
			setMapFocus((prev) => (prev?.kind === "ally" && excluded.has(prev.id) ? null : prev));
			resetCallFlow();
			if (!remaining.length) dismissIncident(selectedId);
			return;
		}
		dismissIncident(selectedId);
		resetCallFlow();
	};

	const handleMapFocus = (focus: MapFocus | null) =>
		setMapFocus((prev) =>
			focus && prev?.kind === focus.kind && prev.id === focus.id ? null : focus,
		);

	const handleResetMapView = () => {
		if (!selectedIncident || !mapRef.current) return;
		setMapFocus(null);
		fitMapToIncidentAndAlly(mapRef.current, selectedIncident, activeAlly);
	};

	return (
		<div style={{ width: "100vw", height: "100vh", position: "relative", background: Z.bg }}>
			<MapGL
				ref={mapRef}
				mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
				mapStyle="mapbox://styles/mapbox/dark-v11"
				style={{ width: "100%", height: "100%" }}
				initialViewState={{ longitude: 114.175, latitude: 22.29, zoom: 10, pitch: 0, bearing: 0 }}
				onClick={() => setMapFocus(null)}
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
							services={dispatchedUnits}
							serviceRoutes={serviceRoutes}
							incident={selectedIncident}
							focusedAllyId={mapFocus?.kind === "ally" ? mapFocus.id : null}
							activeAllyId={activeAlly?.id ?? null}
							showServiceRoutes={showUnitRoutes}
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
							active={ally.id === activeAlly?.id}
							focused={mapFocus?.kind === "ally" && mapFocus.id === ally.id}
							onClick={() => handleMapFocus({ kind: "ally", id: ally.id })}
						/>
					))}

				{showCallCard && activeAlly && callPhase === "ready" && (
					<AllyCallChip
						ally={activeAlly}
						route={allyRoutes[activeAlly.id]}
						onDial={handleDial}
					/>
				)}

				{/* Animated emergency vehicles */}
				{selectedIncident &&
					dispatchedUnits.map((svc) => {
						const coords = serviceRoutes[svc.id]?.coords ?? null;
						const pos = coords
							? interpolateRoute(coords, serviceProgress[svc.id] ?? 0)
							: svc.coords;
						const etaRemaining = serviceEtaRemainingS(
							svc,
							serviceRoutes[svc.id],
							serviceProgress[svc.id] ?? 0,
						);
						return (
							<VehicleMarker
								key={svc.id}
								svc={svc}
								pos={pos}
								label={serviceMapLabel(svc, dispatchedUnits)}
								etaLabel={
									showUnitRoutes && etaRemaining > 0
										? formatDuration(etaRemaining)
										: undefined
								}
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

			{selectedIncident && (
				<MapToolbar
					showUnitRoutes={showUnitRoutes}
					onToggleUnitRoutes={() => setShowUnitRoutes((v) => !v)}
					incident={selectedIncident}
					serviceRoutes={serviceRoutes}
					serviceProgress={serviceProgress}
					allyName={activeAlly?.name ?? null}
					onReset={handleResetMapView}
				/>
			)}

			{selectedIncident && (
				<div
					style={{
						position: "absolute",
						bottom: LAYOUT.panelInset + sp.sm,
						left: LAYOUT.panelInset + LAYOUT.queue,
						right: LAYOUT.panelInset + LAYOUT.detail,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						gap: sp.sm + 2,
						zIndex: 20,
						pointerEvents: "none",
					}}
				>
					{mapFocus && (
						<MapEntityDetail
							focus={mapFocus}
							incident={selectedIncident}
							allies={rankedAllies}
							allyRoutes={allyRoutes}
							serviceRoutes={serviceRoutes}
							serviceProgress={serviceProgress}
							onClose={() => setMapFocus(null)}
						/>
					)}
					{showCallCard && activeAlly && callPhase !== "ready" && (
						<MapCallCard
							ally={activeAlly}
							route={allyRoutes[activeAlly.id]}
							phase={callPhase}
							hasBackupAlly={rankedAllies.length > 1}
							callStartedAt={callStartedAt}
							onDial={handleDial}
							onEndCall={handleEndCall}
							onAccepted={handleCallAccepted}
							onCantHelp={handleCallCantHelp}
						/>
					)}
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
					activeAllyId={activeAlly?.id ?? null}
					showUnitRoutes={showUnitRoutes}
					onMapFocus={handleMapFocus}
					onToggleUnitRoutes={() => setShowUnitRoutes((v) => !v)}
					onAdvance={handleAdvance}
				/>
			)}
		</div>
	);
};
