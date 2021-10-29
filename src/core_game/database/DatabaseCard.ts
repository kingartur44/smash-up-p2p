import { GameState } from "../game/GameState"

export interface DatabaseCard {
	type: "minion" | "base" | "action" | "titan"
	id: string
	name: string
	description: string
	faction: string
	effects?: Effects
}

type Effects = (gameState: GameState) => {
	onPlay?: () => void
}

export class MinionDatabaseCard implements DatabaseCard {
	type: "minion"
	id: string
	name: string
	description: string
	faction: string

	effects?: Effects

	power: number
	
	constructor({id, name, description, faction, power, effects}: {id: string, name: string, description: string, faction: string, effects?: Effects} & {power: number}) {
		this.type = "minion"
		this.id = id
		this.name = name
		this.description = description
		this.faction = faction
		this.power = power
		this.effects = effects
	}
}

export class ActionDatabaseCard implements DatabaseCard {
	type: "action"
	id: string
	name: string
	description: string
	faction: string

	effects?: Effects

	power: number
	
	constructor({id, name, description, faction, power, effects}: {id: string, name: string, description: string, faction: string, effects?: Effects} & {power: number}) {
		this.type = "action"
		this.id = id
		this.name = name
		this.description = description
		this.faction = faction
		this.power = power
		this.effects = effects
	}
}

export class BaseDatabaseCard implements DatabaseCard {
	type: "base"
	id: string
	name: string
	description: string
	faction: string

	effects?: Effects

	breakpoint: number
	points: number[]
	
	constructor({id, name, description, faction, breakpoint, points, effects}: {id: string, name: string, description: string, faction: string, effects?: Effects} & { breakpoint: number, points: number[] }) {
		this.type = "base"

		this.id = id
		this.name = name
		this.description = description
		this.faction = faction

		this.breakpoint = breakpoint
		this.points = points
		this.effects = effects
	}
}