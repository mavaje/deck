import {CardGrouping, Group} from "./card-grouping";
import {ColorSet} from "../color-set";
import {from_color_identity} from "../color";
import {CardOrdering, nulls_last} from "./card-ordering";

export const COLOR: CardOrdering & CardGrouping<Group & {colors?: ColorSet}> = {
    name: 'Color',

    groups: () => [
        {name: 'Land'},
        ...Object.entries(ColorSet.all())
            .map(([name, colors]) => ({
                name,
                color: from_color_identity(colors),
                colors,
            })),
    ],

    test: (card, group) => card.is_type('Land')
        ? group.name === 'Land'
        : group.colors?.equals(card.main_face().card.colors),

    compare(card_a, card_b) {
        const land_a = card_a.is_type('Land') ? 1 : 0;
        const land_b = card_b.is_type('Land') ? 1 : 0;
        if (land_a || land_b) return land_b - land_a;

        const a = card_a.main_face().colors();
        const b = card_b.main_face().colors();

        return nulls_last(a, b)
            ?? (a.count() - b.count()
                || ColorSet.index(a) - ColorSet.index(b));
    }
};
