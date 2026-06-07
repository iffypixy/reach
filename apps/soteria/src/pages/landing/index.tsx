import { Phone, Award, MapPin } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { AppChromeFooter } from "~/components/app-layout";
import { useSession } from "~/lib/session";
import { voice } from "~/lib/voice";

const featureIcons = [Phone, Award, MapPin];

export const LandingPage = () => {
	const navigate = useNavigate();
	const { session } = useSession();

	useEffect(() => {
		if (session.user) {
			navigate(session.onboardingComplete ? "/profile" : "/register/skills", { replace: true });
			return;
		}
		if (!session.signup?.phone) return;
		navigate(session.signup.phoneVerified ? "/register/info" : "/register/verify", { replace: true });
	}, [session.user, session.onboardingComplete, session.signup, navigate]);

	if (session.user || session.signup?.phone) return null;

	return (
		<div className="app-shell app-shell-hero">
			<main className="app-main">
				<div className="app-container app-main-slot app-main-slot-hero">
					<div className="step-enter">
						<h1 className="landing-headline">{voice.landing.headline}</h1>
						<p className="screen-subtitle mt-3">{voice.landing.subtitle}</p>
					</div>

					<div className="mt-8 flex flex-col gap-3">
						{voice.landing.features.map((feature, i) => {
							const Icon = featureIcons[i];
							return (
								<div key={feature.title} className="feature-card">
									<div className="feature-icon">
										<Icon size={20} strokeWidth={1.75} aria-hidden />
									</div>
									<div>
										<p className="type-body-strong">{feature.title}</p>
										<p className="type-caption mt-0.5">{feature.description}</p>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</main>

			<footer className="app-footer">
				<div className="app-container">
					<button
						type="button"
						onClick={() => navigate("/register")}
						className="btn-primary"
						aria-label="become a volunteer"
					>
						{voice.landing.cta}
					</button>
					<p className="type-caption mt-4 text-center">{voice.landing.consent}</p>
					<div className="mt-6">
						<AppChromeFooter />
					</div>
				</div>
			</footer>
		</div>
	);
};
