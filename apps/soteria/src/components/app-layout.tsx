import type { ReactNode } from "react";

import { BrandMark } from "~/components/brand-mark";
import { voice } from "~/lib/voice";

export const AppChromeFooter = () => (
	<p className="app-chrome-footer type-caption">{voice.dispatchFooter}</p>
);

type AppLayoutProps = {
	children: ReactNode;
	title?: string;
	centered?: boolean;
	brandSize?: "sm" | "md" | "lg";
	showFooter?: boolean;
};

export const AppLayout = ({
	children,
	title,
	centered,
	brandSize = "md",
	showFooter = true,
}: AppLayoutProps) => (
	<div className="app-shell">
		<header className="app-header">
			<div className="app-container app-header-slot">
				<BrandMark size={brandSize} />
				{title && <p className="type-label mt-2">{title}</p>}
			</div>
		</header>
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
