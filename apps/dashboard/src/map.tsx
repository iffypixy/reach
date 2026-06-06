import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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
	| "drowning"
	| "diabetic-emergency"
	| "choking"
	| "anaphylaxis"
	| "childbirth"
	| "mental-health-crisis"
	| "language-barrier";

type IncidentStatus = "incoming" | "active" | "dispatched";
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
	status: IncidentStatus;
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
		status: "incoming",
		coords: [114.1628, 22.2824],
		address: "8 Finance St, Central",
		receivedAt: Date.now() - 45_000,
		callerPhone: "+852 9123 4567",
		emergencyServices: [
			{ id: "svc-001a", type: "ambulance", callsign: "AMB-09", coords: [114.1432, 22.2844], etaMinutes: 7 },
			{ id: "svc-001b", type: "police", callsign: "BRAVO-3", coords: [114.1583, 22.2776], etaMinutes: 4 },
		],
	},
	{
		id: "inc-002",
		type: "drowning",
		status: "incoming",
		coords: [114.1720, 22.2960],
		address: "TST Promenade, Tsim Sha Tsui",
		receivedAt: Date.now() - 90_000,
		callerPhone: "+852 9456 7890",
		emergencyServices: [
			{ id: "svc-002a", type: "ambulance", callsign: "AMB-05", coords: [114.1652, 22.3045], etaMinutes: 5 },
			{ id: "svc-002b", type: "police", callsign: "CHARLIE-2", coords: [114.1718, 22.3010], etaMinutes: 3 },
		],
	},
	{
		id: "inc-003",
		type: "severe-bleeding",
		status: "active",
		coords: [114.1694, 22.3213],
		address: "Mong Kok Rd / Nathan Rd",
		receivedAt: Date.now() - 185_000,
		callerPhone: "+852 9234 5678",
		emergencyServices: [
			{ id: "svc-003a", type: "ambulance", callsign: "AMB-14", coords: [114.1741, 22.3099], etaMinutes: 5 },
			{ id: "svc-003b", type: "police", callsign: "ALPHA-7", coords: [114.1621, 22.3156], etaMinutes: 3 },
		],
	},
	{
		id: "inc-004",
		type: "mental-health-crisis",
		status: "active",
		coords: [114.1849, 22.2804],
		address: "Causeway Bay MTR Exit D",
		receivedAt: Date.now() - 360_000,
		callerPhone: "+852 9345 6789",
		emergencyServices: [
			{ id: "svc-004a", type: "ambulance", callsign: "AMB-22", coords: [114.1673, 22.2783], etaMinutes: 6 },
			{ id: "svc-004b", type: "police", callsign: "ECHO-3", coords: [114.1826, 22.2756], etaMinutes: 4 },
		],
	},
	{
		id: "inc-005",
		type: "stroke",
		status: "active",
		coords: [114.1742, 22.2831],
		address: "Wan Chai Waterfront Promenade, HKCEC",
		receivedAt: Date.now() - 130_000,
		callerPhone: "+852 9567 8901",
		emergencyServices: [
			{ id: "svc-005a", type: "ambulance", callsign: "AMB-17", coords: [114.1729, 22.2810], etaMinutes: 4 },
			{ id: "svc-005b", type: "police", callsign: "DELTA-4", coords: [114.1783, 22.2838], etaMinutes: 3 },
		],
	},
	{
		id: "inc-006",
		type: "choking",
		status: "incoming",
		coords: [114.1716, 22.2985],
		address: "Canton Rd / Haiphong Rd, Tsim Sha Tsui",
		receivedAt: Date.now() - 18_000,
		callerPhone: "+852 9678 9012",
		emergencyServices: [
			{ id: "svc-006a", type: "ambulance", callsign: "AMB-03", coords: [114.1652, 22.3045], etaMinutes: 4 },
			{ id: "svc-006b", type: "police", callsign: "CHARLIE-5", coords: [114.1680, 22.2990], etaMinutes: 2 },
		],
	},
	{
		id: "inc-007",
		type: "seizure",
		status: "incoming",
		coords: [114.1824, 22.2779],
		address: "Times Square, 1 Matheson St, Causeway Bay",
		receivedAt: Date.now() - 75_000,
		callerPhone: "+852 9789 0123",
		emergencyServices: [
			{ id: "svc-007a", type: "ambulance", callsign: "AMB-18", coords: [114.1863, 22.2814], etaMinutes: 4 },
			{ id: "svc-007b", type: "police", callsign: "ECHO-7", coords: [114.1840, 22.2750], etaMinutes: 3 },
		],
	},
	{
		id: "inc-008",
		type: "anaphylaxis",
		status: "dispatched",
		coords: [114.1645, 22.2787],
		address: "Pacific Place L3, 88 Queensway, Admiralty",
		receivedAt: Date.now() - 1_080_000,
		callerPhone: "+852 9890 1234",
		emergencyServices: [
			{ id: "svc-008a", type: "ambulance", callsign: "AMB-11", coords: [114.1609, 22.2803], etaMinutes: 3 },
			{ id: "svc-008b", type: "police", callsign: "FOXTROT-2", coords: [114.1583, 22.2776], etaMinutes: 6 },
		],
	},
];

