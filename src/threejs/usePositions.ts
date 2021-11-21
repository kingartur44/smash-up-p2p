import { Vector3 } from "@react-three/fiber"
import { Euler } from "three"
import { GameCard } from "../core_game/game/cards/GameCard"
import { GameCardId, GameState, PlayerID } from "../core_game/game/GameState"
import { AboutToBePlayedPosition, BasePosition, BasesDeckPosition, DiscardPilePosition, HandPosition } from "../core_game/game/utils/Position"
import { useGameScreenContext } from "../react/views/GameScreenContext"

const TABLE_Z_ZERO = 0

const CARD_WIDTH = 1
const CARD_HEIGHT = 1.3
const CARD_MAX_DIMENSION = Math.max(CARD_WIDTH, CARD_HEIGHT)

const BASES_DISTANCE = 2
const CARD_HORIZONTAL_SPACING = 0.15
const STANDARD_PADDING = 0.3


export const PLAYERS_COLORS: Record<PlayerID, {
	primaryColor: string,
	lighterColor: string
}> = {
	0: {
		primaryColor: "green",
		lighterColor: "#b3ffb3"
	},
	1: {
		primaryColor: "red",
		lighterColor: "#ffb3b3"
	},
}

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
	getCardDiscardPilePosition: (card: GameCard, position: DiscardPilePosition) => PositionAndRotation
	getCardHandPosition: (card: GameCard, position: HandPosition) => PositionAndRotation
	getAboutToBePlayedPosition: (card: GameCard, position: AboutToBePlayedPosition) => PositionAndRotation
	getBasePosition: (index: number) => PositionAndRotation
	getBasesDeckPosition: (card: GameCard) => PositionAndRotation

	getCardOnBasePosition: (card: GameCard, position: BasePosition) => PositionAndRotation
	getPlayerCardsZoneForBase: (base_id: GameCardId) => {
		player: PlayerID,
		position: Parameters<THREE.Vector3['set']>,
		size: Parameters<THREE.Vector3['set']>
	}[]
}

