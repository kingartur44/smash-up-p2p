import { makeAutoObservable } from "mobx";
import { ConnectionManager } from "./ConnectionManager";
import { GameCurrentActionType, GameState } from "./game/GameState";
import { isEndTurnMessage } from "./server_messages/game_messages/EndTurnMessage";
import { isPlayCardMessage } from "./server_messages/game_messages/PlayCardMessage";
import { isPickTargetMessage } from "./server_messages/game_messages/PickTargetMessage";
import { ClientGameState } from "./client_game/ClientGameState";
import { isUpdateClientGameStateMessage, UpdateClientGameStateMessage } from "./server_messages/game_messages/UpdateClientGameStateMessage";
import { ChatManager, ClientChatManager } from "./ChatManager";
import { isUpdateChatManagerMessage, UpdateChatManagerMessage } from "./server_messages/UpdateChatManagerMessage";
import { isSendChatMessageMessage } from "./server_messages/SendChatMessageMessage";
import { ServerMessage } from "./server_messages/ServerMessage";

export class GameServer {
	connectionManager: ConnectionManager

	gameState: GameState
	clientGameState: ClientGameState

	chatManager: ChatManager
	clientChatManager: ClientChatManager

	constructor() {
		this.connectionManager = new ConnectionManager(this)

		this.gameState = new GameState(this)
		this.clientGameState = this.gameState.toClientGameState()

		this.chatManager = new ChatManager(this)
		this.clientChatManager = this.chatManager.toClientChatManager()

		makeAutoObservable(this, {
			gameState: false
		})
	}

	tick() {
		if (this.isMaster && this.connectionManager.isConnected) {
			this.gameState.nextStep()
			this.sendUpdateGameState()
		}
	}

	receiveGameMessage(message: any) {
		if (isUpdateClientGameStateMessage(message)) {
			this.clientGameState = JSON.parse(message.clientGameState)
			return
		}
		if (isUpdateChatManagerMessage(message)) {
			this.clientChatManager = JSON.parse(message.client_chat_manager)
			return
		}
	
		if (!this.isMaster) {
			return
		}

		if (isSendChatMessageMessage(message)) {
			this.chatManager.addMessage({
				author: message.user,
				message: message.message
			})
			return
		}

		if (isEndTurnMessage(message)) {
			if (this.gameState.turnPlayerId !== message.playerID) {
				throw new Error("Error, the turn player is different")
			}
			this.gameState.endTurn()
			this.sendUpdateGameState()
			return
		}

		if (isPlayCardMessage(message)) {
			if (this.gameState.turnPlayerId !== message.playerID) {
				throw new Error("Error, the turn player is different")
			}
			this.gameState.playCard(message.card_id, message.playerID, message.position)
			this.sendUpdateGameState()
			return
		}

		if (isPickTargetMessage(message)) {
			const currentAction = this.gameState.currentAction
			if (currentAction.type !== GameCurrentActionType.ChooseTarget) {
				throw new Error("The current action isn't 'ChooseTarget'")
			}
			this.gameState.sendTargetCallback(message.playerID, message.cardId)
			return	
		}

		throw new Error("Attenzione, tipo di messaggio non riconosciuto")
	}

	sendUpdateGameState() {
		if (!this.isMaster) {
			throw new Error("Attenzione, sei solo il client, non il server")
		}

		this.clientGameState = this.gameState.toClientGameState()

		const message: UpdateClientGameStateMessage = {
			type: "update_client_game_state",
			clientGameState: JSON.stringify(this.clientGameState)
		}

		this.connectionManager.dataConnection?.send(message)
	}

	sendServerMessage(message: ServerMessage) {
		if (this.isMaster) {
			this.receiveGameMessage(message)
		} else {
			this.connectionManager.dataConnection?.send(message)
		}
	}


	sendChatMessagesUpdate() {
		this.clientChatManager = this.chatManager.toClientChatManager()

		const message: UpdateChatManagerMessage = {
			type: "update_chat_manager",
			client_chat_manager: JSON.stringify(this.clientChatManager)
		}

		this.connectionManager.dataConnection?.send(message)
	}

	sendChatMessage(message: string) {
		this.sendServerMessage({
			type: "send_chat_message",
			user: this.isMaster ? "Player 1" : "Player 2",
			message: message
		})
	}

	get isMaster(): boolean {
		return this.connectionManager.isMaster
	}

	get playerID() {
		return this.isMaster ? 0 : 1
	}

}