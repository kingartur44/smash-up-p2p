import { GameState } from "../GameState"
import { ActionGameCard } from "./ActionGameCard"
import { MinionGameCard } from "./MinionGameCard"


export type OnPlayEffect = OnPlayEffectMinionCard | OnPlayEffectActionCard

export type SpecialEffect = SpecialMinionEffect

export type GameCardEffect = OnPlayEffect | OngoingEffect | SpecialEffect



export interface OngoingEffect {
	type: "ongoing",
	callback: (card: MinionGameCard, gameState: GameState) => Promise<void>
}

export interface SpecialMinionEffect {
	type: "special-minion",
	callback: (card: MinionGameCard, gameState: GameState) => Promise<void>
}

export interface OnPlayEffectMinionCard {
	type: "on-play-minion",
	callback: (card: MinionGameCard, gameState: GameState) => Promise<void>
}

export interface OnPlayEffectActionCard {
	type: "on-play-action",
	callback: (card: ActionGameCard, gameState: GameState) => Promise<void>
}