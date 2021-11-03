import { MinionDatabaseCard } from "../../database/DatabaseCard";
import { Cards } from "../../database/core_set/core_set";
import { action, computed, makeObservable, observable } from "mobx";
import { GameCurrentActionType, GamePhase, GameState } from "../GameState";
import { CardType } from "../../data/CardType";
import { GameCard } from "./GameCard";
import { transpile } from "typescript";
import { BaseGameCard } from "./BaseGameCard";


export class MinionGameCard extends GameCard {
	
	type: CardType.Minion;
	database_card_id: string;

	constructor(gameState: GameState) {
		super(gameState) 

		this.gameState = gameState;
		this.type = CardType.Minion;
		this.database_card_id = "";

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

			// Specifici di minion
			card_current_base: computed
		});
	}

	override get databaseCard(): MinionDatabaseCard {
		return Cards[this.database_card_id] as MinionDatabaseCard;
	}

	
	override get power() {
		let cardPower = this.databaseCard.power
		this.effects
			.filter(effect => effect.type === "power-boost")
			.forEach(effect => {
				const callback = eval(transpile(effect.callback))
				cardPower += callback(this, this.gameState)
			})
		return cardPower
	}

	override get targets(): number[] {
		let targets = [];
		for (const card of Object.values(this.gameState.cards)) {
			if (card.isBaseCard()) {
				targets.push(card.id);
			}
		}
		return targets;
	}


	override get isPlayable(): boolean {
		if (this.position.position === "hand") {
			if (this.targets.length > 0) {
				if (this.position.playerID === this.gameState.turnPlayerId) {
					if (this.gameState.turnPlayer.minionPlays > 0) {
						if (this.gameState.phase === GamePhase.GameTurn_Play) {
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
	
	get card_current_base(): BaseGameCard | undefined {
		if (this.position.position !== "base") {
			return undefined
		}
		return this.gameState.getCard(this.position.base_id) as BaseGameCard 
	}


	static fromDatabaseCard(gameState: GameState, databaseCard: MinionDatabaseCard): MinionGameCard {
		const card = new MinionGameCard(gameState);
		card.database_card_id = databaseCard.id;
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
			database_card_id: this.database_card_id
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
	}
}
