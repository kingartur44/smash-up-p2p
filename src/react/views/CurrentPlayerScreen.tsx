import React, { FC } from 'react';
import { observer } from 'mobx-react-lite';
import classes from "./CurrentPlayerScreen.module.css"
import { Card } from '../components/Card';
import { useGameScreenContext } from './GameScreenContext';
import { GamePhase } from '../../core_game/game/GameState';

interface CurrentPlayerScreenProps {
	style?: React.CSSProperties;
}

export const CurrentPlayerScreen: FC<CurrentPlayerScreenProps> = observer(({ style }) => {
	const { gameServer, gameState } = useGameScreenContext()

	const player = gameServer.gameState.currentPlayer

	

	return <div style={style}>
		<div>CurrentPlayer</div>

		<div className={classes.container}>
			<div className={classes.stats}>
				<p>Deck: {player.deck.length}</p>
				<p>Minion Plays: {player.minionPlays}</p>
				<p>Action Plays: {player.actionPlays}</p>
			</div>

			<div className={classes.hand_container}>
				{player.hand.map(cardID => {
					const card = gameState.cards[cardID]
					return <Card style={{display: "inline"}} card={card} />
				})}
			</div>

			<div>
				<EndTurnButton />
			</div>

		</div>

	</div>;
});



const EndTurnButton: FC = observer(() => {
	const { gameServer, gameState } = useGameScreenContext()

	const endTurn = () => {
		gameServer.sendGameMessage({
			type: "end_turn",
			playerID: gameServer.playerID
		})
	}

	const isYellowBackground = (() => {
		if (!gameState.isClientOwnerTurn) {
			return false
		}

		if (gameState.phase !== GamePhase.GameTurn_Play) {
			return false
		}

		for (const card of Object.values(gameState.cards)) {
			if (card.isPlayable) {
				return false
			}
		}
		return true
	})()


	return <div style={{
		background: isYellowBackground ? "yellow" : undefined,
		color: isYellowBackground ? "black" : undefined
	}} className={classes.end_turn_button} onClick={endTurn}>
		END TURN
	</div>
})