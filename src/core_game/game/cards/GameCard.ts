import { DatabaseCard } from "../../database/DatabaseCard"
import { Position } from "../utils/Position"
import { GameState, PlayerID } from "../GameState"
import { BaseGameCard } from "./BaseGameCard"
import { ActionGameCard } from "./ActionGameCard"
import { MinionGameCard } from "./MinionGameCard"
import { CardType } from "../../data/CardType"
import { GamePlayer } from "../GamePlayer"
import { GameCardEffect, GenericPositions } from "./CardEffects"
import { transpile } from "typescript"

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
		if (this.owner_id === null) {
			return
		}
		this.gameState.moveCard(this.id, {
			position: "hand",
			playerID: this.owner_id
		})
	}

	initializeEffects() {
		if (this.databaseCard.initializeEffects) {
			this.databaseCard.initializeEffects(this, this.gameState)
		}
	}

	registerEffect(effect: GameCardEffect) {
		this.effects.push(effect)
	}

	onPlay() {
		this.queryEffects("on-play")
			.forEach(effect => {
				const callback = eval(transpile(effect.callback))
				callback(this, this.gameState)
			})
	}

	queryEffects(effectType: string) {
		return this.effects
			.filter(effect => {
				if (effect.type !== effectType) {
					return false
				}
				if ("positionRequirement" in effect) {
					const isRightPosition = (() => {
						switch (effect.positionRequirement) {
							case GenericPositions.Deck:
								return this.position.position === "deck"
							case GenericPositions.DiscardPile:
								return this.position.position === "discard-pile"
							case GenericPositions.Field:
								return ["field", "base"].includes(this.position.position)
							case GenericPositions.Hand:
								return this.position.position === "hand"
						}
					})()
					if (!isRightPosition) {
						return false
					}
				}
				
				return true
			})
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