const ALLIES: Ally[] = [
	{ id: "ally-001", name: "Chan Siu Ming", phone: "+85291234567", skills: ["cardiac-arrest", "severe-bleeding", "choking", "anaphylaxis"], coords: [114.1590, 22.2791], credentialScore: 94 },
	{ id: "ally-002", name: "Dr Lee Wai Yee", phone: "+85294567890", skills: ["cardiac-arrest", "stroke", "breathing-difficulty", "diabetic-emergency", "seizure"], coords: [114.1683, 22.2798], credentialScore: 98 },
	{ id: "ally-003", name: "Priya Nair", phone: "+85292345678", skills: ["mental-health-crisis", "overdose", "language-barrier"], coords: [114.1822, 22.2783], credentialScore: 71 },
	{ id: "ally-004", name: "James Cheung", phone: "+85295678901", skills: ["drowning", "severe-bleeding", "childbirth", "cardiac-arrest"], coords: [114.1731, 22.3015], credentialScore: 83 },
	{ id: "ally-005", name: "Wong Ka Wai", phone: "+85293456789", skills: ["cardiac-arrest", "seizure", "anaphylaxis", "breathing-difficulty"], coords: [114.1729, 22.2988], credentialScore: 88 },
	{ id: "ally-006", name: "Mei Lin Wong", phone: "+85296789012", skills: ["cardiac-arrest", "stroke", "language-barrier", "mental-health-crisis"], coords: [114.1601, 22.2850], credentialScore: 76 },
	{ id: "ally-007", name: "Ali Hassan", phone: "+85297890123", skills: ["language-barrier", "mental-health-crisis", "seizure", "overdose"], coords: [114.1671, 22.3078], credentialScore: 79 },
	{ id: "ally-008", name: "Sarah Ng", phone: "+85298901234", skills: ["childbirth", "breathing-difficulty", "anaphylaxis", "diabetic-emergency"], coords: [114.1693, 22.2995], credentialScore: 85 },
	{ id: "ally-009", name: "David Chan", phone: "+85299012345", skills: ["choking", "cardiac-arrest", "severe-bleeding", "anaphylaxis"], coords: [114.1703, 22.3021], credentialScore: 91 },
	{ id: "ally-010", name: "Maria Santos", phone: "+85290123456", skills: ["language-barrier", "childbirth", "mental-health-crisis"], coords: [114.1736, 22.2861], credentialScore: 77 },
	{ id: "ally-011", name: "Kevin Lam", phone: "+85291122334", skills: ["drowning", "cardiac-arrest", "breathing-difficulty", "seizure"], coords: [114.1748, 22.2954], credentialScore: 86 },
];

// ── Design tokens ─────────────────────────────────────────────────────────────

