import { Power, Radio } from "lucide-react";
import { useEffect, useState } from "react";

import {
	AVAILABILITY_OPTIONS,
	availabilityProgress,
	formatRemaining,
	isAvailable,
	PROGRESS_RING_CIRCUMFERENCE,
	PROGRESS_RING_RADIUS,
	type AvailabilityDuration,
} from "~/lib/availability";
import { voice } from "~/lib/voice";

const DEFAULT_DURATION: AvailabilityDuration = "6h";
const CONFIRM_ENABLE_MS = 4000;

type AvailabilityToggleProps = {
	availableUntil: string | null;
	availableSince: string | null;
	selectedDuration: AvailabilityDuration | null;
	onEnable: (duration: AvailabilityDuration) => void;
	onDisable: () => void;
};

type StatusCopy = {
	title: string;
	hint: string;
	titleClass: string;
	live: string;
};

const statusCopy = (
	active: boolean,
	confirming: boolean,
	pendingLabel: string,
	remaining: string | null,
): StatusCopy => {
	if (active) {
		return {
			title: voice.availability.onTitle,
			hint: voice.availability.onHint(remaining),
			titleClass: "text-success",
			live: remaining ? `On call, ${remaining}` : voice.availability.onTitle,
		};
	}
	if (confirming) {
		return {
			title: voice.availability.confirmTitle,
			hint: voice.availability.confirmHint(pendingLabel),
			titleClass: "text-secondary",
			live: `Confirm going on call for ${pendingLabel}`,
		};
	}
	return {
		title: voice.availability.offTitle,
		hint: voice.availability.offHint,
		titleClass: "text-text",
		live: voice.availability.offTitle,
	};
};

export const AvailabilityToggle = ({
	availableUntil,
	availableSince,
	selectedDuration,
	onEnable,
	onDisable,
}: AvailabilityToggleProps) => {
	const active = isAvailable(availableUntil);
	const [pendingDuration, setPendingDuration] = useState<AvailabilityDuration>(
		selectedDuration ?? DEFAULT_DURATION,
	);
	const [confirmEnable, setConfirmEnable] = useState(false);
	const [, setTick] = useState(0);

	useEffect(() => {
		if (active) return;
		setPendingDuration(selectedDuration ?? DEFAULT_DURATION);
		setConfirmEnable(false);
	}, [active, selectedDuration]);

	useEffect(() => {
		if (!confirmEnable) return;
		const timer = setTimeout(() => setConfirmEnable(false), CONFIRM_ENABLE_MS);
		return () => clearTimeout(timer);
	}, [confirmEnable]);

	useEffect(() => {
		if (!active || !availableUntil) return;
		const timer = setInterval(() => setTick((t) => t + 1), 1000);
		return () => clearInterval(timer);
	}, [active, availableUntil]);

	const pendingLabel =
		AVAILABILITY_OPTIONS.find((o) => o.duration === pendingDuration)?.label ?? pendingDuration;

	const handleMainButton = () => {
		if (active) {
			onDisable();
			return;
		}
		if (!confirmEnable) {
			setConfirmEnable(true);
			return;
		}
		setConfirmEnable(false);
		onEnable(pendingDuration);
	};

	const handleDuration = (duration: AvailabilityDuration) => {
		if (active) {
			onEnable(duration);
			return;
		}
		setPendingDuration(duration);
		setConfirmEnable(true);
	};

	const remaining = active && availableUntil ? formatRemaining(availableUntil) : null;
	const progress =
		active && availableSince && availableUntil
			? availabilityProgress(availableSince, availableUntil)
			: 0;
	const progressOffset = PROGRESS_RING_CIRCUMFERENCE * (1 - progress);
	const confirming = confirmEnable && !active;
	const status = statusCopy(active, confirming, pendingLabel, remaining);

	return (
		<div className="availability-card">
			<div className="sr-only" aria-live="polite" aria-atomic="true">
				{status.live}
			</div>

			<div className="availability-status-block">
				<p className={`type-body-strong ${status.titleClass}`}>{status.title}</p>
				<p className="type-caption">{status.hint}</p>
			</div>

			<div className="availability-hero-wrap">
				<svg
					className={`availability-progress ${active && availableSince ? "" : "invisible"}`}
					viewBox="0 0 100 100"
					aria-hidden="true"
				>
					<circle cx="50" cy="50" r={PROGRESS_RING_RADIUS} className="availability-progress-track" />
					<circle
						cx="50"
						cy="50"
						r={PROGRESS_RING_RADIUS}
						className="availability-progress-fill"
						strokeDasharray={PROGRESS_RING_CIRCUMFERENCE}
						strokeDashoffset={progressOffset}
					/>
				</svg>
				<button
					type="button"
					onClick={handleMainButton}
					aria-pressed={active}
					aria-label={
						active
							? "go off duty"
							: confirming
								? `confirm go on call for ${pendingLabel}`
								: `go on call for ${pendingLabel}`
					}
					className={`availability-hero ${active ? "availability-hero-active" : ""} ${confirming ? "availability-hero-confirm" : ""}`}
				>
					<span
						className={`availability-hero-knob ${active ? "availability-hero-knob-active" : ""} ${confirming ? "availability-hero-knob-confirm" : ""}`}
					>
						{active ? (
							<Radio size={28} strokeWidth={1.75} aria-hidden />
						) : (
							<Power size={28} strokeWidth={1.75} aria-hidden />
						)}
					</span>
				</button>
			</div>

			<div className="duration-pills" role="group" aria-label="availability duration">
				{AVAILABILITY_OPTIONS.map((option) => {
					const isActive = active && selectedDuration === option.duration;
					const isPending = !active && pendingDuration === option.duration;
					const pillClass = isActive
						? "duration-pill-active"
						: isPending
							? "duration-pill-pending"
							: "";
					return (
						<button
							key={option.duration}
							type="button"
							onClick={() => handleDuration(option.duration)}
							className={`duration-pill ${pillClass}`}
							aria-pressed={isActive || isPending}
							aria-label={
								active
									? `extend on call to ${option.ariaLabel}`
									: `select ${option.ariaLabel}`
							}
						>
							{option.label}
						</button>
					);
				})}
			</div>
		</div>
	);
};
