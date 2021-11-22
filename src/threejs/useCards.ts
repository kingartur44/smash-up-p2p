import { useGameScreenContext } from "../GameScreenContext"
import { Card3DModelProps } from "./Card3DModel"
import { usePositions } from "./usePositions"


export function useCards(): Card3DModelProps[] {
	const { gameState, gameServer } = useGameScreenContext()

	const positions = usePositions()

	let cardPrototypes: Card3DModelProps[] = []

	for (const card of Object.values(gameState.cards)) {
		const position = card.position
		switch (position.position) {
			case "hand": {
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

			case "discard-pile": {
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

			case "board": {
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

			case "bases_deck": {
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

			case "is-about-to-be-played": {
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

			case "base": {

				const cardPR = positions.getCardOnBasePosition(card, position)

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