const Z = {
	primary: "#EC0016",
	secondary: "#0C3992",
	text: "#E8EBF0",
	muted: "rgba(232, 235, 240, 0.45)",
	bg: "rgba(6, 8, 14, 0.95)",
	border: "rgba(12, 57, 146, 0.22)",
	borderSubtle: "rgba(255, 255, 255, 0.06)",
	font: '"DB Screen Sans", "Inter", system-ui, -apple-system, sans-serif',
	fontHead: '"DB Screen Head", "DB Screen Sans", "Inter", system-ui, sans-serif',
	ambulance: "#EF4444",
	police: "#60A5FA",
	fire: "#F97316",
} as const;

// ── Labels, icons & colors per type ──────────────────────────────────────────

// Each incident type maps to a clinical category colour.
// These drive the marker centre and sidebar icon — separate from the status ring.
const TYPE_COLOR: Record<IncidentType, string> = {
	"cardiac-arrest":       "#EF4444",
	"breathing-difficulty": "#F97316",
	"stroke":               "#7C3AED",
	"severe-bleeding":      "#DC2626",
	"seizure":              "#9333EA",
	"overdose":             "#0891B2",
	"drowning":             "#0284C7",
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
	"drowning":             "DR",
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
	"drowning":             "Drowning",
	"diabetic-emergency":   "Diabetic Emergency",
	"choking":              "Choking",
	"anaphylaxis":          "Anaphylaxis",
	"childbirth":           "Childbirth Emergency",
	"mental-health-crisis": "Mental Health Crisis",
	"language-barrier":     "Language Barrier",
};

const STATUS_COLOR: Record<IncidentStatus, string> = {
	incoming:   "#EF4444",
	active:     "#F97316",
	dispatched: "#22C55E",
};

// Pulse speed signals urgency: incoming is faster than active.
const STATUS_PULSE: Record<IncidentStatus, string> = {
	incoming:   "1.5s",
	active:     "2.8s",
	dispatched: "none",
};

