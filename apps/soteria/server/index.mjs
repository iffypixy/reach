import "dotenv/config";
import cors from "cors";
import express from "express";
import twilio from "twilio";

const PORT = Number(process.env.PORT) || 3001;
const CODE_TTL_MS = 10 * 60 * 1000;

/** @type {Map<string, { code: string; expiresAt: number }>} */
const codes = new Map();

const normalizePhone = (phone) => phone.replace(/[\s()-]/g, "");

const toE164 = (phone) => {
	const normalized = normalizePhone(phone);
	if (normalized.startsWith("+")) return normalized;
	const digits = normalized.replace(/\D/g, "");
	if (digits.length === 8) return `+852${digits}`;
	if (digits.startsWith("852") && digits.length === 11) return `+${digits}`;
	if (digits.length >= 10) return `+${digits}`;
	return normalized;
};

const randomCode = () => String(Math.floor(100000 + Math.random() * 900000));

const twilioConfigured = () =>
	Boolean(
		process.env.TWILIO_ACCOUNT_SID &&
			process.env.TWILIO_AUTH_TOKEN &&
			process.env.TWILIO_FROM_NUMBER,
	);

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
	res.json({ ok: true, sms: twilioConfigured() });
});

app.post("/api/otp/send", async (req, res) => {
	const phone = typeof req.body?.phone === "string" ? req.body.phone.trim() : "";
	if (!phone) return res.status(400).json({ ok: false, error: "invalid_phone" });
	if (!twilioConfigured())
		return res.status(503).json({ ok: false, error: "sms_not_configured" });

	const e164 = toE164(phone);
	const code = randomCode();
	codes.set(e164, { code, expiresAt: Date.now() + CODE_TTL_MS });

	try {
		const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
		await client.messages.create({
			body: `Your Lifeline verification code is ${code}`,
			from: process.env.TWILIO_FROM_NUMBER,
			to: e164,
		});
		console.log(`otp sent to ${e164}`);
		return res.json({ ok: true });
	} catch (err) {
		codes.delete(e164);
		console.error("twilio send failed:", err.message ?? err);
		return res.status(502).json({ ok: false, error: "sms_failed" });
	}
});

app.post("/api/otp/verify", (req, res) => {
	const phone = typeof req.body?.phone === "string" ? req.body.phone.trim() : "";
	const code = typeof req.body?.code === "string" ? req.body.code.trim() : "";
	if (!phone || !code) return res.status(400).json({ ok: false, error: "invalid_code" });

	const e164 = toE164(phone);
	const entry = codes.get(e164);
	if (!entry || Date.now() > entry.expiresAt) {
		codes.delete(e164);
		return res.json({ ok: false, error: "invalid_code" });
	}
	if (entry.code !== code) return res.json({ ok: false, error: "invalid_code" });

	codes.delete(e164);
	return res.json({ ok: true });
});

const server = app.listen(PORT);

server.on("listening", () => {
	console.log(`otp api listening on http://localhost:${PORT}`);
	if (!twilioConfigured()) console.warn("twilio env vars missing — sms will not send");
});

server.on("error", (err) => {
	if (err.code !== "EADDRINUSE") throw err;
	console.error(`port ${PORT} already in use — stop the old api: kill $(lsof -t -i:${PORT})`);
	process.exit(1);
});
