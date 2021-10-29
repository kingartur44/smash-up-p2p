import React, { FC, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { GameServer } from './core_game/GameServer';
import { GameScreen } from './react/views/GameScreen';


export const App = observer(() => {

	const [gameServer] = useState(new GameServer())

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

	return <GameScreen gameServer={gameServer} />
})

interface ConnectComponentProps {
	gameServer: GameServer
}
const ConnectComponent: FC<ConnectComponentProps> = ({gameServer}) => {

	const [value, setValue] = useState("")


	const connect = () => {
		gameServer.connectionManager.connect(value)
	}

	return <div>
		<input value={value} onChange={e => setValue(e.target.value)} />
		<button onClick={connect}>Connect</button>
	</div>
}

export default App;
