import { observer } from "mobx-react-lite"
import { useGameScreenContext } from "../GameScreenContext"
import classes from "./TopBar.module.css"

export const TopBar = observer(() => {

	const { gameState } = useGameScreenContext()

	return <div className={classes.top_bar}>
		{gameState.players.map((player, index) => {
			return <div className={classes.player_detail} key={index}>
				{player.name} - {player.victoryPoints} VP
				<div className={classes.victory_points_detail}>
					{player.victoryPointsDetailed.map(item => {
						return <div>
							{item.amount} - {item.detail}
						</div>
					})}
				</div>
			</div>
		})}
	</div>
})