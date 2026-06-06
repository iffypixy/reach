import { CERTIFICATION_LABELS } from "~/domain/responder";
import type { Incident } from "~/domain/types";
import type { RankedResponder } from "~/features/recommender/rankResponders";
import { useIncidentsStore } from "~/store/incidents";
import { useRecommendationsStore } from "~/store/recommendations";

type Props = {
	focusIncident: Incident | null;
};

const EMPTY_RECOMMENDATIONS: RankedResponder[] = [];

export const RecommenderPanel = ({ focusIncident }: Props) => {
	const recommendations = useRecommendationsStore((s) =>
		focusIncident
			? (s.recommendationsByIncidentId[focusIncident.id] ?? EMPTY_RECOMMENDATIONS)
			: EMPTY_RECOMMENDATIONS,
	);
	const loading = useRecommendationsStore((s) =>
		focusIncident ? (s.loadingByIncidentId[focusIncident.id] ?? false) : false,
	);
	const toggleContacted = useIncidentsStore((s) => s.toggleContactedResponder);
	const setHandled = useIncidentsStore((s) => s.setIncidentHandled);

	if (!focusIncident) {
		return (
			<div className="flex h-full flex-col gap-4 p-4">
				<Header />
				<div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-400">
					Add an incident to see ranked citizen responders
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col gap-4 p-4">
			<Header />
			{loading && (
				<div className="flex items-center gap-2 text-sm text-slate-500">
					<div className="size-4 animate-spin rounded-full border-2 border-slate-300 border-t-violet-600" />
					Ranking responders…
				</div>
			)}
			<ul className="flex flex-1 flex-col gap-2 overflow-y-auto">
				{recommendations.map((ranked, index) => (
					<ResponderRow
						key={ranked.responder.id}
						rank={index + 1}
						ranked={ranked}
						contacted={focusIncident.contactedResponderIds.includes(ranked.responder.id)}
						onToggleContact={() => toggleContacted(focusIncident.id, ranked.responder.id)}
					/>
				))}
				{!loading && recommendations.length === 0 && (
					<li className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-400">
						No responders within range
					</li>
				)}
			</ul>
			<button
				type="button"
				onClick={() => setHandled(focusIncident.id, !focusIncident.incidentHandled)}
				className={`rounded-lg px-4 py-2.5 text-sm font-semibold ${
					focusIncident.incidentHandled
						? "bg-slate-200 text-slate-600"
						: "bg-violet-600 text-white hover:bg-violet-700"
				}`}
			>
				{focusIncident.incidentHandled ? "Reopen incident" : "Done with incident"}
			</button>
		</div>
	);
};

const Header = () => (
	<div>
		<h2 className="text-lg font-semibold text-slate-900">Recommended responders</h2>
		<p className="text-xs text-slate-500">Ranked by distance, credentials, and verification</p>
	</div>
);

type RowProps = {
	rank: number;
	ranked: RankedResponder;
	contacted: boolean;
	onToggleContact: () => void;
};

const ResponderRow = ({ rank, ranked, contacted, onToggleContact }: RowProps) => {
	const { responder, score, distanceKm, matchedCerts } = ranked;
	return (
		<li
			className={`rounded-lg border p-3 ${
				contacted ? "border-green-300 bg-green-50" : "border-slate-200 bg-white"
			}`}
		>
			<div className="flex items-start justify-between gap-2">
				<div>
					<p className="text-sm font-semibold text-slate-900">
						<span className="mr-1.5 text-xs font-normal text-slate-400">#{rank}</span>
						{responder.firstName} {responder.lastName}
					</p>
					<p className="text-xs text-slate-500">
						{distanceKm.toFixed(1)} km · score {(score * 100).toFixed(0)}
					</p>
				</div>
				<button
					type="button"
					onClick={onToggleContact}
					className={`shrink-0 rounded-md px-2 py-1 text-xs font-medium ${
						contacted
							? "bg-green-600 text-white"
							: "border border-slate-300 text-slate-600 hover:bg-slate-50"
					}`}
				>
					{contacted ? "Contacted" : "Contact"}
				</button>
			</div>
			{matchedCerts.length > 0 ? (
				<div className="mt-2 flex flex-wrap gap-1">
					{matchedCerts.map((cert) => (
						<span
							key={cert.type}
							className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
								cert.verified ? "bg-violet-100 text-violet-800" : "bg-slate-100 text-slate-600"
							}`}
						>
							{CERTIFICATION_LABELS[cert.type]}
							{cert.verified ? " ✓" : ""}
						</span>
					))}
				</div>
			) : (
				<p className="mt-2 text-[10px] text-slate-400">No matching credentials</p>
			)}
		</li>
	);
};
