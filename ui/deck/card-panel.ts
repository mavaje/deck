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
import {DeckView} from "./deck-view";
import {Dropdown} from "../dropdown";
import {CardEditName} from "../../history/card-edit-name";
import {Deck} from "../../deck";
import {DeckDeleteCard} from "../../history/deck-delete-card";
import {CardEditFields} from "../../history/card-edit-fields";

export class CardPanel extends Panel {
    static id: string = 'card-panel';

    static SELECTED: DeckCard = null;

    static {
        document.addEventListener('keydown', event => {
            if (event.key === 'Backspace') {
                console.log('delete card');
            }
        });
    }

    static open(card: DeckCard): void {
        DeckView.deselect(this.SELECTED);
        DeckView.select(card);
        this.SELECTED = card;
        if (window.innerWidth < 848) {
            DeckPanel.close();
        }
        super.open();

        CardPanel.element().scrollTo({top: 0, behavior: 'smooth'});

        HTML.div(
            {id: 'card-panel-card-container'},
            CardView.render(card, `card-panel-card`, {location: 'panel'}),
        );

        const onkeydown: (input: HTMLInputElement, event: KeyboardEvent) => void = (input, {key}) => {
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
                CardEditFields.do(card, {quantity});
                input.value = `${quantity}`;
            },
            onkeydown,
        });

        HTML.button({
            id: 'quantity-decrement',
            disabled: card.quantity <= 0,
            onclick: () => CardEditFields.do(card, {quantity: card.quantity - 1}),
        });

        HTML.button({
            id: 'quantity-increment',
            disabled: card.quantity >= 99,
            onclick: () => CardEditFields.do(card, {quantity: card.quantity + 1}),
        });

        new Dropdown(
            {
                id: 'name-input',
                value: card.name || '',
                onchange: input => CardEditName.do(card, input.value || null),
                lang: Language.detect_font(card.name)?.code(),
            },
            ({label, value}) => CardEditName.do(card, label, value.face_id, value.name_key),
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
                CardEditFields.do(card, {set: set || null});
                input.value = set.toUpperCase();
            },
            onkeydown,
        });

        HTML.input({
            id: 'collector-number-input',
            class: card.invalid_collector_number() && 'error',
            value: card.collector_number ?? '',
            onchange: input => CardEditFields.do(card, {collector_number: input.value || null}),
            onkeydown,
        });

        HTML.button({
            id: 'print-search',
            disabled: !card.name,
            onclick: () => {
                if (!card.name) return;
                const name = card.card_name('name')
                    .replace(/^(.+) \/\/ \1$/, '$1');
                let query = card.card
                    ? `!"${name}"`
                    : name;
                query += ' unique:prints';
                if (!card.language.ignore_for_search) query += ` lang:${card.language}`;
                card.display_face().oracle_ids().forEach(id => {
                    query += ` oracleid:${id}`;
                });
                Search.run(query);
            },
        });

        HTML.button({
            id: 'print-clear',
            disabled: !card.set,
            onclick: () => CardEditFields.do(card, {set: null, collector_number: null}),
        });

        new Dropdown(
            {
                id: 'language-input',
                class: card.invalid_language() && 'error',
                value: card.language.name,
                readonly: true,
            },
            ({value}) => CardEditFields.do(card, {language: value}),
            Language.all()
                .map(language => ({
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
            ({value}) => CardEditFields.do(card, {finish: value}),
            Finish.all()
                .map(finish => ({
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
            ({value}) => CardEditFields.do(card, {condition: value}),
            [
                {
                    label: 'Unspecified',
                    input_value: '',
                    value: null,
                    discouraged: true,
                },
                ...Condition.all()
                    .map(condition => ({
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
            ({value}) => CardEditFields.do(card, {zone: value}),
            Zone.all()
                .filter(zone => zone.can_include(card))
                .map(zone => ({
                    label: zone.name,
                    value: zone,
                })),
        );

        HTML.button({
            id: 'delete-card',
            onclick: () => DeckDeleteCard.do(Deck.CURRENT, card),
        });
    }

    static close(): void {
        DeckView.deselect(this.SELECTED);
        this.SELECTED = null;
        super.close();
    }
}
