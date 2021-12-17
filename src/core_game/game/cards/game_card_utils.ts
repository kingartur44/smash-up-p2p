import { ActionDatabaseCard, BaseDatabaseCard, DatabaseCard, MinionDatabaseCard } from "../../database/DatabaseCard";
import { GameState } from "../GameState";
import { BaseGameCard } from "./BaseGameCard";
import { ActionGameCard } from "./ActionGameCard";
import { MinionGameCard } from "./MinionGameCard";
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