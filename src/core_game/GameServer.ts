import { makeAutoObservable } from "mobx";
import { ConnectionManager } from "./ConnectionManager";
import { GameState } from "./game/GameState";
import { GameMessage } from "./game_messages/GameMessage";
import { isEndTurnMessage } from "./game_messages/EndTurnMessage";
import { isPlayCardMessage } from "./game_messages/PlayCardMessage";
import { isUpdateGameStateMessage, UpdateGameStateMessage } from "./game_messages/UpdateGameStateMessage";

export class GameServer {
	connectionManager: ConnectionManager
	gameState: GameState


	constructor() {
		this.connectionManager = new ConnectionManager(this)
		this.gameState = new GameState(this)

		makeAutoObservable(this)
	}

	tick() {
		if (this.isMaster && this.connectionManager.isConnected) {
			this.gameState.nextStep()
			this.sendUpdateGameState()
		}
	}

	receiveGameMessage(message: any) {
		if (isUpdateGameStateMessage(message)) {
			this.gameState.deserialize(message.gameState)
			return
		}
	
		if (!this.isMaster) {
			return
		}


		if (isEndTurnMessage(message)) {
			if (this.gameState.turnPlayerId !== message.playerID) {
				return
			}
			this.gameState.endTurn()
			this.sendUpdateGameState()
			return
		}

		if (isPlayCardMessage(message)) {
			if (this.gameState.turnPlayerId !== message.playerID) {
				return
			}
			this.gameState.playCard(message.card_id, message.playerID, message.position)
			this.sendUpdateGameState()
			return
		}
	}

	sendUpdateGameState() {
		if (!this.isMaster) {
			throw new Error("Attenzione, sei solo il client, non il server")
		}

		const message: UpdateGameStateMessage = {
			type: "update_game_state",
			gameState: this.gameState.serialize()
		}
		this.connectionManager.dataConnection?.send(message)
	}

	sendGameMessage(message: GameMessage) {
		if (this.isMaster) {
			this.receiveGameMessage(message)
		} else {
			this.connectionManager.dataConnection?.send(message)
		}
	}

	get isMaster(): boolean {
		return this.connectionManager.isMaster
	}

	get playerID() {
		return this.isMaster ? 0 : 1
	}

}