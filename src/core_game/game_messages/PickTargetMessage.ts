import { GameCardId, PlayerID } from "../game/GameState";

export interface PickTargetMessage {
	type: "pick_target"
	playerID: PlayerID
	cardId: GameCardId | null
}

export function isPickTargetMessage(input: any): input is PickTargetMessage {
	return input.type === "pick_target"
		&& typeof input.playerID === "number"
		&& (typeof input.cardId === "number" || input.cardId === null)
} 