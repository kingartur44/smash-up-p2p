import { GameState } from "../../game/GameState"
import { ActionDatabaseCard, DatabaseCard, MinionDatabaseCard } from "../DatabaseCard"
import { Factions } from "./Factions"


export const Cards: Record<string, DatabaseCard> = {
	"aliens-01-supreme-overlord": new MinionDatabaseCard({
		id: "aliens-01-supreme-overlord",
		name: "Supreme Overlord",
		description: "You may return a minion to its owner’s hand.",
		power: 5,
		faction: Factions.Aliens,
		effects: (gameState: GameState) => {
			return {
				onPlay: () => {
					
				}
			}
		}
	}),

	"aliens-02-invader": new MinionDatabaseCard({
		id: "aliens-02-invader",
		name: "Invader",
		description: "Gain 1 VP.",
		power: 3,
		faction: Factions.Aliens
	}),

	"aliens-03-scout": new MinionDatabaseCard({
		id: "aliens-03-scout",
		name: "Scout",
		description: "Special: After this base is scored, you may place this minion into your hand instead of the discard pile.",
		power: 3,
		faction: Factions.Aliens
	}),

	"aliens-04-collector": new MinionDatabaseCard({
		id: "aliens-04-collector",
		name: "Collector",
		description: "You may return a non-Collector minion of power 3 or less on this base to its owner’s hand.",
		power: 2,
		faction: Factions.Aliens
	}),

	"aliens-05-abduction": new ActionDatabaseCard({
		id: "aliens-05-abduction",
		name: "Abduction",
		description: "Return a minion to its owner’s hand. Play an extra minion.",
		power: 0,
		faction: Factions.Aliens
	}),

	"aliens-06-beam-up": new ActionDatabaseCard({
		id: "aliens-06-beam-up",
		name: "Beam Up",
		description: "Return a minion to its owner’s hand.",
		power: 0,
		faction: Factions.Aliens
	}),

	"aliens-07-crop-circles": new ActionDatabaseCard({
		id: "aliens-07-crop-circles",
		name: "Crop Circles",
		description: "Choose a base. Return each minion on that base to its owner’s hand.",
		power: 0,
		faction: Factions.Aliens
	}),

	"aliens-06-disintegrator": new ActionDatabaseCard({
		id: "aliens-06-disintegrator",
		name: "Disintegrator",
		description: "Return a minion to its owner’s hand.",
		power: 0,
		faction: Factions.Aliens
	}),

	"aliens-07-invasion": new ActionDatabaseCard({
		id: "aliens-07-invasion",
		name: "Invasion",
		description: "Move a minion to another base.",
		power: 0,
		faction: Factions.Aliens
	}),

	"aliens-08-jammeed-signal": new ActionDatabaseCard({
		id: "aliens-08-jammeed-signal",
		name: "Jammed Signal",
		description: "Play on a base. Ongoing: All players ignore this base’s ability.",
		power: 0,
		faction: Factions.Aliens
	}),

	"aliens-09-probe": new ActionDatabaseCard({
		id: "aliens-09-probe",
		name: "Probe",
		description: "Look at another player’s hand and choose a minion in it. That player discards that minion.",
		power: 0,
		faction: Factions.Aliens
	}),

	"aliens-10-terraforming": new ActionDatabaseCard({
		id: "aliens-10-terraforming",
		name: "Terraforming",
		description: "Search the base deck for a base. Swap it with a base in play (discard all actions attached to it). All minions from the original base remain. Shuffle the base deck. You may play an extra minion on the new base.",
		power: 0,
		faction: Factions.Aliens
	}),
}

export const Deck = [
	Cards["aliens-01-supreme-overlord"],
	Cards["aliens-02-invader"], Cards["aliens-02-invader"],
	Cards["aliens-03-scout"], Cards["aliens-03-scout"], Cards["aliens-03-scout"],
	Cards["aliens-04-collector"], Cards["aliens-04-collector"], Cards["aliens-04-collector"], Cards["aliens-04-collector"],

	Cards["aliens-05-abduction"],
	Cards["aliens-06-beam-up"], Cards["aliens-06-beam-up"],
	Cards["aliens-07-crop-circles"],
	Cards["aliens-06-disintegrator"], Cards["aliens-06-disintegrator"],
	Cards["aliens-07-invasion"],
	Cards["aliens-08-jammeed-signal"],
	Cards["aliens-09-probe"],
	Cards["aliens-10-terraforming"],
]