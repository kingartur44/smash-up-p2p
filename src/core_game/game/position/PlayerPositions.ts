import { PlayerID } from "../GameState";


export interface HandPosition {
	position: "hand";
	playerID: PlayerID;
}
export function isHandPosition(data: any): data is HandPosition {
	return data.postion === "hand" &&
		typeof data.playerID === "number";
}

export interface DiscardPilePosition {
	position: "discard-pile";
	playerID: PlayerID;
}
export function isDiscardPilePosition(data: any): data is DiscardPilePosition {
	return data.postion === "discard-pile" &&
		typeof data.playerID === "number";
}

export interface DeckPosition {
	position: "deck";
	playerID: PlayerID;
}
export function isDeckPosition(data: any): data is DeckPosition {
	return data.postion === "deck" &&
		typeof data.playerID === "number";
}
