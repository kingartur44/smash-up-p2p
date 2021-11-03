import { observer } from "mobx-react-lite"
import { FC } from "react"
import { servicesVersion } from "typescript"
import { GameCurrentActionType } from "../../core_game/game/GameState"
import { useGameScreenContext } from "./GameScreenContext"
import classes from "./PromptsScreen.module.css"

export const PromptsScreen: FC = observer(() => {

	const { gameState, gameServer } = useGameScreenContext()

	switch (gameState.currentAction.type) {
		case GameCurrentActionType.None: {
			return null
		}

		case GameCurrentActionType.ChooseTarget: {
			const canSelectNull = gameState.currentAction.canSelectNull
			const selectNullCallback = () => {
				gameServer.sendGameMessage({
					type: "pick_target",
					cardId: null,
					playerID: gameServer.playerID
				})
			}

			return <div className={classes.prompt_screen}>
				<span>{gameState.currentAction.prompt}</span>
				{canSelectNull && <button onClick={selectNullCallback}>Select None</button>}
			</div>
		}
	}

})