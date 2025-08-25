export const getPrettyDate = (millisecondsSinceDate: number): string => {
	//1-60m, 1-23hr, 1-6d, 1-52w, 1-Xyr
	const millisecondsInSec = 1000;

	const secPast = millisecondsSinceDate / millisecondsInSec;
	let prettyDate;

	switch (true) {
		case secPast < 60: {
			const roundedSecPast = Math.max(1, Math.floor(secPast));
			prettyDate = `${roundedSecPast}s`;
			break;
		}
		case secPast < 60 * 60: {
			const minsPast = Math.max(1, Math.floor(secPast / 60));
			prettyDate = `${minsPast}min`;
			break;
		}
		case secPast < 60 * 60 * 24: {
			const hoursPast = Math.max(1, Math.floor(secPast / (60 * 60)));
			prettyDate = `${hoursPast}hr`;
			break;
		}
		case secPast < 60 * 60 * 24 * 7: {
			const daysPast = Math.max(1, Math.floor(secPast / (60 * 60 * 24)));
			prettyDate = `${daysPast}d`;
			break;
		}
		case secPast < 60 * 60 * 24 * 7 * 52: {
			const weeksPast = Math.max(1, Math.floor(secPast / (60 * 60 * 24 * 7)));
			prettyDate = `${weeksPast}wk`;
			break;
		}
		default: {
			const yearsPast = Math.max(
				1,
				Math.floor(secPast / (60 * 60 * 24 * 7 * 52)),
			);
			prettyDate = `${yearsPast}yr`;
			break;
		}
	}

	return prettyDate;
};
