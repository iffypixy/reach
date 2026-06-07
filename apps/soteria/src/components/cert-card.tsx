import { Check } from "lucide-react";

import { SkillIcon } from "~/components/skill-icon";
import type { CertificationType } from "~/lib/types";

type CertCardProps = {
	type: CertificationType;
	label: string;
	selected: boolean;
	onToggle: () => void;
};

export const CertCard = ({ type, label, selected, onToggle }: CertCardProps) => (
	<button
		type="button"
		onClick={onToggle}
		aria-pressed={selected}
		aria-label={label}
		className={`flex w-full items-center gap-3 rounded-md border px-4 py-3 text-left transition-colors ${
			selected
				? "border-secondary bg-accent-muted"
				: "border-border bg-surface hover:border-secondary/35"
		}`}
	>
		<span
			className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-sm ${
				selected ? "bg-secondary text-white" : "bg-elevated text-secondary"
			}`}
		>
			<SkillIcon type={type} size={18} />
		</span>
		<span className="type-body-strong flex-1">{label}</span>
		<span
			className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border transition-colors ${
				selected ? "border-secondary bg-secondary text-white" : "border-border bg-elevated"
			}`}
			aria-hidden="true"
		>
			{selected && <Check size={12} strokeWidth={3} />}
		</span>
	</button>
);