const SVC_ICON: Record<ServiceType, ReactNode> = {
	ambulance:     <Cross    size={13} color="white" strokeWidth={2.5} />,
	police:        <Shield   size={13} color="white" strokeWidth={2.5} />,
	"fire-engine": <Flame    size={13} color="white" strokeWidth={2.5} />,
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

const allyInitials = (name: string): string =>
	name.replace(/^Dr\s+/, "").split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();

const allyFirstName = (name: string): string =>
	name.replace(/^Dr\s+/, "").split(" ")[0];

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
			backdropFilter: "blur(20px)",
			display: "flex",
			flexDirection: "column",
			zIndex: 10,
			fontFamily: Z.font,
		}}
	>
		{/* Header */}
		<div
			style={{
				padding: "14px 16px 12px",
				borderBottom: `1px solid ${Z.border}`,
				display: "flex",
				alignItems: "center",
			}}
		>
			<span
				style={{
					fontFamily: Z.fontHead,
					fontSize: 15,
					fontWeight: 900,
					color: Z.text,
					letterSpacing: "0.05em",
					textTransform: "uppercase",
				}}
			>
				Soteria
			</span>
			<span
				style={{
					marginLeft: "auto",
					display: "flex",
					alignItems: "center",
					gap: 5,
					color: "#22C55E",
					fontSize: 10,
					fontWeight: 600,
					letterSpacing: "0.08em",
					textTransform: "uppercase",
				}}
			>
				<span
					style={{
						width: 6,
						height: 6,
						borderRadius: "50%",
						background: "#22C55E",
						animation: "liveBlip 1.8s ease-in-out infinite",
						display: "inline-block",
					}}
				/>
				Live
			</span>
		</div>

		{/* Incidents count */}
		<div
			style={{
				padding: "7px 16px 5px",
				color: Z.muted,
				fontSize: 10,
				fontWeight: 600,
				letterSpacing: "0.1em",
				textTransform: "uppercase",
				display: "flex",
				alignItems: "center",
				gap: 6,
			}}
		>
			<span>Incidents</span>
			<span
				style={{
					background: STATUS_COLOR.incoming + "22",
					color: STATUS_COLOR.incoming,
					fontWeight: 700,
					fontSize: 9,
					padding: "1px 5px",
					borderRadius: 3,
				}}
			>
				{incidents.filter((i) => i.status === "incoming").length} incoming
			</span>
		</div>

		{/* List — sorted by status then age: incoming → active → dispatched */}
		<div style={{ flex: 1, overflowY: "auto" }}>
			{incidents.map((inc) => (
				<IncidentCard
					key={inc.id}
					incident={inc}
					selected={inc.id === selectedId}
					onSelect={() => onSelect(inc.id)}
				/>
			))}
		</div>

		{/* Footer */}
		<div
			style={{
				padding: "8px 16px",
				borderTop: `1px solid ${Z.borderSubtle}`,
				color: Z.muted,
				fontSize: 10,
				letterSpacing: "0.03em",
			}}
		>
			HK 999 Dispatch · Operator View
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
	const statusColor = STATUS_COLOR[incident.status];
	const allyCount = ALLIES.filter((a) => a.skills.includes(incident.type)).length;
	return (
		<button
			type="button"
			onClick={onSelect}
			style={{
				width: "100%",
				background: selected ? "rgba(12, 57, 146, 0.12)" : "transparent",
				border: "none",
				borderLeft: selected ? `2.5px solid ${Z.secondary}` : "2.5px solid transparent",
				borderBottom: `1px solid ${Z.borderSubtle}`,
				padding: "10px 16px 10px 13px",
				cursor: "pointer",
				textAlign: "left",
				display: "flex",
				alignItems: "flex-start",
				gap: 10,
			}}
		>
			{/* Type icon — uses type colour, not status colour */}
			<div
				style={{
					width: 32,
					height: 32,
					borderRadius: 6,
					background: typeColor + "20",
					border: `1px solid ${typeColor}50`,
					flexShrink: 0,
					marginTop: 1,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					gap: 1,
				}}
			>
				<span
					style={{
						color: typeColor,
						fontSize: 7,
						fontWeight: 800,
						letterSpacing: "-0.3px",
						lineHeight: 1,
					}}
				>
					{TYPE_CODE[incident.type]}
				</span>
			</div>

			<div style={{ flex: 1, minWidth: 0 }}>
				{/* Type + status */}
				<div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
					<span style={{ color: Z.text, fontSize: 12, fontWeight: 600 }}>
						{TYPE_LABEL[incident.type]}
					</span>
					<span
						style={{
							background: statusColor + "22",
							color: statusColor,
							fontSize: 9,
							fontWeight: 700,
							padding: "1px 5px",
							borderRadius: 3,
							textTransform: "uppercase",
							letterSpacing: "0.08em",
							flexShrink: 0,
						}}
					>
						{incident.status}
					</span>
				</div>

				{/* Address */}
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

				{/* Meta row: elapsed · allies · phone */}
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: 5,
						marginTop: 3,
						color: Z.muted,
						fontSize: 10,
					}}
				>
					<span
						style={{
							color: incident.status === "incoming" ? STATUS_COLOR.incoming : Z.muted,
							fontWeight: incident.status === "incoming" ? 600 : 400,
						}}
					>
						{formatElapsed(incident.receivedAt)} ago
					</span>
					<span style={{ opacity: 0.35 }}>·</span>
					<span
						style={{
							color: allyCount > 0 ? "#22C55E" : STATUS_COLOR.incoming,
							fontWeight: 600,
						}}
					>
						{allyCount} {allyCount === 1 ? "ally" : "allies"}
					</span>
				</div>
			</div>
		</button>
	);
};

