import { BaseDatabaseCard } from "../../database/DatabaseCard";
import { Cards } from "../../database/core_set/core_set";
import { makeAutoObservable } from "mobx";
import { Position } from "../utils/Position";
import { GameState, PlayerID } from "../GameState";
import { GameCard } from "./GameCard";
import { MinionGameCard } from "./MinionGameCard";
import { ActionGameCard } from "./ActionGameCard";
import { GamePlayer } from "../GamePlayer";


export class BaseGameCard implements GameCard {
	gameState: GameState;

	id: number;
	position: Position;
	type: "base";
	owner: PlayerID | null;
	controller: PlayerID | null;
	database_card_id: string;
	attached_cards: number[];

	constructor(gameState: GameState) {
		this.gameState = gameState;

		this.id = -1;
		this.position = {
			position: "no-position"
		};
		this.type = "base";
		this.owner = null;
		this.controller = null;
		this.database_card_id = "";
		this.attached_cards = [];

		makeAutoObservable(this);
	}

	get databaseCard(): BaseDatabaseCard {
		return Cards[this.database_card_id] as BaseDatabaseCard;
	}

	static fromDatabaseCard(gameState: GameState, databaseCard: BaseDatabaseCard): BaseGameCard {
		const card = new BaseGameCard(gameState);
		card.database_card_id = databaseCard.id;
		return card;
	}

	get power(): number {
		return 0;
	}

	get breakpoint(): number {
		return this.databaseCard.breakpoint;
	}

	get totalPowerOnBase(): number {
		let power = 0;
		for (const playerPower of Object.values(this.playerBasedPowerOnBase)) {
			power += playerPower
		}
		return power;
	}

	get playerBasedPowerOnBase(): Record<PlayerID, number> {
		const powerMap: Record<PlayerID, number> = {}

		for (const card_id of this.attached_cards) {
			const card = this.gameState.getCard(card_id);
			const cardController = card?.controller
			if (cardController === undefined || cardController === null) {
				continue
			}
			powerMap[cardController] = (powerMap[cardController] ?? 0) + (card?.power ?? 0)
		}

		return powerMap
	}

	get sortedPlayersPower(): {player: GamePlayer, power: number}[] {
		const sortedPlayersPower: {player: GamePlayer, power: number}[] = []
		for (const [playerID, power] of Object.entries(this.playerBasedPowerOnBase)) {
			if (playerID === null || power <= 0) {
				continue
			}
			sortedPlayersPower.push({
				player: this.gameState.players[playerID as unknown as PlayerID],
				power: power
			})
		}
		
		return sortedPlayersPower
	}

	get targets(): number[] {
		return [];
	}

	get isPlayable(): boolean {
		return false;
	}

	isMinionCard(): this is MinionGameCard {
		return false;
	}

	isActionCard(): this is ActionGameCard {
		return false;
	}

	isBaseCard(): this is BaseGameCard {
		return true;
	}

	serialize(): any {
		return {
			id: this.id,
			owner: this.owner,
			controller: this.controller,
			type: this.type,
			position: this.position,
			database_card_id: this.database_card_id,
			attached_cards: this.attached_cards
		};
	}

	deserialize(input: any) {
		this.id = input.id;
		this.owner = input.owner;
		this.controller = input.controller;
		this.type = input.type;
		this.position = input.position;
		this.database_card_id = input.database_card_id;
		this.attached_cards = input.attached_cards;
	}
}
