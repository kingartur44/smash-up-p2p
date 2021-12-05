
export interface SendChatMessageMessage {
	type: "send_chat_message",
	user: string
	message: string
}

export function isSendChatMessageMessage(input: any): input is SendChatMessageMessage {
	return input.type === "send_chat_message"
		&& typeof input.user === "string" 
		&& typeof input.message === "string" 
} 