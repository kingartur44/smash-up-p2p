import { PositionType } from "../core_game/game/position/Position"
import { useGameScreenContext } from "../GameScreenContext"
import { Card3DModelProps } from "./Card3DModel"
import { usePositions } from "./usePositions"


export function useCards(): Card3DModelProps[] {
	const { clientGameState, gameServer } = useGameScreenContext()

	const positions = usePositions()

	const cardPrototypes: Card3DModelProps[] = []

	for (const card of Object.values(clientGameState.cards)) {
		const position = card.position
		switch (position.positionType) {
			case PositionType.Hand: {
				const isClientOwnerHand = gameServer.playerID === position.playerID
				
				const cardPR = positions.getCardHandPosition(card, position)
				
				cardPrototypes.push({
					key: card.id,
					card: card,
					isFlipped: !isClientOwnerHand,
					position: cardPR.position,
					rotation: cardPR.rotation
				})
				break
			}

			case PositionType.Deck: {
				const cardPR = positions.getCardDeckPosition(card, position)

				cardPrototypes.push({
					key: card.id,
					card: card,
					isFlipped: true,
					position: cardPR.position,
					rotation: cardPR.rotation
				})

				break
			}

			case PositionType.DiscardPile: {
				const cardPR = positions.getCardDiscardPilePosition(card, position)
				
				cardPrototypes.push({
					key: card.id,
					card: card,
					isFlipped: false,
					position: cardPR.position,
					rotation: cardPR.rotation
				})
				break
			}

			case PositionType.Board: {
				const cardPR = positions.getBasePosition(card)

				cardPrototypes.push({
					key: card.id,
					card: card,
					isFlipped: false,
					position: cardPR.position,
					rotation: cardPR.rotation
				})
				break
			}

			case PositionType.BasesDeck: {
				const cardPR = positions.getBasesDeckPosition(card)

				cardPrototypes.push({
					key: card.id,
					card: card,
					isFlipped: true,
					position: cardPR.position,
					rotation: cardPR.rotation
				})

				break
			}

			case PositionType.isAboutToBePlayed: {
				const cardPR = positions.getAboutToBePlayedPosition(card, position)

				cardPrototypes.push({
					key: card.id,
					card: card,
					isFlipped: false,
					position: cardPR.position,
					rotation: cardPR.rotation
				})

				break
			}

			case PositionType.Base: {

				const cardPR = positions.getCardOnBasePosition(card, position)

				cardPrototypes.push({
					key: card.id,
					card: card,
					isFlipped: false,
					position: cardPR.position,
					rotation: cardPR.rotation
				})
				break
			}

			case PositionType.Minion: {

				const cardPR = positions.getCardOnMinionPosition(card, position)

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