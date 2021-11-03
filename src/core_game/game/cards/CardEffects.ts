export type GameCardEffect = PowerBoostEffect | OnPlayEffect

export enum GenericPositions {
	Deck,
	DiscardPile,
	Hand,
	Field
}


export type PowerBoostEffect = {
	type: "power-boost",
	positionRequirement: GenericPositions
	callback: string
}

export type OnPlayEffect = {
	type: "on-play",
	callback: string
}