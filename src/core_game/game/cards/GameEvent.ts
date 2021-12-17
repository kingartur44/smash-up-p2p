import { GameCard } from "./GameCard";

export enum GameCardEventType {
	ReturnToHand,
	Destroy,
	GoToTheBottomOfTheDeck
}

export interface GameCardEvent {
	type: GameCardEventType
	initiator: GameCard
}

export enum GamePlayerEventType {
	
}

export interface GamePlayerEvent {
	
}