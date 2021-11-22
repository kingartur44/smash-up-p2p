import { makeAutoObservable, observable } from "mobx"
import { DatabaseCard } from "../database/DatabaseCard"
import { Bases } from "../database/core_set/core_set"
import { Faction } from "../database/core_set/Factions"
import { GameServer } from "../GameServer"
import { GameCard } from "./cards/GameCard"
import { fromDatabaseCard, gameCardDeserializer } from "./cards/game_card_utils"
import { BaseGameCard } from "./cards/BaseGameCard"
import { GamePlayer } from "./GamePlayer"
import { Position } from "./utils/Position"
import { GameQuery, GameQueryManager } from "./GameQueryManager"
import { ScriptTarget, transpile } from "typescript"
import { ActionGameCard } from "./cards/ActionGameCard"
import { MinionGameCard } from "./cards/MinionGameCard"

export type PlayerID = number
export type GameCardId = number

export enum GamePhase {
	Setup_FactionSelect,
	Setup_BuildBaseDeck,
	Setup_PrepareTheMonsterandTreasureDecks,
	Setup_PreparetheMadnessDeck,
	Setup_DrawBases,
	Setup_DrawHands,


	GameTurn_Start,
	GameTurn_PlayCards,
	GameTurn_ScoreBase,
	GameTurn_Draw,
	GameTurn_EndTurn,

	ToDo
}


export enum GameCurrentActionType {
	None,
	ChooseTarget
}

export type GameAction = {
	type: GameCurrentActionType.None
} | {
	type: GameCurrentActionType.ChooseTarget,
	possibleTargets: GameCardId[]
	prompt: string
	canSelectNull: boolean
	sendTargetCallback: (card_id: GameCardId | null) => void
}



export class GameState {
	server: GameServer
	queryManager: GameQueryManager

	haveToInitPhase: boolean
	phase: GamePhase

	currentAction: GameAction
	
	activatedEffectQueue: {card_id: GameCardId, effect: string}[]
	history: {card_id: GameCardId}[]

	cardNextId: GameCardId
	cards: Record<GameCardId, GameCard>

	players: GamePlayer[]
	turnPlayerId: PlayerID

	bases_deck: GameCardId[]
	in_play_bases: GameCardId[]
	bases_discard_pile: GameCardId[]

	constructor(server: GameServer) {
		this.server = server
		this.queryManager = new GameQueryManager(this)

		this.cardNextId = 0
		this.cards = observable.object({}, {
			deep: true
		})

		this.players = [
			new GamePlayer({
				gameState: this,
				id: 0
			}),
			new GamePlayer({
				gameState: this,
				id: 1
			}),
		]
		this.turnPlayerId = 0

		this.bases_deck = []
		this.in_play_bases = []
		this.bases_discard_pile = []

		this.haveToInitPhase = true
		this.phase = GamePhase.Setup_FactionSelect

		this.activatedEffectQueue = []
		this.history = []

		this.currentAction = observable.object({
			type: GameCurrentActionType.None
		})

		makeAutoObservable(this, {
			server: false
		})
	}

