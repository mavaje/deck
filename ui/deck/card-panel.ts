import {Attributes, HTML} from "../xml";
import {DeckCard} from "../../deck-card";
import {Language} from "../../designation/language";
import {is_nullish} from "../../value";
import {API} from "../../scryfall/api";
import {edit_card_field} from "../../history/history";
import {close_deck_panel} from "./deck-panel";
import {Board} from "../../designation/board";
import {Finish} from "../../designation/finish";
import {Condition} from "../../designation/condition";

export let SELECTED_CARD: DeckCard = null;

function input_event_listeners(
    on_change: (value: string) => string,
): Attributes<HTMLElementTagNameMap['input'], SVGElementEventMap> {
    return {
        onchange: input => {
            input.value = on_change(input.value);
        },
        onkeypress: (input, {key}) => {
            if (key === 'Enter') {
                input.blur();
            }
        },
    }
}

const quantity_input = (card: DeckCard) => HTML.input({
    id: 'quantity-input',
    type: 'number',
    min: 0,
    value: card.quantity,
    style: {width: '5ch'},
    ...input_event_listeners((value) => {
        let quantity = Number.parseInt(value);
        if (is_nullish(quantity)) quantity = 1;
        edit_card_field(card, 'quantity', quantity);
        return `${quantity}`;
    }),
});

const name_input = (card: DeckCard) => HTML.input({
    id: 'name-input',
    type: 'text',
    value: card.name || '',
    placeholder: 'Card Name',
    style: {flex: '1'},
    ...input_event_listeners((value) => {
        edit_card_field(card, 'name', value || null);
        return value;
    }),
});

const set_input = (card: DeckCard) => HTML.input({
    id: 'set-input',
    type: 'text',
    value: card.set?.toUpperCase() || '',
    placeholder: 'Set',
    style: {width: '5ch'},
    ...input_event_listeners((value) => {
        value = API.SETS.normalise(value);
        edit_card_field(card, 'set', value || null);
        return value.toUpperCase();
    }),
});

const collector_number_input = (card: DeckCard) => HTML.input({
    id: 'collector-number-input',
    type: 'text',
    value: card.collector_number || '',
    placeholder: 'Number',
    style: {width: '6ch'},
    ...input_event_listeners((value) => {
        edit_card_field(card, 'collector_number', value || null);
        return value;
    }),
});

const language_input = (card: DeckCard) => HTML.select({
    id: 'language-input',
    value: card.language.code(),
    onchange: ({value}) => {
        edit_card_field(card, 'language', Language.match(value));
    },
    ontimeout: element => {
        element.value = card.language.code();
    }
}, Language.all().map(language =>
    HTML.option({value: language.code()}, language.name)));

const board_input = (card: DeckCard) => HTML.select({
    id: 'board-input',
    value: card.board.code(),
    onchange: ({value}) => {
        edit_card_field(card, 'board', Board.match(value));
    },
    ontimeout: element => {
        element.value = card.board.code();
    }
}, Board.all().map(board =>
    HTML.option({value: board.code()}, board.name)));

const finish_input = (card: DeckCard) => HTML.select({
    id: 'finish-input',
    value: card.finish.code(),
    onchange: ({value}) => {
        edit_card_field(card, 'finish', Finish.match(value));
    },
    ontimeout: element => {
        element.value = card.finish.code();
    }
}, Finish.all().map(finish =>
    HTML.option({value: finish.code()}, finish.name)));

const condition_input = (card: DeckCard) => HTML.select({
    id: 'condition-input',
    value: card.condition?.code() ?? '',
    onchange: ({value}) => {
        edit_card_field(card, 'condition', Condition.match(value));
    },
    ontimeout: element => {
        element.value = card.condition?.code() ?? '';
    }
}, [
    HTML.option({value: ''}, 'Unspecified'),
    ...Condition.all().map(condition =>
    HTML.option({value: condition.code()}, condition.name)),
]);

export function open_card_panel(card: DeckCard): void {
    SELECTED_CARD = card;
    if (window.innerWidth < 960) {
        close_deck_panel();
    }
    HTML.div({
        id: 'card-panel',
        class: '-collapsed',
    }, [
        HTML.div({id: 'card-panel-row-0'}, [
            quantity_input(card),
            name_input(card),
        ]),
        HTML.div({id: 'card-panel-row-1'}, [
            set_input(card),
            collector_number_input(card),
        ]),
        HTML.div({id: 'card-panel-row-2'}, [
            language_input(card),
        ]),
        HTML.div({id: 'card-panel-row-3'}, [
            board_input(card),
        ]),
        HTML.div({id: 'card-panel-row-4'}, [
            finish_input(card),
        ]),
        HTML.div({id: 'card-panel-row-5'}, [
            condition_input(card),
        ]),
    ]);
}

export function close_card_panel(): void {
    SELECTED_CARD = null;
    HTML.div({
        id: 'card-panel',
        class: 'collapsed',
    });
}
