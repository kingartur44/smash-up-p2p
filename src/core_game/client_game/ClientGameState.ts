import { GameCardId, GamePhase, PlayerID } from "../game/GameState";
import { Position } from "../game/position/Position";

export type ClientGameAction = {
	type: "None"
} | {
	type: "ChooseTarget"
	playerID: PlayerID
	possibleTargets: GameCardId[]
	prompt: string
	canSelectNull: boolean
}


export interface ClientGameState {
	phase: GamePhase;
	phaseStep: "start" | "process" | "end" 
	turnPlayerId: PlayerID

	players: ClientGamePlayer[]
	currentAction: ClientGameAction

	cards: Record<GameCardId, ClientGameCard>

	bases_deck: ClientGameCard[]
	in_play_bases: ClientGameCard[]
	bases_discard_pile: ClientGameCard[]
}

export interface ClientGamePlayer {
	id: number
	name: string
	factions: string[]

	victoryPointsDetailed: {
		amount: number
		detail: string
	}[]
	victoryPoints: number

	minionPlays: number
	actionPlays: number

	deck: ClientGameCard[]
	hand: ClientGameCard[]
	discardPile: ClientGameCard[]
	aboutToBePlayedCards: ClientGameCard[]
}


export type ClientGameCard = ClientMinionCard | ClientBaseCard | ClientActionCard

export interface ClientMinionCard {
	type: "minion"
	id: GameCardId;
	position: Position;
	controller_id: PlayerID | null;
	databaseCard: {
		name: string
		image: string | undefined,
		description: string
	}
	isPlayable: boolean;
	targets: GameCardId[];

	attached_cards: ClientGameCard[]
	power: any
}

export interface ClientActionCard {
	type: "action"
	id: GameCardId;
	position: Position;
	controller_id: PlayerID | null;
	databaseCard: {
		name: string
		image: string | undefined,
		description: string
	}
	isPlayable: boolean;
	targets: GameCardId[];

	attached_cards: ClientGameCard[]
	power: any
}

export interface ClientBaseCard {
	type: "base"
	id: GameCardId;
	position: Position;
	controller_id: PlayerID | null
	databaseCard: {
		name: string
		image: string | undefined,
		description: string
	}
	isPlayable: boolean
	targets: GameCardId[];
	
	breakpoint: number
	totalPowerOnBase: number

	playerCards: Record<number, GameCardId[]>
}