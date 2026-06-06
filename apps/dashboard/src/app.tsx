import { useEffect, useState } from "react";
import type { Incident } from "~/domain/types";
import { AddIncidentPanel } from "~/features/incidents/AddIncidentPanel";
import { RecommenderPanel } from "~/features/incidents/RecommenderPanel";
import { MapView } from "~/features/map/MapView";
import { useIncidentsStore } from "~/store/incidents";

export const App = () => {
	const loadSeed = useIncidentsStore((s) => s.loadSeed);
	const addIncident = useIncidentsStore((s) => s.addIncident);
	const [focusIncident, setFocusIncident] = useState<Incident | null>(null);

	useEffect(() => loadSeed(), [loadSeed]);

	const handleAdd = () => setFocusIncident(addIncident());

	return (
		<div className="flex h-screen w-screen flex-col bg-slate-100">
			<header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
				<div>
					<h1 className="text-xl font-bold text-slate-900">Reach — Operator Dashboard</h1>
					<p className="text-xs text-slate-500">Hong Kong emergency dispatch</p>
				</div>
				<span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
					CAD feed connected
				</span>
			</header>

			<div className="flex min-h-0 flex-1">
				<aside className="w-72 shrink-0 overflow-y-auto border-r border-slate-200 bg-white">
					<AddIncidentPanel onAdd={handleAdd} />
				</aside>

				<main className="min-w-0 flex-1">
					<MapView focusIncident={focusIncident} />
				</main>

				<aside className="w-80 shrink-0 overflow-y-auto border-l border-slate-200 bg-white">
					<RecommenderPanel />
				</aside>
			</div>
		</div>
	);
};
