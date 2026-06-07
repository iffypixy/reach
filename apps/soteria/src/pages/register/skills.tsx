import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { CertCard } from "~/components/cert-card";
import { OnboardingLayout } from "~/components/onboarding-layout";
import { CERTIFICATION_GROUPS } from "~/lib/certifications";
import { useSession } from "~/lib/session";
import type { Certification, CertificationType } from "~/lib/types";
import { useRequireAuth } from "~/lib/use-require-auth";
import { voice } from "~/lib/voice";

export const SkillsPage = () => {
	const navigate = useNavigate();
	const { session, setCertifications, update } = useSession();
	const [selected, setSelected] = useState<CertificationType[]>([]);
	const [confirmed, setConfirmed] = useState(false);

	useRequireAuth(session);
	if (!session.user) return null;

	const toggle = (type: CertificationType) => {
		const exists = selected.includes(type);
		setSelected(exists ? selected.filter((t) => t !== type) : [...selected, type]);
	};

	const finishSignup = () => {
		const certifications: Certification[] = selected.map((type) => ({
			id: crypto.randomUUID(),
			type,
			status: "self_reported",
		}));
		// TODO: POST to /api/certifications
		setCertifications(certifications);
		update({ onboardingComplete: true });
		navigate("/profile");
	};

	const canSubmit = selected.length > 0 && confirmed;

	return (
		<OnboardingLayout
			step={4}
			title={voice.register.skillsTitle}
			subtitle={voice.register.skillsSubtitle}
		>
			<div className="flex flex-col gap-6">
				{CERTIFICATION_GROUPS.map((group) => (
					<div key={group.label}>
						<p className="type-label mb-3">{group.label}</p>
						<div className="flex flex-col gap-2">
							{group.options.map((cert) => (
								<CertCard
									key={cert.type}
									type={cert.type}
									label={cert.label}
									selected={selected.includes(cert.type)}
									onToggle={() => toggle(cert.type)}
								/>
							))}
						</div>
					</div>
				))}

				<label className="flex cursor-pointer gap-3 soteria-elevated-card p-4">
					<input
						type="checkbox"
						checked={confirmed}
						onChange={(e) => setConfirmed(e.target.checked)}
						className="mt-0.5 h-5 w-5 shrink-0 accent-primary"
						aria-label="confirm skills are accurate"
					/>
					<span className="type-body">{voice.register.skillsConfirm}</span>
				</label>

				<button
					type="button"
					onClick={finishSignup}
					disabled={!canSubmit}
					className="btn-primary"
					aria-label="complete signup"
				>
					{voice.register.completeSignup}
				</button>
			</div>
		</OnboardingLayout>
	);
};
