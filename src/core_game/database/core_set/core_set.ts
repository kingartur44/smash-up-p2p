import { BaseDatabaseCard, DatabaseCard, MinionDatabaseCard } from "../DatabaseCard"
import * as AliensFile from "./aliens"
import { Factions } from "./Factions"

export const Cards: Record<string, DatabaseCard> = {
	"base-01": new BaseDatabaseCard({
		id: "base-01",
		name: "The Homeworld",
		description: "After each time a minion is played here, its owner may play an extra minion of power 2 or less.",
		faction: Factions.Aliens,
		breakpoint: 23,
		points: [4, 2, 1]
	}),
	"base-02": new BaseDatabaseCard({
		id: "base-02",
		name: "The Mothership",
		description: "After this base scores, the winner may return one of his or her minions of power 3 or less from here to his or her hand.",
		faction: Factions.Aliens,
		breakpoint: 20,
		points: [4, 2, 1]
	}),

	"base-03": new BaseDatabaseCard({
		id: "base-03",
		name: "Jungle Oasis",
		description: "",
		faction: Factions.Dinosaurs,
		breakpoint: 12,
		points: [2, 0, 0]
	}),
	"base-04": new BaseDatabaseCard({
		id: "base-04",
		name: "Tar Pits",
		description: "After each time a minion is destroyed here, place it at the bottom of its owner’s deck",
		faction: Factions.Dinosaurs,
		breakpoint: 16,
		points: [4, 3, 2]
	}),


	...AliensFile.Cards,
	
	"dinosaurs-01": new MinionDatabaseCard({
		id: "dinosaurs-01",
		name: "Dinosaur 1",
		description: "Dinosaur 1",
		faction: Factions.Dinosaurs,
		power: 2
	})
}

export const Bases = [
	Cards["base-01"],
	Cards["base-02"],
	Cards["base-03"],
	Cards["base-04"]
]

export const Aliens = AliensFile.Deck

export const Dinosaurs = [
	Cards["dinosaurs-01"], Cards["dinosaurs-01"], Cards["dinosaurs-01"], Cards["dinosaurs-01"],
	Cards["dinosaurs-01"], Cards["dinosaurs-01"], Cards["dinosaurs-01"], Cards["dinosaurs-01"],
	Cards["dinosaurs-01"], Cards["dinosaurs-01"], Cards["dinosaurs-01"], Cards["dinosaurs-01"],
	Cards["dinosaurs-01"], Cards["dinosaurs-01"], Cards["dinosaurs-01"], Cards["dinosaurs-01"],
	Cards["dinosaurs-01"], Cards["dinosaurs-01"], Cards["dinosaurs-01"], Cards["dinosaurs-01"],
]