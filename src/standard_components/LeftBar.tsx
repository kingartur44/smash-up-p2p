import { useGameScreenContext } from "../GameScreenContext"
import card_back from "../assets/standard_card_back.png";
import classes from "./LeftBar.module.css"
import { observer } from "mobx-react-lite";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import Sentiment from "sentiment";
import { EndTurnButton } from "../threejs/EndTurnButton";

export const LeftBar = observer(() => {

	const { clientGameState, hoveredCard } = useGameScreenContext()
	const gameCard = hoveredCard ? clientGameState.cards[hoveredCard] : undefined

	
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
			{gameCard.type === "base" && <p>
				Breakpoint: {gameCard.breakpoint}
			</p>}
			<p className={classes.card_description}>{gameCard.databaseCard.description}</p>
		</div>}

		<div className={classes.spacer} />
		
		<MessagesBox />

		<EndTurnButton />
	</div>
})


const SentimentAnalyzer = new Sentiment()
interface ChatMessage {
	author: string
	message: string
	sentiment: number
}
const MessagesBox: FC = observer(() => {
	const { gameServer, clientChatManager } = useGameScreenContext()

	const [message, setMessage] = useState("")

	const sendMessage: React.FormEventHandler<HTMLFormElement> = (event) => {
		event.preventDefault()

		gameServer.sendChatMessage(message)
		setMessage("")
	}

	const messagesList: ChatMessage[] = useMemo(() => {
		return clientChatManager.messages.map(message => {
			return {
				author: message.author,
				message: message.message,
				sentiment: SentimentAnalyzer.analyze(message.message).score
			} as ChatMessage
		})
	}, [clientChatManager.messages])


	const messagesContainerRef = useRef<HTMLDivElement>(null)
	useEffect(() => {
		messagesContainerRef.current?.scrollTo({
			top: messagesContainerRef.current?.scrollHeight,
			behavior: "smooth"
		})
	}, [messagesList])

	
	return <div className={classes.chat_box}>
		<div ref={messagesContainerRef} className={classes.messages_container}>
			{messagesList.map((message, index) => {
				const sentimentEmoji = message.sentiment >= 0
					? '😁'
					: '😡'

				return <div key={index} className={classes.message}>
					<span className={classes.message_author}>{message.author}</span>
					<span>{message.message}</span>
					<span className={classes.sentimentEmoji}>{sentimentEmoji}</span>
				</div>
			})}
		</div>
		<form onSubmit={sendMessage}>
		
			<input value={message}
				onChange={event => setMessage(event.target.value)}
				placeholder="Write a message to your opponents..."
			/>
			<button>Send</button>
		</form>
	</div>
})