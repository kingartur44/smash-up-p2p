import React, { useContext } from "react";
import { GameState } from "./core_game/game/GameState";
import { GameServer } from "./core_game/GameServer";

interface GameScreenContextInterface {
	gameServer: GameServer
	gameState: GameState

	selectedCard: number | null
	setSelectedCard: React.Dispatch<React.SetStateAction<number | null>>

	hoveredCard: number | null
	setHoveredCard: React.Dispatch<React.SetStateAction<number | null>>
}

export const GameScreenContext = React.createContext(undefined as unknown as GameScreenContextInterface)

export function useGameScreenContext(): GameScreenContextInterface {
	return useContext(GameScreenContext)
}