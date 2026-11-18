import {HTML} from "../xml";
import {DeckCard} from "../../deck-card";
import {Language} from "../../designation/language";
import {is_nullish} from "../../value";
import {API} from "../../scryfall/api";
import {Board} from "../../designation/board";
import {Finish} from "../../designation/finish";
import {Condition} from "../../designation/condition";
import {CardView} from "../card-view";
import {DeckPanel} from "./deck-panel";
import {Panel} from "../panel";
import {Search} from "../search/search";
import {DeckView} from "../deck-view";
import {Dropdown} from "../dropdown";
import {EditCardField} from "../../history/edit-card-field";
import {EditCardName} from "../../history/edit-card-name";

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
                EditCardField.do(card, 'quantity', quantity);
                input.value = `${quantity}`;
            },
            onkeypress,
        });

        HTML.button({
            id: 'quantity-decrement',
            disabled: card.quantity <= 0,
            onclick: () => EditCardField.do(card, 'quantity', card.quantity - 1),
        });

        HTML.button({
            id: 'quantity-increment',
            disabled: card.quantity >= 99,
            onclick: () => EditCardField.do(card, 'quantity', card.quantity + 1),
        });

        HTML.input({
            id: 'name-input',
            value: card.name || '',
            onchange: input => EditCardName.do(card, input.value || null),
            onkeypress,
            ...new Dropdown(
                'name-options',
                card.all_names(true).flatMap((name, id) => {
                    const names: [number, string][] = id === 0 && card.is_layout('split', 'double_faced_token')
                        ? [[null, card.card_name(true)], [id, name]]
                        : [[id, name]];
                    return names.map(([id, name]) => ({
                        value: name,
                        on_select: () => EditCardName.do(card, name, id),
                        selected: card.name === name,
                    }));
                }),
            ).event_listeners(),
        });

        HTML.input({
            id: 'set-input',
            class: card.invalid_set() ? 'error' : '-error',
            value: card.set?.toUpperCase() || '',
            onchange: input => {
                const set = API.SETS.normalise(input.value);
                EditCardField.do(card, 'set', set || null);
                input.value = set.toUpperCase();
            },
            onkeypress,
        });

        HTML.input({
            id: 'collector-number-input',
            class: card.invalid_collector_number() ? 'error' : '-error',
            value: card.collector_number ?? '',
            onchange: input => EditCardField.do(card, 'collector_number', input.value || null),
            onkeypress,
        });

        HTML.button({
            id: 'print-search',
            disabled: !card.name,
            onclick: () => {
                if (!card.name) return;
                let query = `!"${card.card_name(false)}" unique:prints`;
                if (!card.language.is_default()) query += ` lang:${card.language}`;
                if (card.card) query += ` oracleid:${card.card.oracle_id}`;
                Search.run(query);
            },
        });

        HTML.input({
            id: 'language-input',
            class: card.invalid_language() ? 'error' : '-error',
            value: card.language.name,
            readonly: true,
            onkeypress,
            ...new Dropdown(
                'language-options',
                Language.all().map(language => ({
                    value: language.name,
                    on_select: () => EditCardField.do(card, 'language', language),
                    selected: card.language === language,
                })),
            ).event_listeners(),
        });

        HTML.input({
            id: 'board-input',
            class: card.board.can_include(card) ? '-error' : 'error',
            value: card.board.name,
            readonly: true,
            onkeypress,
            ...new Dropdown(
                'board-options',
                Board.all()
                    .filter(board => board.can_include(card))
                    .map(board => ({
                        value: board.name,
                        on_select: () => EditCardField.do(card, 'board', board),
                        selected: card.board === board,
                    })),
            ).event_listeners(),
        });

        HTML.input({
            id: 'finish-input',
            value: card.finish.name,
            readonly: true,
            onkeypress,
            ...new Dropdown(
                'finish-options',
                Finish.all().map(finish => ({
                    value: finish.name,
                    on_select: () => EditCardField.do(card, 'finish', finish),
                    selected: card.finish === finish,
                    discouraged: card.card && !card.card.finishes.includes(finish.sf_finish()),
                })),
            ).event_listeners(),
        });

        HTML.input({
            id: 'condition-input',
            value: card.condition?.name ?? '',
            readonly: true,
            onkeypress,
            ...new Dropdown(
                'condition-options',
                [
                    {
                        value: 'Unspecified',
                        on_select: () => EditCardField.do(card, 'condition', null),
                        selected: !card.condition,
                        discouraged: true,
                    },
                    ...Condition.all().map(condition => ({
                        value: condition.name,
                        on_select: () => EditCardField.do(card, 'condition', condition),
                        selected: card.condition === condition,
                    })),
                ],
            ).event_listeners(),
        });
    }

    static close(): void {
        DeckView.deselect(this.SELECTED);
        this.SELECTED = null;
        super.close();
    }
}
