import { ActionDatabaseCard } from "../../database/DatabaseCard";
import { Cards } from "../../database/core_set/core_set";
import { action, computed, makeObservable, observable } from "mobx";
import { GameCurrentActionType, GamePhase, GameState } from "../GameState";
import { GameCard } from "./GameCard";
import { CardType } from "../../data/CardType";
import { GameQuery } from "../GameQueryManager";
import { PositionType } from "../position/Position";


export class ActionGameCard extends GameCard {

	type: CardType.Action
	
	playTargetQuery?: GameQuery


	constructor(gameState: GameState) {
		super(gameState)


		this.type = CardType.Action;
		this.playTargetQuery = undefined

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
			playTargetQuery: observable
		});
	}

	get databaseCard(): ActionDatabaseCard {
		return Cards[this.database_card_id] as ActionDatabaseCard;
	}

	get power() {
		return 0;
	}

	

	get targets(): number[] {
		if (!this.playTargetQuery) {
			return []
		}
		return this.gameState.queryManager.executeQuery(this.playTargetQuery)
	}


	get isPlayable(): boolean {
		// Standard Action Play
		if (this.position.positionType === PositionType.Hand) {
			if (this.position.playerID === this.gameState.turnPlayerId) {
				if (this.gameState.turnPlayer.actionPlays > 0) {
					if (this.gameState.phase === GamePhase.GameTurn_PlayCards) {
						if (this.gameState.currentAction.type === GameCurrentActionType.None) {
							return true;
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

}
