import { observer } from "mobx-react-lite";
import { FC, useMemo } from "react";
import { CardType } from "../../core_game/data/CardType";
import { GameCard } from "../../core_game/game/cards/GameCard";
import { GameCurrentActionType } from "../../core_game/game/GameState";
import { useGameScreenContext } from "../views/GameScreenContext";
import classes from "./Card.module.css"

export interface CardProps {
	card: GameCard
	style?: React.CSSProperties
}

export const Card: FC<CardProps> = observer(({card, style}) => {

	const { 
		gameServer,
		gameState,
		selectedCard,
		setSelectedCard
	} = useGameScreenContext()

	const isSelected = selectedCard === card.id

	const playable = useMemo(() => {
		if (!gameState.isClientOwnerTurn) {
			return false
		}
		
		return card.isPlayable
	}, [gameState.isClientOwnerTurn, card.isPlayable])

	const gameStateCurrentActionPossibleTargets = (() => {
		if (gameState.currentAction.type === GameCurrentActionType.ChooseTarget) {
			return gameState.currentAction.possibleTargets
		}
		return []		
	})()

	const isATargetCard = useMemo(() => {
		if (selectedCard === null) {
			return false
		}
		if (gameState.cards[selectedCard].targets.includes(card.id)) {
			return true
		}
		
		if (gameState.currentAction.type === GameCurrentActionType.ChooseTarget) {
			if (gameStateCurrentActionPossibleTargets.includes(card.id)) {
				return true
			}
		}

		return false
	}, [gameState.cards, selectedCard, card.id, gameState.currentAction, gameStateCurrentActionPossibleTargets])

	const clickOnCard = () => {
		if (card.position.position === "hand") {
			if (!playable) {
				return
			}
			setSelectedCard(card.id)
		} else if (card.position.position === "board" && card.type === CardType.Base) {
			if (selectedCard) {
				gameServer.sendGameMessage({
					type: "play_card",
					playerID: gameServer.playerID,
					card_id: selectedCard,
					position: {
						position: "base",
						base_id: card.id
					}
				})
				setSelectedCard(null)
			}
		} else if (gameState.currentAction.type === GameCurrentActionType.ChooseTarget) {
			gameServer.sendGameMessage({
				type: "pick_target",
				cardId: card.id,
				playerID: gameServer.playerID,
			})
		}
	}

	let className = classes.card 
	if (playable) {
		className += " " + classes.playable_card
	}
	if (isSelected) {
		className += " " + classes.selected_card
	}
	if (isATargetCard) {
		className += " " + classes.targeted_card
	}


	const tooltip = card.databaseCard.name + " - " +card.databaseCard.description

	if (card.isBaseCard()) {
		const playerPowers = card.sortedPlayersPower.map(({player, power}) => {
				return <span style={{color: player.color, paddingLeft: 10}}>
					{power}
				</span>
			})


		return <div data-tooltip={tooltip} className={className} style={style} onClick={clickOnCard}>
			{card.databaseCard.name} - Breakpoint {card.totalPowerOnBase} / {card.breakpoint} - {playerPowers}
		</div>
	}

	if (card.isMinionCard()) {
		return <div data-tooltip={tooltip} className={className} style={style} onClick={clickOnCard}>
			{card.databaseCard.name} - Power {card.power}
		</div>
	}

	return <div data-tooltip={tooltip} className={className} style={style} onClick={clickOnCard}>
		{card.databaseCard.name}
	</div>
	
})