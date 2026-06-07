import type { ReactNode } from "react";

import { AppChromeFooter } from "~/components/app-layout";
import { BrandMark } from "~/components/brand-mark";

const SIGNUP_STEPS = 4;

type OnboardingLayoutProps = {
	step?: 1 | 2 | 3 | 4;
	title?: string;
	subtitle?: string;
	children: ReactNode;
};

const stepLabels: Record<1 | 2 | 3 | 4, string> = {
	1: "Phone number",
	2: "Verification",
	3: "Your details",
	4: "Your skills",
};

export const OnboardingLayout = ({ step, title, subtitle, children }: OnboardingLayoutProps) => (
	<div className="app-shell">
		<header className="app-header">
			<div className="app-container app-header-slot">
				<BrandMark size="sm" />
				{step && (
					<div className="mt-5 w-full">
						<p className="type-label">
							Step {step} of {SIGNUP_STEPS} · {stepLabels[step]}
						</p>
						<div
							className="progress-track mt-2"
							role="progressbar"
							aria-valuenow={step}
							aria-valuemin={1}
							aria-valuemax={SIGNUP_STEPS}
							aria-label={`signup progress, step ${step} of ${SIGNUP_STEPS}`}
						>
							{Array.from({ length: SIGNUP_STEPS }, (_, i) => i + 1).map((s) => (
								<div
									key={s}
									className={`progress-segment ${s <= step ? "progress-segment-active" : ""}`}
								/>
							))}
						</div>
					</div>
				)}
			</div>
		</header>

		<main className="app-main">
			<div className="app-container app-main-slot step-enter">
				{(title || subtitle) && (
					<div className="mb-6">
						{title && <h1 className="screen-title">{title}</h1>}
						{subtitle && <p className="screen-subtitle mt-1.5">{subtitle}</p>}
					</div>
				)}
				{children}
			</div>
		</main>

		<footer className="app-chrome-footer-wrap">
			<div className="app-container">
				<AppChromeFooter />
			</div>
		</footer>
	</div>
);
