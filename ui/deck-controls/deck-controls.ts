import {HTML} from "../../html";
import {DeckView} from "../deck-view";
import {CardGrouping} from "../../card-sorting/card-grouping";
import {CardOrdering} from "../../card-sorting/card-ordering";
import {NONE} from "../../card-sorting/none";
import {TYPE} from "../../card-sorting/type";
import {SUBTYPE} from "../../card-sorting/subtype";
import {COLOR} from "../../card-sorting/color";
import {COLOR_IDENTITY} from "../../card-sorting/color-identity";
import {MANA_VALUE} from "../../card-sorting/mana-value";
import {SET} from "../../card-sorting/set";
import {RARITY} from "../../card-sorting/rarity";
import {TAG} from "../../card-sorting/tag";
import {NAME} from "../../card-sorting/name";
import {PRICE_EUR, PRICE_TIX, PRICE_USD} from "../../card-sorting/price";
import {RANK_EDHREC, RANK_PENNY} from "../../card-sorting/rank";

const CARD_GROUPINGS: CardGrouping[] = [
    NONE,
    TYPE,
    SUBTYPE,
    COLOR,
    COLOR_IDENTITY,
    MANA_VALUE,
    SET,
    RARITY,
    TAG,
];

const CARD_ORDERINGS: CardOrdering[] = [
    NONE,
    NAME,
    SET,
    RARITY,
    COLOR,
    COLOR_IDENTITY,
    PRICE_USD,
    PRICE_EUR,
    PRICE_TIX,
    MANA_VALUE,
    RANK_EDHREC,
    RANK_PENNY,
];

export function initialise_deck_controls() {
    const group_select = HTML.select({
        id: 'group-by',
        onchange: () => {
            DeckView.GROUPING = CARD_GROUPINGS[group_select.value];
            DeckView.render();
        },
    });

    CARD_GROUPINGS.forEach((grouping, i) => {
        group_select.add(new Option(grouping.name, `${i}`));
    });

    const by_board = HTML.input({
        id: 'by-board',
        onchange: () => {
            DeckView.BY_BOARD = by_board.checked;
            DeckView.render();
        },
    });

    const order_select = HTML.select({
        id: 'order-by',
        onchange: () => {
            DeckView.ORDERING = CARD_ORDERINGS[order_select.value];
            DeckView.render();
        },
    });

    CARD_ORDERINGS.forEach((ordering, i) => {
        order_select.add(new Option(ordering.name, `${i}`));
    });
}
