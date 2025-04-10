export function timeToSeconds(timeStr: string): number {
	if (!timeStr.match(/\d+:\d{1,2}:\d+\.?\d*/)) {
		throw `The parameter ${timeStr} is in a wrong format '00:00:00.000' .`;
	}

	const a = timeStr.split(':'); // split it at the colons

	if (+a[1] >= 60 || +a[2] >= 60) {
		throw `The parameter ${timeStr} is invalid, please follow the format "Hours:Minutes:Seconds.Milliseconds`;
	}

	a[2] = `${Math.floor(+a[2])}`; // Seconds can have miliseconds
	// minutes are worth 60 seconds. Hours are worth 60 minutes.

	return +a[0] * 60 * 60 + +a[1] * 60 + +a[2];
}
