import { useEffect, useState } from "react";

import { AppLayout } from "~/components/app-layout";
import { AvailabilityToggle } from "~/components/availability-toggle";
import { CertCard } from "~/components/cert-card";
import { CertStatusBadge } from "~/components/cert-status-badge";
import { Toast } from "~/components/toast";
import { UploadZone } from "~/components/upload-zone";
import { SkillIcon } from "~/components/skill-icon";
import { isAvailable } from "~/lib/availability";
import { ALL_CERTIFICATION_OPTIONS, CERTIFICATION_GROUPS, certificationLabel } from "~/lib/certifications";
import { useSession } from "~/lib/session";
import type { CertificationType } from "~/lib/types";
import { useRequireAuth } from "~/lib/use-require-auth";
import { voice } from "~/lib/voice";

export const ProfilePage = () => {
	const { session, submitCertificationDocument, addCertification, setAvailability, clearAvailability } =
		useSession();
	const [toast, setToast] = useState<string | null>(null);
	const [addingSkill, setAddingSkill] = useState(false);

	useRequireAuth(session);

	useEffect(() => {
		if (!session.availableUntil || isAvailable(session.availableUntil)) return;
		clearAvailability();
	}, [session.availableUntil, clearAvailability]);

	if (!session.user) return null;

	const existingTypes = new Set(session.certifications.map((c) => c.type));
	const availableToAdd = ALL_CERTIFICATION_OPTIONS.filter((o) => !existingTypes.has(o.type));

	const handleAddSkill = (type: CertificationType) => {
		addCertification(type);
		setAddingSkill(false);
	};

	return (
		<AppLayout>
			{toast && <Toast message={toast} onDismiss={() => setToast(null)} />}

			<div className="profile-page">
				<div className="profile-intro">
					<h1 className="profile-greeting">{voice.profile.greeting(session.user.firstName)}</h1>
					<p className="profile-greeting-hint">{voice.profile.greetingHint}</p>
				</div>

				<AvailabilityToggle
					availableUntil={session.availableUntil}
					availableSince={session.availableSince}
					selectedDuration={session.availabilityDuration}
					onEnable={setAvailability}
					onDisable={clearAvailability}
				/>

				<section className="profile-section" aria-labelledby="skills-heading">
					<div className="profile-section-header">
						<h2 id="skills-heading" className="type-title">
							{voice.profile.skillsTitle}
						</h2>
						<p className="type-caption">{voice.profile.skillsHint}</p>
					</div>

					{session.certifications.length > 0 ? (
						<div className="soteria-elevated-card skill-list-card">
							<ul className="skill-list">
								{session.certifications.map((cert) => {
									const label = certificationLabel(cert.type);
									const canUpload =
										cert.status === "self_reported" || cert.status === "rejected";
									return (
										<li key={cert.id} className="skill-item">
											<div className="skill-item-header">
												<SkillIcon type={cert.type} size={18} className="text-primary" />
												<span className="skill-item-name">{label}</span>
												<CertStatusBadge status={cert.status} />
											</div>

											{cert.status === "rejected" && cert.rejectionReason && (
												<p className="text-sm text-danger" role="alert">
													{cert.rejectionReason}
												</p>
											)}

											{cert.status === "pending_review" && (
												<div className="flex flex-col gap-2">
													{cert.documentUrl && (
														<img
															src={cert.documentUrl}
															alt={`${label} certificate photo`}
															className="h-32 w-full rounded-md object-cover"
														/>
													)}
													<p className="type-caption">
														Under review — usually 1–2 business days.
													</p>
												</div>
											)}

											{canUpload && (
												<UploadZone
													label={voice.profile.verifyPrompt}
													preview={null}
													onUpload={(dataUrl) =>
														submitCertificationDocument(cert.id, dataUrl)
													}
													onError={setToast}
												/>
											)}

											{cert.status === "verified" && cert.documentUrl && (
												<div className="flex flex-col gap-2">
													<img
														src={cert.documentUrl}
														alt={`${label} verified certificate`}
														className="h-32 w-full rounded-md object-cover"
													/>
													{cert.verifiedAt && (
														<p className="type-caption">
															Verified {new Date(cert.verifiedAt).toLocaleDateString()}
														</p>
													)}
												</div>
											)}
										</li>
									);
								})}
							</ul>
						</div>
					) : (
						<div className="soteria-elevated-card skill-empty">
							<p className="type-caption">{voice.profile.noSkills}</p>
						</div>
					)}

					{addingSkill ? (
						<div className="skill-picker">
							<div className="soteria-elevated-card p-4">
								<p className="type-body-strong mb-3">{voice.profile.chooseSkill}</p>
								{CERTIFICATION_GROUPS.map((group) => {
									const options = group.options.filter((o) => !existingTypes.has(o.type));
									if (options.length === 0) return null;
									return (
										<div key={group.label} className="mb-4 last:mb-0">
											<p className="type-label mb-2">{group.label}</p>
											<div className="flex flex-col gap-2">
												{options.map((cert) => (
													<CertCard
														key={cert.type}
														type={cert.type}
														label={cert.label}
														selected={false}
														onToggle={() => handleAddSkill(cert.type)}
													/>
												))}
											</div>
										</div>
									);
								})}
							</div>
							<button
								type="button"
								onClick={() => setAddingSkill(false)}
								className="btn-link"
								aria-label="cancel adding skill"
							>
								Cancel
							</button>
						</div>
					) : (
						availableToAdd.length > 0 && (
							<button
								type="button"
								onClick={() => setAddingSkill(true)}
								className="btn-secondary"
								aria-label="add skill"
							>
								{voice.profile.addSkill}
							</button>
						)
					)}
				</section>
			</div>
		</AppLayout>
	);
};
