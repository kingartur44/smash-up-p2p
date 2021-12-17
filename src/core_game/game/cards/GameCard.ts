import { ActionDatabaseCard, BaseDatabaseCard, DatabaseCard, MinionDatabaseCard } from "../../database/DatabaseCard"
import { FIELD_POSITIONS, Position, PositionType } from "../position/Position"
import { GamePhase, GameState, PlayerID } from "../GameState"
import { BaseGameCard } from "./BaseGameCard"
import { ActionGameCard } from "./ActionGameCard"
import { MinionGameCard } from "./MinionGameCard"
import { CardType } from "../../data/CardType"
import { GamePlayer } from "../GamePlayer"
import { GameCardEffect } from "./GameCardEffects"
import { AfterBaseScore_OverrideDestination, GenericPositions } from "./GameCardState"
import { ClientActionCard, ClientBaseCard, ClientGameCard, ClientMinionCard } from "../../client_game/ClientGameState"
import { GameCardEvent, GameCardEventType } from "./GameEvent"
import { GameCardState } from "./GameCardState"

type CardId = number

export abstract class GameCard {
	gameState: GameState;

	id: CardId
	position: Position
	owner_id: PlayerID | null
	controller_id: PlayerID | null

	effects: GameCardEffect[]
	states: GameCardState[]

	database_card_id: string;
	
	abstract type: CardType

	abstract get power(): number
	abstract get databaseCard(): DatabaseCard

	abstract get targets(): CardId[]
	abstract get isPlayable(): boolean
	

	constructor(gameState: GameState) {
		this.gameState = gameState

		this.id = -1
		this.position = {
			positionType: PositionType.NoPosition
		}

		this.effects = []
		this.states = []

		this.database_card_id = "";

		this.owner_id = null;
		this.controller_id = null;
	}


