import { useCallback, useEffect, useState } from "react";

import { geocodeUrl, MAPTILER_KEY } from "~/config/hk";
import { INCIDENT_CATEGORIES, INCIDENT_LABELS } from "~/domain/mapping";
import type { Coord, IncidentCategory } from "~/domain/types";
import { useIncidentsStore } from "~/store/incidents";

type GeocodeResult = {
	place_name: string;
	center: [number, number];
};

type Props = {
	isAddingMode: boolean;
	onToggleAddingMode: (active: boolean) => void;
	pendingLocation: Coord | null;
	onSetLocation: (coord: Coord, address?: string) => void;
	onClearLocation: () => void;
};

export const AddIncidentPanel = ({
	isAddingMode,
	onToggleAddingMode,
	pendingLocation,
	onSetLocation,
	onClearLocation,
}: Props) => {
	const addIncident = useIncidentsStore((s) => s.addIncident);
	const [category, setCategory] = useState<IncidentCategory>("cardiacArrest");
	const [addressQuery, setAddressQuery] = useState("");
	const [searchResults, setSearchResults] = useState<GeocodeResult[]>([]);
	const [selectedAddress, setSelectedAddress] = useState<string | undefined>();

	const searchAddress = useCallback(async () => {
		if (!addressQuery.trim() || !MAPTILER_KEY) return;
		const res = await fetch(geocodeUrl(addressQuery.trim()));
		if (!res.ok) return;
		const data = (await res.json()) as { features: GeocodeResult[] };
		setSearchResults(data.features ?? []);
	}, [addressQuery]);

	useEffect(() => {
		if (!addressQuery.trim()) {
			setSearchResults([]);
			return;
		}
		const timer = setTimeout(() => searchAddress(), 400);
		return () => clearTimeout(timer);
	}, [addressQuery, searchAddress]);

	const selectResult = (result: GeocodeResult) => {
		const [lng, lat] = result.center;
		setSelectedAddress(result.place_name);
		setAddressQuery(result.place_name);
		setSearchResults([]);
		onSetLocation({ lat, lng }, result.place_name);
		onToggleAddingMode(false);
	};

	const handleAdd = () => {
		if (!pendingLocation) return;
		addIncident({
			category,
			lat: pendingLocation.lat,
			lng: pendingLocation.lng,
			address: selectedAddress ?? (addressQuery || undefined),
		});
		setAddressQuery("");
		setSelectedAddress(undefined);
		setSearchResults([]);
		onClearLocation();
		onToggleAddingMode(false);
	};

	return (
		<div className="flex h-full flex-col gap-4 p-4">
			<div>
				<h2 className="text-lg font-semibold text-slate-900">Add incident</h2>
				<p className="text-xs text-slate-500">Register a new incident and dispatch nearest units</p>
			</div>

			<label className="flex flex-col gap-1 text-sm">
				<span className="font-medium text-slate-700">Incident type</span>
				<select
					value={category}
					onChange={(e) => setCategory(e.target.value as IncidentCategory)}
					className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
				>
					{INCIDENT_CATEGORIES.map((cat) => (
						<option key={cat} value={cat}>
							{INCIDENT_LABELS[cat]}
						</option>
					))}
				</select>
			</label>

			<label className="flex flex-col gap-1 text-sm">
				<span className="font-medium text-slate-700">Location (address search)</span>
				<input
					type="text"
					value={addressQuery}
					onChange={(e) => setAddressQuery(e.target.value)}
					placeholder="Search Hong Kong address..."
					className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400"
				/>
				{!MAPTILER_KEY && (
					<span className="text-xs text-amber-600">
						Add VITE_MAPTILER_KEY to .env for address search
					</span>
				)}
			</label>

			{searchResults.length > 0 && (
				<ul className="max-h-40 overflow-y-auto rounded-lg border border-slate-200 bg-white text-sm">
					{searchResults.map((result) => (
						<li key={result.place_name}>
							<button
								type="button"
								onClick={() => selectResult(result)}
								className="w-full px-3 py-2 text-left hover:bg-slate-50"
							>
								{result.place_name}
							</button>
						</li>
					))}
				</ul>
			)}

			<div className="flex flex-col gap-2">
				<button
					type="button"
					onClick={() => onToggleAddingMode(!isAddingMode)}
					className={`rounded-lg border px-3 py-2 text-sm font-medium ${
						isAddingMode
							? "border-blue-600 bg-blue-50 text-blue-700"
							: "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
					}`}
				>
					{isAddingMode ? "Click map to set location…" : "Pick location on map"}
				</button>
				{pendingLocation && (
					<p className="font-mono text-xs text-slate-500">
						{pendingLocation.lat.toFixed(4)}, {pendingLocation.lng.toFixed(4)}
					</p>
				)}
			</div>

			<div className="mt-auto space-y-2 border-t border-slate-200 pt-4">
				<p className="text-xs text-slate-400">
					Title, severity, description — placeholder (team TBD)
				</p>
				<button
					type="button"
					onClick={handleAdd}
					disabled={!pendingLocation}
					className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
				>
					Add incident
				</button>
			</div>
		</div>
	);
};
