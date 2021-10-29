import { MinionDatabaseCard } from "../../database/DatabaseCard";
import { Cards } from "../../database/core_set/core_set";
import { makeAutoObservable } from "mobx";
import { Position } from "../utils/Position";
import { GamePhase, GameState, PlayerID } from "../GameState";
import { BaseGameCard } from "./BaseGameCard";
import { ActionGameCard } from "./ActionGameCard";
import { GameCard } from "./GameCard";


export class MinionGameCard implements GameCard {
	gameState: GameState;

	id: number;
	position: Position;
	type: "minion";
	owner: PlayerID | null;
	controller: PlayerID | null;
	database_card_id: string;

	constructor(gameState: GameState) {
		this.gameState = gameState;

		this.id = -1;
		this.position = {
			position: "no-position"
		};
		this.type = "minion";
		this.owner = null;
		this.controller = null;

		this.database_card_id = "";
		makeAutoObservable(this);
	}

	get databaseCard(): MinionDatabaseCard {
		return Cards[this.database_card_id] as MinionDatabaseCard;
	}

	static fromDatabaseCard(gameState: GameState, databaseCard: MinionDatabaseCard): MinionGameCard {
		const card = new MinionGameCard(gameState);
		card.database_card_id = databaseCard.id;
		return card;
	}

	get power() {
		return this.databaseCard.power;
	}

	get targets(): number[] {
		let targets = [];
		for (const card of Object.values(this.gameState.cards)) {
			if (card.isBaseCard()) {
				targets.push(card.id);
			}
		}
		return targets;
	}

	get isPlayable(): boolean {
		if (this.position.position === "hand") {
			if (this.targets.length > 0) {
				if (this.position.playerID === this.gameState.turnPlayerId) {
					if (this.gameState.turnPlayer.minionPlays > 0) {
						if (this.gameState.phase === GamePhase.GameTurn_Play) {
							return true;
						}
					}
				}
			}
		}

		return false;
	}

	isMinionCard(): this is MinionGameCard {
		return true;
	}

	isActionCard(): this is ActionGameCard {
		return false;
	}

	isBaseCard(): this is BaseGameCard {
		return false;
	}

	serialize(): any {
		return {
			id: this.id,
			owner: this.owner,
			controller: this.controller,
			type: this.type,
			position: this.position,
			database_card_id: this.database_card_id
		};
	}

	deserialize(input: any) {
		this.id = input.id;
		this.owner = input.owner;
		this.controller = input.controller;
		this.type = input.type;
		this.position = input.position;
		this.database_card_id = input.database_card_id;
	}
}
