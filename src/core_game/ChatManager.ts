import { makeAutoObservable } from "mobx";
import { GameServer } from "./GameServer";

interface ChatMessage {
	author: string
	message: string
}

export class ChatManager {
	gameServer: GameServer
	messages: ChatMessage[]

	constructor(gameServer: GameServer) {
		this.gameServer = gameServer
		this.messages = []

		makeAutoObservable(this, {
			gameServer: false
		})
	}

	addMessage(message: ChatMessage) {
		this.messages= [
			...this.messages,
			message
		]
		this.gameServer.sendChatMessagesUpdate()
	}

	toClientChatManager(): ClientChatManager {
		return {
			messages: this.messages
		}
	}
}


export interface ClientChatManager {
	messages: ChatMessage[]
}