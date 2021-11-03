import { CardType } from "../../data/CardType"
import { generateSet } from "../utils"
import { Faction } from "./Factions"

 

const Set = generateSet(Faction.Aliens, [
	{
		type: CardType.Minion,
		quantityInDeck: 1,

		name: "Supreme Overlord",
		description: "You may return a minion to its owner’s hand.",
		power: 5,
		initializeEffects: async (card, gameState) => {
			gameState.addEffectToQueue(card.id, `async (card, gameState) => {
				const target = await gameState.pickTarget({
					cardType: [${CardType.Minion}],
					minionFilter: {
						position: [
							"on-the-board"
						]
					}
				}, "Scegli un minion da far tornare in mano", true)
				target?.returnToOwnerHand()
			}`)
		}
	},
	{
		type: CardType.Minion,
		quantityInDeck: 2,

		name: "Invader",
		description: "Gain 1 VP.",
		power: 3,
		initializeEffects: (card, gameState) => {
			gameState.addEffectToQueue(card.id, `async (card, gameState) => {
				const controller = card.controller
				if (controller) {
					controller.victoryPoints += 1
				}
			}`)
		}
	},
	{
		type: CardType.Minion,
		quantityInDeck: 3,

		name: "Scout",
		description: "Special: After this base is scored, you may place this minion into your hand instead of the discard pile.",
		power: 3
	},

	{	
		type: CardType.Minion,
		quantityInDeck: 4,

		name: "Collector",
		description: "You may return a non-Collector minion of power 3 or less on this base to its owner’s hand.",
		power: 2,
		initializeEffects: async (card, gameState) => {
			gameState.addEffectToQueue(card.id, `async (card, gameState) => {
				const target = await gameState.pickTarget({
					cardType: [${CardType.Minion}],
					filters: {
						position: [
							"on-the-board"
						],
						name: {
							operator: "!=",
							value: "Collector"
						}
					},
					minionFilter: {
						power: {
							operator: "<=",
							value: 3
						}
					}
				}, "Scegli un minion da far tornare in mano", true)
				target?.returnToOwnerHand()
			}`)
		}
	},

	{
		type: CardType.Action,
		quantityInDeck: 1,

		name: "Abduction",
		description: "Return a minion to its owner’s hand. Play an extra minion."
	},

	{
		type: CardType.Action,
		quantityInDeck: 2,

		name: "Beam Up",
		description: "Return a minion to its owner’s hand."
	},

	{
		type: CardType.Action,
		quantityInDeck: 1,

		name: "Crop Circles",
		description: "Choose a base. Return each minion on that base to its owner’s hand."
	},

	{
		type: CardType.Action,
		quantityInDeck: 2,

		name: "Disintegrator",
		description: "Return a minion to its owner’s hand."
	},

	{
		type: CardType.Action,
		quantityInDeck: 1,

		name: "Invasion",
		description: "Move a minion to another base."
	},

	{
		type: CardType.Action,
		quantityInDeck: 1,

		name: "Jammed Signal",
		description: "Play on a base. Ongoing: All players ignore this base’s ability."
	},

	{
		type: CardType.Action,
		quantityInDeck: 1,

		name: "Probe",
		description: "Look at another player’s hand and choose a minion in it. That player discards that minion."
	},

	{
		type: CardType.Action,
		quantityInDeck: 1,

		name: "Terraforming",
		description: "Search the base deck for a base. Swap it with a base in play (discard all actions attached to it). All minions from the original base remain. Shuffle the base deck. You may play an extra minion on the new base."
	},
])

export const Cards = Set.cards
export const Deck = Set.deck