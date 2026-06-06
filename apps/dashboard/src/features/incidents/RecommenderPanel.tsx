import { useEffect, useState } from "react";

import { INCIDENT_LABELS, SERVICE_LABELS } from "~/domain/mapping";
import type { IncidentCreatedPayload } from "~/events/bus";
import { bus } from "~/events/bus";

type PendingRecommendation = IncidentCreatedPayload & { receivedAt: number };

export const RecommenderPanel = () => {
	const [pending, setPending] = useState<PendingRecommendation | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(
		() =>
			bus.on("incident:created", (detail) => {
				setPending({ ...detail, receivedAt: Date.now() });
				setLoading(true);
				setTimeout(() => setLoading(false), 2500);
			}),
		[],
	);

	return (
		<div className="flex h-full flex-col gap-4 p-4">
			<div>
				<h2 className="text-lg font-semibold text-slate-900">Recommended responders</h2>
				<p className="text-xs text-slate-500">AI recommender integration (teammate)</p>
			</div>

			{!pending && (
				<div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-400">
					Add an incident to trigger responder recommendations
				</div>
			)}

			{pending && loading && (
				<div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white p-6">
					<div className="size-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
					<p className="text-sm text-slate-600">Finding nearby responders…</p>
					<p className="text-xs text-slate-400">
						{INCIDENT_LABELS[pending.category]} ·{" "}
						{pending.services.map((s) => SERVICE_LABELS[s]).join(", ")}
					</p>
				</div>
			)}

			{pending && !loading && (
				<div className="flex flex-1 flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4">
					<p className="text-sm font-medium text-slate-800">Event emitted: incident:created</p>
					<pre className="overflow-auto rounded bg-slate-50 p-3 font-mono text-xs text-slate-600">
						{JSON.stringify(
							{
								incidentId: pending.incidentId,
								category: pending.category,
								lat: pending.lat,
								lng: pending.lng,
								services: pending.services,
							},
							null,
							2,
						)}
					</pre>
					<p className="text-xs text-slate-400">
						Responder list will render here once the recommender module is wired in via
						bus.on(&quot;incident:created&quot;, …)
					</p>
				</div>
			)}
		</div>
	);
};
