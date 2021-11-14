import { FC, useMemo, useState } from 'react';
import { useLoader, Vector3 } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import card_back from "../assets/standard_card_back.png";
import { DoubleSide, Euler, TextureLoader } from 'three';
import { GameCard } from '../core_game/game/cards/GameCard';
import { observer } from 'mobx-react-lite';
import { useGameScreenContext } from '../react/views/GameScreenContext';
import { CardType } from '../core_game/data/CardType';
import { GameCurrentActionType } from '../core_game/game/GameState';
import { useSpring, animated } from '@react-spring/three'
import { usePositions } from './usePositions';

export interface Card3DModelProps {
	position?: Vector3;
	rotation?: Euler;
	isFlipped?: boolean;

	card: GameCard;
	key: any
}

function useGameCard(card: GameCard) {
	const {
		gameServer,
		gameState,
		selectedCard,
		setSelectedCard,
	} = useGameScreenContext()

	const isSelected = selectedCard === card.id

	const isPlayable = useMemo(() => {
		if (!gameState.isClientOwnerTurn) {
			return false
		}
		
		return card.isPlayable
	}, [gameState.isClientOwnerTurn, card.isPlayable])

	const isATargetCard = (() => {
		if (selectedCard !== null) {
			if (gameState.cards[selectedCard].targets.includes(card.id)) {
				return true
			}
		}
		
		if (gameState.currentAction.type === GameCurrentActionType.ChooseTarget) {
			if (gameState.currentAction.possibleTargets.includes(card.id)) {
				return true
			} 
		}

		return false
	})()

	const onCardAction = () => {
		if (gameState.currentAction.type === GameCurrentActionType.ChooseTarget) {
			gameServer.sendGameMessage({
				type: "pick_target",
				cardId: card.id,
				playerID: gameServer.playerID,
			})
		} else if (card.position.position === "hand") {
			if (!isPlayable) {
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
		}
	}


	return {
		isSelected,
		isPlayable,
		isATargetCard,

		onCardAction
	}
}

export const Card3DModel: FC<Card3DModelProps> = observer(({ position: propsPosition, rotation: propsRotation, isFlipped, card }) => {

	const {
		setHoveredCard
	} = useGameScreenContext()


	const { CARD_WIDTH, CARD_HEIGHT} = usePositions()

	// Immagine Carta
	const imageName = card.databaseCard.image
	const hasCustomImage = imageName !== undefined;
	const textureName = (hasCustomImage && !isFlipped) ? imageName : card_back
	const texture = useLoader(TextureLoader, textureName);

	// Gestione colore
	const [isHovered, setIsHovered] = useState(false);

	const { isPlayable, isATargetCard, isSelected, onCardAction } = useGameCard(card)

	const effectiveRotation = useMemo(() => {
		let pRotation = propsRotation || new Euler();
		return pRotation;
	}, [isFlipped, propsRotation]);

	// Animazioni
	const { position, rotation } = useSpring({
		position: propsPosition,
		rotation: effectiveRotation
	})

	
	const cardColor = (() => {
		if (isPlayable || isSelected) {
			return "yellow"
		}
		if (isATargetCard) {
			return "red"
		}
		return "white"
	})()


	const powerIndicator = (() => {
		if (!card.isMinionCard()) {
			return null
		}
		if (card.position.position !== "base") {
			return null
		}

		return <Text fontSize={0.5}
			rotation={new Euler(Math.PI / 4)}
			position={[0, -0.5, 0.5]}
			color={"white"}
			outlineWidth={0.02}
			outlineColor="black"
		>
			{card.power}
		</Text>
	})()

	return <animated.group position={position as any} rotation={rotation} scale={isHovered ? 1.05 : 1}>
		<mesh onPointerOver={event => {
				event.stopPropagation()
				setIsHovered(true)
				setHoveredCard(card.id)
			}}
			onPointerOut={event => {
				event.stopPropagation()
				setIsHovered(false)
			}}
			onClick={onCardAction}
		>
			<planeBufferGeometry attach="geometry" args={[CARD_WIDTH, CARD_HEIGHT]} />
			<meshBasicMaterial attach="material"
				map={texture}
				side={DoubleSide}
				opacity={1}
				color={cardColor}
			/>
		</mesh>

		{powerIndicator}

		{!hasCustomImage && (
			<Text position={[0, 0, 0.01]} color="black">
				{card.databaseCard.name}
			</Text>
		)}
	</animated.group>
})