	dispatchEvent(event: GameCardEvent) {
		switch (event.type) {
			case GameCardEventType.ReturnToHand: {
				if (this.owner_id === null) {
					return
				}
				this.moveCard({
					positionType: PositionType.Hand,
					playerID: this.owner_id
				})
				break
			}
			case GameCardEventType.GoToTheBottomOfTheDeck: {
				if (this.owner_id === null) {
					return
				}
				this.moveCard({
					positionType: PositionType.Deck,
					playerID: this.owner_id
				}, "bottom")
				break
			}
			case GameCardEventType.Destroy: {
				if (this.owner_id === null) {
					return
				}
				this.moveCard({
					positionType: PositionType.DiscardPile,
					playerID: this.owner_id
				})
				break
			}
		}
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

	registerEffect(effect: GameCardEffect) {
		this.effects.push(effect)
	}

	addState(state: GameCardState) {
		this.states.push(state)
	}

	async onPlay() {
		for (const effect of this.effects) {
			if (effect.type === "on-play-minion") {
				if (this.isMinionCard()) {
					await effect.callback(this, this.gameState)
				}
				
			} else if (effect.type === "on-play-action") {
				if (this.isActionCard()) {
					await effect.callback(this, this.gameState)
				}
			} else if (effect.type === "ongoing") {
				if (this.isMinionCard()) {
					await effect.callback(this, this.gameState)
				}				
			} else if (effect.type === "special-minion") {
				if (this.isMinionCard()) {
					await effect.callback(this, this.gameState)
				}
			} 
			else {
				throw new Error("The effect is not activable")
			}
		}
	}


	queryStates<T extends GameCardState>(input: string[] | string): T[] {
		const effectTypes = Array.isArray(input) ? input : [input]
		return this.states
			.filter(state => {
				if (!FIELD_POSITIONS.includes(this.position.positionType)) {
					return false
				}
				if (!effectTypes.includes(state.type)) {
					return false
				}
				return true
			}) as T[]
	}


	discardCardAfterBaseScore() {
		if (this.owner_id === null) {
			throw new Error("The card has no owner")
		}

		const overrideEffects = this.queryStates<AfterBaseScore_OverrideDestination>("after-base-score_override-destination")

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
						this.dispatchEvent({
							initiator: this,
							type: GameCardEventType.ReturnToHand
						})
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
			positionType: PositionType.DiscardPile,
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
		switch (this.position.positionType) {
			case PositionType.Hand: {
				this.gameState.players[this.position.playerID].hand.removeCard(this)
				break
			}
			case PositionType.Deck: {
				this.gameState.players[this.position.playerID].deck.removeCard(this)
				break
			}
			case PositionType.isAboutToBePlayed: {
				this.gameState.players[this.position.playerID].aboutToBePlayedCards.removeCard(this)
				break
			}
			case PositionType.DiscardPile: {
				this.gameState.players[this.position.playerID].discardPile.removeCard(this)
				break
			}
			case PositionType.Base: {
				const base = this.gameState.getCard(this.position.base_id)
				if (!base.isBaseCard()) {
					throw new Error(`Logic Error: The card is not a base card`)
				}

				base.attached_cards.removeCard(this)
				break
			}
			case PositionType.basesDiscardPile: {
				this.gameState.bases_discard_pile.removeCard(this)
				break
			}
			case PositionType.BasesDeck: {
				this.gameState.bases_deck.removeCard(this)
				break
			}
			case PositionType.Board: {
				this.gameState.in_play_bases.removeCard(this)
				break
			}
			case PositionType.NoPosition: {
				break
			}
			default: {
				throw new Error(`Position [${JSON.stringify(this.position)}] not implemented`)
			}
		}

		this.position = {
			positionType: PositionType.NoPosition
		}
	}

	moveCard(newPosition: Position, extra?: "shuffle-in" | "top" | "bottom") {
		this.removeFromItsPosition()

		if (!FIELD_POSITIONS.includes(newPosition.positionType)) {
			this.removeAllStates()
		}

		switch (newPosition.positionType) {
			case PositionType.Base: {
				const base = this.gameState.getCard(newPosition.base_id)
				if (!base.isBaseCard()) {
					throw new Error(`Logic Error: The card is not a base card`)
				}

				base.attached_cards.addToBottom(this)
				this.position = newPosition
				break
			}
			case PositionType.Hand: {
				const player = this.gameState.players[newPosition.playerID] as GamePlayer | undefined
				if (player === undefined) {
					throw new Error(`The player [${newPosition.playerID}] does not exist`)
				}

				player.hand.addToBottom(this)
				this.position = newPosition
				break
			}
			case PositionType.isAboutToBePlayed: {
				const player = this.gameState.players[newPosition.playerID] as GamePlayer | undefined
				if (player === undefined) {
					throw new Error(`The player [${newPosition.playerID}] does not exist`)
				}

				player.aboutToBePlayedCards.addToBottom(this)
				this.position = newPosition
				break
			}
			case PositionType.DiscardPile: {
				const player = this.gameState.players[newPosition.playerID] as GamePlayer | undefined
				if (player === undefined) {
					throw new Error(`The player [${newPosition.playerID}] does not exist`)
				}

				player.discardPile.addToBottom(this)
				this.position = newPosition
				break
			}
			case PositionType.Deck: {
				const player = this.gameState.players[newPosition.playerID] as GamePlayer | undefined
				if (player === undefined) {
					throw new Error(`The player [${newPosition.playerID}] does not exist`)
				}

				switch (extra) {
					default:
					case "top": {
						player.deck.addToTop(this)
						break
					}
					case "shuffle-in": {
						player.deck.addToTop(this)
						player.deck.shuffle()
						break
					}
					case "bottom": {
						player.deck.addToBottom(this)
						break
					}
				}

				this.position = newPosition
				break
			}
			case PositionType.Board: {
				if (!this.isBaseCard()) {
					throw new Error("Logic Error: Trying to move a non-base card on the board")
				}
				this.gameState.in_play_bases.addToBottom(this)
				this.position = newPosition
				break
			}
			case PositionType.BasesDeck: {
				if (!this.isBaseCard()) {
					throw new Error("Logic Error: Trying to move a non-base card on the board")
				}
				this.gameState.bases_deck.addToBottom(this)
				this.position = newPosition
				break
			}
			case PositionType.basesDiscardPile: {
				if (!this.isBaseCard()) {
					throw new Error("Logic Error: Trying to move a non-base card on the board")
				}
				this.gameState.bases_discard_pile.addToBottom(this)
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


	updateCardStates({turnPlayer, gamePhase, timing}: {turnPlayer: PlayerID, gamePhase: GamePhase, timing: "start" | "end"}) {
		this.states = this.states.filter(state => {
			if (state.expire) {
				if (state.expire.phase === gamePhase && state.expire.timing === timing) {
					if (state.expire.player_id) {
						if (state.expire.player_id === turnPlayer) {
							return false
						} 
					} else {
						return false
					}
				}
			}

			return true
		})
	}

	removeAllStates() {
		this.states = []
	}

}