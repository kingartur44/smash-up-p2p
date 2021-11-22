import { observer } from "mobx-react-lite"
import { FC } from "react"
import { GamePhase } from "../core_game/game/GameState"
import { useGameScreenContext } from "../GameScreenContext"
import classes from "./EndTurnButton.module.css"

export const EndTurnButton: FC = observer(() => {
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

		if (gameState.phase !== GamePhase.GameTurn_PlayCards) {
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