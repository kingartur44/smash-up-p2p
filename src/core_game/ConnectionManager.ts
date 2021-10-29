import { makeAutoObservable } from "mobx";
import Peer from "peerjs";
import { GameServer } from "./GameServer";


export class ConnectionManager {
	gameServer: GameServer
	
	isMaster: boolean
	peer: Peer
	peerID?: string
	dataConnection?: Peer.DataConnection

	constructor(gameServer: GameServer) {
		this.gameServer = gameServer

		this.isMaster = true
		this.peer = new Peer()
		this.peer.on("open", id => {
			this.peerID = id
		})
		this.peer.on("connection", dataConnection => {
			this.isMaster = false
			this.setDataConnection(dataConnection)
		})

		makeAutoObservable(this)
	}

	connect(otherPeerId: string) {
		this.isMaster = true
		this.setDataConnection(this.peer.connect(otherPeerId))
	}

	get isConnected(): boolean {
		return this.dataConnection !== undefined
	}

	get playerID(): number {
		return this.isMaster ? 0 : 1
	}

	setDataConnection(dataConnection: Peer.DataConnection) {
		this.dataConnection = dataConnection
		this.dataConnection.on("data", this.gameServer.receiveGameMessage.bind(this.gameServer))
	}

	
}
