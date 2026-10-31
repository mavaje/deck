import {CardGrouping, Group} from "./card-grouping";
import {CardOrdering} from "./card-ordering";
import {Deck} from "../deck";
import {fraction} from "../text";

export const MANA_VALUE: CardOrdering & CardGrouping<Group & {mv?: number}> = {
    name: 'Mana Value',

    groups(deck: Deck) {
        const mvs = new Set(deck.cards
            .map(card => card.mana_value())
            .filter(mv => mv !== null));
        return [
            {name: 'Land'},
            ...[...mvs]
                .sort((a, b) => a - b)
                .map(mv => ({
                    name: `${fraction(mv)}-drop`,
                    mv,
                })),
        ];
    },

    test: (card, group) => card.is_type('Land')
        ? group.name === 'Land'
        : group.mv === card.mana_value(),

    compare(card_a, card_b) {
        const land_a = card_a.is_type('Land') ? 1 : 0;
        const land_b = card_b.is_type('Land') ? 1 : 0;
        if (land_a || land_b) return land_b - land_a;

        return (card_a.mana_value() ?? Infinity)
            - (card_b.mana_value() ?? Infinity);
    }
};