export function usePositions(): PositionsOutput {

	const { gameServer, gameState } = useGameScreenContext()

	
	function getCardDeckPosition(playerID: PlayerID, cardIndex: number) {
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
	}

	function getCardDiscardPilePosition(card: GameCard, position: DiscardPilePosition) {
		const playerDiscardPile = gameState.players[position.playerID].discardPile

		const cardIndex = playerDiscardPile.findIndex(card_id => card_id === card.id)
		if (cardIndex === -1) {
			throw new Error("The card is not in the discard pile")
		}

		const cardElevation = cardIndex * 0.01
		

		const positionsAndRotations: PositionAndRotation[] = [
			{
				position: [6, -4, TABLE_Z_ZERO + cardElevation],
				rotation: new Euler(0)
			},
			{
				position: [-6, 4, TABLE_Z_ZERO + cardElevation],
				rotation:new Euler(0)
			}
		]
		const referencePosition = position.playerID === gameServer.playerID ? 0 : 1
		return positionsAndRotations[referencePosition]
	}

	function getCardHandPosition(card: GameCard, position: HandPosition) {
		const playerHand = gameState.players[position.playerID].hand
		const cardIndex = playerHand.findIndex(card_id => card_id === card.id)
		if (cardIndex === -1) {
			throw new Error("The card is not in the hand")
		}


		const centerAdjustment = cardIndex * (1 + CARD_HORIZONTAL_SPACING)
		const cardXAdjustment = -Math.floor(playerHand.length / 2) * (1 + CARD_HORIZONTAL_SPACING) + centerAdjustment

		const positionsAndRotations: PositionAndRotation[] = [
			{
				position: [
					0 + cardXAdjustment,
					-6.5,
					2.5
				],
				rotation: new Euler(Math.PI / 4)
			},
			{
				position: [0 + cardXAdjustment, 4, 4],
				rotation: new Euler(Math.PI / 4)
			},
		]
		const referencePosition = position.playerID === gameServer.playerID ? 0 : 1
		return positionsAndRotations[referencePosition]
	}

	function getAboutToBePlayedPosition(card: GameCard, position: AboutToBePlayedPosition) {

		const positionsAndRotations: PositionAndRotation[] = [
			{
				position: [0, -4, TABLE_Z_ZERO],
				rotation: new Euler(0)
			},
			{
				position: [0, 4, TABLE_Z_ZERO],
				rotation: new Euler(0)
			},
		]
		const referencePosition = position.playerID === gameServer.playerID ? 0 : 1
		return positionsAndRotations[referencePosition]
	}

	


	function getBasePosition(index: number): PositionAndRotation {
		return {
			position: [
				-4,
				calcBaseYCoordinate(index, gameState),
				TABLE_Z_ZERO
			],
			rotation: new Euler(0)
		}
	}

	function getBasesDeckPosition(card: GameCard): PositionAndRotation {
		const playerDiscardPile = gameState.bases_deck

		const cardIndex = playerDiscardPile.findIndex(card_id => card_id === card.id)
		if (cardIndex === -1) {
			throw new Error("The card is not in the base deck")
		}

		const cardElevation = cardIndex * 0.01

		return {
			position: [
				-6,
				0,
				TABLE_Z_ZERO + cardElevation
			],
			rotation: new Euler(0)
		}
	}

	function getCardOnBasePosition(card: GameCard, position: BasePosition): PositionAndRotation {
		const base = gameState.getCard(position.base_id)
		if (!base) {
			throw new Error("Warning, the base does not exist")
		}
		if (!base.isBaseCard()) {
			throw new Error("Warning, the card is not a base")
		}
		if (card.controller_id === null) {
			throw new Error("Warning, the card has no controller")
		}

		const effectiveIndex = base.playerCards[card.controller_id].indexOf(card.id)
		if (effectiveIndex === -1) {
			throw new Error("Error, check here")
		}

		const playerZone = getPlayerCardsZoneForBase(base.id).find(zone => zone.player === card.controller_id)
		if (!playerZone) {
			throw new Error("Error, check here")
		}


		const basePosition = playerZone.position

		return {
			position: [
				basePosition[0] + effectiveIndex * (1 + CARD_HORIZONTAL_SPACING),
				basePosition[1],
				basePosition[2] + 0.01
			],
			rotation: new Euler(0)
		}
	}

	function getPlayerCardsZoneForBase(base_id: GameCardId): {
		player: PlayerID,
		position: Parameters<THREE.Vector3['set']>,
		size: Parameters<THREE.Vector3['set']>
	}[] {
		const base = gameState.getCard(base_id)
		if (!base) {
			throw new Error("Warning, the base does not exist")
		}
		if (!base.isBaseCard()) {
			throw new Error("Warning, the card is not a base")
		}

		const playerCards = base.playerCards

		const zones = [] as {
			position: Parameters<THREE.Vector3['set']>,
			size: Parameters<THREE.Vector3['set']>,
			player: PlayerID
		}[]


		let leftSpacing = 2 * (1 + CARD_HORIZONTAL_SPACING)
		for (const [playerID, cards] of Object.entries(playerCards)) {
			const width = (cards.length * CARD_WIDTH) // Larghezza delle carte
				+ ((cards.length - 1) * CARD_HORIZONTAL_SPACING) // Spaziatura tra le carte
				+ (STANDARD_PADDING * 2) // Margine della box
			
			zones.push({
				player: parseInt(playerID),
				position: [
					-4 + leftSpacing, // X
					calcBaseYCoordinate((base.position as any).index, gameState), // Y
					TABLE_Z_ZERO // Z
				],
				size: [
					width, // X
					CARD_HEIGHT + STANDARD_PADDING * 2, // Y
					0 // Z
				]
			})

			leftSpacing += width + CARD_HORIZONTAL_SPACING
		}


		return zones
	}
	


	return {
		CARD_WIDTH,
		CARD_HEIGHT,
		CARD_MAX_DIMENSION,
		STANDARD_PADDING,

		getCardDeckPosition,
		getCardDiscardPilePosition,
		getCardHandPosition,
		getAboutToBePlayedPosition,
		getBasePosition,
		getBasesDeckPosition,
		getCardOnBasePosition,
		getPlayerCardsZoneForBase
	}
}



function calcBaseYCoordinate(index: number, gameState: GameState): number {
	const zero_y_position = -Math.floor(gameState.in_play_bases.length / 2) * BASES_DISTANCE
	return zero_y_position + (index * BASES_DISTANCE)
}