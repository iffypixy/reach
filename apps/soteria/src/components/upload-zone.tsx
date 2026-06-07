import { Camera } from "lucide-react";
import { useRef, useState } from "react";

import { compressPhoto } from "~/lib/compress-photo";

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/heic", "image/heif"];

type UploadZoneProps = {
	label: string;
	preview: string | null;
	onUpload: (dataUrl: string) => boolean | void;
	onError: (message: string) => void;
};

export const UploadZone = ({ label, preview, onUpload, onError }: UploadZoneProps) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const [processing, setProcessing] = useState(false);

	const handleFile = async (file: File | undefined) => {
		if (!file || processing) return;
		if (!ACCEPTED.includes(file.type) && !file.type.startsWith("image/")) {
			onError("only photos — photograph your certificate");
			return;
		}
		if (file.size > MAX_BYTES) {
			onError("photo must be 10 MB or smaller");
			return;
		}
		setProcessing(true);
		try {
			const dataUrl = await compressPhoto(file);
			if (onUpload(dataUrl) === false)
				onError("couldn't save photo — try again or retake closer");
		} catch {
			onError("failed to process photo");
		} finally {
			setProcessing(false);
		}
	};

	return (
		<div>
			<p className="type-body-strong mb-3">{label}</p>
			{preview ? (
				<div className="flex flex-col items-center gap-3">
					<img
						src={preview}
						alt={`${label} preview`}
						className="h-40 w-full rounded-md object-cover"
					/>
					<button
						type="button"
						onClick={() => inputRef.current?.click()}
						disabled={processing}
						className="text-sm font-semibold text-secondary"
						aria-label={`retake photo for ${label}`}
					>
						Retake
					</button>
				</div>
			) : (
				<button
					type="button"
					onClick={() => inputRef.current?.click()}
					disabled={processing}
					className="flex min-h-[120px] w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-surface transition-colors hover:border-secondary/35 hover:bg-accent-muted/40 disabled:opacity-60"
					aria-label={`photograph certificate for ${label}`}
					aria-busy={processing}
				>
					<Camera size={24} strokeWidth={1.5} className="text-secondary" aria-hidden />
					<span className="type-body-strong">
						{processing ? "Processing…" : "Photograph certificate"}
					</span>
					<span className="type-caption">Camera only — no PDFs</span>
				</button>
			)}
			<input
				ref={inputRef}
				type="file"
				accept="image/jpeg,image/png,image/*"
				capture="environment"
				className="hidden"
				disabled={processing}
				onChange={(e) => {
					handleFile(e.target.files?.[0]);
					e.target.value = "";
				}}
			/>
		</div>
	);
};
