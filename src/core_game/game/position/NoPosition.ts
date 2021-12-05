export interface NoPosition {
	position: "no-position";
}
export function isNoPosition(data: any): data is NoPosition {
	return data.postion === "no-position";
}
