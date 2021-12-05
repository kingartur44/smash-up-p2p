import { GameState } from "../GameState"
import { ActionGameCard } from "./ActionGameCard"
import { MinionGameCard } from "./MinionGameCard"


export type OnPlayEffect = OnPlayEffectMinionCard | OnPlayEffectActionCard

export type GameCardEffect_OLD = PowerBoostEffect | OnPlayEffect | AfterBaseScore_OverrideDestination


export enum GenericPositions {
	Deck,
	DiscardPile,
	Hand,
	Field
}


export type PowerBoostEffect = {
	type: "power-boost",
	positionRequirement: GenericPositions
	callback: (card: MinionGameCard, gameState: GameState) => number
}


export interface AfterBaseScore_OverrideDestination {
	type: "after-base-score_override-destination"
	newDestination: GenericPositions
	isOptional: boolean
}

export type OnPlayEffectMinionCard = {
	type: "on-play-minion",
	callback: (card: MinionGameCard, gameState: GameState) => Promise<void>
}

export type OnPlayEffectActionCard = {
	type: "on-play-action",
	callback: (card: ActionGameCard, gameState: GameState) => Promise<void>
}