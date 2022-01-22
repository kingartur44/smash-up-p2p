import { GamePhase, GameState, PlayerID } from "../GameState";
import { BaseGameCard } from "./BaseGameCard";
import { GameCard } from "./GameCard";
import { MinionGameCard } from "./MinionGameCard";

export type GameCardState = PowerBoost | ReduceBreakpoint | AfterBaseScore_OverrideDestination

export enum GenericPositions {
	Deck,
	DiscardPile,
	Hand,
	Field
}


export interface GamePhasesTiming {
	phase: GamePhase,
	timing: "start" | "end"
	player_id?: PlayerID | null
}

export interface PowerBoost {
	type: "power-boost"
	value: number | ((card: MinionGameCard, gameState: GameState) => number) | ((card: GameCard, gameState: GameState) => Map<MinionGameCard, number>)

	expire?: GamePhasesTiming
}

export interface AfterBaseScore_OverrideDestination {
	type: "after-base-score_override-destination"
	newDestination: GenericPositions
	isOptional: boolean

	expire?: GamePhasesTiming
}

export interface ReduceBreakpoint {
	type: "reduce-breakpoint"
	value: ((card: BaseGameCard, gameState: GameState) => number) | number
	expire?: GamePhasesTiming
}