import { DatabaseCard } from "../../database/DatabaseCard"
import { Position } from "../utils/Position"
import { GameState, PlayerID } from "../GameState"
import { BaseGameCard } from "./BaseGameCard"
import { ActionGameCard } from "./ActionGameCard"
import { MinionGameCard } from "./MinionGameCard"
import { CardType } from "../../data/CardType"
import { GamePlayer } from "../GamePlayer"
import { GameCardEffect } from "./CardEffects"

type CardId = number

export abstract class GameCard {
	gameState: GameState;

	id: CardId
	position: Position
	owner_id: PlayerID | null
	controller_id: PlayerID | null
	effects: GameCardEffect[]
	
	abstract type: CardType

	abstract get power(): number
	abstract get databaseCard(): DatabaseCard

	abstract get targets(): CardId[]
	abstract get isPlayable(): boolean


	abstract serialize(): any
	abstract deserialize(input: any): void
	

	constructor(gameState: GameState) {
		this.gameState = gameState

		this.id = -1
		this.position = {
			position: "no-position"
		}
		this.effects = []

		this.owner_id = null;
		this.controller_id = null;
	}

	returnToOwnerHand() {
		if (!this.owner_id) {
			return
		}
		this.gameState.moveCard(this.id, {
			position: "hand",
			playerID: this.owner_id
		})
	}

	initializeEffects() {
		
	}

	registerEffect(effect: GameCardEffect) {
		this.effects.push(effect)
	}

	get owner(): GamePlayer | null {
		if (this.owner_id === null) {
			return null
		}
		return this.gameState.players[this.owner_id]
	}
	get controller(): GamePlayer | null {
		if (this.controller_id === null) {
			return null
		}
		return this.gameState.players[this.controller_id]
	}

	// Controlli di classe per typescript
	isMinionCard(): this is MinionGameCard {
		return this.type === CardType.Minion;
	}

	isActionCard(): this is ActionGameCard {
		return this.type === CardType.Action;
	}

	isBaseCard(): this is BaseGameCard {
		return this.type === CardType.Base;
	}
}


