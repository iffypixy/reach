type Props = {
	onAdd: () => void;
};

export const AddIncidentPanel = ({ onAdd }: Props) => (
	<div className="flex h-full flex-col gap-4 p-4">
		<div>
			<h2 className="text-lg font-semibold text-slate-900">Add incident</h2>
			<p className="text-xs text-slate-500">
				Register a random incident and dispatch the nearest available units
			</p>
		</div>

		<button
			type="button"
			onClick={onAdd}
			className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
		>
			Add incident
		</button>

		<p className="mt-auto text-xs text-slate-400">
			Each press spawns an incident at a Hong Kong hotspot with units already en route.
		</p>
	</div>
);
