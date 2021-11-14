import { RoundedBox } from "@react-three/drei"
import { Vector3 } from "@react-three/fiber"
import { useRef } from "react"
import { Mesh } from "three"

export const OldTable = () => {

	const boxRef = useRef<Mesh>(null)

	const geometry = boxRef.current?.geometry

	return <group position={[0, 0, 0]}>
		<RoundedBox
			args={[10, 10]}
			ref={boxRef}
			radius={0.05} smoothness={4}
		>
			<meshPhongMaterial attach="material" color="#BA8C63" />
		</RoundedBox>

		{
			([
				[4.5, 4.5, -3],
				[-4.5, 4.5, -3],
				[4.5, -4.5, -3],
				[-4.5, -4.5, -3]
			] as Vector3[]).map((position, index) => {
				return <RoundedBox
					key={index}
					args={[1, 1, 6]}
					position={position}
					radius={0.05} smoothness={4}
				>
					<meshPhongMaterial attach="material" color="#BA8C63" />
				</RoundedBox>
			})
		}

		<mesh>
			<lineSegments geometry={geometry} renderOrder={100}>
				<lineBasicMaterial color="black" />
			</lineSegments>
		</mesh>

	</group>
}