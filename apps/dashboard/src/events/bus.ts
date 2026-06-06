import type { IncidentCategory, ServiceCategory } from "~/domain/types";

export type IncidentCreatedPayload = {
	incidentId: string;
	category: IncidentCategory;
	lat: number;
	lng: number;
	services: ServiceCategory[];
};

type EventMap = {
	"incident:created": IncidentCreatedPayload;
};

type Handler<T> = (detail: T) => void;

class EventBus {
	private target = new EventTarget();

	emit<K extends keyof EventMap>(type: K, detail: EventMap[K]) {
		this.target.dispatchEvent(new CustomEvent(type, { detail }));
	}

	on<K extends keyof EventMap>(type: K, handler: Handler<EventMap[K]>) {
		const listener = (e: Event) => handler((e as CustomEvent<EventMap[K]>).detail);
		this.target.addEventListener(type, listener);
		return () => this.target.removeEventListener(type, listener);
	}
}

export const bus = new EventBus();
