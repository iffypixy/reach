export const hapticTap = () => {
	if (!("vibrate" in navigator)) return;
	navigator.vibrate(10);
};

export const hapticConfirm = () => {
	if (!("vibrate" in navigator)) return;
	navigator.vibrate([12, 40, 12]);
};
