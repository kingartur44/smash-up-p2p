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
import { transpile } from "typescript"

export type PlayerID = number
export type GameCardId = number

export enum GamePhase {
	FactionSelect,
	InitialDraw,

	GameTurn_Play,
	GameTurn_ScoreBase,
	GameTurn_Draw,

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
	sendTargetCallback: (card_id: GameCardId) => void
}



export class GameState {
	server: GameServer
	queryManager: GameQueryManager

	haveToInitPhase: boolean
	phase: GamePhase

	currentAction: GameAction
	
	activatedEffectQueue: string[]

	cardNextId: GameCardId
	cards: Record<GameCardId, GameCard>

	players: GamePlayer[]
	turnPlayerId: PlayerID
	bases: GameCardId[]

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
		this.bases = [
			this.generateCard(Bases[0]).id,
			this.generateCard(Bases[1]).id,
		]
		for (const cardID of this.bases) {
			this.cards[cardID].position = {
				position: "board"
			}
		}

		this.haveToInitPhase = true
		this.phase = GamePhase.FactionSelect

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
			let nextEffect = this.activatedEffectQueue.pop()
			if (nextEffect) {
				const callback = eval(transpile(nextEffect))
				callback(this)
			}
		}

		switch (this.phase) {
			case GamePhase.FactionSelect: {
				this.players[0].setFactions([Faction.Aliens])
				this.players[0].name = "Giocatore 1"
				this.players[0].color = "aqua"

				this.players[1].setFactions([Faction.Dinosaurs])
				this.players[1].name = "Giocatore 2"
				this.players[1].color = "orange"


				this.setPhase(GamePhase.InitialDraw)
				break
			}
			case GamePhase.InitialDraw: {
				for (const player of this.players) {
					player.draw(5)
				}

				this.setPhase(GamePhase.GameTurn_Play)
				break
			}
			case GamePhase.GameTurn_Play: {
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
				for (const baseID of this.bases) {
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
						this.bases = this.bases.filter(item => item !== baseID)
					}
				}

				this.setPhase(GamePhase.GameTurn_Draw)
				break
			}
			case GamePhase.GameTurn_Draw: {
				this.turnPlayer.draw(2)
					
				this.turnPlayerId++
				if (this.turnPlayerId === 2) {
					this.turnPlayerId = 0
				}
				this.setPhase(GamePhase.GameTurn_Play)
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
		if (this.phase === GamePhase.GameTurn_Play) {
			this.setPhase(GamePhase.GameTurn_ScoreBase)
		}
	}

	getCard(card_id: number): GameCard | null {
		return this.cards[card_id]
	}

	async pickTarget(query: GameQuery, prompt: string): Promise<GameCard | undefined> {
		const possibleTargets = this.queryManager.executeQuery(query)
		if (possibleTargets.length === 0) {
			return undefined
		}

		return new Promise(resolve => {
			this.currentAction = {
				type: GameCurrentActionType.ChooseTarget,
				prompt: prompt,
				sendTargetCallback: (card_id) => {
					if (possibleTargets.includes(card_id)) {
						resolve(this.cards[card_id])
					}	
				},
				possibleTargets: possibleTargets
			}
		})
	}

	addEffectToQueue(effect: string) {
		this.activatedEffectQueue.push(effect)
	}

	playCard(card_id: number, playerID: PlayerID, newPosition: Position) {
		const card = this.cards[card_id]
		if (!card) {
			return
		}

		if (card.position.position === "hand") {
			if (newPosition.position === "base") {
				if (card.isMinionCard()) {
					if (this.players[playerID].minionPlays > 0) {
						this.players[playerID].minionPlays--
					} else {
						return
					}
				}
				if (card.isActionCard()) {
					if (this.players[playerID].actionPlays > 0) {
						this.players[playerID].actionPlays--
					} else {
						return
					}
				}

				this.moveCard(card_id, newPosition)
				if (card.databaseCard.initializeEffects) {
					card.databaseCard.initializeEffects(card, this)
				}
				
			}
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
			case "base": {
				const base = this.getCard(position.base_id) as BaseGameCard
				if (!base) {
					throw new Error(`The card [${position.base_id}] does not exist`)
				}

				base.attached_cards = base.attached_cards.filter(cardID => cardID !== gameCard.id)
				break
			}
			default: {
				throw new Error("Non Implementato")
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
				card.position = newPosition
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
		}
	}

	serialize(): string {
		return JSON.stringify({
			players: this.players.map(player => player.serialize()),
			phase: this.phase,
			currentAction: this.currentAction,
			activatedEffectQueue: this.activatedEffectQueue,
			bases: this.bases,
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
		this.bases = data.bases
		this.cards = Object.fromEntries(Object.entries(data.cards).map(([cardId, card]) => {
			return [cardId, gameCardDeserializer({
				gameState: this,
				input: card
			})]
		}))
		this.turnPlayerId = data.turnPlayer
	}
}