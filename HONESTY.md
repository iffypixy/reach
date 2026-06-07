# HONESTY.md

> Mandatory disclosure for the hackathon. This file lives at the root of your repository. Judges cross-check it against your code and your technical video.
>
> **The deal:** disclosed shortcuts are **not** penalized — that is the entire point of this file. Hidden ones are. Undisclosed pre-built code is heavily penalized, each undisclosed mock carries a small penalty, and a faked demo is heavily penalized. Telling the truth here costs you nothing.

---

## 1. Team — who did what
Judges compare this against `git shortlog -sn`, so keep it honest.

| Member | GitHub handle | Main contributions |
|---|---|---|
| Anastasios (Tasos) Vlachmpeis | *(fill in)* | Dashboard map UI, incident/ally dispatch logic, ally recommender, Mapbox routing & animations, operator workflow, merge integration |
| Nurzhan Zhukesh | zhukeshhhh | Soteria mobile app (registration, OTP/SMS server wiring), AGENTS.md updates |
| Ansat | iffypixy | Early mapbox branch / map integration work (merged via PR #1) |

---

## 2. What is fully working
Features that run end-to-end on the live app, with real data and real logic. Be specific: name the feature, what input it takes, what output it produces.

**Operator dashboard (`apps/dashboard`)**

- **Live Hong Kong map** — Mapbox GL map centered on HK, pan/zoom clamped to a ~20 km radius (`config/hk.ts`). Renders incident pins, emergency-service vehicles, ally markers, and optional route overlays.
- **Incident board & selection** — Seed incidents load on startup; operator-created incidents persist in `localStorage` (`data/incidentStorage.ts`). Selecting an incident opens the side panel with type, address, caller number, dispatched units, and ally recommendations.
- **Operator “Fetch incident” flow** — Clicking **Fetch incident** picks a random incident type, generates a land coordinate clear of existing incidents, synthesizes dispatched ambulance/police/fire units (`data/dispatch.ts`), reverse-geocodes the address via Mapbox when possible, and selects the new incident (`map.tsx`).
- **Ally recommender** — For the selected incident, ranks nearby allies by a real weighted score: 70% proximity (Mapbox walking route distance when available, haversine fallback) + 30% credential relevance (`features/recommender/scoreAlly.ts`, `rankAllies.ts`). Returns the top 10 within 10 km.
- **Walking & driving routes** — Ally approach paths and emergency-vehicle routes are fetched from the **Mapbox Directions API** (walking / driving profiles). Invalid straight-line fallbacks are rejected (`map.tsx`).
- **Dispatch animation & ETAs** — Vehicle markers animate along routed geometry; ETA banners show service type + countdown. Clicking an ETA banner fits the map to the vehicle and incident.
- **Ally call workflow (UI)** — Call button runs a simulated phone flow: ringing → in-call timer → wrap-up, then operator records **Will help** / **Declined** on the incident (`map.tsx`). Ally response state persists per incident.
- **Route visibility toggle** — Operator can show/hide vehicle route lines; ambulance routes render with a distinct red + dashed overlay.

**Volunteer mobile app (`apps/soteria`)**

- **Phone registration & OTP** — User enters HK mobile number → Express server sends a 6-digit SMS via **Twilio** when credentials are configured (`server/index.mjs`). Client enforces rate limits and blocks VoIP/disposable prefixes (`lib/auth.ts`).
- **OTP verification** — Codes verified server-side against an in-memory store with 10-minute TTL. Demo bypass code `123456` also accepted locally for testing without SMS.
- **Onboarding** — Multi-step flow: phone → verify → self-reported skills/certifications → profile. Session stored in `localStorage` (`lib/session.ts`).
- **Profile & availability** — User can toggle “available to respond” for a chosen duration, add self-reported certifications, and upload cert documents (stored locally; status set to pending review).

---

## 3. What is mocked, stubbed, or hardcoded
Every shortcut. Examples: a login that accepts any password, a payment that always succeeds, an "AI" that is an if/else, a database that is an in-memory dictionary, fake JSON returned instead of a real API call.

**Undisclosed mocks carry a small penalty each. Anything you list here = free.**

| What is faked | Where (file:line or folder) | Why we mocked it | What the real version would do |
|---|---|---|---|
| **Incident feed (primary mock)** | `apps/dashboard/src/data/incidents.ts`, `data/incidentStorage.ts`, `map.tsx` (`addIncident`) | No access yet to the governmental agency’s CAD / emergency dispatch data pipeline during the hackathon | Ingest live incidents from the agency’s official API or message bus: real incident ID, type, location, timestamp, caller metadata, and authoritative status updates |
| **Seed incidents** | `apps/dashboard/src/data/incidents.ts` (`SEED_TEMPLATES`, `getSeedIncidents`) | Populate the demo map on first load without a backend | Removed entirely once live incident stream is connected; or replaced by replay of sanitized production data |
| **Operator-generated incidents** | `apps/dashboard/src/map.tsx` (`addIncident`) | Lets operators demo the workflow without waiting for real 999 calls | Incidents would arrive automatically from dispatch; “Fetch incident” would be removed or become a training-mode replay |
| **Emergency service vehicle positions & ETAs** | `apps/dashboard/src/data/dispatch.ts`, `data/stations.ts` | No live AVL/GPS feed from ambulance, police, or fire services | Subscribe to each service’s unit-tracking feed; ETAs from their dispatch system or our router using live positions |
| **Static station list** | `apps/dashboard/src/data/stations.ts` | Approximate real HK hospital/police/fire locations for plausible demo origins | Sync from official facility registry or dispatch CAD station tables |
| **Ally / volunteer pool** | `apps/dashboard/src/data/generateAllies.ts`, `data/allies.ts`, `data/allyPictures.ts` | Dashboard needs thousands of mappable responders before the mobile app’s user base exists | Allies come from registered Soteria users who opt in, with live availability and verified credentials from a backend |
| **Dashboard ↔ Soteria not connected** | `apps/dashboard/*` vs `apps/soteria/*` | Two apps built in parallel; no shared API yet | Single backend: Soteria registration writes to DB; dashboard reads available allies, certs, and phone numbers in real time |
| **Ally phone numbers** | `apps/dashboard/src/data/generateAllies.ts`, `data/allies.ts` | Fictional +852 numbers for UI display | Real numbers from verified volunteer accounts (with consent), bridged or click-to-call via dispatch |
| **Ally profile photos** | `apps/dashboard/src/data/allyPictures.ts`, `apps/dashboard/pictures/` | Random stock images assigned by deterministic RNG | User-uploaded photos from Soteria profile |
| **Certification “verified” flags on generated allies** | `apps/dashboard/src/data/generateAllies.ts` (`verified: rng() < 0.7`) | Visual variety in the recommender UI | Verification workflow: document upload → manual or automated review → trusted flag in DB |
| **Simulated phone call to ally** | `apps/dashboard/src/map.tsx` (`mockDialAlly`, `mockRingMs`) | No telephony integration in the demo; avoids placing real calls during judging | Initiate outbound call or push notification to the volunteer app; record accept/decline from their device |
| **Caller phone numbers on generated incidents** | `apps/dashboard/src/map.tsx` (`addIncident`) | Placeholder display data | Real caller ID from dispatch (redacted/masked per privacy policy) |
| **Land vs water placement** | `apps/dashboard/src/lib/geo.ts` (`WATER_ZONES`) | Coarse rectangles instead of coastline geometry | OSM/Overpass or government land-use polygons for accurate placement |
| **Incident persistence** | `apps/dashboard/src/data/incidentStorage.ts` | Browser `localStorage` only | PostgreSQL / dispatch-synced store shared across operator workstations |
| **OTP code storage** | `apps/soteria/server/index.mjs` (`codes` Map) | Hackathon-simple in-memory store | Redis or DB with audit trail; survives server restarts |
| **Demo OTP bypass** | `apps/soteria/src/lib/auth.ts` (`DEMO_OTP = "123456"`) | Test registration without Twilio credits | Removed in production; verify only against server-issued codes |
| **Self-reported certifications (mobile)** | `apps/soteria/src/pages/register/skills.tsx` (`// TODO: POST to /api/certifications`) | No cert verification backend yet | POST to API → review queue → verified status synced to dashboard recommender |
| **Cert document OCR** | `apps/soteria/package.json` (tesseract.js dependency), `text.txt` design notes | Planned feature; OCR not wired in source yet | Tesseract.js worker parses ID/cert photos and pre-fills registration fields |
| **Hardcoded dial constant (unused)** | `apps/dashboard/src/config/hk.ts` (`DIAL_PHONE_NUMBER`) | Leftover from earlier click-to-call experiment; current UI uses mock call flow instead | Remove or wire to real telephony bridge when calls go live |

---

## 4. External APIs, services & data sources
Everything the project calls or pretends to call. Mark each as real or mocked.

| Service / API / dataset | Used for | Real call or mocked? | Auth (sandbox / test key / none) |
|---|---|---|---|
| **Mapbox GL JS** | Map rendering | Real (client library) | `VITE_MAPBOX_TOKEN` in `apps/dashboard/.env` |
| **Mapbox Directions API** | Ally walking routes, emergency vehicle driving routes | Real HTTP fetch | Same Mapbox token |
| **Mapbox Geocoding API** | Reverse geocode for operator-created incident addresses | Real HTTP fetch when token present; falls back to nearest hotspot name | Same Mapbox token |
| **Government emergency dispatch / CAD feed** | Incident ingestion | **Mocked** — not integrated | N/A (future: agency-issued credentials) |
| **Twilio SMS** | OTP delivery for Soteria registration | Real when `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` set in `apps/soteria/.env`; otherwise server returns `sms_not_configured` | Twilio account credentials |
| **Express OTP API** (`apps/soteria/server/index.mjs`) | `/api/otp/send`, `/api/otp/verify`, `/api/health` | Real local server; codes stored in memory | None (localhost / deployed URL) |
| **Procedurally generated ally dataset** | Dashboard recommender pool (~5k credentialed + 2k uncredentialed + 11 seeds) | Mocked | None |
| **Hand-curated HK stations** | Emergency vehicle origin points | Mocked static data | None |
| **Browser localStorage** | Incident state (dashboard), user session (Soteria) | Real persistence, mock backend | None |
| **Tesseract.js** | Cert/ID OCR (planned) | Not called in current source | N/A |

---

## 5. Pre-existing code
Anything written **before** kickoff that we brought into this project: prior personal projects, forked open-source code, templates, boilerplate, internal libraries.

**Undisclosed pre-built code is heavily penalized. Anything you list here = free.**

| Item | Source (URL or description) | Roughly how much | License |
|---|---|---|---|
| **Vite + React + TypeScript app scaffold** | Standard Vite React template pattern | Boilerplate for both apps | MIT |
| **Mapbox GL JS / react-map-gl** | [mapbox/mapbox-gl-js](https://github.com/mapbox/mapbox-gl-js), [visgl/react-map-gl](https://github.com/visgl/react-map-gl) | Map rendering & React bindings | Mapbox ToS / BSD |
| **Tailwind CSS v4** | [tailwindlabs/tailwindcss](https://github.com/tailwindcss/tailwindcss) | Styling | MIT |
| **Lucide React icons** | [lucide-icons/lucide](https://github.com/lucide-icons/lucide) | UI icons | ISC |
| **Express, cors, dotenv** | npm ecosystem | Soteria OTP server | MIT |
| **Twilio Node SDK** | [twilio/twilio-node](https://github.com/twilio/twilio-node) | SMS sending | MIT |
| **Tesseract.js** | [naptha/tesseract.js](https://github.com/naptha/tesseract.js) | Declared dependency; OCR not yet integrated | Apache-2.0 |
| **DB Screen fonts (Soteria)** | Deutsche Bahn open fonts in `apps/soteria/public/fonts/` | Typography / branding | DB corporate font license (check terms for redistribution) |
| **Stock ally profile images** | `apps/dashboard/pictures/` | Random avatars for generated allies | Team-provided / generated assets for demo |

All application logic (incident model, dispatch simulation, recommender scoring, map UI, Soteria onboarding, OTP server) was written during the hackathon window on top of these libraries.

---

## 6. Known limitations & next steps
What we would build next, and the weak spots we already know about. Naming these honestly is a strength, not a flaw.

- **Integrate the governmental agency’s incident data pipeline** — Replace seed and synthetic incidents with a live (or sandbox) feed from the official emergency dispatch system. This is the single most important production step.
- **Unify dashboard and Soteria via a backend** — Registered volunteers, verified certifications, availability windows, and contact details should flow from Soteria into the dashboard ally pool in real time.
- **Replace simulated ally outreach** — Mock call UI → push notification or VoIP to the volunteer app, with accept/decline captured on the volunteer side and reflected on the operator dashboard.
- **Live emergency unit tracking** — Swap haversine ETA estimates and synthetic vehicle positions for real AVL data from ambulance, police, and fire services.
- **Certification verification** — Implement the `/api/certifications` backend, document review queue, and optional Tesseract OCR auto-fill on ID upload.
- **Remove demo shortcuts** — Drop `DEMO_OTP`, in-memory OTP store, and unused `DIAL_PHONE_NUMBER`; use durable storage and production telephony.
- **Accurate geospatial constraints** — Replace coarse water-zone rectangles with real coastline / land-use data so pins never appear in the harbour.
- **Multi-operator & audit** — Move incident and response state off `localStorage` into a shared database with operator attribution and incident history.
- **Privacy & compliance** — Caller numbers, locations, and volunteer PII will need redaction, retention policies, and consent flows before any public deployment in HK.
