import { PlayerID } from "../../game/GameState";
import { isPosition, Position } from "../../game/position/Position";


export interface PlayCardMessage {
	type: "play_card"
	playerID: PlayerID
	card_id: number
	position: Position
}

export function isPlayCardMessage(input: any): input is PlayCardMessage {
	return input.type === "play_card"
		&& typeof input.playerID === "number"
		&& typeof input.card_id === "number"
		&& isPosition(input.position)
} 