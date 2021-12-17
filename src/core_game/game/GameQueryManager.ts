import { CardType } from "../data/CardType";
import { GameCardId, GameState, PlayerID } from "./GameState";
import { BasePosition, FIELD_POSITIONS, HandPosition, Position, PositionType } from "./position/Position";

export interface GameQuery {
	cardType?: CardType[]

	filters?: {
		name?: {
			operator: "=" | "!="
			value: string
		}
		controller_id?: (PlayerID | null)[]
		position?: (Position | "on-the-board")[]
	}

	minionFilter?: {
		power: {
			operator: "<" | "<=" | "=" | ">" | ">=",
			value: number
		}
	}

	excludedCards?: GameCardId[]
	includedCards?: GameCardId[]
}

export class GameQueryManager {
	gameState: GameState
	
	constructor(gameState: GameState) {
		this.gameState = gameState
	}

	executeQuery(query: GameQuery): GameCardId[] {
		return Object.values(this.gameState.cards)
			.filter(card => {
				if (!query.cardType?.includes(card.type)) {
					return false
				}

				if (query.includedCards) {
					if (query.includedCards.includes(card.id)) {
						return true
					}
				}

				if (query.excludedCards) {
					if (query.excludedCards.includes(card.id)) {
						return false
					}
				}

				if (card.isMinionCard()) {
					if (query.minionFilter?.power) {
						const operator = query.minionFilter.power.operator
						const checkValue = query.minionFilter.power.value
						const checkResult = (() => {
							switch (operator) {
								case "<":
									return card.power < checkValue
								case "<=":
									return card.power <= checkValue
								case "=":
									return card.power === checkValue
								case ">":
									return card.power > checkValue
								case ">=":
									return card.power >= checkValue
							}
						})()
						if (!checkResult) {
							return false
						}
					}
					
				}

				if (query.filters?.name) {
					const checkValue = query.filters.name.value
					const operator = query.filters.name.operator
					const checkResult = (() => {
						switch (operator) {
							case "=":
								return card.databaseCard.name === checkValue
							case "!=":
								return card.databaseCard.name !== checkValue
						}
					})()
					if (!checkResult) {
						return false
					}
				}

				if (query.filters?.position) {
					const positionQueryResult = query.filters?.position.some(position => {
						if (position === "on-the-board") {
							return FIELD_POSITIONS.includes(card.position.positionType)
						}
						if (card.position.positionType !== position.positionType) {
							return false
						}
						switch (position.positionType) {
							case PositionType.Board:
							case PositionType.NoPosition:
								return true
							case PositionType.Base:
								return position.base_id === (card.position as BasePosition).base_id
							case PositionType.Deck:
							case PositionType.Hand:
								return position.playerID === (card.position as HandPosition).playerID
						}
						throw new Error("Attenzione, posizione sconosciuta")
					})
					if (!positionQueryResult) {
						return false
					}
				}

				if (query.filters?.controller_id) {
					if (!query.filters.controller_id.includes(card.controller_id!)) {
						return false
					}
				}
				
				return true
			})
			.map(card => card.id)
	}
}