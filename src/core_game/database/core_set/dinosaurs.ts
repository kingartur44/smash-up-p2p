import { CardType } from "../../data/CardType"
import { generateSet } from "../utils"
import { Faction } from "./Factions"
import { GameCardEventType } from "../../game/cards/GameEvent"
import { MinionGameCard } from "../../game/cards/MinionGameCard"
import { PositionType } from "../../game/position/Position"
import { GamePhase, GameState } from "../../game/GameState"
import { ActionGameCard } from "../../game/cards/ActionGameCard"
import assert from "assert"

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
import tar_pits_image from "../../../assets/dinosaurs/tar pits.png"


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

		power: 4,

		initializeEffects: async (card, gameState) => {
			card.registerEffect({
				type: "on-play-minion",
				callback: async (card, gameState) => {
					const target = await gameState.pickTarget(card.controller_id!, {
						cardType: [CardType.Minion],
						filters: {
							position: [
								"on-the-board"
							],
						},
						minionFilter: {
							power: {
								operator: "<=",
								value: 2
							}
						}
					}, "Scegli un minion da far tornare in mano", false)
					target?.dispatchEvent({
						initiator: card,
						type: GameCardEventType.Destroy
					})
				}
			})
		}
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
				type: "ongoing",
				callback: async (card, gameState) => {
					card.addState({
						type: "power-boost",
						value: (card, gameState) => {
							if (gameState.turnPlayerId !== card.controller_id) {
								return 2
							}
							return 0
						}
					})
				}
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
				type: "ongoing",
				callback: async (card, gameState) => {
					card.addState({
						type: "power-boost",
						value: (card, gameState) => {
							const raptorCurrentBase = card.card_current_base
							assert(raptorCurrentBase !== undefined, "The raptor is not in play")
			
							const warRaptors = gameState.queryManager.executeQuery({
								cardType: [CardType.Minion],
								filters: {
									position: [{
										positionType: PositionType.Base,
										base_id: raptorCurrentBase.id
									}],
									name: {
										operator: "=",
										value: "War Raptor"
									}
								}
							})
							
							return warRaptors.length
						}
					})
				}
			})
		}
	},

	{
		type: CardType.Action,
		quantityInDeck: 2,

		name: "Augmentation",
		description: "One minion gains +4 power until the end of your turn.",
		image: augmentation_image,

		initializeEffects: (card: ActionGameCard, gameState: GameState) => {
			card.playTargetQuery = {
				cardType: [CardType.Minion],
				filters: {
					position: ["on-the-board"]
				}
			}

			card.registerEffect({
				type: "on-play-action",
				callback: async (card: ActionGameCard, gameState: GameState) => {
					const target = await gameState.pickTarget(
						card.controller_id!,
						card.playTargetQuery!,
						"Choose a minion to give 4 power until the end of the turn",
						false
					)
					target?.addState({
						type: "power-boost",
						value: 4,
						expire: {
							phase: GamePhase.GameTurn_EndTurn,
							timing: "end"
						}
					})
				}
			})
		}
	},

	{
		type: CardType.Action,
		quantityInDeck: 2,

		name: "Howl",
		description: "Each of your minions gains +1 power until the end of your turn",
		image: howl_image,

		initializeEffects: (card: ActionGameCard, gameState: GameState) => {
			

			card.registerEffect({
				type: "on-play-action",
				callback: async (card: ActionGameCard, gameState: GameState) => {
					const targets = gameState.queryManager.executeQuery(
						{
							cardType: [CardType.Minion],
							filters: {
								controller_id: [card.controller_id],
								position: ["on-the-board"]
							}
						}
					)

					for (const target of targets) {
						const targetCard = gameState.getCard(target)
						targetCard.addState({
							type: "power-boost",
							value: 1,
							expire: {
								phase: GamePhase.GameTurn_EndTurn,
								timing: "end",
								player_id: card.controller_id
							}
						})
					}
					
				}
			})
		}
	},

	{
		type: CardType.Action,
		quantityInDeck: 1,

		name: "Natural Selection",
		description: "Choose one of your minions on a base. Destroy a minion there with less power than yours.",
		image: natural_selection_image,

		initializeEffects: (card, gameState) => {
			card.registerEffect({
				type: "on-play-action",
				callback: async (card, gameState) => {
					const yourCard = await gameState.pickTarget(card.controller_id!, {
						cardType: [ CardType.Minion ]
					}, "Choose one of your minions", false)
		
					const cardToDestroy = await gameState.pickTarget(card.controller_id!, {
						cardType: [ CardType.Minion ],
						minionFilter: {
							power: {
								operator: "<",
								value: yourCard!.power
							}
						}
					}, "Choose a minion to destroy", false)
					cardToDestroy!.dispatchEvent({
						initiator: card,
						type: GameCardEventType.Destroy
					})
				}
			})
		}
	},

	{
		type: CardType.Action,
		quantityInDeck: 1,

		name: "Rampage",
		description: "Reduce the breakpoint of a base by the power of one of your minions on that base until the end of the turn.",
		image: rampage_image,

		initializeEffects: (card, gameState) => {
			card.registerEffect({
				type: "on-play-action",
				callback: async (card, gameState) => {
					const target = await gameState.pickTarget<MinionGameCard>(card.controller_id!, {
						cardType: [CardType.Minion],
						filters: {
							position: ["on-the-board"],
							controller_id: [card.controller_id]
						}
					}, "Choose a minion. Its base will have its breakpoint reduced by the minion power", false)

					if (target === null) {
						return
					}

					target.card_current_base?.addState({
						type: "reduce-breakpoint",
						value: target.power,
						expire: {
							phase: GamePhase.GameTurn_EndTurn,
							timing: "end"
						}
					})

				}
			})
		}
	},

	{
		type: CardType.Action,
		quantityInDeck: 1,

		name: "Survival of the Fittest",
		description: "Destroy the lowest-power minion (you choose in case of a tie) on each base with a higher-power minion.",
		image: survival_of_the_fittest_image,

		initializeEffects: (card, gameState) => {
			card.registerEffect({
				type: "on-play-action",
				callback: async (card, gameState) => {
					const cardsToDestroy: MinionGameCard[] = []

					for (const base of gameState.in_play_bases.cards) {
						if (!base.isBaseCard()) {
							throw new Error()
						}
						let competingCards: MinionGameCard[] = base.attached_cards.cards.filter(card => {
							if (!card.isMinionCard()) {
								return false
							}
							return true
						}) as unknown as MinionGameCard[]

						// If there are less than 2 minion is pointless to continue
						if (competingCards.length < 2) {
							continue
						}
						// We check if all minions have the same power
						const firstMinionPower = competingCards[0].power
						let areThereTwoDifferentPowerMinion = false
						for (const competingCard of competingCards) {
							if (competingCard.power !== firstMinionPower) {
								areThereTwoDifferentPowerMinion = true
								break
							}
						}
						if (!areThereTwoDifferentPowerMinion) {
							continue
						}
						// We find the lowest power minions of them all
						competingCards = competingCards.sort((minionA, minionB) => minionA.power - minionB.power)
						const lowestPower = competingCards[0].power
						const lowestPowerMinions = competingCards.filter(card => card.power === lowestPower)
						
						if (lowestPowerMinions.length === 1) {
							cardsToDestroy.push(lowestPowerMinions[0])
						} else {
							const target = await gameState.pickTarget(card.controller_id!, {
								includedCards: lowestPowerMinions.map(card => card.id)
							}, "There is a tie, choose wich minion you want to destroy", false)
							if (target === null || !target.isMinionCard()) {
								throw new Error()
							}
							cardsToDestroy.push(target)
						}
					}

					// Destroy all the selected cards
					for (const cardToDestroy of cardsToDestroy) {
						cardToDestroy.dispatchEvent({
							initiator: card,
							type: GameCardEventType.Destroy
						})
					}
				}
			})
		}
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


	{
		type: CardType.Base,
		quantityInDeck: 1,

		name: "Jungle Oasis",
		description: "(No effect)",

		breakpoint: 12,
		points: [2, 0, 0]
	},
	{
		type: CardType.Base,
		quantityInDeck: 1,

		name: "Tar Pits",
		description: "After each time a minion is destroyed here, place it at the bottom of its owner’s deck",
		image: tar_pits_image,

		breakpoint: 16,
		points: [4, 3, 2]
	}
])

export const Cards = Set.cards
export const Deck = Set.deck
export const Bases = Set.bases_deck