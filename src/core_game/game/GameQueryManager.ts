import { CardType } from "../data/CardType";
import { GameCardId, GameState } from "./GameState";
import { BasePosition, DeckPosition, Position } from "./utils/Position";

export interface GameQuery {
	cardType?: CardType[]

	filters?: {
		name?: {
			operator: "=" | "!="
			value: string
		}
		position?: (Position | "on-the-board")[]
	}

	minionFilter?: {
		power: {
			operator: "<" | "<=" | "=" | ">" | ">=",
			value: number
		}
	}
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
							return ["board", "base"].includes(card.position.position)
						}
						if (card.position.position !== position.position) {
							return false
						}
						switch (position.position) {
							case "board":
							case "no-position":
								return true
							case "base":
								return position.base_id === (card.position as BasePosition).base_id
							case "deck":
							case "hand":
								return position.playerID === (card.position as DeckPosition).playerID
						}
						throw new Error("Attenzione, posizione sconosciuta")
					})
					if (!positionQueryResult) {
						return false
					}
				}
				
				return true
			})
			.map(card => card.id)
	}
}