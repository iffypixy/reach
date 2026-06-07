import type { CertificationStatus } from "~/lib/types";

type CertStatusBadgeProps = {
	status: CertificationStatus;
};

const statusDisplay: Record<
	CertificationStatus,
	{ label: string; className: string }
> = {
	self_reported: { label: "Self-reported", className: "bg-surface text-text border border-border" },
	pending_review: { label: "In review", className: "bg-accent-muted text-secondary" },
	verified: { label: "Verified", className: "bg-success/15 text-success" },
	rejected: { label: "Rejected", className: "bg-danger/15 text-danger" },
};

export const CertStatusBadge = ({ status }: CertStatusBadgeProps) => {
	const display = statusDisplay[status];
	return (
		<span
			className={`shrink-0 rounded-sm px-2 py-0.5 text-xs font-semibold ${display.className}`}
		>
			{display.label}
		</span>
	);
};
