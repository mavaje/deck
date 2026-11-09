import {Rarity as CardRarity} from "../scryfall/types";
import {MTG_COLORS} from "../color";
import {CardClassifier} from "./card-classifier";
import {DeckCard} from "../deck-card";
import {Group} from "./group";

const RARITIES: Record<CardRarity, Partial<Group>> = {
    common: {name: 'Common'},
    uncommon: {name: 'Uncommon', color: [MTG_COLORS.silver]},
    rare: {name: 'Rare', color: [MTG_COLORS.yellow]},
    mythic: {name: 'Mythic Rare', color: [MTG_COLORS.red]},
    special: {name: 'Special', color: [MTG_COLORS.purple]},
    bonus: {name: 'Bonus', color: [MTG_COLORS.orange]},
};

export class Rarity extends CardClassifier<string> {
    static name: string = 'Rarity';

    groups(): Group<string>[] {
        return this.group_by(
            card => card.card?.rarity,
            undefined,
            Object.fromEntries(Object.entries(RARITIES)
                .map(([key, group]) => [key, new Group({value: key, ...group})])),
        );
    }

    compare(a: DeckCard, b: DeckCard): number {
        return this.compare_card_index(a, b, card => card.card?.rarity, Object.keys(RARITIES));
    }
}
