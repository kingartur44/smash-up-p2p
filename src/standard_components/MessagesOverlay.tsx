import { useGameScreenContext } from "../GameScreenContext"
import classes from "./MessagesOverlay.module.css"
import { observer } from "mobx-react-lite";

export const MessagesOverlay = observer(() => {

	const { clientGameState, gameServer } = useGameScreenContext()

	const currentAction = clientGameState.currentAction

	switch (currentAction.type) {
		case "None": {
			return null
		}

		case "ChooseTarget": {
			const canSelectNull = currentAction.canSelectNull
			const selectNullCallback = () => {
				gameServer.sendServerMessage({
					type: "pick_target",
					cardId: null,
					playerID: gameServer.playerID
				})
			}

			if (currentAction.playerID !== gameServer.playerID) {
				return <div className={classes.prompt_screen}>
					<span>The other player is making a choice..</span>
				</div>
			}

			return <div className={classes.prompt_screen}>
				<span>{currentAction.prompt}</span>
				{canSelectNull && <button onClick={selectNullCallback}>Select None</button>}
			</div>
		}
	}
})