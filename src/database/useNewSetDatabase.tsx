import { useEffect, useState } from "react";
import initSqlJs, { Database } from "sql.js"


export interface Faction {
	faction_id: number
	name: string
}

export interface DatabaseCard_2 {
	card_id: number
	faction_id: number
	type: string
	name: string
	description: string
	image: string
	quantity: number

	effect: string
}

export interface DatabaseMinionCard_2 extends DatabaseCard_2 {
	type: "minion"

	printed_power: number
}

type NewSetDatabaseResult = {
	database?: Database
}

export function useNewSetDatabase(): NewSetDatabaseResult {
	const [database, setDatabase] = useState(undefined as Database | undefined)


	// Init of the database del database
	useEffect(() => {
		(async () => {
			const SQL = await initSqlJs({
				// Required to load the wasm binary asynchronously. Of course, you can host it wherever you want
				// You can omit locateFile completely when running in node
				locateFile: file => `https://sql.js.org/dist/${file}`
			});
			const db = new SQL.Database();
			db.run(`
				CREATE TABLE factions (
					faction_id 	INTEGER PRIMARY KEY,
					name 		TEXT NOT NULL
				);
		
				CREATE TABLE cards (
					card_id 		INTEGER PRIMARY KEY,
					faction_id		INTEGER,
		
					type			TEXT CHECK( type IN ('minion', 'action', 'base', 'titan') ),
					name			TEXT NOT NULL,
					description 	TEXT NOT NULL,
					image			TEXT NOT NULL,
					effect			TEXT NOT NULL,
					quantity		INTERGER NOT NULL,

					printed_power	INTEGER,
		
					FOREIGN KEY (faction_id)
					  REFERENCES factions (faction_id) 
				);
			`)
		
			const testFunction = (table_name: string) => {
				console.log("Hello world from", table_name)
			}
			db.create_function("test_function", testFunction)


			for (const action of ["INSERT", "UPDATE", "DELETE"]) {
				for (const table of ["factions", "cards"]) {
					db.run(`
						CREATE TRIGGER ${table}_${action.toLowerCase()}
							BEFORE ${action} ON ${table}
						BEGIN
							SELECT test_function('${table}');
						END
					`)
				}
			}
			
			db.exec(`
				INSERT INTO factions ( name ) VALUES ( $name )
			`, {
				"$name": "Aliens"
			})

			setDatabase(db)
		})()
	}, [])

	
	return {
		database: database
	}
}