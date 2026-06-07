import type { ReactNode } from "react";

import { voice } from "~/lib/voice";

export const AppChromeFooter = () => (
	<p className="app-chrome-footer type-caption">{voice.dispatchFooter}</p>
);

type AppLayoutProps = {
	children: ReactNode;
	centered?: boolean;
	showFooter?: boolean;
};

export const AppLayout = ({ children, centered, showFooter = true }: AppLayoutProps) => (
	<div className="app-shell">
		<main className="app-main">
			<div className={`app-container app-main-slot step-enter ${centered ? "justify-center" : ""}`}>
				{children}
			</div>
		</main>
		{showFooter && (
			<footer className="app-chrome-footer-wrap">
				<div className="app-container">
					<AppChromeFooter />
				</div>
			</footer>
		)}
	</div>
);
