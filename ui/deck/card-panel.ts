import {HTML} from "../xml";
import {DeckCard} from "../../deck-card";
import {Language} from "../../designation/language";
import {is_nullish} from "../../value";
import {API} from "../../scryfall/api";
import {edit_card_field} from "../../history/history";
import {Board} from "../../designation/board";
import {Finish} from "../../designation/finish";
import {Condition} from "../../designation/condition";
import {CardView} from "../card-view";
import {DeckPanel} from "./deck-panel";
import {Panel} from "../panel";
import {Search} from "../search/search";
import {DeckView} from "../deck-view";
import {Dropdown} from "../dropdown";

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
            CardView.render(card, undefined, `card-panel-card`),
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
                edit_card_field(card, 'quantity', quantity);
                input.value = `${quantity}`;
            },
            onkeypress,
        });

        HTML.button({
            id: 'quantity-decrement',
            disabled: card.quantity <= 0,
            onclick: () => edit_card_field(card, 'quantity', card.quantity - 1),
        });

        HTML.button({
            id: 'quantity-increment',
            disabled: card.quantity >= 99,
            onclick: () => edit_card_field(card, 'quantity', card.quantity + 1),
        });

        HTML.input({
            id: 'name-input',
            value: card.name || '',
            onchange: input => edit_card_field(card, 'name', input.value || null),
            onkeypress,
        });

        HTML.input({
            id: 'set-input',
            class: card.invalid_set() ? 'error' : '-error',
            value: card.set?.toUpperCase() || '',
            onchange: input => {
                const set = API.SETS.normalise(input.value);
                edit_card_field(card, 'set', set || null);
                input.value = set.toUpperCase();
            },
            onkeypress,
        });

        HTML.input({
            id: 'collector-number-input',
            class: card.invalid_collector_number() ? 'error' : '-error',
            value: card.collector_number ?? '',
            onchange: input => edit_card_field(card, 'collector_number', input.value || null),
            onkeypress,
        });

        HTML.input({
            id: 'language-input',
            class: card.invalid_language() ? 'error' : '-error',
            value: card.language.code().toUpperCase(),
            onchange: ({value}) => {
                const language = Language.match(value) ?? Language.DEFAULT;
                edit_card_field(card, 'language', language);
            },
            onkeypress,
            ...new Dropdown(
                'language-options',
                Language.all().map(language => ({
                    value: `${language.code().toUpperCase()} - ${language.name}`,
                    on_click: () => edit_card_field(card, 'language', language),
                    selected: card.language === language,
                })),
            ).event_listeners(),
        });

        HTML.span({
            id: 'print-search',
            disabled: !card.name,
            onclick: () => {
                if (!card.name) return;
                let query = `!"${card.name}" unique:prints`;
                if (!card.language.is_default()) query += ` lang:${card.language}`;
                if (card.card) query += ` oracleid:${card.card.oracle_id}`;
                Search.run(query);
            },
        });

        HTML.input({
            id: 'board-input',
            value: card.board.name,
            onchange: ({value}) => {
                const board = Board.match(value) ?? Board.DEFAULT;
                edit_card_field(card, 'board', board);
            },
            onkeypress,
            ...new Dropdown(
                'board-options',
                Board.all().map(board => ({
                    value: board.name,
                    on_click: () => edit_card_field(card, 'board', board),
                    selected: card.board === board,
                    discouraged: !board.can_include(card),
                })),
            ).event_listeners(),
        });

        HTML.input({
            id: 'finish-input',
            value: card.finish.name,
            onchange: ({value}) => {
                const finish = Finish.match(value) ?? Finish.DEFAULT;
                edit_card_field(card, 'finish', finish);
            },
            onkeypress,
            ...new Dropdown(
                'finish-options',
                Finish.all().map(finish => ({
                    value: finish.name,
                    on_click: () => edit_card_field(card, 'finish', finish),
                    selected: card.finish === finish,
                    discouraged: card.card && !card.card.finishes.includes(finish.sf_finish()),
                })),
            ).event_listeners(),
        });

        HTML.input({
            id: 'condition-input',
            value: card.condition?.name ?? '',
            onchange: ({value}) => {
                edit_card_field(card, 'condition', Condition.match(value));
            },
            onkeypress,
            ...new Dropdown(
                'condition-options',
                Condition.all().map(condition => ({
                    value: condition.name,
                    on_click: () => edit_card_field(card, 'condition', condition),
                    selected: card.condition === condition,
                })),
            ).event_listeners(),
        });
    }

    static close(): void {
        DeckView.deselect(this.SELECTED);
        this.SELECTED = null;
        super.close();
    }
}
