import { FC, Suspense, useRef } from 'react'
import { Camera, Canvas } from '@react-three/fiber'
import { OrthographicCamera, useContextBridge } from '@react-three/drei'
import { Euler } from 'three'
import { GameScreenContext } from '../GameScreenContext'
import { observer } from 'mobx-react-lite'
import { Table } from './Table'
import { Card3DModel } from './Card3DModel'
import { useCards } from './useCards'
import { LeftBar } from '../standard_components/LeftBar'
import { MessagesOverlay } from '../standard_components/MessagesOverlay'
import { TopBar } from '../standard_components/TopBar'


export const ThreeJSContainer: FC = observer(() => {


	return <div>
		<div style={{display: "flex"}}>
			<TopBar />
			<LeftBar />
			<MessagesOverlay />
			<Suspense fallback={"Loading..."}>
				<ThreeFiberScene />
			</Suspense>
		</div>
	</div>
})




export const ThreeFiberScene = observer(() => {
	const currentCamera = useRef<Camera>()

	const cardsProps = useCards()

	const ContextBridge = useContextBridge(GameScreenContext)

	return <div style={{
		width: "100%",
		height: "100vh"
	}}> 
		<Canvas>
			<color attach="background" args={["cyan"]} />

			<ContextBridge>
				<OrthographicCamera ref={currentCamera}
					rotation={new Euler(-Math.PI / 5)}
					position={[0, 0, -6]}
				>
					<ambientLight />
					
					<Table />

					{cardsProps.map(cardProps => {
						return <Card3DModel {...cardProps} />
					})}
				</OrthographicCamera>
			</ContextBridge>
		</Canvas>
	</div>
})