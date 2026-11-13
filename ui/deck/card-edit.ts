import {Attributes, HTML} from "../xml";
import {DeckCard} from "../../deck-card";
import {Language} from "../../designation/language";
import {is_nullish} from "../../value";
import {API} from "../../scryfall/api";
import {edit_card_field} from "../../history/history";

function input_event_listeners(
    on_change: (value: string) => string,
): Attributes<HTMLElementTagNameMap['input'], SVGElementEventMap> {
    const listener = (input: HTMLInputElement) => {
        input.value = on_change(input.value);
        input.blur();
    }
    return {
        onchange: listener,
        onkeypress: (input, {key}) => {
            if (key === 'Enter') {
                listener(input);
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
    placeholder: 'Language',
    onchange: ({value}) => {
        edit_card_field(card, 'language', Language.match(value));
    },
    ontimeout: element => {
        element.value = card.language.code();
    }
}, Language.all().map(language =>
    HTML.option({value: language.code()}, language.name)));

export function update_card_edit_panel(card: DeckCard): void {
    HTML.div({
        id: 'card-edit',
        class: '-collapsed',
    }, [
        HTML.div({
            style: {
                align_self: 'stretch',
                display: 'flex',
                flex_direction: 'row',
                align_items: 'center',
                gap: '4px',
            },
        }, [
            quantity_input(card),
            ...card.card
                ? [
                    card.name,
                    HTML.span({class: 'light'}, card.to_string(' (SET:000)? *EN*?')),
                ]
                : [name_input(card)],
        ]),
        !card.card && HTML.div({
            style: {
                // display: 'flex',
                // flex_direction: 'row',
                // align_self: 'stretch',
            },
        }, [
            set_input(card),
            collector_number_input(card),
            language_input(card),
        ]),
        HTML.div([

        ]),
    ]);
}
