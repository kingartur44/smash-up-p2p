import { PlayerID } from "../GameState"

export type Position = NoPosition | HandPosition | DeckPosition | BasePosition | BoardPosition | DiscardPilePosition

export function isPosition(data: any): data is Position {
	return isNoPosition(data) || isHandPosition(data) || isDeckPosition(data) || isBasePosition(data) || isBoardPosition(data) || isDiscardPilePosition(data)
}

interface NoPosition {
	position: "no-position"
}
export function isNoPosition(data: any): data is NoPosition {
	return data.postion === "no-position"
}

interface HandPosition {
	position: "hand"
	playerID: PlayerID
}
export function isHandPosition(data: any): data is HandPosition {
	return data.postion === "hand" &&
		typeof data.playerID === "number"
}

interface DiscardPilePosition {
	position: "discard-pile"
	playerID: PlayerID
}
export function isDiscardPilePosition(data: any): data is DiscardPilePosition {
	return data.postion === "discard-pile" &&
		typeof data.playerID === "number"
}

export interface DeckPosition {
	position: "deck"
	playerID: PlayerID
}
export function isDeckPosition(data: any): data is DeckPosition {
	return data.postion === "deck" &&
		typeof data.playerID === "number"
}

export interface BasePosition {
	position: "base"
	base_id: number
}
export function isBasePosition(data: any): data is BasePosition {
	return data.position === "base" && typeof data.base_id === "number"
}

interface BoardPosition {
	position: "board"
}
export function isBoardPosition(data: any): data is BoardPosition {
	return data.position === "board"
}