	nextStep() {
		if (this.activatedEffectQueue.length > 0) {
			let nextEffect = this.activatedEffectQueue.pop()
			if (nextEffect) {
				const card = this.getCard(nextEffect.card_id)
				// eslint-disable-next-line no-eval
				const callback = eval(transpile(nextEffect.effect, {
					target: ScriptTarget.ESNext
				}))
				callback(card, this)
			}
		}

		switch (this.phase) {
			case GamePhase.Setup_FactionSelect: {
				this.players[0].setFactions([Faction.Aliens])
				this.players[0].name = "Giocatore 1"
				this.players[0].color = "aqua"

				this.players[1].setFactions([Faction.Dinosaurs])
				this.players[1].name = "Giocatore 2"
				this.players[1].color = "orange"


				this.setPhase(GamePhase.Setup_BuildBaseDeck)
				break
			}

			case GamePhase.Setup_BuildBaseDeck: {
				const base_0 = this.generateCard(Bases[0]).id
				const base_1 = this.generateCard(Bases[1]).id
				const base_2 = this.generateCard(Bases[2]).id
				const base_3 = this.generateCard(Bases[3]).id

				this.moveCard(base_0, {
					position: "bases_deck"
				})
				this.moveCard(base_1, {
					position: "bases_deck"
				})
				this.moveCard(base_2, {
					position: "bases_deck"
				})
				this.moveCard(base_3, {
					position: "bases_deck"
				})

				this.setPhase(GamePhase.Setup_PrepareTheMonsterandTreasureDecks)
				break
			}

			case GamePhase.Setup_PrepareTheMonsterandTreasureDecks: {
				this.setPhase(GamePhase.Setup_PreparetheMadnessDeck)
				break
			}
			case GamePhase.Setup_PreparetheMadnessDeck: {
				this.setPhase(GamePhase.Setup_DrawBases)
				break
			}
			case GamePhase.Setup_DrawBases: {
				this.moveCard(this.bases_deck[0], {
					position: "board"
				})
				this.moveCard(this.bases_deck[0], {
					position: "board"
				})
				this.moveCard(this.bases_deck[0], {
					position: "board"
				})

				this.setPhase(GamePhase.Setup_DrawHands)
				break
			}
			case GamePhase.Setup_DrawHands: {
				for (const player of this.players) {
					player.draw(5)
				}

				this.setPhase(GamePhase.GameTurn_Start)
				break
			}
			case GamePhase.GameTurn_Start: {
				this.setPhase(GamePhase.GameTurn_PlayCards)
				break
			}
			case GamePhase.GameTurn_PlayCards: {
				if (this.haveToInitPhase) {
					for (const player of this.players) {
						if (player.id === this.turnPlayerId) {
							player.minionPlays = 1;
							player.actionPlays = 1;
						} else {
							player.minionPlays = 0;
							player.actionPlays = 0;
						}
					}
					
					this.haveToInitPhase = false
				}
				break
			}
			case GamePhase.GameTurn_ScoreBase: {
				for (const baseID of this.in_play_bases) {
					const base = this.cards[baseID]
					if (!base.isBaseCard()) {
						throw new Error("The base card isn't a base...")
					}
					if (base.totalPowerOnBase >= base.breakpoint) {
						const runners = base.sortedPlayersPower
						for (let i = 0; i < base.databaseCard.points.length; i++) {
							const runner = runners[i]
							if (runner) {
								runner.player.victoryPoints += base.databaseCard.points[i]
							}
						}

						for (const cardID of base.attached_cards) {
							const card = this.getCard(cardID)
							if (card === null) {
								throw new Error("This card should exist")
							}
							if (card.owner_id === null) {
								throw new Error("The card has no owner")
							}
							this.moveCard(cardID, {
								position: "discard-pile",
								playerID: card.owner_id
							})
						}
						this.moveCard(baseID, {
							position: "bases_discard_pile"
						})

						const newBase = this.getCard(this.bases_deck[0])
						if (!newBase) {
							throw new Error("TODO Error: you have to shuffle the deck if it's empty")
						}
						this.moveCard(newBase.id, {
							position: "board"
						})

					}
				}

				this.setPhase(GamePhase.GameTurn_Draw)
				break
			}
			case GamePhase.GameTurn_Draw: {
				this.turnPlayer.draw(2)
				this.setPhase(GamePhase.GameTurn_EndTurn)
				break
			}
			case GamePhase.GameTurn_EndTurn: {
				this.turnPlayerId++
				if (this.turnPlayerId === 2) {
					this.turnPlayerId = 0
				}
				this.setPhase(GamePhase.GameTurn_PlayCards)
				break
			}
			case GamePhase.ToDo: {
				console.error("TO DO")
			}
		}
	}

	setPhase(phase: GamePhase) {
		this.phase = phase
		this.haveToInitPhase = true
	}

	generateCard(databaseCard: DatabaseCard): GameCard {
		const card = fromDatabaseCard({
			gameState: this,
			input: databaseCard
		})
		card.id = this.cardNextId
		this.cards[card.id] = card
		this.cardNextId += 1
		return card
	}

	get currentPlayer(): GamePlayer {
		return this.players[this.server.playerID]
	}

	get turnPlayer(): GamePlayer {
		return this.players[this.turnPlayerId]
	}

