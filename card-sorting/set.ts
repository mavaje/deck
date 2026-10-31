import {CardGrouping, field_grouping} from "./card-grouping";
import {normalise_set} from "../text";
import {CardOrdering, string_ordering} from "./card-ordering";

export const SET: CardOrdering & CardGrouping = {
    ...field_grouping('Set', card => normalise_set(card.card?.set ?? card.set, true)),
    ...string_ordering('Set', card =>
        card.card?.set ?? card.set
            ? [
                normalise_set(card.card?.set ?? card.set, true) ?? '_',
                card.card?.collector_number ?? card.collector_number,
            ].join('-')
            : null),
};
