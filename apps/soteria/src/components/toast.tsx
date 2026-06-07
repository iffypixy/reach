import { useEffect } from "react";

type ToastProps = {
	message: string;
	onDismiss: () => void;
	durationMs?: number;
};

export const Toast = ({ message, onDismiss, durationMs = 5000 }: ToastProps) => {
	useEffect(() => {
		const timer = setTimeout(onDismiss, durationMs);
		return () => clearTimeout(timer);
	}, [durationMs, onDismiss]);

	return (
		<div
			className="toast-enter fixed top-[calc(12px+env(safe-area-inset-top,0px))] right-4 left-4 z-50 mx-auto max-w-[400px] rounded-md border border-border bg-elevated px-4 py-3 text-sm text-text shadow-panel"
			role="status"
			aria-live="polite"
		>
			{message}
		</div>
	);
};
