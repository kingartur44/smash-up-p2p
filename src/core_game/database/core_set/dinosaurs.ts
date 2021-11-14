import { CardType } from "../../data/CardType"
import { GenericPositions as GenericPosition } from "../../game/cards/CardEffects"
import { generateSet } from "../utils"
import { Faction } from "./Factions"

import armor_stego_image from "../../../assets/dinosaurs/armor stego.png"
import war_raptor_image from "../../../assets/dinosaurs/war raptor.png"
import augmentation_image from "../../../assets/dinosaurs/augmentation.png"
import howl_image from "../../../assets/dinosaurs/howl.png"
import king_rex_image from "../../../assets/dinosaurs/king rex.png"
import laseratops_image from "../../../assets/dinosaurs/laseratops.png"
import natural_selection_image from "../../../assets/dinosaurs/natural selection.png"
import rampage_image from "../../../assets/dinosaurs/rampage.png"
import thoot_and_claw_and_guns_image from "../../../assets/dinosaurs/thoot and claw... and guns.png"
import survival_of_the_fittest_image from "../../../assets/dinosaurs/survival of the fittest.png"
import upgrade_image from "../../../assets/dinosaurs/upgrade.png"
import wildlife_preserve_image from "../../../assets/dinosaurs/wildlife preserve.png"


const Set = generateSet(Faction.Dinosaurs, [
	{
		type: CardType.Minion,
		quantityInDeck: 1,

		name: "King Rex",
		description: "(no ability)",
		image: king_rex_image,

		power: 7,
	},
	{
		type: CardType.Minion,
		quantityInDeck: 2,

		name: "Laseratops",
		description: "Destroy a minion of power 2 or less on this base.",
		image: laseratops_image,

		power: 4
	},
	{
		type: CardType.Minion,
		quantityInDeck: 3,

		name: "Armor Stego",
		description: "Ongoing: Has +2 power during other players’ turns.",
		image: armor_stego_image,

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
		image: war_raptor_image,

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
		description: "One minion gains +4 power until the end of your turn.",
		image: augmentation_image
	},

	{
		type: CardType.Action,
		quantityInDeck: 2,

		name: "Howl",
		description: "Each of your minions gains +1 power until the end of your turn",
		image: howl_image
	},

	{
		type: CardType.Action,
		quantityInDeck: 1,

		name: "Natural Selection",
		description: "Choose one of your minions on a base. Destroy a minion there with less power than yours.",
		image: natural_selection_image
	},

	{
		type: CardType.Action,
		quantityInDeck: 1,

		name: "Rampage",
		description: "Reduce the breakpoint of a base by the power of one of your minions on that base until the end of the turn.",
		image: rampage_image
	},

	{
		type: CardType.Action,
		quantityInDeck: 1,

		name: "Survival of the Fittest",
		description: "Destroy the lowest-power minion (you choose in case of a tie) on each base with a higher-power minion.",
		image: survival_of_the_fittest_image
	},

	{
		type: CardType.Action,
		quantityInDeck: 1,

		name: "Tooth and Claw... and Guns",
		description: "Play on a minion. Ongoing: If an another player's ability would affect this minion, destroy this card and the ability does not affect this minion for the rest of the turn.",
		image: thoot_and_claw_and_guns_image
	},

	{
		type: CardType.Action,
		quantityInDeck: 1,

		name: "Upgrade ",
		description: "Play on a minion. Ongoing: This minion has +2 power.",
		image: upgrade_image
	},

	{
		type: CardType.Action,
		quantityInDeck: 1,

		name: "Wildlife Preserve",
		description: "Play on a base. Ongoing: Your minions here are not affected by other players’ actions.",
		image: wildlife_preserve_image
	},
])

export const Cards = Set.cards
export const Deck = Set.deck