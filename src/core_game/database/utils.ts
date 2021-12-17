import { CardType } from "../data/CardType";
import { ActionGameCard } from "../game/cards/ActionGameCard";
import { BaseGameCard } from "../game/cards/BaseGameCard";
import { MinionGameCard } from "../game/cards/MinionGameCard";
import { GameState } from "../game/GameState";
import { Faction } from "./core_set/Factions";
import { ActionDatabaseCard, BaseDatabaseCard, DatabaseCard, MinionDatabaseCard } from "./DatabaseCard";



export interface MinionDatabaseCardPrototype {
	type: CardType.Minion
	quantityInDeck: number

	name: string
	description: string
	image?: string

	initializeEffects?: (card: MinionGameCard, gameState: GameState) => void

	power: number
}

export interface ActionDatabaseCardPrototype {
	type: CardType.Action
	quantityInDeck: number

	name: string
	description: string
	image?: string
	
	initializeEffects?: (card: ActionGameCard, gameState: GameState) => void

}
export interface BaseDatabaseCardPrototype {
	type: CardType.Base
	quantityInDeck: number

	name: string
	description: string
	image?: string
	
	initializeEffects?: (card: BaseGameCard, gameState: GameState) => void

	breakpoint: number
	points: number[]
}

type DatabaseCardPrototypes = MinionDatabaseCardPrototype | ActionDatabaseCardPrototype | BaseDatabaseCardPrototype

interface GenerateSetOutput {
	cards: Record<string, DatabaseCard>
	deck: DatabaseCard[]
	bases_deck: DatabaseCard[]
}

export function generateSet(faction: Faction, prototypes: DatabaseCardPrototypes[]): GenerateSetOutput {
	const cards: Record<string, DatabaseCard> = {}
	const deck: DatabaseCard[] = []
	const bases_deck: DatabaseCard[] = []

	let counter = 0
	for (const prototype of prototypes) {
		const card_id = `${faction.toLocaleLowerCase()}-${counter}-${prototype.name.toLocaleLowerCase().replaceAll(" ", "-")}`
		counter++

		const card = (() => {
			switch (prototype.type) {
				case CardType.Minion: {
					return new MinionDatabaseCard({
						id: card_id,
						description: prototype.description,
						image: prototype.image,
						faction: faction,
						name: prototype.name,
						power: prototype.power,
						initializeEffects: prototype.initializeEffects
					})
				}
				case CardType.Action: {
					return new ActionDatabaseCard({
						id: card_id,
						description: prototype.description,
						image: prototype.image,
						faction: faction,
						name: prototype.name,
						initializeEffects: prototype.initializeEffects
					})
				}
				case CardType.Base: {
					return new BaseDatabaseCard({
						id: card_id,
						description: prototype.description,
						image: prototype.image,
						faction: faction,
						name: prototype.name,
						initializeEffects: prototype.initializeEffects,
						breakpoint: prototype.breakpoint,
						points: prototype.points
					})
				}
			}
		})()

		cards[card_id] = card
		for (let i = 0; i < prototype.quantityInDeck; i++) {
			if (card.type === CardType.Base) {
				bases_deck.push(card)
			} else {
				deck.push(card)
			}			
		} 
	}

	return {
		cards,
		deck,
		bases_deck
	}
}