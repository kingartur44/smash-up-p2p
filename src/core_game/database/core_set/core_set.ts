import { DatabaseCard } from "../DatabaseCard"
import * as AliensFile from "./aliens"
import * as DinousaursFile from "./dinosaurs"

export const Cards: Record<string, DatabaseCard> = {
	...AliensFile.Cards,
	...DinousaursFile.Cards,
}

export const Bases = [
	...AliensFile.Bases,
	...DinousaursFile.Bases
]

export const Aliens = AliensFile.Deck

export const Dinosaurs = DinousaursFile.Deck