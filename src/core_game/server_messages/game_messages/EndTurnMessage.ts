import { PlayerID } from "../../game/GameState";

export interface EndTurnMessage {
	type: "end_turn",
	playerID: PlayerID
}

export function isEndTurnMessage(input: any): input is EndTurnMessage {
	return input.type === "end_turn"
		&& typeof input.playerID === "number" 
} 