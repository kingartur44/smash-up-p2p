import { makeAutoObservable } from "mobx";
import { ClientGameCard } from "../client_game/ClientGameState";
import { GameCard } from "./cards/GameCard";
import { GameCardId, GameState } from "./GameState";
import { PositionType } from "./position/Position";
import { shuffleArray } from "./utils/shuffleArray";

export class GameCardStack {
	gameState: GameState
	content: GameCardId[]

	constructor(gameState: GameState) {
		this.gameState = gameState
		this.content = []

		makeAutoObservable(this, {
			gameState: false
		})
	}

	get cards(): GameCard[] {
		return this.content.map(cardId => this.gameState.getCard(cardId))
	}

	getTopCard(): GameCard {
		if (this.content.length <= 0) {
			throw new Error("The deck is empty")
		}
		return this.gameState.getCard(this.content[0])
	}

	empty() {
		for (const card of this.cards) {
			card.moveCard({
				positionType: PositionType.NoPosition
			})
		}
	}

	addToTop(card: GameCard) {
		this.content.unshift(card.id)
	}

	addToBottom(card: GameCard) {
		this.content.push(card.id)
	}

	removeCard(card: GameCard) {
		this.content = this.content.filter(cardId => cardId !== card.id)
	}

	shuffle() {
		// TODO: Le posizioni
		shuffleArray(this.content)
	}

	toClientGameCardArray(): ClientGameCard[] {
		return this.cards.map(card => card.toClientGameCardArray())
	}
}