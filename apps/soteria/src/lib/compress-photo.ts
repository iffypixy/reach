const MAX_EDGE = 1600;
const JPEG_QUALITY = 0.82;

const loadImage = (file: File) =>
	new Promise<HTMLImageElement>((resolve, reject) => {
		const url = URL.createObjectURL(file);
		const img = new Image();
		img.onload = () => {
			URL.revokeObjectURL(url);
			resolve(img);
		};
		img.onerror = () => {
			URL.revokeObjectURL(url);
			reject(new Error("failed to load photo"));
		};
		img.src = url;
	});

export const compressPhoto = async (file: File) => {
	const img = await loadImage(file);
	const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
	const width = Math.max(1, Math.round(img.width * scale));
	const height = Math.max(1, Math.round(img.height * scale));
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("failed to prepare photo");
	ctx.drawImage(img, 0, 0, width, height);
	return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
};
