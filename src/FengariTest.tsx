import { useEffect } from "react";
import { LuaFactory } from "wasmoon"


export const FengariTest = () => {


	useEffect(() => {
		(async () => {
			// Initialize a new lua environment factory
			// You can pass the wasm location as the first argument, useful if you are using wasmoon on a web environment and want to host the file by yourself
			const factory = new LuaFactory()
			// Create a standalone lua environment from the factory
			const lua = await factory.createEngine()

			try {
				// Set a JS function to be a global lua function
				const arrayEffects: any[] = []
				lua.global.set('addEffect', (x: any) => {
					arrayEffects.push(x)
				})
				// Run a lua string
				await lua.doString(`
					function multiply(x, y)
						return x * y
					end
					addEffect(multiply)
					addEffect({
						a = 54
					})
				`)
				lua.global.close()

				console.log(arrayEffects[0](2, 4))
			} finally {
				// Close the lua environment, so it can be freed
				lua.global.close()
			}
		})()
	}, [])


	return <div>
		Hello Fengari
	</div>;
};
