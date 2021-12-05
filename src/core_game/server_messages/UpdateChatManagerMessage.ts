
export interface UpdateChatManagerMessage {
	type: "update_chat_manager",
	client_chat_manager: string
}

export function isUpdateChatManagerMessage(input: any): input is UpdateChatManagerMessage {
	return input.type === "update_chat_manager"
		&& typeof input.client_chat_manager === "string" 
} 