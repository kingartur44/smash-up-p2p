import { CardType } from "../data/CardType"
import { ActionGameCard } from "../game/cards/ActionGameCard"
import { BaseGameCard } from "../game/cards/BaseGameCard"
import { MinionGameCard } from "../game/cards/MinionGameCard"
import { GameState } from "../game/GameState"


export class DatabaseCard {
	type: CardType
	id: string
	name: string
	description: string
	image?: string
	faction: string
	//initializeEffects?: (card: GameCard, gameState: GameState) => void

	constructor() {
		this.type = CardType.Minion
		this.id = ""
		this.name = ""
		this.description = ""
		this.image = ""
		this.faction = ""
	}
}


export class MinionDatabaseCard extends DatabaseCard {
	type: CardType.Minion
	id: string
	name: string
	description: string
	image?: string
	faction: string

	initializeEffects?: (card: MinionGameCard, gameState: GameState) => void

	power: number
	
	constructor({id, name, description, image, faction, power, initializeEffects}: {id: string, name: string, description: string, image?: string, faction: string, initializeEffects?: (card: MinionGameCard, gameState: GameState) => void} & {power: number}) {
		super()

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

export class ActionDatabaseCard extends DatabaseCard {
	type: CardType.Action
	id: string
	name: string
	description: string
	image?: string

	faction: string

	initializeEffects?: (card: ActionGameCard, gameState: GameState) => void

	
	constructor({id, name, description, image, faction, initializeEffects}: {id: string, name: string, description: string, image?: string, faction: string, initializeEffects?: (card: ActionGameCard, gameState: GameState) => void}) {
		super()

		this.type = CardType.Action
		this.id = id
		this.name = name
		this.description = description
		this.image = image
		this.faction = faction
		this.initializeEffects = initializeEffects
	}
}

export class BaseDatabaseCard extends DatabaseCard {
	type: CardType.Base
	id: string
	name: string
	description: string
	image?: string

	faction: string

	initializeEffects?: (card: BaseGameCard, gameState: GameState) => void

	breakpoint: number
	points: number[]
	
	constructor({id, name, description, image, faction, breakpoint, points, initializeEffects}: {id: string, name: string, description: string, image?: string, faction: string, initializeEffects?: (card: BaseGameCard, gameState: GameState) => void} & { breakpoint: number, points: number[] }) {
		super()

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