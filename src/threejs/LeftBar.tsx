import { useGameScreenContext } from "../react/views/GameScreenContext"
import card_back from "../assets/standard_card_back.png";

export const LeftBar = () => {

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

	

	return <div style={{width: 250, padding: 5, display: "flex", flexDirection: "column", alignItems: "center"}}>
		{gameCard && <div>
			<img alt="" style={{width: "90%"}} src={textureName} />
			<p>{gameCard.databaseCard.name}</p>
			<p>{gameCard.databaseCard.description}</p>
		</div>}
		
	</div>
}