const IncidentMarker = ({
	incident,
	selected,
	dimmed,
	onClick,
}: {
	incident: Incident;
	selected: boolean;
	dimmed: boolean;
	onClick: () => void;
}) => {
	const typeColor = TYPE_COLOR[incident.type];
	const statusColor = STATUS_COLOR[incident.status];
	const pulseDuration = STATUS_PULSE[incident.status];
	const showPulse = pulseDuration !== "none";
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
					opacity: dimmed ? 0.35 : 1,
					transition: "opacity 0.2s",
				}}
				aria-label={`${TYPE_LABEL[incident.type]} incident`}
			>
				{/* Status-coloured pulsing rings — speed varies by urgency */}
				{showPulse && (
					<>
						<span
							style={{
								position: "absolute",
								inset: 0,
								borderRadius: "50%",
								border: `1.5px solid ${statusColor}`,
								animation: `pulseRing ${pulseDuration} cubic-bezier(0.215, 0.61, 0.355, 1) infinite`,
							}}
						/>
						<span
							style={{
								position: "absolute",
								inset: 0,
								borderRadius: "50%",
								border: `1.5px solid ${statusColor}`,
								animation: `pulseRing ${pulseDuration} cubic-bezier(0.215, 0.61, 0.355, 1) infinite`,
								animationDelay: `${parseFloat(pulseDuration) * 0.5}s`,
							}}
						/>
					</>
				)}

				{/* Type-coloured centre — carries the 2-letter code */}
				<span
					style={{
						position: "relative",
						zIndex: 1,
						width: 22,
						height: 22,
						borderRadius: "50%",
						background: typeColor,
						color: "#fff",
						fontSize: 7,
						fontWeight: 800,
						letterSpacing: "-0.3px",
						fontFamily: Z.font,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						outline: selected ? `2.5px solid ${statusColor}` : "none",
						outlineOffset: 3,
						boxShadow: selected
							? `0 0 16px ${typeColor}90`
							: `0 0 6px ${typeColor}50`,
					}}
				>
					{TYPE_CODE[incident.type]}
				</span>
			</button>
		</Marker>
	);
};

const AllyMarker = ({ ally, rank }: { ally: Ally; rank: number }) => {
	const size = rank === 0 ? 34 : rank === 1 ? 26 : 20;
	const iconSize = rank === 0 ? 18 : rank === 1 ? 14 : 11;
	return (
		<Marker longitude={ally.coords[0]} latitude={ally.coords[1]} anchor="center">
			<div
				title={ally.name}
				style={{
					width: size,
					height: size,
					borderRadius: "50%",
					background: rank === 0 ? Z.secondary : "rgba(6, 8, 14, 0.88)",
					border: `2px solid ${rank === 0 ? Z.secondary : Z.secondary + "60"}`,
					opacity: rank === 0 ? 1 : rank === 1 ? 0.65 : 0.4,
					boxShadow: rank === 0 ? `0 0 20px ${Z.secondary}80, 0 0 8px ${Z.secondary}50` : "none",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					transition: "all 0.3s ease",
				}}
			>
				<svg viewBox="0 0 24 24" width={iconSize} height={iconSize} aria-hidden="true">
					<circle cx="12" cy="7" r="4" fill="white" />
					<path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" fill="white" />
				</svg>
			</div>
		</Marker>
	);
};

const VehicleMarker = ({ svc, pos }: { svc: EmergencyService; pos: [number, number] }) => {
	const color = svcColor(svc.type);
	return (
		<Marker longitude={pos[0]} latitude={pos[1]} anchor="center">
			<div
				title={`${SVC_LABEL[svc.type]} ${svc.callsign}`}
				style={{
					display: "flex",
					alignItems: "center",
					gap: 5,
					background: color,
					borderRadius: 20,
					padding: "5px 9px 5px 7px",
					boxShadow: `0 0 14px ${color}70, 0 2px 8px rgba(0,0,0,0.55)`,
					border: "1.5px solid rgba(255,255,255,0.25)",
					whiteSpace: "nowrap",
					fontFamily: Z.font,
				}}
			>
				{SVC_ICON[svc.type]}
				<span style={{ color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: "0.04em" }}>
					{svc.callsign}
				</span>
			</div>
		</Marker>
	);
};

