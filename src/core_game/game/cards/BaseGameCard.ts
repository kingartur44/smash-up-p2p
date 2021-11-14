import { BaseDatabaseCard } from "../../database/DatabaseCard";
import { Cards } from "../../database/core_set/core_set";
import { action, computed, makeObservable, observable } from "mobx";
import { GameState, PlayerID } from "../GameState";
import { GameCard } from "./GameCard";
import { GamePlayer } from "../GamePlayer";
import { CardType } from "../../data/CardType";


export class BaseGameCard extends GameCard {

	type: CardType.Base;

	database_card_id: string;
	attached_cards: number[];

	constructor(gameState: GameState) {
		super(gameState)

		this.type = CardType.Base;

		this.database_card_id = "";
		this.attached_cards = [];

		makeObservable(this, {
			id: observable,
			type: observable,
			position: observable,
			owner_id: observable,
			controller_id: observable,
			effects: observable,

			power: computed,
			databaseCard: computed,
			targets: computed,
			isPlayable: computed,
			owner: computed,
			controller: computed,

			returnToOwnerHand: action,
			initializeEffects: action,
			registerEffect: action,

			// Custom
			breakpoint: computed,
			totalPowerOnBase: computed,
			playerBasedPowerOnBase: computed,
			sortedPlayersPower: computed,
			database_card_id: observable,
			attached_cards: observable
		});
	}

	get databaseCard(): BaseDatabaseCard {
		return Cards[this.database_card_id] as BaseDatabaseCard;
	}



	get power(): number {
		return 0;
	}


	get targets(): number[] {
		return [];
	}


	get isPlayable(): boolean {
		return false;
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
			const cardController = card?.controller_id
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


	static fromDatabaseCard(gameState: GameState, databaseCard: BaseDatabaseCard): BaseGameCard {
		const card = new BaseGameCard(gameState);
		card.database_card_id = databaseCard.id;
		card.initializeEffects()
		return card;
	}

	serialize(): any {
		return {
			id: this.id,
			effects: this.effects,
			owner_id: this.owner_id,
			controller_id: this.controller_id,
			type: this.type,
			position: this.position,
			database_card_id: this.database_card_id,
			attached_cards: this.attached_cards
		};
	}

	deserialize(input: any) {
		this.id = input.id;
		this.effects = input.effects;
		this.owner_id = input.owner_id;
		this.controller_id = input.controller_id;
		this.type = input.type;
		this.position = input.position;
		this.database_card_id = input.database_card_id;
		this.attached_cards = input.attached_cards;
	}
}
