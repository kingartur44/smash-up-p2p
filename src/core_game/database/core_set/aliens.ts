import { CardType } from "../../data/CardType"
import { generateSet } from "../utils"
import { Faction } from "./Factions"

import collector_image from "../../../assets/aliens/collector.png"
import scout_image from "../../../assets/aliens/scout.png"

import abduction_image from "../../../assets/aliens/abduction.png"
import beam_up_image from "../../../assets/aliens/beam up.png"
import crop_circles_image from "../../../assets/aliens/crop circles.png"
import disintegrator_image from "../../../assets/aliens/disintegrator.png"
import invader_image from "../../../assets/aliens/invader.png"
import invasion_image from "../../../assets/aliens/invasion.png"
import probe_image from "../../../assets/aliens/probe.png"
import jammed_signal_image from "../../../assets/aliens/jammed signal.png"
import supreme_overlord_image from "../../../assets/aliens/supreme overlord.png"
import terraforming_image from "../../../assets/aliens/terraforming.png"
import { GenericPositions } from "../../game/cards/CardEffects"


const Set = generateSet(Faction.Aliens, [
	{
		type: CardType.Minion,
		quantityInDeck: 1,

		name: "Supreme Overlord",
		description: "You may return a minion to its owner’s hand.",
		image: supreme_overlord_image,

		power: 5,
		initializeEffects: async (card, gameState) => {
			card.registerEffect({
				type: "on-play-minion",
				callback: async (card, gameState) => {
					const target = await gameState.pickTarget({
						cardType: [CardType.Minion],
						filters: {
							position: ["on-the-board"]
						}
					}, "Scegli un minion da far tornare in mano", true)
					target?.returnToOwnerHand()
				}
			})
		}
	},
	{
		type: CardType.Minion,
		quantityInDeck: 2,

		name: "Invader",
		description: "Gain 1 VP.",
		image: invader_image,

		power: 3,
		initializeEffects: (card, gameState) => {
			card.registerEffect({
				type: "on-play-minion",
				callback: async (card, gameState) => {
					const controller = card.controller
					if (controller) {
						controller.increseVictoryPoints({
							amount: 1,
							detail: "You activated the on-play effect of the invader"
						})
					}
				}
			})
		}
	},
	{
		type: CardType.Minion,
		quantityInDeck: 3,

		name: "Scout",
		description: "Special: After this base is scored, you may place this minion into your hand instead of the discard pile.",
		image: scout_image,

		power: 3,
		initializeEffects: (card) => {
			card.registerEffect({
				type: "after-base-score_override-destination",
				isOptional: true,
				newDestination: GenericPositions.Hand
			})
		}
	},

	{	
		type: CardType.Minion,
		quantityInDeck: 4,

		name: "Collector",
		description: "You may return a non-Collector minion of power 3 or less on this base to its owner’s hand.",
		image: collector_image,

		power: 2,
		initializeEffects: async (card, gameState) => {
			card.registerEffect({
				type: "on-play-minion",
				callback: async (card, gameState) => {
					const target = await gameState.pickTarget({
						cardType: [CardType.Minion],
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
				}
			})
		}
	},

	{
		type: CardType.Action,
		quantityInDeck: 1,

		name: "Abduction",
		description: "Return a minion to its owner’s hand. Play an extra minion.",
		image: abduction_image,

		initializeEffects: async (card, gameState) => {
			card.playTargetQuery = {
				cardType: [CardType.Minion],
				filters: {
					position: ["on-the-board"]
				}
			}
			
			card.registerEffect({
				type: "on-play-action",
				callback: async (card, gameState) => {
					if (!card.playTargetQuery) {
						return
					}
					const target = await gameState.pickTarget(
						card.playTargetQuery,
						"Scegli un minion da far tornare in mano",
						true
					)
					target?.returnToOwnerHand()
					
					if (card.controller) {
						card.controller.minionPlays += 1
					}
				}
			})
		}
	},

	{
		type: CardType.Action,
		quantityInDeck: 2,

		name: "Beam Up",
		description: "Return a minion to its owner’s hand.",
		image: beam_up_image,

		initializeEffects: async (card, gameState) => {
			card.playTargetQuery = {
				cardType: [CardType.Minion],
				filters: {
					position: ["on-the-board"]
				}
			}
			
			card.registerEffect({
				type: "on-play-action",
				callback: async (card, gameState) => {
					if (!card.playTargetQuery) {
						return
					}
					const target = await gameState.pickTarget(
						card.playTargetQuery,
						"Scegli un minion da far tornare in mano",
						true
					)
					target?.returnToOwnerHand()
				}
			})
		}
	},

	{
		type: CardType.Action,
		quantityInDeck: 1,

		name: "Crop Circles",
		description: "Choose a base. Return each minion on that base to its owner’s hand.",
		image: crop_circles_image,

		initializeEffects: async (card, gameState) => {
			card.playTargetQuery = {
				cardType: [CardType.Base],
				filters: {
					position: ["on-the-board"]
				}
			}

			card.registerEffect({
				type: "on-play-action",
				callback: async (card, gameState) => {
					if (!card.playTargetQuery) {
						return
					}
					const target = await gameState.pickTarget(
						card.playTargetQuery,
						"Scegli una base. Tutti i minion su quella base torneranno in mano ai rispettivi proprietari",
						true
					)
					if (!target || !target.isBaseCard()) {
						throw new Error("The selected card isn't a base")
					}
					
					for (const card of target.attached_cards.cards) {
						card.returnToOwnerHand()
					}
				}
			})
		}
	},

	{
		type: CardType.Action,
		quantityInDeck: 2,

		name: "Disintegrator",
		description: "Return a minion to its owner’s hand.",
		image: disintegrator_image
	},

	{
		type: CardType.Action,
		quantityInDeck: 10,

		name: "Invasion",
		description: "Move a minion to another base.",
		image: invasion_image,
		initializeEffects: async (card, gameState) => {
			card.playTargetQuery = {
				cardType: [CardType.Minion],
				filters: {
					position: ["on-the-board"]
				}
			}

			card.registerEffect({
				type: "on-play-action",
				callback: async (card, gameState) => {
					if (!card.playTargetQuery) {
						return
					}

					const targetMinion = await gameState.pickTarget(
						card.playTargetQuery,
						"Choose a minion to move to another base",
						false
					)
					if (!targetMinion) {
						return
					}
					
					if (card.position.position !== "base") {
						throw new Error("The position is not right")
					}

					const targetBase = await gameState.pickTarget({
						cardType: [CardType.Base],
						filters: {
							position: ["on-the-board"]
						},
						excludedCards: [card.position.base_id]
					}, "Choose the base where to move the minion", false)
					card.moveCard({
						position: "base",
						base_id: targetBase!.id
					})
				}
			})
		}
	},

	{
		type: CardType.Action,
		quantityInDeck: 1,

		name: "Jammed Signal",
		description: "Play on a base. Ongoing: All players ignore this base’s ability.",
		image: jammed_signal_image
	},

	{
		type: CardType.Action,
		quantityInDeck: 1,

		name: "Probe",
		description: "Look at another player’s hand and choose a minion in it. That player discards that minion.",
		image: probe_image
	},

	{
		type: CardType.Action,
		quantityInDeck: 1,

		name: "Terraforming",
		description: "Search the base deck for a base. Swap it with a base in play (discard all actions attached to it). All minions from the original base remain. Shuffle the base deck. You may play an extra minion on the new base.",
		image: terraforming_image
	},
])

export const Cards = Set.cards
export const Deck = Set.deck