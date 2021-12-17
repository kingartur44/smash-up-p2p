import { FC, useMemo, useState } from 'react';
import { useLoader, Vector3 } from '@react-three/fiber';
import { Html, Text } from '@react-three/drei';
import { DoubleSide, Euler, Shape, TextureLoader } from 'three';
import { observer } from 'mobx-react-lite';
import { useGameScreenContext } from '../GameScreenContext';
import { useSpring, animated } from '@react-spring/three'
import { usePositions } from './usePositions';
import { drawRectFromCenter } from './Table';

import standard_card_back from "../assets/standard_card_back.png";
import base_card_back from "../assets/base_card_back.png"
import { ClientGameCard } from '../core_game/client_game/ClientGameState';
import { PositionType } from '../core_game/game/position/Position';


function useGameCard(card: ClientGameCard) {
	const {
		gameServer,
		clientGameState,
		selectedCard,
		setSelectedCard,
	} = useGameScreenContext()

	const isSelected = selectedCard === card.id

	const isPlayable = useMemo(() => {
		return card.isPlayable
	}, [card.isPlayable])

	const isATargetCard = (() => {
		if (selectedCard !== null) {
			if (clientGameState.cards[selectedCard].targets.includes(card.id)) {
				return true
			}
		}
		
		if (clientGameState.currentAction.type === "ChooseTarget") {
			if (clientGameState.currentAction.possibleTargets.includes(card.id)) {
				return true
			} 
		}

		return false
	})()

	const onCardAction = () => {
		if (clientGameState.currentAction.type === "ChooseTarget") {
			if (clientGameState.currentAction.playerID === gameServer.playerID) {
				gameServer.sendServerMessage({
					type: "pick_target",
					cardId: card.id,
					playerID: gameServer.playerID,
				})
			}
		} else if (selectedCard === card.id && card.type === "action") {
			gameServer.sendServerMessage({
				type: "play_card",
				playerID: gameServer.playerID,
				card_id: selectedCard
			})
		} else if (card.position.positionType === PositionType.Hand) {
			if (!isPlayable) {
				return
			}
			setSelectedCard(card.id)
		} else if (isATargetCard) {
			if (selectedCard !== null) {
				gameServer.sendServerMessage({
					type: "play_card",
					playerID: gameServer.playerID,
					card_id: selectedCard,
					position: {
						positionType: PositionType.Base,
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

export interface Card3DModelProps {
	position?: Vector3;
	rotation?: Euler;
	isFlipped?: boolean;

	card: ClientGameCard;
	key: any
}
export const Card3DModel: FC<Card3DModelProps> = observer(({ position: propsPosition, rotation: propsRotation, isFlipped, card }) => {

	const {
		setHoveredCard
	} = useGameScreenContext()


	const { CARD_WIDTH, CARD_HEIGHT} = usePositions()

	// Immagine Carta
	const imageName = card.databaseCard.image as string
	const hasCustomImage = imageName !== undefined;
	const textureName = (hasCustomImage && !isFlipped) ? imageName : (
		card.type === "base" ? base_card_back : standard_card_back
	)
	const texture = useLoader(TextureLoader, textureName);

	// Gestione colore
	const [isHovered, setIsHovered] = useState(false);

	const { isPlayable, isATargetCard, isSelected, onCardAction } = useGameCard(card)

	const effectiveRotation = useMemo(() => {
		const pRotation = propsRotation || new Euler();
		return pRotation;
	}, [ propsRotation ]);

	// Animazioni
	const { position, rotation } = useSpring({
		position: propsPosition,
		rotation: effectiveRotation
	})

	const cardSize = useMemo(() => {
		if (card.type === "base") {
			return {
				width: CARD_HEIGHT,
				height: CARD_WIDTH
			}
		}
		return {
			width: CARD_WIDTH,
			height: CARD_HEIGHT
		}
	}, [card, CARD_WIDTH, CARD_HEIGHT])
	
	const cardOutlineColor = (() => {
		if (isPlayable || isSelected) {
			return "yellow"
		}
		if (isATargetCard) {
			return "red"
		}
		return undefined
	})()

	const powerIndicator = (() => {
		if (card.type !== "minion") {
			return null
		}
		if (card.position.positionType !== PositionType.Base) {
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

	const outlineShape = useMemo(() => {
		const shape = new Shape()
		drawRectFromCenter({shape, centerX: 0, centerY: 0, width: cardSize.width, height: cardSize.height})
		return shape
	}, [cardSize])

	const showActionPlayButton = (() => {
		return isSelected && isPlayable && card.type === "action"
	})()

	return <animated.group position={position as any} rotation={rotation} scale={isHovered ? 1.05 : 1}>
		<mesh onPointerOver={event => {
				event.stopPropagation()
				setIsHovered(true)
				setHoveredCard(isFlipped ? null : card.id)
			}}
			onPointerOut={event => {
				event.stopPropagation()
				setIsHovered(false)
			}}
			onClick={onCardAction}
		>
			<planeBufferGeometry attach="geometry" args={[cardSize.width, cardSize.height]} />
			<meshBasicMaterial attach="material"
				map={texture}
				side={DoubleSide}
			/>
		</mesh>

		{cardOutlineColor && <line>
			<shapeBufferGeometry args={[outlineShape]} />
			<lineBasicMaterial linewidth={8} color={cardOutlineColor} />
		</line>}

		{powerIndicator}

		{showActionPlayButton && <>
			<Html transform sprite
				position={[0, cardSize.height / 2, 0]}
			>
				<button onClick={onCardAction} style={{transform:"translateY(-66%)", fontSize: "xx-small"}}>
					Play
				</button>
			</Html>
		</>}
	</animated.group>
})
