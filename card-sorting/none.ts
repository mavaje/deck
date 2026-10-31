import {CardOrdering} from "./card-ordering";
import {CardGrouping} from "./card-grouping";

export const NONE: CardOrdering & CardGrouping = {
    name: 'None',

    groups: () => [],

    test: () => false,

    compare: () => 0,
};
