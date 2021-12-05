export interface UpdateClientGameStateMessage {
	type: "update_client_game_state",
	clientGameState: string
}

export function isUpdateClientGameStateMessage(input: any): input is UpdateClientGameStateMessage {
	return input.type === "update_client_game_state" &&
		typeof input.clientGameState === "string"
} 