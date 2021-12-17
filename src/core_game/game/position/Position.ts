import { PlayerID } from "../GameState"

export type Position = NoPosition | HandPosition | DeckPosition | BasePosition | BoardPosition | DiscardPilePosition | BasesDeckPosition | AboutToBePlayedPosition | BasesDiscardPilePosition

export enum PositionType {
	Base,
	isAboutToBePlayed,
	Board,
	BasesDeck,
	basesDiscardPile,
	Hand,
	DiscardPile,
	Deck,
	NoPosition,
}

export const FIELD_POSITIONS: PositionType[] = [
	PositionType.Board, PositionType.Base
]

export interface BasePosition {
	positionType: PositionType.Base
	base_id: number
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
	positionType: PositionType.basesDiscardPile
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