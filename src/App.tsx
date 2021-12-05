import { FC, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { GameServer } from './core_game/GameServer';
import { ThreeJSContainer } from './threejs/ThreeJSContainer';
import { GameCardId } from './core_game/game/GameState';
import { GameScreenContext } from './GameScreenContext';


export const App = observer(() => {
	const [gameServer] = useState(() =>{
		return new GameServer()
	})

	const [selectedCard, setSelectedCard] = useState(null as GameCardId | null)
	const [hoveredCard, setHoveredCard] = useState(null as GameCardId | null)

	useEffect(() => {
		const intervalID = setInterval(() => {
			gameServer.tick()
		}, 500)
		return () => {
			clearInterval(intervalID)
		}
	}, [gameServer])

	const copia = () => {
		navigator.clipboard.writeText(gameServer.connectionManager.peerID ?? "")
	}

	if (!gameServer.connectionManager.isConnected) {
		return <div>
			Peer {gameServer.connectionManager.peerID} <button onClick={copia}>COPIA</button>
			<ConnectComponent gameServer={gameServer} />
		</div>
	}

	return <GameScreenContext.Provider value={{
		gameServer: gameServer,
		clientGameState: gameServer.clientGameState,
		clientChatManager: gameServer.clientChatManager,
		
		selectedCard, setSelectedCard,
		hoveredCard, setHoveredCard
	}}>
		<ThreeJSContainer />
	</GameScreenContext.Provider>
})

interface ConnectComponentProps {
	gameServer: GameServer
}
const ConnectComponent: FC<ConnectComponentProps> = ({gameServer}) => {

	const [value, setValue] = useState("")

	const connect = () => {
		gameServer.connectionManager.connect(value)
	}

	const autoConnect = () => {
		if (gameServer.connectionManager.peerID !== undefined) {
			gameServer.connectionManager.connect(gameServer.connectionManager.peerID)
		}
		
	}

	return <div>
		<input value={value} onChange={e => setValue(e.target.value)} />
		<button onClick={connect}>Connect</button>
		<button onClick={autoConnect}>Auto Connect</button>
	</div>
}

export default App;
