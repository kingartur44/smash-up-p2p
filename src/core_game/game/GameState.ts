import { makeAutoObservable, observable } from "mobx"
import { DatabaseCard } from "../database/DatabaseCard"
import { Bases } from "../database/core_set/core_set"
import { Faction } from "../database/core_set/Factions"
import { GameServer } from "../GameServer"
import { GameCard } from "./cards/GameCard"
import { fromDatabaseCard } from "./cards/game_card_utils"
import { GamePlayer } from "./GamePlayer"
import { Position } from "./position/Position"
import { GameQuery, GameQueryManager } from "./GameQueryManager"
import { ScriptTarget, transpile } from "typescript"
import { ActionGameCard } from "./cards/ActionGameCard"
import { MinionGameCard } from "./cards/MinionGameCard"
import { convertNumberToNumeral } from "./utils/convertNumberToNumeral"
import { ClientGameAction, ClientGameState } from "../client_game/ClientGameState"
import { GameCardStack } from "./GameCardStack"
import { GameEffectsContainer } from "./GameEffectsContainer"

export type PlayerID = number
export type GameCardId = number

export enum GamePhase {
	Setup_FactionSelect = "Setup_FactionSelect",
	Setup_BuildBaseDeck = "Setup_BuildBaseDeck",
	Setup_PrepareTheMonsterandTreasureDecks = "Setup_PrepareTheMonsterandTreasureDecks",
	Setup_PreparetheMadnessDeck = "Setup_PreparetheMadnessDeck",
	Setup_DrawBases = "Setup_DrawBases",
	Setup_DrawHands = "Setup_DrawHands",


	GameTurn_Start = "GameTurn_Start",
	GameTurn_PlayCards = "GameTurn_PlayCards",
	GameTurn_ScoreBase = "GameTurn_ScoreBase",
	GameTurn_Draw = "GameTurn_Draw",
	GameTurn_EndTurn = "GameTurn_EndTurn",

	ToDo = "ToDo"
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
	cardEffects: GameEffectsContainer

	cardNextId: GameCardId
	cards: Record<GameCardId, GameCard>

	players: GamePlayer[]
	turnPlayerId: PlayerID

	bases_deck: GameCardStack
	in_play_bases: GameCardStack
	bases_discard_pile: GameCardStack

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

		this.bases_deck = new GameCardStack(this)
		this.in_play_bases = new GameCardStack(this)
		this.bases_discard_pile = new GameCardStack(this)

		this.haveToInitPhase = true
		this.phase = GamePhase.Setup_FactionSelect

		this.activatedEffectQueue = []
		this.cardEffects = new GameEffectsContainer(this)

		this.currentAction = observable.object({
			type: GameCurrentActionType.None
		})

		makeAutoObservable(this, {
			server: false
		})
	}

	nextStep() {
		if (this.activatedEffectQueue.length > 0) {
			const nextEffect = this.activatedEffectQueue.pop()
			if (nextEffect) {
				const card = this.getCard(nextEffect.card_id)
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
				const base_0 = this.generateCard(Bases[0])
				const base_1 = this.generateCard(Bases[1])
				const base_2 = this.generateCard(Bases[2])
				const base_3 = this.generateCard(Bases[3])

				base_0.moveCard({
					position: "bases_deck"
				})
				base_1.moveCard({
					position: "bases_deck"
				})
				base_2.moveCard({
					position: "bases_deck"
				})
				base_3.moveCard({
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
				this.bases_deck.getTopCard().moveCard({
					position: "board"
				})
				this.bases_deck.getTopCard().moveCard({
					position: "board"
				})
				this.bases_deck.getTopCard().moveCard({
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
				for (const base of this.in_play_bases.cards) {
					if (!base.isBaseCard()) {
						throw new Error("The base card isn't a base...")
					}
					if (base.totalPowerOnBase >= base.breakpoint) {
						const runners = base.sortedPlayersPower
						for (let i = 0; i < base.databaseCard.points.length; i++) {
							const runner = runners[i]
							if (runner !== undefined) {
								runner.player.increseVictoryPoints({
									amount: base.databaseCard.points[i],
									detail: `You made the ${convertNumberToNumeral(i + 1)} place at the base ${base.databaseCard.name}`
								})
							}
						}

						for (const card of base.attached_cards.cards) {
							card.discardCardAfterBaseScore()
						}
						
						base.moveCard({
							position: "bases_discard_pile"
						})

						const newBase = this.bases_deck.getTopCard()
						newBase.moveCard({
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

	getCard(card_id: GameCardId): GameCard {
		const card = this.cards[card_id]
		if (card === undefined) {
			throw new Error("Logic Error: the card does not exist")
		}
		return card
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
				card.moveCard(newPosition)
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

			card.moveCard({
				position: "is-about-to-be-played",
				playerID: card.owner_id
			})

			await card.onPlay()

			card.moveCard({
				position: "discard-pile",
				playerID: card.owner_id
			})
		}
	}

	playCard(card_id: number, playerID: PlayerID, newPosition?: Position) {
		const card = this.getCard(card_id)
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

	

	// serialize(): string {
	// 	return JSON.stringify({
	// 		players: this.players.map(player => player.serialize()),
	// 		phase: this.phase,
	// 		currentAction: this.currentAction,
	// 		activatedEffectQueue: this.activatedEffectQueue,
	// 		bases: this.in_play_bases,
	// 		bases_deck: this.bases_deck,
	// 		cards: Object.fromEntries(Object.entries(this.cards).map(([cardId, card]) => {
	// 			return [cardId, card.serialize()]
	// 		})),
	// 		turnPlayer: this.turnPlayerId
	// 	})
	// }

	// deserialize(input: string) {
	// 	const data = JSON.parse(input)
	// 	data.players.forEach((player: any, index: number) => this.players[index].deserialize(player))
	// 	this.phase = data.phase
	// 	this.currentAction = data.currentAction
	// 	this.activatedEffectQueue = data.activatedEffectQueue
	// 	this.in_play_bases = data.bases
	// 	this.bases_deck = data.bases_deck
	// 	this.cards = Object.fromEntries(Object.entries(data.cards).map(([cardId, card]) => {
	// 		return [cardId, gameCardDeserializer({
	// 			gameState: this,
	// 			input: card
	// 		})]
	// 	}))
	// 	this.turnPlayerId = data.turnPlayer
	// }

	toClientGameState(): ClientGameState {
		return {
			players: this.players.map(player => player.toClientGamePlayer()),
			turnPlayerId: this.turnPlayerId,
			phase: this.phase,

			currentAction: (() => {
				let clientCurrentAction: ClientGameAction
				switch (this.currentAction.type) {
					case GameCurrentActionType.None: {
						clientCurrentAction = {
							type: "None"
						}
						break
					}
					case GameCurrentActionType.ChooseTarget: {
						clientCurrentAction = {
							type: "ChooseTarget",
							possibleTargets: this.currentAction.possibleTargets,
							prompt: this.currentAction.prompt,
							canSelectNull: this.currentAction.canSelectNull
						}
						break
					}
					default:
						throw new Error("CurrentAction non supportata")
				}
				return clientCurrentAction
			})(),

			cards: Object.fromEntries(
				Object.entries(this.cards)
					.map(([key, value]) => [key, value.toClientGameCardArray()])
			),

			bases_deck: this.bases_deck.toClientGameCardArray(),
			bases_discard_pile: this.bases_discard_pile.toClientGameCardArray(),
			in_play_bases: this.in_play_bases.toClientGameCardArray()
		}
	}
}