import { Vector3 } from "@react-three/fiber";
import { useMemo } from "react";
import { Shape } from "three"
import { GameCardId, PlayerID } from "../core_game/game/GameState";
import { useGameScreenContext } from "../GameScreenContext";
import { PLAYERS_COLORS, usePositions } from "./usePositions"


export function drawRect({shape, x, y, width, height}: {shape: Shape, x: number, y: number, width: number, height: number}) {
	shape.moveTo(x, y)
	shape.lineTo(x + width, y)
	shape.lineTo(x + width, y + height)
	shape.lineTo(x, y + height)
	shape.lineTo(x, y)
}

export function drawRectFromCenter({shape, centerX, centerY, width, height}: {shape: Shape, centerX: number, centerY: number, width: number, height: number}) {
	drawRect({
		shape,
		x: centerX - width / 2,
		y: centerY - height / 2,
		width: width,
		height: height
	})
}

export const Table = () => {

	const { getCardDeckPosition, getPlayerCardsZoneForBase, CARD_WIDTH, CARD_HEIGHT, STANDARD_PADDING } = usePositions()

	const { gameState } = useGameScreenContext()

	const deckZones = useMemo(() => {
		let zones = [] as {
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

			zones.push({
				playerID: player.id,
				shape: shape,
				width: width,
				position: deckZone
			})
		}
		
		return zones
	}, [getCardDeckPosition, gameState.players, CARD_WIDTH, CARD_HEIGHT, STANDARD_PADDING])

	const basePlayersZone = useMemo(() => {
		let drawZones = [] as {
			playerID: PlayerID
			baseID: GameCardId
			position: Vector3
			shape: Shape
		}[]

		for (const baseID of gameState.in_play_bases) {
			const zones = getPlayerCardsZoneForBase(baseID)
			
			for (const zone of zones) {
				const shape = new Shape()

				drawRect({
					shape: shape, 
					x: 0,
					y: 0,
					width: zone.size[0],
					height: zone.size[1]
				})

				drawZones.push({
					playerID: zone.player,
					baseID: baseID,
					shape: shape,
					position: [
						zone.position[0] - 0.81,
						zone.position[1] - zone.size[1] / 2,
						zone.position[2]
					]
				})
			}
		}

		return drawZones
	}, [gameState.in_play_bases, getPlayerCardsZoneForBase])


	return <group position={[0, 0, 0]}>
		
		{deckZones.map(deckZone => {
			return <mesh position={deckZone.position}
				key={`deck-${deckZone.playerID}`}
			>
				<meshBasicMaterial attach="material" color={PLAYERS_COLORS[deckZone.playerID].lighterColor} />
				<shapeBufferGeometry attach="geometry" args={[deckZone.shape]} />
				<line>
					<shapeBufferGeometry args={[deckZone.shape]} />
					<lineBasicMaterial color={PLAYERS_COLORS[deckZone.playerID].primaryColor} />
				</line>
			</mesh>
		})}


		{basePlayersZone.map(base_zone => {
			return <mesh position={base_zone.position}
				key={`base_zone-${base_zone.baseID}-${base_zone.playerID}`}
			>
				<meshBasicMaterial attach="material" color={PLAYERS_COLORS[base_zone.playerID].lighterColor} />
				<shapeBufferGeometry attach="geometry" args={[base_zone.shape]} />
				<line>
					<shapeBufferGeometry args={[base_zone.shape]} />
					<lineBasicMaterial color={PLAYERS_COLORS[base_zone.playerID].primaryColor} />
				</line>
			</mesh>
		})}

	</group>
}