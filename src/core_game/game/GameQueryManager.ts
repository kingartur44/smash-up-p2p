import { CardType } from "../data/CardType";
import { GameCardId, GameState } from "./GameState";
import { BasePosition, DeckPosition, Position } from "./utils/Position";

export interface GameQuery {
	cardType?: CardType[]

	filters?: {
		name: string[]
	}

	minionFilter?: {
		position: Position[]		
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

				if (card.type === CardType.Minion) {
					if (query.minionFilter?.position) {
						const positionQueryResult = query.minionFilter?.position.some(position => {
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
				}

				if (query.filters?.name) {
					if (!query.filters?.name.includes(card.databaseCard.name)) {
						return false
					}
				}
				
				return true
			})
			.map(card => card.id)
	}
}