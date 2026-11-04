import {Rarity as CardRarity} from "../scryfall/types";
import {MTG_COLORS} from "../color";
import {BaseGroup, CardClassifier, Group} from "./card-classifier";
import {DeckCard} from "../deck-card";

const RARITIES: Record<CardRarity, BaseGroup> = {
    common: {name: 'Common', color: ['#000000']},
    uncommon: {name: 'Uncommon', color: [MTG_COLORS.silver]},
    rare: {name: 'Rare', color: [MTG_COLORS.gold]},
    mythic: {name: 'Mythic Rare', color: [MTG_COLORS.red]},
    special: {name: 'Special', color: [MTG_COLORS.purple]},
    bonus: {name: 'Bonus', color: [MTG_COLORS.orange]},
};

export class Rarity extends CardClassifier {
    static name: string = 'Rarity';

    groups(): Group[] {
        return this.group_by(
            card => card.card?.rarity,
            undefined,
            Object.fromEntries(Object.entries(RARITIES)
                .map(([key, group]) => [key, {...group}])),
        );
    }

    compare(a: DeckCard, b: DeckCard): number {
        return this.compare_index(a, b, card => card.card?.rarity, Object.keys(RARITIES));
    }
}
