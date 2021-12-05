import { ActionDatabaseCard, BaseDatabaseCard, DatabaseCard, MinionDatabaseCard } from "../../database/DatabaseCard"
import { Position } from "../position/Position"
import { GameState, PlayerID } from "../GameState"
import { BaseGameCard } from "./BaseGameCard"
import { ActionGameCard } from "./ActionGameCard"
import { MinionGameCard } from "./MinionGameCard"
import { CardType } from "../../data/CardType"
import { GamePlayer } from "../GamePlayer"
import { AfterBaseScore_OverrideDestination, GameCardEffect_OLD, GenericPositions, OnPlayEffect } from "./CardEffects"
import { ClientActionCard, ClientBaseCard, ClientGameCard, ClientMinionCard } from "../../client_game/ClientGameState"

type CardId = number

export abstract class GameCard {
	gameState: GameState;

	id: CardId
	position: Position
	owner_id: PlayerID | null
	controller_id: PlayerID | null
	effects: GameCardEffect_OLD[]

	database_card_id: string;
	
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
		this.database_card_id = "";

		this.owner_id = null;
		this.controller_id = null;
	}

	returnToOwnerHand() {
		if (this.owner_id === null) {
			return
		}
		this.moveCard({
			position: "hand",
			playerID: this.owner_id
		})
	}

	initializeEffects() {
		if (this.databaseCard instanceof MinionDatabaseCard) {
			if (this.isMinionCard()) {
				this.databaseCard.initializeEffects?.(this, this.gameState)
			}
		}

		if (this.databaseCard instanceof ActionDatabaseCard) {
			if (this.isActionCard()) {
				this.databaseCard.initializeEffects?.(this, this.gameState)
			}
		}

		if (this.databaseCard instanceof BaseDatabaseCard) {
			if (this.isBaseCard()) {
				this.databaseCard.initializeEffects?.(this, this.gameState)
			}
		}
		
	}

	registerEffect(effect: GameCardEffect_OLD) {
		this.effects.push(effect)
	}

	async onPlay() {
		for (const effect of this.queryEffects<OnPlayEffect>("on-play")) {
			if (effect.type === "on-play-minion" && this.isMinionCard()) {
				await effect.callback(this, this.gameState)
			} else if (effect.type === "on-play-action" && this.isActionCard()) {
				await effect.callback(this, this.gameState)
			} else {
				throw new Error("The effect is not activable")
			}
		}
	}

	queryEffects<T extends GameCardEffect_OLD>(effectType: string): T[] {
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
			}) as T[]
	}


	discardCardAfterBaseScore() {
		if (this.owner_id === null) {
			throw new Error("The card has no owner")
		}

		const overrideEffects = this.queryEffects<AfterBaseScore_OverrideDestination>("after-base-score_override-destination")

		if (overrideEffects.length > 1) {
			throw new Error("TODO Error: Decidere cosa fare in queste situazioni")
		}

		if (overrideEffects.length === 1) {
			const effect = overrideEffects[0]
			let effectIsActivated = true
			if (effect.isOptional) {
				effectIsActivated = confirm(`Do you wish to activate the effect of ${this.databaseCard.name}?`)
			}
			if (effectIsActivated) {
				switch (effect.newDestination) {
					case GenericPositions.Hand: {
						this.returnToOwnerHand()
						break
					}
					default: {
						throw new Error("TODO Error")
					}
				}
				return
			}
		}

		this.moveCard({
			position: "discard-pile",
			playerID: this.owner_id
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


	private removeFromItsPosition() {
		switch (this.position.position) {
			case "hand": {
				this.gameState.players[this.position.playerID].hand.removeCard(this)
				break
			}
			case "deck": {
				this.gameState.players[this.position.playerID].deck.removeCard(this)
				break
			}
			case "is-about-to-be-played": {
				this.gameState.players[this.position.playerID].aboutToBePlayedCards.removeCard(this)
				break
			}
			case "discard-pile": {
				this.gameState.players[this.position.playerID].discardPile.removeCard(this)
				break
			}
			case "base": {
				const base = this.gameState.getCard(this.position.base_id)
				if (!base.isBaseCard()) {
					throw new Error(`Logic Error: The card is not a base card`)
				}

				base.attached_cards.removeCard(this)
				break
			}
			case "bases_discard_pile": {
				this.gameState.bases_discard_pile.removeCard(this)
				break
			}
			case "bases_deck": {
				this.gameState.bases_deck.removeCard(this)
				break
			}
			case "board": {
				this.gameState.in_play_bases.removeCard(this)
				break
			}
			case "no-position": {
				break
			}
			default: {
				throw new Error(`Position [${JSON.stringify(this.position)}] not implemented`)
			}
		}

		this.position = {
			position: "no-position"
		}
	}

	moveCard(newPosition: Position) {
		this.removeFromItsPosition()

		switch (newPosition.position) {
			case "base": {
				const base = this.gameState.getCard(newPosition.base_id)
				if (!base.isBaseCard()) {
					throw new Error(`Logic Error: The card is not a base card`)
				}

				base.attached_cards.addCard(this)
				this.position = newPosition
				break
			}
			case "hand": {
				const player = this.gameState.players[newPosition.playerID] as GamePlayer | undefined
				if (player === undefined) {
					throw new Error(`The player [${newPosition.playerID}] does not exist`)
				}

				player.hand.addCard(this)
				this.position = newPosition
				break
			}
			case "is-about-to-be-played": {
				const player = this.gameState.players[newPosition.playerID] as GamePlayer | undefined
				if (player === undefined) {
					throw new Error(`The player [${newPosition.playerID}] does not exist`)
				}

				player.aboutToBePlayedCards.addCard(this)
				this.position = newPosition
				break
			}
			case "discard-pile": {
				const player = this.gameState.players[newPosition.playerID] as GamePlayer | undefined
				if (player === undefined) {
					throw new Error(`The player [${newPosition.playerID}] does not exist`)
				}

				player.discardPile.addCard(this)
				this.position = newPosition
				break
			}
			case "deck": {
				const player = this.gameState.players[newPosition.playerID] as GamePlayer | undefined
				if (player === undefined) {
					throw new Error(`The player [${newPosition.playerID}] does not exist`)
				}

				player.deck.addCard(this)
				this.position = newPosition
				break
			}
			case "board": {
				if (!this.isBaseCard()) {
					throw new Error("Logic Error: Trying to move a non-base card on the board")
				}
				this.gameState.in_play_bases.addCard(this)
				this.position = newPosition
				break
			}
			case "bases_deck": {
				if (!this.isBaseCard()) {
					throw new Error("Logic Error: Trying to move a non-base card on the board")
				}
				this.gameState.bases_deck.addCard(this)
				this.position = newPosition
				break
			}
			case "bases_discard_pile": {
				if (!this.isBaseCard()) {
					throw new Error("Logic Error: Trying to move a non-base card on the board")
				}
				this.gameState.bases_discard_pile.addCard(this)
				this.position = newPosition
				break
			}
		}
	}


	toClientGameCardArray(): ClientGameCard {
		if (this.isMinionCard()) {
			const clientCard: ClientMinionCard = {
				type: "minion",

				id: this.id,
				controller_id: this.controller_id,
				databaseCard: {
					name: this.databaseCard.name,
					image: this.databaseCard.image,
					description: this.databaseCard.description
				},
				isPlayable: this.isPlayable,
				position: this.position,
				power: this.power,
				targets: this.targets
			}
			return clientCard
		} else if (this.isBaseCard()) {
			const clientCard: ClientBaseCard = {
				type: "base",

				id: this.id,
				controller_id: this.controller_id,
				databaseCard: {
					name: this.databaseCard.name,
					image: this.databaseCard.image,
					description: this.databaseCard.description
				},
				isPlayable: this.isPlayable,
				position: this.position,
				targets: this.targets,
				
				breakpoint: this.breakpoint,
				playerCards: this.playerCards
			}
			return clientCard
		} else if (this.isActionCard()) {
			const clientCard: ClientActionCard = {
				type: "action",

				id: this.id,
				controller_id: this.controller_id,
				databaseCard: {
					name: this.databaseCard.name,
					image: this.databaseCard.image,
					description: this.databaseCard.description
				},
				isPlayable: this.isPlayable,
				position: this.position,
				power: this.power,
				targets: this.targets
			}
			return clientCard
		} else {
			throw new Error("Error: Card not supported")
		}
	}
}