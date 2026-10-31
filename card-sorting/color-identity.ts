import {CardGrouping, Group} from "./card-grouping";
import {ColorIdentity} from "../color-identity";
import {from_color_identity} from "../color";
import {CardOrdering, nulls_last} from "./card-ordering";

export const COLOR_IDENTITY: CardOrdering & CardGrouping<Group & {colors?: ColorIdentity}> = {
    name: 'Color Identity',

    groups: () => Object.entries(ColorIdentity.all())
        .map(([name, colors]) => ({
            name,
            color: from_color_identity(colors),
            colors,
        })),

    test: (card, group) => group.colors?.equals(card.color_identity()),

    compare(card_a, card_b) {
        const a = card_a.color_identity();
        const b = card_b.color_identity();

        return nulls_last(a, b)
            ?? (a.count() - b.count()
                || ColorIdentity.index(a) - ColorIdentity.index(b));
    }
};
