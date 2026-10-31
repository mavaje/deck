import {CardGrouping} from "./card-grouping";
import {CardOrdering, nulls_last} from "./card-ordering";
import {MTG_COLORS} from "../color";

const RARITIES = [
    'common',
    'uncommon',
    'rare',
    'mythic',
    'special',
    'bonus',
];

export const RARITY: CardOrdering & CardGrouping = {
    name: 'Rarity',

    groups: () => [
        {name: 'Common', color: ['#000000']},
        {name: 'Uncommon', color: [MTG_COLORS.silver]},
        {name: 'Rare', color: [MTG_COLORS.gold]},
        {name: 'Mythic Rare', color: [MTG_COLORS.red]},
        {name: 'Special', color: [MTG_COLORS.purple]},
        {name: 'Bonus', color: [MTG_COLORS.orange]},
    ],

    test: (card, {name}) => card.card?.rarity === name.split(' ')[0].toLowerCase(),

    compare: (card_a, card_b) => {
        const a = card_a.card?.rarity;
        const b = card_b.card?.rarity;
        return nulls_last(a, b)
            ?? RARITIES.indexOf(a) - RARITIES.indexOf(b);
    },
};
