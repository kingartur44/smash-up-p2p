
export interface BoardPosition {
	position: "board";
}
export function isBoardPosition(data: any): data is BoardPosition {
	return data.position === "board";
}

export interface BasesDeckPosition {
	position: "bases_deck";
}
export function isBasesDeckPosition(data: any): data is BasesDeckPosition {
	return data.position === "bases_deck";
}

export interface BasesDiscardPilePosition {
	position: "bases_discard_pile";
}
export function isBasesDiscardPilePosition(data: any): data is BasesDiscardPilePosition {
	return data.position === "bases_discard_pile";
}
