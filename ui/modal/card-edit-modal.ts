import {HTML} from "../xml";
import {DeckCard} from "../../deck-card";
import {show_modal} from "./modal";
import {Language} from "../../designation/language";
import {DeckView} from "../deck-view";
import {is_nullish} from "../../value";
import {API} from "../../scryfall/api";

const quantity_input = (card: DeckCard) => HTML.input({
    id: 'quantity-input',
    type: 'number',
    min: 0,
    value: card.quantity,
    style: {width: '5ch'},
    onchange: ({value}) => {
        card.quantity = Number.parseInt(value);
        if (is_nullish(card.quantity)) card.quantity = 1;
        DeckView.render();
    },
});

const name_input = (card: DeckCard) => HTML.input({
    id: 'name-input',
    type: 'text',
    value: card.name,
    placeholder: 'Card Name',
    style: {width: '30ch'},
    onchange: ({value}) => {
        card.name = value;
        DeckView.render();
    },
});

const set_input = (card: DeckCard) => HTML.input({
    id: 'set-input',
    type: 'text',
    value: card.set?.toUpperCase(),
    placeholder: 'Set',
    style: {width: '5ch'},
    onchange: element => {
        element.value = element.value.toUpperCase() || null;
        card.set = API.SETS.normalise(element.value);
        DeckView.render();
    },
});

const collector_number_input = (card: DeckCard) => HTML.input({
    id: 'collector-number-input',
    type: 'text',
    value: card.collector_number,
    placeholder: 'Number',
    style: {width: '6ch'},
    onchange: ({value}) => {
        card.collector_number = value;
        DeckView.render();
    },
});

const language_input = (card: DeckCard) => HTML.select({
    id: 'language-input',
    value: card.language.code(),
    placeholder: 'Language',
    onchange: ({value}) => {
        card.language = Language.match(value);
        DeckView.render();
    },
    ontimeout: element => {
        element.value = card.language.code();
    }
}, Language.all().map(language =>
    HTML.option({value: language.code()}, language.name)));

export function edit_card_modal(card: DeckCard): void {
    show_modal(HTML.div({
        id: 'card-edit-modal',
    }, [
        HTML.div({class: 'row'}, [
            quantity_input(card),
            ...card.card
                ? [
                    card.name,
                    HTML.span({class: 'light'}, card.to_string(' (SET:000)? *EN*?')),
                ]
                : [name_input(card)],
        ]),
        !card.card && HTML.div([
            set_input(card),
            collector_number_input(card),
            language_input(card),
        ]),
        HTML.div([

        ]),
    ]));
}
