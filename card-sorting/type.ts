import {CardGrouping} from "./card-grouping";
import {CARD_TYPES} from "../card-types";

export const TYPE: CardGrouping = {
    name: 'Type',

    groups: () => CARD_TYPES.map(name => ({name})),

    test: (card, {name}) => card.is_type(name),
};
