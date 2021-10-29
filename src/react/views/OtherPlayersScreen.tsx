import React, { FC } from 'react';
import { observer } from 'mobx-react-lite';
import classes from "./OtherPlayersScreen.module.css"
import { useGameScreenContext } from './GameScreenContext';


interface OtherPlayersScreenProps {
	style?: React.CSSProperties;
}

export const OtherPlayersScreen: FC<OtherPlayersScreenProps> = observer(({ style }) => {

	const { gameServer } = useGameScreenContext()

	return <div style={style}>
		Other Players
		{gameServer.gameState.players
			.filter(player => player !== gameServer.gameState.currentPlayer)
			.map(player => {
				return <div className={classes.player_container}>
					<span>Deck {player.deck.length}</span>
					<span>Hand {player.hand.length}</span>
					<span>Discard Pile {player.discardPile.length}</span>
				</div>;
			})}

	</div>;
});
