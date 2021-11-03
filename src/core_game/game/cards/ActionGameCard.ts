import { ActionDatabaseCard } from "../../database/DatabaseCard";
import { Cards } from "../../database/core_set/core_set";
import { action, computed, makeObservable, observable } from "mobx";
import { GameCurrentActionType, GamePhase, GameState } from "../GameState";
import { GameCard } from "./GameCard";
import { CardType } from "../../data/CardType";


export class ActionGameCard extends GameCard {

	type: CardType.Action;

	database_card_id: string;

	constructor(gameState: GameState) {
		super(gameState)


		this.type = CardType.Action;

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
			registerEffect: action
		});
	}

	override get databaseCard(): ActionDatabaseCard {
		return Cards[this.database_card_id] as ActionDatabaseCard;
	}

	override get power() {
		return 0;
	}

	

	override get targets(): number[] {
		let targets = [];
		for (const card of Object.values(this.gameState.cards)) {
			if (card.isBaseCard() || card.isMinionCard()) {
				targets.push(card.id);
			}
		}
		return targets;
	}


	override get isPlayable(): boolean {
		if (this.position.position === "hand") {
			if (this.targets.length > 0) {
				if (this.position.playerID === this.gameState.turnPlayerId) {
					if (this.gameState.turnPlayer.actionPlays > 0) {
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


	static fromDatabaseCard(gameState: GameState, databaseCard: ActionDatabaseCard): ActionGameCard {
		const card = new ActionGameCard(gameState);
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