// Fixed source/layer IDs — only data updates when the selected incident changes.
const RouteLayer = ({
	allies,
	allyRoutes,
	services,
	serviceRoutes,
	incident,
}: {
	allies: Ally[];
	allyRoutes: Record<string, RouteData>;
	services: EmergencyService[];
	serviceRoutes: Record<string, RouteData>;
	incident: Incident;
}) => {
	const data = useMemo(
		(): GeoJSON.FeatureCollection => ({
			type: "FeatureCollection",
			features: [
				...allies.map((ally, rank) => ({
					type: "Feature" as const,
					geometry: {
						type: "LineString" as const,
						coordinates: allyRoutes[ally.id]?.coords ?? [ally.coords, incident.coords],
					},
					properties: { routeType: "ally", rank },
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
		[allies, allyRoutes, services, serviceRoutes, incident],
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
					"line-width": ["case", ["==", ["get", "rank"], 0], 2.5, 1.2],
					"line-opacity": [
						"case",
						["==", ["get", "rank"], 0], 0.9,
						["==", ["get", "rank"], 1], 0.4,
						0.15,
					],
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

const AllyPanel = ({
	incident,
	allies,
	allyRoutes,
	serviceRoutes,
	serviceProgress,
	onClose,
}: {
	incident: Incident;
	allies: Ally[];
	allyRoutes: Record<string, RouteData>;
	serviceRoutes: Record<string, RouteData>;
	serviceProgress: Record<string, number>;
	onClose: () => void;
}) => {
	const typeColor = TYPE_COLOR[incident.type];
	const statusColor = STATUS_COLOR[incident.status];
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
				backdropFilter: "blur(20px)",
				display: "flex",
				flexDirection: "column",
				zIndex: 10,
				fontFamily: Z.font,
				animation: "slideInRight 0.22s ease",
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
				{/* Type badge */}
				<div
					style={{
						width: 34,
						height: 34,
						borderRadius: 6,
						background: typeColor + "20",
						border: `1px solid ${typeColor}50`,
						flexShrink: 0,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<span
						style={{
							color: typeColor,
							fontSize: 8,
							fontWeight: 800,
							letterSpacing: "-0.3px",
						}}
					>
						{TYPE_CODE[incident.type]}
					</span>
				</div>

				<div style={{ flex: 1, minWidth: 0 }}>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: 5,
							marginBottom: 2,
						}}
					>
						<span style={{ color: Z.text, fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>
							{TYPE_LABEL[incident.type]}
						</span>
						<span
							style={{
								background: statusColor + "22",
								color: statusColor,
								fontSize: 9,
								fontWeight: 700,
								padding: "1px 5px",
								borderRadius: 3,
								textTransform: "uppercase",
								letterSpacing: "0.08em",
								flexShrink: 0,
							}}
						>
							{incident.status}
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
				{/* Best match hero */}
				<div style={{ padding: "10px 14px 0" }}>
					<div
						style={{
							color: Z.muted,
							fontSize: 10,
							fontWeight: 600,
							letterSpacing: "0.1em",
							textTransform: "uppercase",
							marginBottom: 8,
						}}
					>
						Best Match
					</div>
					{allies[0] ? (
						<AllyHeroCard ally={allies[0]} route={allyRoutes[allies[0].id]} />
					) : (
						<div
							style={{
								color: Z.muted,
								fontSize: 12,
								padding: "12px 0",
								lineHeight: 1.5,
							}}
						>
							No allies with matching skills nearby
						</div>
					)}
				</div>

				{/* Compact list for remaining allies */}
				{allies.length > 1 && (
					<div style={{ padding: "10px 14px 4px" }}>
						<div
							style={{
								color: Z.muted,
								fontSize: 10,
								fontWeight: 600,
								letterSpacing: "0.1em",
								textTransform: "uppercase",
								marginBottom: 2,
							}}
						>
							Also Nearby ({allies.length - 1})
						</div>
						{allies.slice(1).map((ally, i) => (
							<AllyCompactRow
								key={ally.id}
								ally={ally}
								rank={i + 2}
								route={allyRoutes[ally.id]}
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
				<div style={{ padding: "8px 14px 4px" }}>
					<div
						style={{
							color: Z.muted,
							fontSize: 10,
							fontWeight: 600,
							letterSpacing: "0.1em",
							textTransform: "uppercase",
							marginBottom: 2,
						}}
					>
						Responding Units
					</div>
					{incident.emergencyServices.map((svc) => (
						<ServiceRow
							key={svc.id}
							svc={svc}
							route={serviceRoutes[svc.id]}
							progress={serviceProgress[svc.id] ?? 0}
						/>
					))}
				</div>

				<div style={{ height: 12 }} />
			</div>
		</div>
	);
};

const AllyHeroCard = ({ ally, route }: { ally: Ally; route?: RouteData }) => (
	<div
		style={{
			background: "rgba(12, 57, 146, 0.1)",
			border: `1px solid rgba(12, 57, 146, 0.28)`,
			borderLeft: `3px solid ${Z.secondary}`,
			borderRadius: 6,
			padding: "12px 14px",
		}}
	>
		<div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
			{/* Avatar mirrors the map marker */}
			<div
				style={{
					width: 32,
					height: 32,
					borderRadius: 6,
					background: Z.secondary,
					color: "#fff",
					fontSize: 11,
					fontWeight: 700,
					fontFamily: Z.font,
					letterSpacing: "-0.3px",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					flexShrink: 0,
					boxShadow: `0 0 14px ${Z.secondary}50`,
				}}
			>
				{allyInitials(ally.name)}
			</div>
			<div style={{ flex: 1, minWidth: 0 }}>
				<div
					style={{
						color: Z.text,
						fontSize: 14,
						fontWeight: 700,
						lineHeight: 1.2,
						overflow: "hidden",
						textOverflow: "ellipsis",
						whiteSpace: "nowrap",
					}}
				>
					{ally.name}
				</div>
				<div style={{ color: Z.secondary, fontSize: 11, fontWeight: 600, marginTop: 2 }}>
					{ally.credentialScore}★
				</div>
			</div>
		</div>

		{route ? (
			<div style={{ color: Z.muted, fontSize: 12, marginBottom: 12 }}>
				<span style={{ color: Z.text, fontWeight: 600 }}>{formatDuration(route.durationS)}</span>
				{" walking · "}
				<span>{formatDist(route.distanceM)}</span>
			</div>
		) : (
			<div style={{ color: Z.muted, fontSize: 11, marginBottom: 12 }}>Loading route…</div>
		)}

		<a
			href={`tel:${ally.phone}`}
			style={{
				display: "block",
				textAlign: "center",
				background: Z.primary,
				color: "#fff",
				fontSize: 12,
				fontWeight: 700,
				padding: "10px 0",
				borderRadius: 5,
				textDecoration: "none",
				letterSpacing: "0.08em",
				textTransform: "uppercase",
			}}
		>
			Call Now
		</a>
	</div>
);

const AllyCompactRow = ({ ally, rank, route }: { ally: Ally; rank: number; route?: RouteData }) => (
	<div
		style={{
			display: "flex",
			alignItems: "center",
			gap: 8,
			padding: "7px 0",
			borderTop: `1px solid ${Z.borderSubtle}`,
		}}
	>
		<span
			style={{
				width: 14,
				flexShrink: 0,
				color: Z.muted,
				fontSize: 10,
				fontWeight: 600,
				textAlign: "right",
			}}
		>
			{rank}
		</span>
		<span
			style={{
				flex: 1,
				color: Z.text,
				fontSize: 11,
				overflow: "hidden",
				textOverflow: "ellipsis",
				whiteSpace: "nowrap",
			}}
		>
			{ally.name}
		</span>
		<span style={{ color: Z.muted, fontSize: 10, flexShrink: 0 }}>
			{route ? formatDuration(route.durationS) : "—"}
		</span>
		<span style={{ color: Z.muted, fontSize: 10, flexShrink: 0 }}>{ally.credentialScore}★</span>
		<a
			href={`tel:${ally.phone}`}
			style={{
				flexShrink: 0,
				color: Z.primary,
				fontSize: 9,
				fontWeight: 700,
				textDecoration: "none",
				border: `1px solid ${Z.primary}30`,
				padding: "3px 8px",
				borderRadius: 3,
				textTransform: "uppercase",
				letterSpacing: "0.05em",
			}}
		>
			call
		</a>
	</div>
);

const ServiceRow = ({
	svc,
	route,
	progress,
}: {
	svc: EmergencyService;
	route?: RouteData;
	progress: number;
}) => {
	const color = svcColor(svc.type);
	const etaRemaining = route
		? Math.max(0, route.durationS * (1 - progress))
		: svc.etaMinutes * 60 * (1 - progress);
	const pct = Math.min(progress * 100, 100);
	return (
		<div
			style={{
				padding: "9px 16px",
				borderBottom: `1px solid ${Z.borderSubtle}`,
				display: "flex",
				alignItems: "center",
				gap: 10,
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
					<span style={{ color: Z.text, fontSize: 11, fontWeight: 500 }}>
						{svc.callsign}
					</span>
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
		</div>
	);
};

// ── Root ──────────────────────────────────────────────────────────────────────

export const SoteriaMap = () => {
	const mapRef = useRef<MapRef>(null);
	const selectedIdRef = useRef<string | null>(null);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [allyRoutes, setAllyRoutes] = useState<Record<string, RouteData>>({});
	const [serviceRoutes, setServiceRoutes] = useState<Record<string, RouteData>>({});
	const [serviceProgress, setServiceProgress] = useState<Record<string, number>>({});
	const [, setTick] = useState(0);

	// Sorted: incoming first, then by age (oldest active escalates first)
	const sortedIncidents = useMemo(
		() =>
			[...INCIDENTS].sort((a, b) => {
				const ord: Record<IncidentStatus, number> = { incoming: 0, active: 1, dispatched: 2 };
				return ord[a.status] - ord[b.status] || a.receivedAt - b.receivedAt;
			}),
		[],
	);

	const selectedIncident = useMemo(
		() => INCIDENTS.find((i) => i.id === selectedId) ?? null,
		[selectedId],
	);

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

	return (
		<div style={{ width: "100vw", height: "100vh", position: "relative" }}>
			<MapGL
				ref={mapRef}
				mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
				mapStyle="mapbox://styles/mapbox/dark-v11"
				style={{ width: "100%", height: "100%" }}
				initialViewState={{ longitude: 114.175, latitude: 22.29, zoom: 10, pitch: 0, bearing: 0 }}
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
						/>
					</>
				)}

				{/* All incident markers — unselected dim when something is selected */}
				{INCIDENTS.map((inc) => (
					<IncidentMarker
						key={inc.id}
						incident={inc}
						selected={inc.id === selectedId}
						dimmed={!!selectedId && inc.id !== selectedId}
						onClick={() => handleSelect(inc.id)}
					/>
				))}

				{/* Ally markers (only for selected incident) */}
				{selectedIncident &&
					rankedAllies.map((ally, rank) => (
						<AllyMarker key={ally.id} ally={ally} rank={rank} />
					))}

				{/* Animated emergency vehicles */}
				{selectedIncident &&
					selectedIncident.emergencyServices.map((svc) => {
						const coords = serviceRoutes[svc.id]?.coords ?? null;
						const pos = coords
							? interpolateRoute(coords, serviceProgress[svc.id] ?? 0)
							: svc.coords;
						return <VehicleMarker key={svc.id} svc={svc} pos={pos} />;
					})}
			</MapGL>

			{/* Left sidebar — sorted by urgency */}
			<IncidentSidebar
				incidents={sortedIncidents}
				selectedId={selectedId}
				onSelect={handleSelect}
			/>

			{/* Right detail panel */}
			{selectedIncident && (
				<AllyPanel
					incident={selectedIncident}
					allies={rankedAllies}
					allyRoutes={allyRoutes}
					serviceRoutes={serviceRoutes}
					serviceProgress={serviceProgress}
					onClose={() => setSelectedId(null)}
				/>
			)}
		</div>
	);
};
