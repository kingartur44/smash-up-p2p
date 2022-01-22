import { MinionDatabaseCard } from "../../database/DatabaseCard";
import { Cards } from "../../database/core_set/core_set";
import { action, computed, makeObservable, observable } from "mobx";
import { GameCurrentActionType, GamePhase, GameState } from "../GameState";
import { CardType } from "../../data/CardType";
import { GameCard } from "./GameCard";
import { PositionType } from "../position/Position";
import { PowerBoost } from "./GameCardState";


export class MinionGameCard extends GameCard {
	
	type: CardType.Minion;


	constructor(gameState: GameState) {
		super(gameState) 

		this.gameState = gameState;
		this.type = CardType.Minion;

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
			parent_card: observable,

			initializeEffects: action,
			registerEffect: action
		});
	}

	get databaseCard(): MinionDatabaseCard {
		return Cards[this.database_card_id] as MinionDatabaseCard;
	}

	
	get power() {
		let cardPower = this.databaseCard.power;

		for (const state of this.queryStates<PowerBoost>("power-boost")) {
			const value = typeof state.value === "number"
				? state.value
				: state.value(this, this.gameState)
			if (typeof value === "number") {
				cardPower += value
			}
		}

		return cardPower
	}

	get targets(): number[] {
		const targets = [];
		for (const card of Object.values(this.gameState.cards)) {
			if (card.isBaseCard()) {
				targets.push(card.id);
			}
		}
		return targets;
	}


	get isPlayable(): boolean {
		if (this.position.positionType === PositionType.Hand) {
			if (this.targets.length > 0) {
				if (this.position.playerID === this.gameState.turnPlayerId) {
					if (this.gameState.turnPlayer.minionPlays > 0) {
						if (this.gameState.phase === GamePhase.GameTurn_PlayCards) {
							if (this.gameState.currentAction.type === GameCurrentActionType.None) {
								return true;
							}
						}
					}
				}
			}
		}

		return false;
	}


	static fromDatabaseCard(gameState: GameState, databaseCard: MinionDatabaseCard): MinionGameCard {
		const card = new MinionGameCard(gameState);
		card.database_card_id = databaseCard.id;
		card.initializeEffects()
		return card;
	}
}
