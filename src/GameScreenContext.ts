import React, { useContext } from "react";
import { ClientChatManager } from "./core_game/ChatManager";
import { ClientGameState } from "./core_game/client_game/ClientGameState";
import { GameServer } from "./core_game/GameServer";

interface GameScreenContextInterface {
	gameServer: GameServer
	clientGameState: ClientGameState
	clientChatManager: ClientChatManager

	selectedCard: number | null
	setSelectedCard: React.Dispatch<React.SetStateAction<number | null>>

	hoveredCard: number | null
	setHoveredCard: React.Dispatch<React.SetStateAction<number | null>>
}

export const GameScreenContext = React.createContext(undefined as unknown as GameScreenContextInterface)

export function useGameScreenContext(): GameScreenContextInterface {
	return useContext(GameScreenContext)
}