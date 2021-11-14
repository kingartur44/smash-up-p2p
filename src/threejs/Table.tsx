import { Text } from "@react-three/drei";
import { Vector3 } from "@react-three/fiber";
import { useMemo } from "react";
import { Euler, Shape } from "three"
import { PlayerID } from "../core_game/game/GameState";
import { useGameScreenContext } from "../react/views/GameScreenContext";
import { usePositions } from "./usePositions"


function drawRect({shape, x, y, width, height}: {shape: Shape, x: number, y: number, width: number, height: number}) {
	shape.moveTo(x, y)
	shape.lineTo(x + width, y)
	shape.lineTo(x + width, y + height)
	shape.lineTo(x, y + height)
	shape.lineTo(x, y)
}

function drawRectFromCenter({shape, centerX, centerY, width, height}: {shape: Shape, centerX: number, centerY: number, width: number, height: number}) {
	drawRect({
		shape,
		x: centerX - width / 2,
		y: centerY - height / 2,
		width: width,
		height: height
	})
}

export const Table = () => {

	const { getCardDeckPosition, CARD_WIDTH, CARD_HEIGHT, STANDARD_PADDING } = usePositions()

	const { gameState } = useGameScreenContext()

	const deckZones = useMemo(() => {
		let deckZones = [] as {
			playerID: PlayerID
			position: Vector3
			shape: Shape
			width: number
		}[]

		for (const player of gameState.players) {
			const deckZone = getCardDeckPosition(player.id, 0).position
			const shape = new Shape()
			const width = CARD_WIDTH + STANDARD_PADDING
			drawRectFromCenter({
				shape: shape, 
				centerX: 0,
				centerY: 0,
				width: CARD_WIDTH + STANDARD_PADDING,
				height: CARD_HEIGHT + STANDARD_PADDING
			})

			deckZones.push({
				playerID: player.id,
				shape: shape,
				width: width,
				position: deckZone
			})
		}
		
		return deckZones
	}, [getCardDeckPosition, gameState.players, CARD_WIDTH, CARD_HEIGHT, STANDARD_PADDING])

	return <group position={[0, 0, 0]}>
		
		{deckZones.map(deckZone => {
			return <mesh position={deckZone.position}
				key={deckZone.playerID}
			>
				<meshBasicMaterial attach="material" color="#a6a6a6" />
				<shapeBufferGeometry attach="geometry" args={[deckZone.shape]} />
				<line>
					<shapeBufferGeometry args={[deckZone.shape]} />
					<lineBasicMaterial color="blue" />
				</line>
			</mesh>
		})}

	</group>
}