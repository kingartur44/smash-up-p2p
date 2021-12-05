import { observer } from "mobx-react-lite"
import { FC } from "react"
import { useGameScreenContext } from "../GameScreenContext"
import classes from "./EndTurnButton.module.css"

export const EndTurnButton: FC = observer(() => {
	const { gameServer, clientGameState } = useGameScreenContext()

	const endTurn = () => {
		gameServer.sendServerMessage({
			type: "end_turn",
			playerID: gameServer.playerID
		})
	}

	const isYellowBackground = (() => {
		if (clientGameState.phase !== "GameTurn_PlayCards") {
			return false
		}

		for (const card of Object.values(clientGameState.cards)) {
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