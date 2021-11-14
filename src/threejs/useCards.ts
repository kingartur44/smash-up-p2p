import { Vector3 } from "@react-three/fiber"
import { Euler } from "three"
import { GameState } from "../core_game/game/GameState"
import { BoardPosition } from "../core_game/game/utils/Position"
import { useGameScreenContext } from "../react/views/GameScreenContext"
import { Card3DModelProps } from "./Card3DModel"
import { usePositions } from "./usePositions"

const TABLE_Z_ZERO = 0


export function useCards(): Card3DModelProps[] {
	const { gameState, gameServer } = useGameScreenContext()

	const positions = usePositions()

	let cardPrototypes: Card3DModelProps[] = []

	for (const card of Object.values(gameState.cards)) {
		const position = card.position
		switch (position.position) {
			case "hand": {
				if (position.index === undefined) {
					throw new Error("Attenzione, l'index è a 0")
				}

				const isClientOwnerHand = gameServer.playerID === position.playerID
				
				const cardPR = positions.getCardHandPosition(
					position.playerID,
					position.index
				)
				
				cardPrototypes.push({
					key: card.id,
					card: card,
					isFlipped: !isClientOwnerHand,
					position: cardPR.position,
					rotation: cardPR.rotation
				})
				break
			}

			case "deck": {
				if (position.index === undefined) {
					throw new Error("Attenzione, l'index è a 0")
				}

				const cardPR = positions.getCardDeckPosition(
					position.playerID,
					position.index
				)

				cardPrototypes.push({
					key: card.id,
					card: card,
					isFlipped: true,
					position: cardPR.position,
					rotation: cardPR.rotation
				})

				break
			}

			case "board": {
				if (position.index === undefined) {
					throw new Error("Attenzione, l'index è a 0")
				}
				const cardPR = positions.getBasePosition(position.index)

				cardPrototypes.push({
					key: card.id,
					card: card,
					isFlipped: false,
					position: cardPR.position,
					rotation: cardPR.rotation
				})
				break
			}

			case "base": {

				const cardPR = positions.getCardOnBasePosition(position)

				cardPrototypes.push({
					key: card.id,
					card: card,
					isFlipped: false,
					position: cardPR.position,
					rotation: cardPR.rotation
				})
			}
		}
	}

	return cardPrototypes
}


function calcBasePosition(position: BoardPosition, gameState: GameState): Vector3 {
	const zero_y_position = -Math.floor(gameState.bases.length / 2) * 1.6

	return [
		-4,
		zero_y_position + ((position.index ?? 0) * 1.6),
		TABLE_Z_ZERO
	]
}