import { CardType } from "../../data/CardType"
import { GenericPositions as GenericPosition } from "../../game/cards/CardEffects"
import { generateSet } from "../utils"
import { Faction } from "./Factions"


const Set = generateSet(Faction.Dinosaurs, [
	{
		type: CardType.Minion,
		quantityInDeck: 1,

		name: "King Rex",
		description: "(no ability)",
		power: 7,
	},
	{
		type: CardType.Minion,
		quantityInDeck: 2,

		name: "Laseratops",
		description: "Destroy a minion of power 2 or less on this base.",
		power: 4
	},
	{
		type: CardType.Minion,
		quantityInDeck: 3,

		name: "Armor Stego",
		description: "Ongoing: Has +2 power during other players’ turns.",
		power: 3,
		initializeEffects: (card, gameState) => {
			card.registerEffect({
				type: "power-boost",
				positionRequirement: GenericPosition.Field,
				callback: `(card, gameState) => {
					if (gameState.turnPlayerId !== card.controller_id) {
						return 2
					}
					return 0
				}`
			})
		}
	},

	{	
		type: CardType.Minion,
		quantityInDeck: 4,

		name: "War Raptor",
		description: "Ongoing: Gains +1 power for each War Raptor on this base (including this one).",
		power: 2,
		initializeEffects: (card, gameState) => {
			card.registerEffect({
				type: "power-boost",
				positionRequirement: GenericPosition.Field,
				callback: `(card, gameState) => {
					const raptorCurrentBase = (card as MinionGameCard).card_current_base
					if (!raptorCurrentBase) {
						return
					}
	
					const warRaptors = gameState.queryManager.executeQuery({
						cardType: [${CardType.Minion}],
						filters: {
							position: [{
								position: "base",
								base_id: raptorCurrentBase.id
							}],
							name: {
								operator: "=",
								value: "War Raptor"
							}
						}
					})
					
					return warRaptors.length
				}`
			})
		}
	},

	{
		type: CardType.Action,
		quantityInDeck: 2,

		name: "Augmentation",
		description: "One minion gains +4 power until the end of your turn."
	},

	{
		type: CardType.Action,
		quantityInDeck: 2,

		name: "Howl",
		description: "Each of your minions gains +1 power until the end of your turn"
	},

	{
		type: CardType.Action,
		quantityInDeck: 1,

		name: "Natural Selection",
		description: "Choose one of your minions on a base. Destroy a minion there with less power than yours."
	},

	{
		type: CardType.Action,
		quantityInDeck: 1,

		name: "Rampage",
		description: "Reduce the breakpoint of a base by the power of one of your minions on that base until the end of the turn."
	},

	{
		type: CardType.Action,
		quantityInDeck: 1,

		name: "Survival of the Fittest",
		description: "Destroy the lowest-power minion (you choose in case of a tie) on each base with a higher-power minion."
	},

	{
		type: CardType.Action,
		quantityInDeck: 1,

		name: "Tooth and Claw... and Guns",
		description: "Play on a minion. Ongoing: If an another player's ability would affect this minion, destroy this card and the ability does not affect this minion for the rest of the turn."
	},

	{
		type: CardType.Action,
		quantityInDeck: 1,

		name: "Upgrade ",
		description: "Play on a minion. Ongoing: This minion has +2 power."
	},

	{
		type: CardType.Action,
		quantityInDeck: 1,

		name: "Wildlife Preserve",
		description: "Play on a base. Ongoing: Your minions here are not affected by other players’ actions."
	},
])

export const Cards = Set.cards
export const Deck = Set.deck