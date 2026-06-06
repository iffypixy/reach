import type { Incident } from "~/domain/types";

const STORAGE_KEY = "soteria-incidents";

type PersistedState = {
	operatorIncidents: Incident[];
	overrides: Record<string, Pick<Incident, "contactedAllyIds" | "handled">>;
};

const normalize = (inc: Incident): Incident => ({
	...inc,
	contactedAllyIds: inc.contactedAllyIds ?? [],
	handled: inc.handled ?? false,
	source: inc.source ?? "operator",
});

export const loadPersistedState = (): PersistedState => {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return { operatorIncidents: [], overrides: {} };
		const parsed = JSON.parse(raw) as PersistedState;
		return {
			operatorIncidents: (parsed.operatorIncidents ?? []).map(normalize),
			overrides: parsed.overrides ?? {},
		};
	} catch {
		return { operatorIncidents: [], overrides: {} };
	}
};

export const savePersistedState = (incidents: Incident[]) => {
	const operatorIncidents = incidents.filter((i) => i.source === "operator").map(normalize);
	const overrides: PersistedState["overrides"] = {};
	for (const inc of incidents) {
		if (inc.contactedAllyIds.length > 0 || inc.handled)
			overrides[inc.id] = {
				contactedAllyIds: inc.contactedAllyIds,
				handled: inc.handled,
			};
	}
	localStorage.setItem(STORAGE_KEY, JSON.stringify({ operatorIncidents, overrides }));
};

export const mergeIncidents = (seed: Incident[], persisted: PersistedState): Incident[] => {
	const merged = [
		...seed.map((inc) => {
			const override = persisted.overrides[inc.id];
			if (!override) return inc;
			return { ...inc, ...override };
		}),
		...persisted.operatorIncidents,
	];
	return merged;
};
