import { FC, Suspense, useRef } from 'react'
import { Camera, Canvas } from '@react-three/fiber'
import { MapControls, PerspectiveCamera, useContextBridge } from '@react-three/drei'
import { Euler } from 'three'
import { GameScreenContext } from '../react/views/GameScreenContext'
import { observer } from 'mobx-react-lite'
import { Table } from './Table'
import { Card3DModel } from './Card3DModel'
import { useCards } from './useCards'
import { EndTurnButton } from './EndTurnButton'
import { LeftBar } from './LeftBar'


interface ThreeJSContainerProps {
	
}
export const ThreeJSContainer: FC<ThreeJSContainerProps> = observer(() => {


	return <div>
		<div style={{display: "flex"}}>
			<LeftBar />
			<Suspense fallback={"Loading..."}>
				<ThreeFiberScene />
			</Suspense>
		</div>
		<div>
			<EndTurnButton />
		</div>
	</div>
})




export const ThreeFiberScene = observer(() => {
	const currentCamera = useRef<Camera>()

	const cardsProps = useCards()

	const ContextBridge = useContextBridge(GameScreenContext)

	return <div style={{
		width: 800,
		height: 720
	}}> 
		<Canvas>
			<color attach="background" args={["#dadada"]} />
			{/* <MapControls camera={currentCamera.current} /> */}

			<ContextBridge>
				<PerspectiveCamera ref={currentCamera}
					rotation={new Euler(-Math.PI / 4)}
					position={[0, 0, -6]}
				>
					<ambientLight />
					
					<Table />

					{cardsProps.map(cardProps => {
						return <Card3DModel {...cardProps} />
					})}
				</PerspectiveCamera>
			</ContextBridge>
		</Canvas>
	</div>
})