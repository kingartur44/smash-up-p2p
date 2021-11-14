import { CardType } from "../data/CardType"
import { GameCard } from "../game/cards/GameCard"
import { GameState } from "../game/GameState"

export interface DatabaseCard {
	type: CardType
	id: string
	name: string
	description: string
	image?: string
	faction: string
	initializeEffects?: (card: GameCard, gameState: GameState) => void
}


export class MinionDatabaseCard implements DatabaseCard {
	type: CardType.Minion
	id: string
	name: string
	description: string
	image?: string
	faction: string

	initializeEffects?: (card: GameCard, gameState: GameState) => void

	power: number
	
	constructor({id, name, description, image, faction, power, initializeEffects}: {id: string, name: string, description: string, image?: string, faction: string, initializeEffects?: (card: GameCard, gameState: GameState) => void} & {power: number}) {
		this.type = CardType.Minion
		this.id = id
		this.name = name
		this.description = description
		this.image = image
		this.faction = faction
		this.power = power
		this.initializeEffects = initializeEffects
	}
}

export class ActionDatabaseCard implements DatabaseCard {
	type: CardType.Action
	id: string
	name: string
	description: string
	image?: string

	faction: string

	initializeEffects?: (card: GameCard, gameState: GameState) => void

	
	constructor({id, name, description, image, faction, initializeEffects}: {id: string, name: string, description: string, image?: string, faction: string, initializeEffects?: (card: GameCard, gameState: GameState) => void}) {
		this.type = CardType.Action
		this.id = id
		this.name = name
		this.description = description
		this.image = image
		this.faction = faction
		this.initializeEffects = initializeEffects
	}
}

export class BaseDatabaseCard implements DatabaseCard {
	type: CardType.Base
	id: string
	name: string
	description: string
	image?: string

	faction: string

	initializeEffects?: (card: GameCard, gameState: GameState) => void

	breakpoint: number
	points: number[]
	
	constructor({id, name, description, image, faction, breakpoint, points, initializeEffects}: {id: string, name: string, description: string, image?: string, faction: string, initializeEffects?: (card: GameCard, gameState: GameState) => void} & { breakpoint: number, points: number[] }) {
		this.type = CardType.Base

		this.id = id
		this.name = name
		this.description = description
		this.image = image
		this.faction = faction

		this.breakpoint = breakpoint
		this.points = points
		this.initializeEffects = initializeEffects
	}
}