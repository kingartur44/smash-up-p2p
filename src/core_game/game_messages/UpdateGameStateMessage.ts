export interface UpdateGameStateMessage {
	type: "update_game_state",
	gameState: string
}

export function isUpdateGameStateMessage(input: any): input is UpdateGameStateMessage {
	return input.type === "update_game_state" &&
		typeof input.gameState === "string"
} 