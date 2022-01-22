import { PlayerID } from "../GameState"

export type Position = NoPosition | HandPosition | DeckPosition | BasePosition | MinionPosition | BoardPosition | DiscardPilePosition | BasesDeckPosition | AboutToBePlayedPosition | BasesDiscardPilePosition

export enum PositionType {
	Base,
	Minion,

	isAboutToBePlayed,
	Board,
	BasesDeck,
	BasesDiscardPile,
	Hand,
	DiscardPile,
	Deck,
	NoPosition,
}

export const FIELD_POSITIONS: PositionType[] = [
	PositionType.Board, PositionType.Minion, PositionType.Base
]

export interface BasePosition {
	positionType: PositionType.Base
	base_id: number
}
export interface MinionPosition {
	positionType: PositionType.Minion
	minion_id: number
}

export interface AboutToBePlayedPosition {
	positionType: PositionType.isAboutToBePlayed
	playerID: PlayerID
}

export interface BoardPosition {
	positionType: PositionType.Board
}

export interface BasesDeckPosition {
	positionType: PositionType.BasesDeck
}

export interface BasesDiscardPilePosition {
	positionType: PositionType.BasesDiscardPile
}


export interface HandPosition {
	positionType: PositionType.Hand
	playerID: PlayerID;
}

export interface DiscardPilePosition {
	positionType: PositionType.DiscardPile
	playerID: PlayerID;
}

export interface DeckPosition {
	positionType: PositionType.Deck
	playerID: PlayerID;
}

export interface NoPosition {
	positionType: PositionType.NoPosition
}