import {CardGrouping, Group} from "./card-grouping";
import {ColorIdentity} from "../color-identity";
import {from_color_identity} from "../color";
import {CardOrdering, nulls_last} from "./card-ordering";

export const COLOR: CardOrdering & CardGrouping<Group & {colors?: ColorIdentity}> = {
    name: 'Color',

    groups: () => [
        {name: 'Land'},
        ...Object.entries(ColorIdentity.all())
            .map(([name, colors]) => ({
                name,
                color: from_color_identity(colors),
                colors,
            })),
    ],

    test: (card, group) => card.is_type('Land')
        ? group.name === 'Land'
        : group.colors?.equals(card.face(0, 'colors')),

    compare(card_a, card_b) {
        const land_a = card_a.is_type('Land') ? 1 : 0;
        const land_b = card_b.is_type('Land') ? 1 : 0;
        if (land_a || land_b) return land_b - land_a;

        const a = card_a.face(0, 'colors');
        const b = card_b.face(0, 'colors');

        return nulls_last(a, b)
            ?? (a.length - b.length
                || ColorIdentity.index(a) - ColorIdentity.index(b));
    }
};
