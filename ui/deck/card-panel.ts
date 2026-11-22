import {HTML} from "../xml";
import {DeckCard} from "../../deck-card";
import {Language} from "../../designation/language";
import {is_nullish} from "../../value";
import {API} from "../../scryfall/api";
import {Zone} from "../../designation/zone";
import {Finish} from "../../designation/finish";
import {Condition} from "../../designation/condition";
import {CardView} from "../card-view";
import {DeckPanel} from "./deck-panel";
import {Panel} from "../panel";
import {Search} from "../search/search";
import {DeckView} from "../deck-view";
import {Dropdown} from "../dropdown";
import {EditCardName} from "../../history/edit-card-name";
import {Deck} from "../../deck";
import {DeleteCard} from "../../history/delete-card";
import {EditCardFields} from "../../history/edit-card-fields";

export class CardPanel extends Panel {
    static id: string = 'card-panel';

    static SELECTED: DeckCard = null;

    static open(card: DeckCard): void {
        DeckView.deselect(this.SELECTED);
        DeckView.select(card);
        this.SELECTED = card;
        if (window.innerWidth < 848) {
            DeckPanel.close();
        }
        super.open();

        HTML.div(
            {id: 'card-panel-card-container'},
            CardView.render(card, `card-panel-card`),
        );

        const onkeypress: (input: HTMLInputElement, event: KeyboardEvent) => void = (input, {key}) => {
            if (key === 'Enter') {
                input.blur();
            }
        };

        HTML.input({
            id: 'quantity-input',
            value: card.quantity,
            onchange: input => {
                let quantity = Number.parseInt(input.value);
                if (is_nullish(quantity)) quantity = 1;
                EditCardFields.do(card, {quantity});
                input.value = `${quantity}`;
            },
            onkeypress,
        });

        HTML.button({
            id: 'quantity-decrement',
            disabled: card.quantity <= 0,
            onclick: () => EditCardFields.do(card, {quantity: card.quantity - 1}),
        });

        HTML.button({
            id: 'quantity-increment',
            disabled: card.quantity >= 99,
            onclick: () => EditCardFields.do(card, {quantity: card.quantity + 1}),
        });

        new Dropdown(
            {
                id: 'name-input',
                value: card.name || '',
                onchange: input => EditCardName.do(card, input.value || null),
            },
            ({label, value}) => EditCardName.do(card, label, value.face_id, value.printed),
            Object.entries(card.selectable_names()).map(([name, face]) => ({
                label: name,
                value: face,
            })),
        );

        HTML.input({
            id: 'set-input',
            class: card.invalid_set() && 'error',
            value: card.set?.toUpperCase() || '',
            onchange: input => {
                const set = API.SETS.normalise(input.value);
                EditCardFields.do(card, {set: set || null});
                input.value = set.toUpperCase();
            },
            onkeypress,
        });

        HTML.input({
            id: 'collector-number-input',
            class: card.invalid_collector_number() && 'error',
            value: card.collector_number ?? '',
            onchange: input => EditCardFields.do(card, {collector_number: input.value || null}),
            onkeypress,
        });

        HTML.button({
            id: 'print-search',
            disabled: !card.name,
            onclick: () => {
                if (!card.name) return;
                const name = card.card_name(false)
                    .replace(/^(.+) \/\/ \1$/, '$1');
                let query = card.card
                    ? `!"${name}"`
                    : name;
                query += ' unique:prints';
                if (!card.language.is_default()) query += ` lang:${card.language}`;
                card.main_face(true).oracle_ids().forEach(id => {
                    query += ` oracleid:${id}`;
                });
                Search.run(query);
            },
        });

        HTML.button({
            id: 'print-clear',
            disabled: !card.set,
            onclick: () => EditCardFields.do(card, {set: null, collector_number: null}),
        });

        new Dropdown(
            {
                id: 'language-input',
                class: card.invalid_language() && 'error',
                value: card.language.name,
                readonly: true,
            },
            ({value}) => EditCardFields.do(card, {language: value}),
            Language.all().map(language => ({
                label: language.name,
                value: language,
            })),
        );

        new Dropdown(
            {
                id: 'finish-input',
                value: card.finish.name,
                readonly: true,
            },
            ({value}) => EditCardFields.do(card, {finish: value}),
            Finish.all().map(finish => ({
                label: finish.name,
                value: finish,
                discouraged: card.card && !card.card.finishes.includes(finish.sf_finish()),
            })),
        );

        new Dropdown(
            {
                id: 'condition-input',
                value: card.condition?.name || '',
                readonly: true,
            },
            ({value}) => EditCardFields.do(card, {condition: value}),
            [
                {
                    label: 'Unspecified',
                    input_value: '',
                    value: null,
                    discouraged: true,
                },
                ...Condition.all().map(condition => ({
                    label: condition.name,
                    value: condition,
                })),
            ],
        );

        new Dropdown(
            {
                id: 'zone-input',
                class: !card.zone.can_include(card) && 'error',
                value: card.zone.name,
                readonly: true,
            },
            ({value}) => EditCardFields.do(card, {zone: value}),
            Zone.all()
                .filter(zone => zone.can_include(card))
                .map(zone => ({
                    label: zone.name,
                    value: zone,
                })),
        );

        HTML.button({
            id: 'delete-card',
            onclick: () => DeleteCard.do(Deck.CURRENT, card),
        });
    }

    static close(): void {
        DeckView.deselect(this.SELECTED);
        this.SELECTED = null;
        super.close();
    }
}
