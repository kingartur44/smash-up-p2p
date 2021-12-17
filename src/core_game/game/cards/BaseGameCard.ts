import { BaseDatabaseCard } from "../../database/DatabaseCard";
import { Cards } from "../../database/core_set/core_set";
import { action, computed, makeObservable, observable } from "mobx";
import { GameCardId, GameState, PlayerID } from "../GameState";
import { GameCard } from "./GameCard";
import { GamePlayer } from "../GamePlayer";
import { CardType } from "../../data/CardType";
import { GameCardStack } from "../GameCardStack";
import { ReduceBreakpoint } from "./GameCardState";


export class BaseGameCard extends GameCard {

	type: CardType.Base;

	
	attached_cards: GameCardStack;

	constructor(gameState: GameState) {
		super(gameState)

		this.type = CardType.Base;

		
		this.attached_cards = new GameCardStack(gameState);

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
		let cardBreakPoint = this.databaseCard.breakpoint;

		for (const state of this.queryStates<ReduceBreakpoint>("reduce-breakpoint")) {
			const value = typeof state.value === "number"
				? state.value
				: state.value(this, this.gameState)
			cardBreakPoint -= value
		}

		return cardBreakPoint;
	}

	get totalPowerOnBase(): number {
		let power = 0;
		for (const playerPower of Object.values(this.playerBasedPowerOnBase)) {
			power += playerPower
		}
		return power;
	}

	get playerCards(): Record<PlayerID, GameCardId[]> {
		const cards: Record<PlayerID, GameCardId[]> = {}

		for (const card of this.attached_cards.cards) {
			const cardController = card.controller_id
			if (cardController === null) {
				continue
			}
			
			if (cards[cardController] === undefined) {
				cards[cardController] = []
			}
			cards[cardController].push(card.id)
		}

		return cards
	}

	get playerBasedPowerOnBase(): Record<PlayerID, number> {
		const powerMap: Record<PlayerID, number> = {}

		for (const card of this.attached_cards.cards) {
			const cardController = card.controller_id
			if (cardController === null) {
				continue
			}
			powerMap[cardController] = (powerMap[cardController] ?? 0) + card.power
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
}
