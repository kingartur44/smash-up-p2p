export type GameCardEffect = PowerBoostEffect

export interface PowerBoostEffect {
	type: "power-boost",
	callback: string
}