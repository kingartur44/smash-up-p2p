import { makeAutoObservable, observable } from "mobx"
import { DatabaseCard } from "../database/DatabaseCard"
import { Bases } from "../database/core_set/core_set"
import { Faction } from "../database/core_set/Factions"
import { GameServer } from "../GameServer"
import { GameCard } from "./cards/GameCard"
import { fromDatabaseCard } from "./cards/game_card_utils"
import { GamePlayer } from "./GamePlayer"
import { Position, PositionType } from "./position/Position"
import { GameQuery, GameQueryManager } from "./GameQueryManager"
import { ScriptTarget, transpile } from "typescript"
import { ActionGameCard } from "./cards/ActionGameCard"
import { MinionGameCard } from "./cards/MinionGameCard"
import { convertNumberToNumeral } from "./utils/convertNumberToNumeral"
import { ClientGameAction, ClientGameState } from "../client_game/ClientGameState"
import { GameCardStack } from "./GameCardStack"
import assert from "assert"

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
	playerID: PlayerID
	possibleTargets: GameCardId[]
	prompt: string
	canSelectNull: boolean
	sendTargetCallback: (card_id: GameCardId | null) => void
}


export class GameState {
	server: GameServer
	queryManager: GameQueryManager

	haveToInitPhaseStep: boolean
	phase: GamePhase
	phaseStep: "start" | "process" | "end"
	nextPhase: GamePhase | undefined

	currentAction: GameAction
	
	activatedEffectQueue: {card_id: GameCardId, effect: string}[]

	cardNextId: GameCardId
	cards: Record<GameCardId, GameCard>

	turnCounter: number
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

		this.turnCounter = 1
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

		this.haveToInitPhaseStep = true
		this.phase = GamePhase.Setup_FactionSelect
		this.phaseStep = "start"
		this.nextPhase = undefined

		this.activatedEffectQueue = []

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

			return
		}

		if (this.currentAction.type !== GameCurrentActionType.None) {
			return
		}

		if (this.phaseStep === "start" || this.phaseStep === "end") {
			if (this.haveToInitPhaseStep) {
				this.haveToInitPhaseStep = false
				for (const card of Object.values(this.cards)) {
					card.updateCardStates({
						timing: this.phaseStep,
						gamePhase: this.phase,
						turnPlayer: this.turnPlayerId
					})
				}
				// Velocizziamo il processo nel caso in cui nessun effetto è stato attivato
				if (this.activatedEffectQueue.length > 0) {
					return
				}
			}
			if (this.phaseStep === "start") {
				this.setPhaseStep("process")
				return
			}
			if (this.phaseStep === "end") {
				this.setPhaseStep("start")
				assert(this.nextPhase !== undefined, "Logic Error: Non c'è una prossima fase")

				this.phase = this.nextPhase
				this.nextPhase = undefined
				return
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
					positionType: PositionType.BasesDeck
				})
				base_1.moveCard({
					positionType: PositionType.BasesDeck
				})
				base_2.moveCard({
					positionType: PositionType.BasesDeck
				})
				base_3.moveCard({
					positionType: PositionType.BasesDeck
				})

				this.bases_deck.shuffle()

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
					positionType: PositionType.Board
				})
				this.bases_deck.getTopCard().moveCard({
					positionType: PositionType.Board
				})
				this.bases_deck.getTopCard().moveCard({
					positionType: PositionType.Board
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
				if (this.haveToInitPhaseStep) {
					for (const player of this.players) {
						if (player.id === this.turnPlayerId) {
							player.minionPlays = 1;
							player.actionPlays = 1;
						} else {
							player.minionPlays = 0;
							player.actionPlays = 0;
						}
					}
					
					this.haveToInitPhaseStep = false
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
							positionType: PositionType.basesDiscardPile
						})

						const newBase = this.bases_deck.getTopCard()
						newBase.moveCard({
							positionType: PositionType.Board
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
				this.turnCounter += 1

				// We calculate the next player turn
				this.turnPlayerId += 1
				if (this.turnPlayerId === this.players.length) {
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

	setPhase(newPhase: GamePhase) {
		if (newPhase === this.phase) {
			throw new Error("Logic Error: this phase is not different from the previous one")
		}
		this.setPhaseStep("end")
		this.nextPhase = newPhase
	}

	setPhaseStep(newPhaseStep: "start" | "process" | "end") {
		if (newPhaseStep === this.phaseStep) {
			throw new Error("Logic Error: this step is not different from the previous one")
		}
		this.haveToInitPhaseStep = true
		this.phaseStep = newPhaseStep
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

	async pickTarget<T extends GameCard>(playerID: PlayerID, query: GameQuery, prompt: string, canSelectNull: boolean): Promise<T | null> {
		const possibleTargets = this.queryManager.executeQuery(query)
		if (possibleTargets.length === 0) {
			return null
		}

		return new Promise(resolve => {
			this.currentAction = {
				type: GameCurrentActionType.ChooseTarget,
				playerID: playerID,
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
						resolve(this.getCard(card_id) as T)
						this.currentAction = {
							type: GameCurrentActionType.None
						}
					}
				},
				possibleTargets: possibleTargets
			}
		})
	}

	sendTargetCallback(playerID: number, cardId: number | null) {
		if (this.currentAction.type !== GameCurrentActionType.ChooseTarget) {
			throw new Error("Wrong timing for the message")
		}
		if (this.currentAction.playerID !== playerID) {
			throw new Error("This player is not the one who have to perform this action")
		}

		this.currentAction.sendTargetCallback(cardId)
	}

	addEffectToQueue(card_id: number, effect: string) {
		this.activatedEffectQueue.push({ card_id, effect })
	}

	async playMinionCard(card: MinionGameCard, playerID: PlayerID, newPosition: Position) {
		if (this.players[playerID].minionPlays <= 0) {
			throw new Error("You don't have enought minion plays")
		}
	
		
		if (card.position.positionType === PositionType.Hand) {
			if (newPosition.positionType === PositionType.Base) {
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

		if (card.position.positionType === PositionType.Hand) {
			this.players[playerID].actionPlays--

			card.moveCard({
				positionType: PositionType.isAboutToBePlayed,
				playerID: card.owner_id
			})

			await card.onPlay()

			card.moveCard({
				positionType: PositionType.DiscardPile,
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


	toClientGameState(): ClientGameState {
		return {
			players: this.players.map(player => player.toClientGamePlayer()),
			turnPlayerId: this.turnPlayerId,
			phase: this.phase,
			phaseStep: this.phaseStep,

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
							playerID: this.currentAction.playerID,
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