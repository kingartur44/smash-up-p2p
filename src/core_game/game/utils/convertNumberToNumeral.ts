export function convertNumberToNumeral(number: number): string {
	if (number=== 0) {
		return "1st"
	} else if (number=== 1) {
		return "2nd"
	} else if (number=== 2) {
		return "3rd"
	}
	
	return number + "th"
}