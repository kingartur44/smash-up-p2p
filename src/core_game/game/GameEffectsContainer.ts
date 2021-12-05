import { makeAutoObservable } from "mobx";
import { GameStateCardEffects } from "./cards/GameStateCardEffects";
import { GameState } from "./GameState";

export class GameEffectsContainer {
	gameState: GameState;
	effects: GameStateCardEffects[]
	

	constructor(gameState: GameState) {
		this.gameState = gameState
		this.effects = []
		
		
		makeAutoObservable(this, {
			gameState: false
		})
	}
}