import { ActionDatabaseCard, BaseDatabaseCard, DatabaseCard, MinionDatabaseCard } from "../../database/DatabaseCard"
import { Position } from "../utils/Position"
import { GameState, PlayerID } from "../GameState"
import { BaseGameCard } from "./BaseGameCard"
import { ActionGameCard } from "./ActionGameCard"
import { MinionGameCard } from "./MinionGameCard"

type CardId = number

export interface GameCard {
	id: CardId
	position: Position

	type: "minion" | "base" | "action" | "titan"
	owner: PlayerID | null
	controller: PlayerID | null

	serialize: () => any
	deserialize: (input: any) => void
	databaseCard: DatabaseCard

	power: number

	targets: CardId[]
	isPlayable: boolean

	isMinionCard: () => this is MinionGameCard
	isActionCard: () => this is ActionGameCard
	isBaseCard: () => this is BaseGameCard
}

export function fromDatabaseCard({gameState, input}: {gameState: GameState, input: DatabaseCard}): GameCard {
	if (input instanceof MinionDatabaseCard) {
		return MinionGameCard.fromDatabaseCard(gameState, input)
	}
	if (input instanceof ActionDatabaseCard) {
		return ActionGameCard.fromDatabaseCard(gameState, input)
	}
	if (input instanceof BaseDatabaseCard) {
		return BaseGameCard.fromDatabaseCard(gameState, input)
	}
	
	throw new Error("Card not supported")
}

export function gameCardDeserializer({gameState, input}: {gameState: GameState, input: any}) {
	switch (input.type) {
		case "minion": {
			const card = new MinionGameCard(gameState)
			card.deserialize(input)
			return card
		}
		case "action": {
			const card = new ActionGameCard(gameState)
			card.deserialize(input)
			return card
		}
		case "base": {
			const card = new BaseGameCard(gameState)
			card.deserialize(input)
			return card
		}
		default: {
			throw new Error("Card not supported")
		}
	}
}


