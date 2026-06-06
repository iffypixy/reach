import { HK_BOUNDS } from "~/config/hk";
import { CERTIFICATION_TYPES, type Certification, type Responder } from "~/domain/responder";

export const RESPONDER_POOL_SIZE = 300;
export const RESPONDER_SEED = 42;

const FIRST_NAMES = [
	"Wing",
	"Ka",
	"Ho",
	"Man",
	"Ying",
	"Chi",
	"Mei",
	"Kit",
	"Sum",
	"Wai",
	"Jun",
	"Hin",
	"Tsz",
	"Lok",
	"Chun",
	"Yui",
	"Long",
	"Ping",
	"Siu",
	"Fai",
];

const LAST_NAMES = [
	"Chan",
	"Wong",
	"Lee",
	"Lam",
	"Cheung",
	"Ng",
	"Leung",
	"Tang",
	"Ho",
	"Yip",
	"Cheng",
	"Chow",
	"Tsang",
	"Kwok",
	"Tam",
	"Au",
	"Fung",
	"Ma",
	"Yuen",
	"Lo",
];

const mulberry32 = (seed: number) => {
	let s = seed;
	return () => {
		s |= 0;
		s = (s + 0x6d2b79f5) | 0;
		let t = Math.imul(s ^ (s >>> 15), 1 | s);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
};

const pick = <T>(rng: () => number, items: T[]): T =>
	items[Math.floor(rng() * items.length)] ?? items[0]!;

export const generateResponders = (
	count = RESPONDER_POOL_SIZE,
	seed = RESPONDER_SEED,
): Responder[] => {
	const rng = mulberry32(seed);
	const cols = Math.ceil(Math.sqrt(count * 1.2));
	const rows = Math.ceil(count / cols);
	const latStep = (HK_BOUNDS.maxLat - HK_BOUNDS.minLat) / rows;
	const lngStep = (HK_BOUNDS.maxLng - HK_BOUNDS.minLng) / cols;
	const res: Responder[] = [];

	for (let i = 0; i < count; i++) {
		const row = Math.floor(i / cols);
		const col = i % cols;
		const lat = HK_BOUNDS.minLat + latStep * (row + 0.5) + (rng() - 0.5) * latStep * 0.6;
		const lng = HK_BOUNDS.minLng + lngStep * (col + 0.5) + (rng() - 0.5) * lngStep * 0.6;
		const hasCerts = rng() < 0.3;
		const createdDaysAgo = Math.floor(rng() * 900) + 30;
		const certifications: Certification[] = [];

		if (hasCerts) {
			const certCount = Math.floor(rng() * 3) + 1;
			const types = [...CERTIFICATION_TYPES];
			for (let j = 0; j < certCount; j++) {
				const idx = Math.floor(rng() * types.length);
				const type = types.splice(idx, 1)[0];
				if (!type) break;
				certifications.push({
					id: `cert-${seed}-${i}-${j}`,
					type,
					customLabel:
						type === "other"
							? pick(rng, ["Community First Aid", "Red Cross Volunteer"])
							: undefined,
					verified: rng() < 0.7,
				});
			}
		}

		res.push({
			id: `resp-${seed}-${i}`,
			firstName: pick(rng, FIRST_NAMES),
			lastName: pick(rng, LAST_NAMES),
			email: rng() < 0.6 ? `user${i}@example.com` : undefined,
			createdAt: new Date(Date.now() - createdDaysAgo * 86400000).toISOString(),
			lat,
			lng,
			certifications,
		});
	}

	return res;
};
