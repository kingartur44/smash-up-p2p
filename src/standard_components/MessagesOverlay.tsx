import { useGameScreenContext } from "../GameScreenContext"
import classes from "./MessagesOverlay.module.css"
import { observer } from "mobx-react-lite";

export const MessagesOverlay = observer(() => {

	const { clientGameState, gameServer } = useGameScreenContext()

	switch (clientGameState.currentAction.type) {
		case "None": {
			return null
		}

		case "ChooseTarget": {
			const canSelectNull = clientGameState.currentAction.canSelectNull
			const selectNullCallback = () => {
				gameServer.sendServerMessage({
					type: "pick_target",
					cardId: null,
					playerID: gameServer.playerID
				})
			}

			return <div className={classes.prompt_screen}>
				<span>{clientGameState.currentAction.prompt}</span>
				{canSelectNull && <button onClick={selectNullCallback}>Select None</button>}
			</div>
		}
	}
})