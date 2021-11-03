import { FC } from "react"
import { GameCurrentActionType } from "../../core_game/game/GameState"
import { useGameScreenContext } from "./GameScreenContext"
import classes from "./PromptsScreen.module.css"

export const PromptsScreen: FC = () => {

	const { gameState } = useGameScreenContext()

	switch (gameState.currentAction.type) {
		case GameCurrentActionType.None: {
			return null
		}

		case GameCurrentActionType.ChooseTarget: {
			return <div className={classes.prompt_screen}>
				{gameState.currentAction.prompt}
			</div>
		}
	}

}