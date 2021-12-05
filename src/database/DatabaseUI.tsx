import { FC, useCallback, useMemo, useState } from "react";
import { Database } from "sql.js";
import { DecoratedBox } from "./DecoratedBox";
import { DatabaseCard_2, DatabaseMinionCard_2, Faction, useNewSetDatabase } from "./useNewSetDatabase";



export const DatabaseUI = () => {
	

	return <CreateSetInterfaceWrapper />
};

export const CreateSetInterfaceWrapper: FC = () => {
	const { database } = useNewSetDatabase()

	if (database === undefined) {
		return <div>
			Creating the database...
		</div>
	}

	return <CreateSetInterface database={database} />
}

interface CreateSetInterfaceProps {
	database: Database
}
export const CreateSetInterface: FC<CreateSetInterfaceProps> = ({database}) => {
	
	const [factionName, setFactionName] = useState("")


	const createFaction = useCallback(() => {
		database.exec(`
			INSERT INTO factions ( name ) VALUES ( $name )
		`, {
			"$name": factionName
		})

		setFactionName("")
	}, [database, factionName])

	const factions: Faction[] = (() => {
		const query_result = database.exec("SELECT * FROM factions")[0]
		if (query_result === undefined) {
			return []
		}
		const data: Faction[] = []
		for (const values of query_result.values) {
			data.push({
				faction_id: values[0] as number,
				name: values[1] as string
			})
		}
		return data
	})()


	return <div>
		<DecoratedBox label="Crea nuova Fazione">
			Nome fazione: <input value={factionName} onChange={event => setFactionName(event.target.value)} />
			<br />
			<button onClick={createFaction}>Crea fazione</button>
		</DecoratedBox>
		<br />

		<DecoratedBox label="Fazioni">
			{factions.map(faction => <FactionBox database={database} faction={faction} />)}
		</DecoratedBox>
	</div>
}

interface FactionBoxPros {
	database: Database
	faction: Faction
}
export const FactionBox: FC<FactionBoxPros> = ({database, faction}) => {

	const [prototypeMinionCard, setPrototypeMinionCard] = useState(() => {
		const card: Omit<DatabaseMinionCard_2, "card_id"> = {
			type: "minion",
			faction_id: faction.faction_id,

			description: "",
			name: "",
			image: "",
			effect: "",

			printed_power: 0,
			quantity: 0
		}
		return card
	})


	const [selectedCardType, setSelectedCardType] = useState("minion")

	const setCardName = useCallback((newName: string) => {
		setPrototypeMinionCard(oldPrototype => {
			return {
				...oldPrototype,
				name: newName
			}
		})
	}, [])

	const setCardDescription = useCallback((newDescription: string) => {
		setPrototypeMinionCard(oldPrototype => {
			return {
				...oldPrototype,
				description: newDescription
			}
		})
	}, [])

	const setCardImage = useCallback((newImage: string) => {
		setPrototypeMinionCard(oldPrototype => {
			return {
				...oldPrototype,
				image: newImage
			}
		})
	}, [])

	const setCardEffect = useCallback((newEffect: string) => {
		setPrototypeMinionCard(oldPrototype => {
			return {
				...oldPrototype,
				effect: newEffect
			}
		})
	}, [])

	const setCardQuantity = useCallback((newQuantity: number) => {
		setPrototypeMinionCard(oldPrototype => {
			return {
				...oldPrototype,
				quantity: newQuantity
			}
		})
	}, [])

	const selectedCard = useMemo(() => {
		switch (selectedCardType) {
			case "minion": {
				return prototypeMinionCard
			}
		}
		return undefined
	}, [selectedCardType, prototypeMinionCard])

	const cards: DatabaseCard_2[] = (() => {
		const query_result = database.exec("SELECT * FROM cards")[0]
		if (query_result === undefined) {
			return []
		}
		const data: DatabaseCard_2[] = []
		for (const values of query_result.values) {
			data.push({
				card_id: values[0] as number,
				faction_id: values[1] as number,

				type: values[2] as string,
				name: values[3] as string,
				description: values[4] as string,
				image : values[5] as string,
				effect: values[6] as string,
				quantity: values[7] as number
			})
		}
		return data
	})()

	const createCard = useCallback(() => {
		if (selectedCard === undefined) {
			return 
		}

		database.exec(`
			INSERT INTO cards ( faction_id, type, name, description, image, effect, quantity ) 
			VALUES ( $faction_id, $type, $name, $description, $image, $effect, $quantity )
		`, {
			"$type": selectedCard.type,
			"$name": selectedCard.name,
			"$description": selectedCard.description,
			"$image": selectedCard.image,
			"$effect": selectedCard.effect,
			"$quantity": selectedCard.quantity
		})

		setCardDescription("")
		setCardName("")
		setCardImage("")
	}, [database, selectedCard, setCardDescription, setCardImage, setCardName])

	return <DecoratedBox label={faction.name}>
		<DecoratedBox direction="column" label="Crea carta per questa fazione">
			Tipo carta: <select value={selectedCardType} onChange={event => setSelectedCardType(event.target.value)} >
				<option value="minion">minion</option>
				<option value="action">action</option>
				<option value="base">base</option>
				<option value="titan">titan</option>
			</select>
			
			Nome carta <input 
				value={selectedCard?.name}
				onChange={event => setCardName(event.target.value)}
			/>
			
			Descrizione: <input
				value={selectedCard?.description}
				onChange={event => setCardDescription(event.target.value)}
			/>

			Quantità nel deck: <input type="number"
				value={selectedCard?.quantity}
				onChange={event => setCardQuantity(parseInt(event.target.value))}
			/>



			Immagine carta: <input type="file" onChange={event => {
				const reader = new FileReader();
				const file = event?.target?.files?.[0];
				if (!file) {
					return
				}
				reader.readAsDataURL(file)
				reader.onload = () => {
					setCardImage(reader.result?.toString() ?? "");
				}
			}} />
			
			Effetto: <textarea rows={5}
				value={selectedCard?.effect} 
				onChange={event => setCardEffect(event.target.value)}
			/>

			{(() => {
				switch (selectedCardType) {
					case "minion": {
						return <>
						Potere: <input type="number" value={prototypeMinionCard.printed_power} onChange={event => setPrototypeMinionCard(oldValue => ({
							...oldValue,
							printed_power: parseInt(event.target.value)
						}))} />
						<br />
						</>
						break
					}
					case "action": {
						break
					}
					case "base": {
						break
					}
					case "titan": {
						break
					}
				}
			})()}

			<button onClick={createCard}>Salva Carta</button>
		</DecoratedBox>
		<br />
		<DecoratedBox label="Cards">
			{cards.map(card => {
				return <div>
					<pre>{JSON.stringify({...card, image: undefined})}</pre>
					<img src={card.image} />
				</div>
			})}
		</DecoratedBox>
	</DecoratedBox>
}