import {Attributes, HTML} from "../xml";
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

export class CardPanel extends Panel {
    static id: string = 'card-panel';

    static SELECTED: DeckCard = null;

    private static input_event_listeners(
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
        };
    }

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

        HTML.input({
            id: 'quantity-input',
            value: card.quantity,
            ...this.input_event_listeners(value => {
                let quantity = Number.parseInt(value);
                if (is_nullish(quantity)) quantity = 1;
                edit_card_field(card, 'quantity', quantity);
                return `${quantity}`;
            }),
        });

        HTML.input({
            id: 'name-input',
            value: card.name || '',
            ...this.input_event_listeners(value => {
                edit_card_field(card, 'name', value || null);
                return value;
            }),
        });

        HTML.input({
            id: 'set-input',
            class: card.invalid_set() ? 'error' : '-error',
            value: card.set?.toUpperCase() || '',
            ...this.input_event_listeners((value) => {
                value = API.SETS.normalise(value);
                edit_card_field(card, 'set', value || null);
                return value.toUpperCase();
            }),
        });

        HTML.input({
            id: 'collector-number-input',
            class: card.invalid_collector_number() ? 'error' : '-error',
            value: card.collector_number,
            ...this.input_event_listeners((value) => {
                edit_card_field(card, 'collector_number', value || null);
                return value.toUpperCase();
            }),
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

        HTML.select({
            id: 'language-input',
            class: card.invalid_language() ? 'error' : '-error',
            value: card.language.code(),
            onchange: ({value}) => {
                edit_card_field(card, 'language', Language.match(value));
            },
        }, Language.all().map(language =>
            HTML.option({value: language.code()}, language.name)));

        HTML.select({
            id: 'board-input',
            value: card.board.code(),
            onchange: ({value}) => {
                edit_card_field(card, 'board', Board.match(value));
            },
        }, Board.all().map(board =>
            HTML.option({value: board.code()}, board.name)));

        HTML.select({
            id: 'finish-input',
            value: card.finish.code(),
            onchange: ({value}) => {
                edit_card_field(card, 'finish', Finish.match(value));
            },
        }, Finish.all().map(finish =>
            HTML.option({value: finish.code()}, finish.name)));

        HTML.select({
            id: 'condition-input',
            value: card.condition?.code() ?? '',
            onchange: ({value}) => {
                edit_card_field(card, 'condition', Condition.match(value));
            },
        },[
            HTML.option({value: ''}, 'Unspecified'),
            ...Condition.all().map(condition =>
                HTML.option({value: condition.code()}, condition.name)),
        ]);
    }

    static close(): void {
        DeckView.deselect(this.SELECTED);
        this.SELECTED = null;
        super.close();
    }
}
