import { makeAutoObservable } from "mobx";
import { Aliens, Dinosaurs } from "../database/core_set/core_set";
import { Faction } from "../database/core_set/Factions";
import { GameState } from "./GameState";
import { ClientGamePlayer } from "../client_game/ClientGameState";
import { GameCardStack } from "./GameCardStack";
import { DatabaseCard } from "../database/DatabaseCard";
import { PositionType } from "./position/Position";


export class GamePlayer {
	gameState: GameState
	
	id: number;
	name: string;
	color: string;

	victoryPointsDetailed: {amount: number, detail: string}[]

	minionPlays: number;
	actionPlays: number;

	deck: GameCardStack;
	hand: GameCardStack;
	discardPile: GameCardStack;
	aboutToBePlayedCards: GameCardStack;

	factions: string[];

	constructor({gameState, id}: {gameState: GameState, id: number}) {
		this.gameState = gameState

		this.id = id
		this.name = "";
		this.color = "";

		this.victoryPointsDetailed = [];

		this.minionPlays = 0;
		this.actionPlays = 0;

		this.deck = new GameCardStack(gameState)
		this.hand = new GameCardStack(gameState)
		this.discardPile = new GameCardStack(gameState)
		this.aboutToBePlayedCards = new GameCardStack(gameState)

		this.factions = [];

		makeAutoObservable(this, {
			gameState: false
		});
	}

	get victoryPoints(): number {
		return this.victoryPointsDetailed.reduce((acc, item) => {
			return acc + item.amount
		}, 0)
	}

	increseVictoryPoints(item: {amount: number, detail: string}) {
		this.victoryPointsDetailed.push(item)
	}

	setFactions(factions: string[]) {
		this.factions = factions;
		this.deck.empty()

		for (const faction of factions) {
			let selectedArray: DatabaseCard[]
			if (faction === Faction.Aliens) {
				selectedArray = Aliens
			} else if (faction === Faction.Dinosaurs) {
				selectedArray = Dinosaurs
			} else {
				throw new Error("Unsupported faction")
			}

			for (const databaseCard of selectedArray) {
				const newCard = this.gameState.generateCard(databaseCard)
				newCard.owner_id = this.id
				newCard.controller_id = this.id
				newCard.moveCard({
					positionType: PositionType.Deck,
					playerID: this.id
				})
			}
		}

		this.deck.shuffle()
	}

	draw(amount: number) {
		for (let i = 0; i < amount; i++) {
			const card = this.deck.getTopCard()
			
			card.moveCard({
				positionType: PositionType.Hand,
				playerID: this.id
			})
		}
	}

	toClientGamePlayer(): ClientGamePlayer {
		return {
			id: this.id,
			name: this.name,

			victoryPoints: this.victoryPoints,
			victoryPointsDetailed: this.victoryPointsDetailed,
			
			minionPlays: this.minionPlays,
			actionPlays: this.actionPlays,

			deck: this.deck.toClientGameCardArray(),
			hand: this.hand.toClientGameCardArray(),
			discardPile: this.discardPile.toClientGameCardArray(),
			aboutToBePlayedCards: this.aboutToBePlayedCards.toClientGameCardArray(),

			factions: this.factions
		};
	}
}
