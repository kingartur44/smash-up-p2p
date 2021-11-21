import React, { FC, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { GameServer } from '../../core_game/GameServer';
import { OtherPlayersScreen } from './OtherPlayersScreen';
import { CurrentPlayerScreen } from './CurrentPlayerScreen';
import { GameScreenContext, useGameScreenContext } from './GameScreenContext';
import { Card } from '../components/Card';
import { BaseGameCard } from "../../core_game/game/cards/BaseGameCard";
import { PromptsScreen } from './PromptsScreen';

interface GameScreenProps {
	gameServer: GameServer;
}
export const GameScreen: FC<GameScreenProps> = observer(({ gameServer }) => {

	const [selectedCard, setSelectedCard] = useState(null as number | null)
	const [hoveredCard, setHoveredCard] = useState(null as number | null)

	return <GameScreenContext.Provider value={{
		gameServer: gameServer,
		gameState: gameServer.gameState,
		selectedCard, setSelectedCard,
		hoveredCard, setHoveredCard
	}}>
		<div style={{
			background: "black",
			height: "100vh",
			display: "grid",
			gridTemplateRows: "10% 75% 15%",
			gridTemplateColumns: "15% auto",
			gridTemplateAreas: `
			"other-players other-players other-players"
			"leaderboard board board"
			"current-player current-player current-player"`
		}}>
			<PromptsScreen />
			<OtherPlayersScreen style={{
				gridArea: "other-players",
				borderBottom: "1px solid white",
				color: 'white'
			}} />
			<Leaderboard style={{
				gridArea: "leaderboard",
				borderRight: "1px solid white",
				color: 'white'
			}} />
			<BoardScreen style={{
				gridArea: "board",
				color: 'white'
			}} />
			<CurrentPlayerScreen style={{
				gridArea: "current-player",
				borderTop: "1px solid white",
				color: 'white'
			}} />
		</div>
	</GameScreenContext.Provider> 
});


interface LeaderboardProps {
	style?: React.CSSProperties
}
const Leaderboard: FC<LeaderboardProps> = observer(({style}) => {
	const { gameServer } = useGameScreenContext()

	return <div style={style}>
		Leaderboard
		<div>
			{
				gameServer.gameState.players
					.slice().sort((playerA, playerB) => playerA.victoryPoints - playerB.victoryPoints)
					.map(player => {
						return <div style={{color: player.color}}>
							{player.name} - {player.victoryPoints} VP
						</div>
					})
			}
		</div>
	</div>
})

interface BoardScreenProps {
	style?: React.CSSProperties
}
const BoardScreen: FC<BoardScreenProps> = observer(({style}) => {
	const { gameServer, gameState } = useGameScreenContext()

	return <div style={style}>
		{gameServer.gameState.in_play_bases.map(baseCardId => {
			const baseCard = gameState.cards[baseCardId] as BaseGameCard
			return <div>
				<Card key={baseCardId} card={baseCard} />
				<div style={{paddingLeft: 50}}>
					{baseCard.attached_cards.map(attachedCardID => {
						const attachedCard = gameState.cards[attachedCardID]
						return <Card key={attachedCardID} card={attachedCard} />
					})}
				</div>
			</div>
		})}
	</div>
})

