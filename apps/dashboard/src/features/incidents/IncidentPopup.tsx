import { INCIDENT_LABELS, SERVICE_COLORS, SERVICE_LABELS } from "~/domain/mapping";
import type { Incident } from "~/domain/types";
import { getUnitEtaLabel } from "~/features/map/useDispatchAnimation";

type Props = {
	incident: Incident;
};

export const IncidentPopupContent = ({ incident }: Props) => (
	<div className="min-w-56 space-y-2 text-sm text-slate-200">
		<div>
			<p className="font-semibold text-white">{incident.title}</p>
			<p className="text-xs text-slate-400">
				{incident.source === "seed" ? "CAD feed" : "Operator registered"} ·{" "}
				{INCIDENT_LABELS[incident.category]}
			</p>
		</div>
		{incident.address && <p className="text-xs text-slate-400">{incident.address}</p>}
		<div className="space-y-1.5 border-t border-white/10 pt-2">
			<p className="text-xs font-medium text-slate-300">Inbound units</p>
			{incident.dispatchUnits.map((unit) => (
				<div key={unit.id} className="flex items-center gap-2 text-xs">
					<span
						className="size-2 shrink-0 rounded-full"
						style={{ backgroundColor: SERVICE_COLORS[unit.service] }}
					/>
					<span className="flex-1 text-slate-300">
						{SERVICE_LABELS[unit.service]} — {unit.stationName}
					</span>
					<span className="font-mono text-slate-400">{getUnitEtaLabel(unit)}</span>
				</div>
			))}
		</div>
		<div className="border-t border-white/10 pt-2 text-xs text-slate-400">
			Citizen responders:{" "}
			{incident.respondersContacted ? (
				<span className="font-medium text-green-400">Contacted</span>
			) : (
				<span className="text-slate-500">Not contacted</span>
			)}
		</div>
	</div>
);
