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

    private static quantity_input(card: DeckCard) {
        return HTML.input({
            id: 'quantity-input',
            type: 'number',
            min: 0,
            value: card.quantity,
            style: {width: '5ch'},
            ...this.input_event_listeners((value) => {
                let quantity = Number.parseInt(value);
                if (is_nullish(quantity)) quantity = 1;
                edit_card_field(card, 'quantity', quantity);
                return `${quantity}`;
            }),
        });
    }

    private static name_input(card: DeckCard) {
        return HTML.input({
            id: 'name-input',
            type: 'text',
            value: card.name || '',
            placeholder: 'Card Name',
            style: {flex: '1'},
            ...this.input_event_listeners((value) => {
                edit_card_field(card, 'name', value || null);
                return value;
            }),
        });
    }

    private static set_input(card: DeckCard) {
        return HTML.input({
            id: 'set-input',
            type: 'text',
            value: card.set?.toUpperCase() || '',
            placeholder: 'Set',
            style: {width: '5ch'},
            ...this.input_event_listeners((value) => {
                value = API.SETS.normalise(value);
                edit_card_field(card, 'set', value || null);
                return value.toUpperCase();
            }),
        });
    }

    private static collector_number_input(card: DeckCard) {
        return HTML.input({
            id: 'collector-number-input',
            type: 'text',
            value: card.collector_number || '',
            placeholder: 'Number',
            style: {width: '6ch'},
            ...this.input_event_listeners((value) => {
                edit_card_field(card, 'collector_number', value || null);
                return value;
            }),
        });
    }

    private static language_input(card: DeckCard) {
        return HTML.select({
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
    }

    private static board_input(card: DeckCard) {
        return HTML.select({
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
    }

    private static finish_input(card: DeckCard) {
        return HTML.select({
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
    }


    private static condition_input(card: DeckCard) {
        return HTML.select({
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
    };

    static open(card: DeckCard): void {
        CardView.deselect(this.SELECTED);
        CardView.select(card);
        this.SELECTED = card;
        if (window.innerWidth < 960) {
            DeckPanel.close();
        }
        super.open();
        HTML.div({id: this.id}, [
            HTML.div({id: 'card-panel-row-0'}, [
                this.quantity_input(card),
                this.name_input(card),
            ]),
            HTML.div({id: 'card-panel-row-1'}, [
                this.set_input(card),
                this.collector_number_input(card),
            ]),
            HTML.div({id: 'card-panel-row-2'}, [
                this.language_input(card),
            ]),
            HTML.div({id: 'card-panel-row-3'}, [
                this.board_input(card),
            ]),
            HTML.div({id: 'card-panel-row-4'}, [
                this.finish_input(card),
            ]),
            HTML.div({id: 'card-panel-row-5'}, [
                this.condition_input(card),
            ]),
        ]);
    }

    static close(): void {
        CardView.deselect(this.SELECTED);
        this.SELECTED = null;
        super.close();
    }
}
