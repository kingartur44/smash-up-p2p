import { PlayerID } from "../GameState"
import { HandPosition, DeckPosition, DiscardPilePosition, isHandPosition, isDeckPosition, isDiscardPilePosition } from "./PlayerPositions"
import { NoPosition, isNoPosition } from "./NoPosition"
import { BoardPosition, BasesDeckPosition, BasesDiscardPilePosition, isBoardPosition, isBasesDeckPosition, isBasesDiscardPilePosition } from "./BoardPositions"

export type Position = NoPosition | HandPosition | DeckPosition | BasePosition | BoardPosition | DiscardPilePosition | BasesDeckPosition | AboutToBePlayedPosition | BasesDiscardPilePosition

export function isPosition(data: any): data is Position {
	return isNoPosition(data) || isHandPosition(data) || isDeckPosition(data) || isBasePosition(data) || isBoardPosition(data) || isDiscardPilePosition(data) || isBasesDeckPosition(data) || isAboutToBePlayedPosition(data) || isBasesDiscardPilePosition(data)
}


export interface BasePosition {
	position: "base"
	base_id: number
}
export function isBasePosition(data: any): data is BasePosition {
	return data.position === "base" && typeof data.base_id === "number"
}

export interface AboutToBePlayedPosition {
	position: "is-about-to-be-played"
	playerID: PlayerID
}
export function isAboutToBePlayedPosition(data: any): data is BasesDeckPosition {
	return data.position === "is-about-to-be-played" &&
		typeof data.playerID === "number"
}