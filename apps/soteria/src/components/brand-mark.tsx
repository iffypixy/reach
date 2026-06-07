import { voice } from "~/lib/voice";

type BrandMarkProps = {
	size?: "sm" | "md" | "lg";
	inverted?: boolean;
};

const sizes: Record<NonNullable<BrandMarkProps["size"]>, string> = {
	sm: "brand-mark brand-mark-sm",
	md: "brand-mark brand-mark-md",
	lg: "brand-mark brand-mark-lg",
};

export const BrandMark = ({ size = "md", inverted }: BrandMarkProps) => (
	<span className={`${sizes[size]} ${inverted ? "text-white" : "text-text"}`}>
		{voice.brandName}
	</span>
);
