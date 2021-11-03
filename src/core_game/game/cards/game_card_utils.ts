import { ActionDatabaseCard, BaseDatabaseCard, DatabaseCard, MinionDatabaseCard } from "../../database/DatabaseCard";
import { GameState } from "../GameState";
import { BaseGameCard } from "./BaseGameCard";
import { ActionGameCard } from "./ActionGameCard";
import { MinionGameCard } from "./MinionGameCard";
import { CardType } from "../../data/CardType";
import { GameCard } from "./GameCard";


export function fromDatabaseCard({ gameState, input }: { gameState: GameState; input: DatabaseCard; }): GameCard {
	if (input instanceof MinionDatabaseCard) {
		return MinionGameCard.fromDatabaseCard(gameState, input);
	}
	if (input instanceof ActionDatabaseCard) {
		return ActionGameCard.fromDatabaseCard(gameState, input);
	}
	if (input instanceof BaseDatabaseCard) {
		return BaseGameCard.fromDatabaseCard(gameState, input);
	}

	throw new Error("Card not supported");
}

export function gameCardDeserializer({ gameState, input }: { gameState: GameState; input: any; }) {
	switch (input.type as CardType) {
		case CardType.Minion: {
			const card = new MinionGameCard(gameState);
			card.deserialize(input);
			return card;
		}
		case CardType.Action: {
			const card = new ActionGameCard(gameState);
			card.deserialize(input);
			return card;
		}
		case CardType.Base: {
			const card = new BaseGameCard(gameState);
			card.deserialize(input);
			return card;
		}
		default: {
			throw new Error("Card not supported");
		}
	}
}