	get isClientOwnerTurn(): boolean {
		return this.server.playerID === this.turnPlayerId
	}

	endTurn() {
		if (this.phase === GamePhase.GameTurn_PlayCards) {
			this.setPhase(GamePhase.GameTurn_ScoreBase)
		}
	}

	getCard(card_id: GameCardId): GameCard | null {
		return this.cards[card_id]
	}

	async pickTarget(query: GameQuery, prompt: string, canSelectNull: boolean): Promise<GameCard | null> {
		const possibleTargets = this.queryManager.executeQuery(query)
		if (possibleTargets.length === 0) {
			return null
		}

		return new Promise(resolve => {
			this.currentAction = {
				type: GameCurrentActionType.ChooseTarget,
				prompt: prompt,
				canSelectNull: canSelectNull,
				sendTargetCallback: (card_id) => {
					if (card_id === null) {
						if (canSelectNull) {
							resolve(null)
							this.currentAction = {
								type: GameCurrentActionType.None
							}
						}
						return
					}
					if (possibleTargets.includes(card_id)) {
						resolve(this.getCard(card_id))
						this.currentAction = {
							type: GameCurrentActionType.None
						}
					}
				},
				possibleTargets: possibleTargets
			}
		})
	}

	addEffectToQueue(card_id: number, effect: string) {
		this.activatedEffectQueue.push({ card_id, effect })
	}

	async playMinionCard(card: MinionGameCard, playerID: PlayerID, newPosition: Position) {
		if (this.players[playerID].minionPlays <= 0) {
			throw new Error("You don't have enought minion plays")
		}
	
		
		if (card.position.position === "hand") {
			if (newPosition.position === "base") {
				this.players[playerID].minionPlays -= 1
				this.moveCard(card.id, newPosition)
				card.onPlay()
			}
		}

	}

	async playActionCard(card: ActionGameCard, playerID: PlayerID, newPosition?: Position) {
		if (this.players[playerID].actionPlays <= 0) {
			throw new Error("You don't have enought action plays")
		}
		if (card.owner_id === null) {
			throw new Error("We need an owner to know the discard pile where to send the card")
		}

		if (card.position.position === "hand") {
			this.players[playerID].actionPlays--

			this.moveCard(card.id, {
				position: "is-about-to-be-played",
				playerID: card.owner_id
			})

			await card.onPlay()

			this.moveCard(card.id, {
				position: "discard-pile",
				playerID: card.owner_id
			})
		}
	}

	playCard(card_id: number, playerID: PlayerID, newPosition?: Position) {
		const card = this.getCard(card_id)
		if (card === null) {
			throw new Error("The card does not exist")
		}
		if (card.isMinionCard()) {
			if (newPosition === undefined) {
				throw new Error("[newPosition] is undefined")
			}
			this.playMinionCard(card, playerID, newPosition)
		} else if (card.isActionCard()) {
			this.playActionCard(card, playerID, newPosition)
		} else if (card.isBaseCard()) {
			throw new Error("TODO Implementare")
		} else {
			throw new Error("Attention, this card is not yet supported")
		}
	}

	removeCardFromItsPosition(cardID: number) {
		const gameCard = this.cards[cardID]
		const position = gameCard.position
		switch (position.position) {
			case "hand": {
				this.players[position.playerID].hand = this.players[position.playerID].hand.filter(cardID => cardID !== gameCard.id)
				break
			}
			case "deck": {
				this.players[position.playerID].deck = this.players[position.playerID].deck.filter(cardID => cardID !== gameCard.id)
				break
			}
			case "is-about-to-be-played": {
				this.players[position.playerID].aboutToBePlayedCards = this.players[position.playerID].aboutToBePlayedCards.filter(cardID => cardID !== gameCard.id)
				break
			}
			case "discard-pile": {
				this.players[position.playerID].discardPile = this.players[position.playerID].discardPile.filter(cardID => cardID !== gameCard.id)
				break
			}
			case "base": {
				const base = this.getCard(position.base_id) as BaseGameCard
				if (!base) {
					throw new Error(`The card [${position.base_id}] does not exist`)
				}

				base.attached_cards = base.attached_cards.filter(cardID => cardID !== gameCard.id)
				break
			}
			case "bases_discard_pile": {
				this.bases_discard_pile = this.bases_discard_pile.filter(cardID => cardID !== gameCard.id)
				break
			}
			case "bases_deck": {
				this.bases_deck = this.bases_deck.filter(cardID => cardID !== gameCard.id)
				break
			}
			case "board": {
				this.in_play_bases = this.in_play_bases.filter(cardID => cardID !== gameCard.id)
				break
			}
			case "no-position": {
				break
			}
			default: {
				throw new Error(`Position [${JSON.stringify(position)}] not implemented`)
			}
		}
		gameCard.position = {
			position: "no-position"
		}
	}

