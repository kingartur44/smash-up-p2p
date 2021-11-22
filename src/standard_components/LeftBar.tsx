import { useGameScreenContext } from "../GameScreenContext"
import card_back from "../assets/standard_card_back.png";
import classes from "./LeftBar.module.css"
import { observer } from "mobx-react-lite";

export const LeftBar = observer(() => {

	const { gameState, hoveredCard } = useGameScreenContext()
	const gameCard = hoveredCard ? gameState.getCard(hoveredCard) : undefined

	
	const textureName = (() => {
		if (!gameCard) {
			return undefined
		}
		const imageName = (gameCard.databaseCard as any).image as string | undefined;
		const hasCustomImage = imageName !== undefined;
		return hasCustomImage ? imageName : card_back
	})()

	

	return <div className={classes.left_Bar}>
		{gameCard && <div className={classes.card_info}>
			<img alt="" src={textureName} />
			<p>{gameCard.databaseCard.name}</p>
			{gameCard.isBaseCard() && <p>
				Breakpoint: {gameCard.breakpoint}
			</p>}
			<p>{gameCard.databaseCard.description}</p>
		</div>}
		
	</div>
})