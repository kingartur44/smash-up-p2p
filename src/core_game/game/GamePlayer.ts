import { makeAutoObservable } from "mobx";
import { shuffleArray } from "../../utils/shuffleArray";
import { Aliens, Dinosaurs } from "../database/core_set/core_set";
import { Faction } from "../database/core_set/Factions";
import { GameState } from "./GameState";


export class GamePlayer {
	gameState: GameState
	
	id: number;
	name: string;
	color: string;

	victoryPoints: number;
	minionPlays: number;
	actionPlays: number;

	deck: number[];
	hand: number[];
	discardPile: number[];

	factions: string[];

	constructor({gameState, id}: {gameState: GameState, id: number}) {
		this.gameState = gameState

		this.id = id
		this.name = "";
		this.color = "";

		this.victoryPoints = 0;
		this.minionPlays = 0;
		this.actionPlays = 0;

		this.deck = [];
		this.hand = [];
		this.discardPile = [];
		this.factions = [];

		makeAutoObservable(this);
	}

	setFactions(factions: string[]) {
		this.factions = factions;
		this.deck = [];
		for (const faction of factions) {
			if (faction === Faction.Aliens) {
				this.deck = this.deck.concat(Aliens.map(databaseCard => {
					const card = this.gameState.generateCard(databaseCard)
					card.owner_id = this.id;
					card.controller_id = this.id;
					card.position = {
						position: "deck",
						playerID: this.id
					}
					return card.id
				}))
			}
			if (faction === Faction.Dinosaurs) {
				this.deck = this.deck.concat(Dinosaurs.map(databaseCard => {
					const card = this.gameState.generateCard(databaseCard)
					card.owner_id = this.id;
					card.controller_id = this.id;
					card.position = {
						position: "deck",
						playerID: this.id
					}
					return card.id
				}))
			}
		}
		shuffleArray(this.deck)
	}

	draw(amount: number) {
		for (let i = 0; i < amount; i++) {
			const cardId = this.deck.pop()
			if (!cardId) {
				break
			}
			this.gameState.cards[cardId].position = {
				position: "hand",
				playerID: this.id
			}
			this.hand.push(cardId)
		}
	}

	serialize(): any {
		return {
			id: this.id,
			name: this.name,
			color: this.color,

			victoryPoints: this.victoryPoints,
			minionPlays: this.minionPlays,
			actionPlays: this.actionPlays,

			deck: this.deck,
			hand: this.hand,
			discardPile: this.discardPile,

			factions: this.factions
		};
	}

	deserialize(input: any) {
		this.id = input.id;
		this.name = input.name;
		this.color = input.color
		this.victoryPoints = input.victoryPoints;

		this.minionPlays = input.minionPlays
		this.actionPlays = input.actionPlays

		this.deck = input.deck;
		this.hand = input.hand;
		this.discardPile = input.discardPile;

		this.factions = input.factions;
	}
}
