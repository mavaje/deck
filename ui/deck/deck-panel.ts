import {HTML} from "../xml";
import {DeckView} from "../deck-view";
import {Type} from "../../card-classifier/type";
import {Color} from "../../card-classifier/color";
import {ColorIdentity} from "../../card-classifier/color-identity";
import {ManaValue} from "../../card-classifier/mana-value";
import {SetClassifier} from "../../card-classifier/set-classifier";
import {Rarity} from "../../card-classifier/rarity";
import {Tag} from "../../card-classifier/tag";
import {Name} from "../../card-classifier/name";
import {PriceEUR, PriceTIX, PriceUSD} from "../../card-classifier/price";
import {RankEDHREC, RankPenny} from "../../card-classifier/rank";
import {CardClassifier} from "../../card-classifier/card-classifier";
import {Subtype} from "../../card-classifier/subtype";
import {Keyword} from "../../card-classifier/keyword";
import {Artist} from "../../card-classifier/artist";
import {TypePrimary} from "../../card-classifier/type-primary";
import {close_card_panel} from "./card-panel";

const CARD_GROUPINGS: (typeof CardClassifier<string | number>)[] = [
    CardClassifier,
    SetClassifier,
    Rarity,
    Type,
    TypePrimary,
    Subtype,
    Color,
    ColorIdentity,
    ManaValue,
    Artist,
    Keyword,
    Tag,
];

const CARD_ORDERINGS: (typeof CardClassifier<string | number>)[] = [
    CardClassifier,
    Name,
    SetClassifier,
    Rarity,
    TypePrimary,
    Color,
    ColorIdentity,
    PriceUSD,
    PriceEUR,
    PriceTIX,
    ManaValue,
    RankEDHREC,
    RankPenny,
];

export function initialise_deck_panel() {
    const group_select = HTML.select({
        id: 'group-by',
        onchange: () => {
            DeckView.GROUPING = CARD_GROUPINGS[group_select.value];
            DeckView.render();
        },
    }, CARD_GROUPINGS.map((grouping, i) =>
        HTML.option({value: i}, grouping.name)));

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
    }, CARD_ORDERINGS.map((ordering, i) =>
        HTML.option({value: i}, ordering.name)));
}

export function open_deck_panel(): void {
    if (window.innerWidth < 960) {
        close_card_panel();
    }
    HTML.div({
        id: 'deck-panel',
        class: '-collapsed',
    });
}

export function close_deck_panel(): void {
    HTML.div({
        id: 'deck-panel',
        class: 'collapsed',
    });
}
