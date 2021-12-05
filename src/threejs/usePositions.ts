import { Euler } from "three"
import { GameCardId, PlayerID } from "../core_game/game/GameState"
import { AboutToBePlayedPosition, BasePosition } from "../core_game/game/position/Position"
import { DeckPosition, DiscardPilePosition, HandPosition } from "../core_game/game/position/PlayerPositions"
import { useGameScreenContext } from "../GameScreenContext"
import { ClientGameCard, ClientGameState } from "../core_game/client_game/ClientGameState"

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

	getPlayerDeckPosition: (player: PlayerID) => Parameters<THREE.Vector3['set']>

	getCardDeckPosition: (card: ClientGameCard, position: DeckPosition) => PositionAndRotation
	getCardDiscardPilePosition: (card: ClientGameCard, position: DiscardPilePosition) => PositionAndRotation
	getCardHandPosition: (card: ClientGameCard, position: HandPosition) => PositionAndRotation
	getAboutToBePlayedPosition: (card: ClientGameCard, position: AboutToBePlayedPosition) => PositionAndRotation
	getBasePosition: (card: ClientGameCard) => PositionAndRotation
	getBasesDeckPosition: (card: ClientGameCard) => PositionAndRotation

	getCardOnBasePosition: (card: ClientGameCard, position: BasePosition) => PositionAndRotation
	getPlayerCardsZoneForBase: (base_id: GameCardId) => {
		player: PlayerID,
		position: Parameters<THREE.Vector3['set']>,
		size: Parameters<THREE.Vector3['set']>
	}[]
}

export function usePositions(): PositionsOutput {

	const { gameServer, clientGameState } = useGameScreenContext()

	function getPlayerDeckPosition(player: PlayerID): Parameters<THREE.Vector3['set']> {
		const data: Parameters<THREE.Vector3['set']>[] = [
			[4, -4, TABLE_Z_ZERO],
			[-4, 4, TABLE_Z_ZERO]
		]
		const referencePosition = player === gameServer.playerID ? 0 : 1
		return data[referencePosition]
	}

	function getCardDeckPosition(card: ClientGameCard, deckPosition: DeckPosition): PositionAndRotation {
		const playerID = deckPosition.playerID
		if (playerID === null) {
			throw new Error("Logic Error: The card has no controller")
		}
		const cardIndex = clientGameState.players[playerID].deck.findIndex(item => item.id === card.id)
		if (cardIndex === -1) {
			throw new Error("Logic Error: The card is not in the deck")
		}

		const cardElevation = cardIndex * 0.01
		const deckGroundPosition = getPlayerDeckPosition(playerID)

		const cardPosition: Parameters<THREE.Vector3['set']> = [
			deckGroundPosition[0], 				// X
			deckGroundPosition[1], 				// Y
			deckGroundPosition[2] + cardElevation // Z
		]

		const data: PositionAndRotation[] = [
			{
				position: cardPosition,
				rotation: new Euler(0)
			},
			{
				position: cardPosition,
				rotation: new Euler(0, 0, Math.PI)
			}
		]

		const referencePosition = playerID === gameServer.playerID ? 0 : 1
		return data[referencePosition]
	}

	function getCardDiscardPilePosition(card: ClientGameCard, position: DiscardPilePosition) {
		const playerDiscardPile = clientGameState.players[position.playerID].discardPile

		const cardIndex = playerDiscardPile.findIndex(item => item.id === card.id)
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
				rotation: new Euler(Math.PI, 0, 0)
			}
		]
		const referencePosition = position.playerID === gameServer.playerID ? 0 : 1
		return positionsAndRotations[referencePosition]
	}

	function getCardHandPosition(card: ClientGameCard, position: HandPosition) {
		const playerHand = clientGameState.players[position.playerID].hand
		const cardIndex = playerHand.findIndex(item => item.id === card.id)
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
				position: [0 + cardXAdjustment, 4, 3],
				rotation: new Euler(Math.PI / 4)
			},
		]
		const referencePosition = position.playerID === gameServer.playerID ? 0 : 1
		return positionsAndRotations[referencePosition]
	}

	function getAboutToBePlayedPosition(card: ClientGameCard, position: AboutToBePlayedPosition) {

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

	


	function getBasePosition(card: ClientGameCard): PositionAndRotation {
		const index = clientGameState.in_play_bases.findIndex(item => item.id === card.id)
		if (index === -1) {
			throw new Error("The base is not in play")
		}

		return {
			position: [
				-4,
				calcBaseYCoordinate(index, clientGameState),
				TABLE_Z_ZERO
			],
			rotation: new Euler(0)
		}
	}

	function getBasesDeckPosition(card: ClientGameCard): PositionAndRotation {
		const basesDeck = clientGameState.bases_deck

		const cardIndex = basesDeck.findIndex(item => item.id === card.id)
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

	function getCardOnBasePosition(card: ClientGameCard, position: BasePosition): PositionAndRotation {
		const base = clientGameState.cards[position.base_id]
		if (base.type !== "base") {
			throw new Error("Logic Error: the card is not a base")
		}
		if (card.controller_id === null) {
			throw new Error("Warning, the card has no controller")
		}

		const effectiveIndex = base.playerCards[card.controller_id].findIndex(item => item === card.id)
		if (effectiveIndex === -1) {
			throw new Error("")
		}

		const playerZone = getPlayerCardsZoneForBase(base.id).find(zone => zone.player === card.controller_id)
		if (playerZone === undefined) {
			throw new Error("")
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
		const base = clientGameState.cards[base_id]
		if (base.type !== "base") {
			throw new Error("Logic Error: the card is not a base")
		}

		const baseIndex = clientGameState.in_play_bases.findIndex(item => item.id === base.id)
		if (baseIndex === -1) {
			throw new Error("Logic Error: the base isn't in play")
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
					calcBaseYCoordinate(baseIndex, clientGameState), // Y
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

		getPlayerDeckPosition,

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



function calcBaseYCoordinate(index: number, clientGameState: ClientGameState): number {
	const zero_y_position = -Math.floor(clientGameState.in_play_bases.length / 2) * BASES_DISTANCE
	return zero_y_position + (index * BASES_DISTANCE)
}