	moveCard(cardID: number, newPosition: Position) {
		this.removeCardFromItsPosition(cardID)
		
		const card = this.getCard(cardID)

		if (!card) {
			throw new Error(`The card [${cardID}] does not exist`)
		}

		switch (newPosition.position) {
			case "base": {
				const base = this.getCard(newPosition.base_id) as BaseGameCard
				if (!base) {
					throw new Error(`The card [${newPosition.base_id}] does not exist`)
				}

				base.attached_cards.push(cardID)
				card.position = {
					...newPosition,
					index: base.attached_cards.length - 1
				}
				break
			}
			case "hand": {
				const player = this.players[newPosition.playerID]
				if (!player) {
					throw new Error(`The player [${newPosition.playerID}] does not exist`)
				}

				player.hand.push(cardID)
				card.position = newPosition
				break
			}
			case "is-about-to-be-played": {
				const player = this.players[newPosition.playerID]
				if (!player) {
					throw new Error(`The player [${newPosition.playerID}] does not exist`)
				}

				player.aboutToBePlayedCards.push(cardID)
				card.position = newPosition
				break
			}
			case "discard-pile": {
				const player = this.players[newPosition.playerID]
				if (!player) {
					throw new Error(`The player [${newPosition.playerID}] does not exist`)
				}

				player.discardPile.push(cardID)
				card.position = newPosition
				break
			}
			case "deck": {
				const player = this.players[newPosition.playerID]
				if (!player) {
					throw new Error(`The player [${newPosition.playerID}] does not exist`)
				}

				player.deck.push(cardID)
				card.position = {
					...newPosition,
					index: player.deck.length - 1
				}
				break
			}
			case "board": {
				if (!card.isBaseCard()) {
					throw new Error("Trying to move a non-base card on the board")
				}
				this.in_play_bases.push(cardID)
				card.position = newPosition
				break
			}
			case "bases_deck": {
				if (!card.isBaseCard()) {
					throw new Error("Trying to move a non-base card in the bases deck")
				}
				this.bases_deck.push(cardID)
				card.position = newPosition
				break
			}
			case "bases_discard_pile": {
				if (!card.isBaseCard()) {
					throw new Error("Trying to move a non-base card in the bases deck")
				}
				this.bases_discard_pile.push(cardID)
				card.position = newPosition
				break
			}
		}
	}

	serialize(): string {
		return JSON.stringify({
			players: this.players.map(player => player.serialize()),
			phase: this.phase,
			currentAction: this.currentAction,
			activatedEffectQueue: this.activatedEffectQueue,
			bases: this.in_play_bases,
			bases_deck: this.bases_deck,
			cards: Object.fromEntries(Object.entries(this.cards).map(([cardId, card]) => {
				return [cardId, card.serialize()]
			})),
			turnPlayer: this.turnPlayerId
		})
	}

	deserialize(input: string) {
		const data = JSON.parse(input)
		data.players.forEach((player: any, index: number) => this.players[index].deserialize(player))
		this.phase = data.phase
		this.currentAction = data.currentAction
		this.activatedEffectQueue = data.activatedEffectQueue
		this.in_play_bases = data.bases
		this.bases_deck = data.bases_deck
		this.cards = Object.fromEntries(Object.entries(data.cards).map(([cardId, card]) => {
			return [cardId, gameCardDeserializer({
				gameState: this,
				input: card
			})]
		}))
		this.turnPlayerId = data.turnPlayer
	}
}