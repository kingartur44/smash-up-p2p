import { Euler } from "three"
import { GameState, PlayerID } from "../core_game/game/GameState"
import { BasePosition, BoardPosition } from "../core_game/game/utils/Position"
import { useGameScreenContext } from "../react/views/GameScreenContext"

const TABLE_Z_ZERO = 0

const CARD_WIDTH = 1
const CARD_HEIGHT = 1.3
const CARD_MAX_DIMENSION = Math.max(CARD_WIDTH, CARD_HEIGHT)

const BASES_DISTANCE = 2
const CARD_HORIZONTAL_SPACING = 0.15
const STANDARD_PADDING = 0.3

interface PositionAndRotation {
	position: Parameters<THREE.Vector3['set']>,
	rotation: Euler
}

interface PositionsOutput {
	CARD_WIDTH: number
	CARD_HEIGHT: number
	CARD_MAX_DIMENSION: number
	STANDARD_PADDING: number

	getCardDeckPosition: (index: PlayerID, cardIndex: number) => PositionAndRotation
	getCardHandPosition: (index: PlayerID, cardIndex: number) => PositionAndRotation
	getBasePosition: (index: number) => PositionAndRotation

	getCardOnBasePosition: (position: BasePosition) => PositionAndRotation
}

export function usePositions(): PositionsOutput {

	const { gameServer, gameState } = useGameScreenContext()

	return {
		CARD_WIDTH,
		CARD_HEIGHT,
		CARD_MAX_DIMENSION,
		STANDARD_PADDING,

		getCardDeckPosition: (playerID: PlayerID, cardIndex: number) => {
			const cardElevation = cardIndex * 0.01

			const data: PositionAndRotation[] = [
				{
					position: [4, -4, TABLE_Z_ZERO + cardElevation],
					rotation: new Euler(0)
				},
				{
					position: [-4, 4, TABLE_Z_ZERO + cardElevation],
					rotation:new Euler(0)
				}
			]

			const referencePosition = playerID === gameServer.playerID ? 0 : 1
			return data[referencePosition]
		},

		getCardHandPosition: (playerID: PlayerID, cardIndex: number) => {
			const playerHand = gameState.players[playerID].hand
			const centerAdjustment = cardIndex * (1 + CARD_HORIZONTAL_SPACING)
			const cardXAdjustment = -Math.floor(playerHand.length / 2) * (1 + CARD_HORIZONTAL_SPACING) + centerAdjustment


			const positionsAndRotations: PositionAndRotation[] = [
				{
					position: [0 + cardXAdjustment, -6.5, 4],
					rotation: new Euler(Math.PI / 4)
				},
				{
					position: [0 + cardXAdjustment, 4, 2],
					rotation: new Euler(-Math.PI / 2)
				},
			]
			const referencePosition = playerID === gameServer.playerID ? 0 : 1
			return positionsAndRotations[referencePosition]
		},


		getBasePosition: (index: number) => {
			return {
				position: [
					-4,
					calcBaseYCoordinate(index, gameState),
					TABLE_Z_ZERO
				],
				rotation: new Euler(0, 0, Math.PI / 2)
			}
		},

		getCardOnBasePosition: (position: BasePosition) => {
			if (position.index === undefined) {
				throw new Error("Attenzione, l'index è a 0")
			}

			const base = gameState.getCard(position.base_id)
			if (!base) {
				throw new Error("Warning, the base does not exist")
			}
			const basePosition = [
				-4,
				calcBaseYCoordinate((base.position as any).index, gameState),
				TABLE_Z_ZERO
			]

			return {
				position: [
					basePosition[0] + (position.index + 2) * (1 + CARD_HORIZONTAL_SPACING),
					basePosition[1],
					basePosition[2]
				],
				rotation: new Euler(0)
			}
		}
	}

}



function calcBaseYCoordinate(index: number, gameState: GameState): number {
	const zero_y_position = -Math.floor(gameState.bases.length / 2) * BASES_DISTANCE
	return zero_y_position + (index * BASES_DISTANCE)
}