import {HTML} from "../xml";
import {API} from "../../scryfall/api";
import {DeckCard} from "../../deck-card";
import {CardView} from "../card-view";
import {count_plural} from "../../text";
import {Panel} from "../panel";
import {CardPanel} from "../deck/card-panel";
import {SetCardPrinting} from "../../history/set-card-printing";
import {Deck} from "../../deck";

export class Search extends Panel {
    static id: string = 'search-results';

    static HISTORY = new Set<string>();
    static HISTORY_INDEX: number = 0;
    static CURRENT_VALUE: string = '';

    static initialise() {
        HTML.button({
            id: 'search-collapse',
            onclick: () => this.toggle(),
        });

        HTML.form({
            id: 'search-form',
            onsubmit: (_, event) => {
                event.preventDefault();
                this.run(HTML.input({id: 'search-query'}).value);
            },
        });

        HTML.button({
            id: 'search-clear',
            onclick: () => HTML.input({id: 'search-query', value: ''}),
        });

        HTML.input({
            id: 'search-results',
            onwheel: (input, event) => {
                if (event.deltaX === 0) {
                    input.scrollLeft += event.deltaY;
                    event.preventDefault();
                }
            },
        });
    }

    static open() {
        HTML.button({id: 'search-collapse'}, '-');
        super.open();
    }

    static close() {
        HTML.button({id: 'search-collapse'}, '+');
        super.close();
    }

    static async run(query: string): Promise<void> {
        query = query
            .replaceAll(/^\s+|\s+$/g, '')
            .replaceAll(/\s+/g, ' ');

        HTML.input({id: 'search-query', value: query});
        if (!query) return;

        this.HISTORY.delete(query);
        this.HISTORY.add(query);
        this.HISTORY_INDEX = 1;
        HTML.input({
            id: 'search-query',
            oninput: input => {
                this.HISTORY_INDEX = 0;
                this.CURRENT_VALUE = input.value;
            },
            onkeydown: (input, event) => {
                switch (event.key) {
                    case 'ArrowUp':
                        if (this.HISTORY_INDEX < this.HISTORY.size) {
                            this.HISTORY_INDEX++;
                            input.value = [...this.HISTORY][this.HISTORY.size - this.HISTORY_INDEX];
                        }
                        event.preventDefault();
                        return;
                    case 'ArrowDown':
                        if (this.HISTORY_INDEX > 0) {
                            this.HISTORY_INDEX--;
                            input.value = [...this.HISTORY][this.HISTORY.size - this.HISTORY_INDEX]
                                ?? this.CURRENT_VALUE;
                        }
                        event.preventDefault();
                        return;
                }
            },
        });

        this.open();
        HTML.div({id: 'search-status'}, 'Searching...');
        HTML.div({id: 'search-results', class: 'searching'}, HTML.div(
            {class: 'groups'},
            [...Array(5)]
                .map((_, i) =>
                    HTML.div({id: `search-stack-${i}`, class: 'stack'},
                        CardView.render(DeckCard.empty(), `search-result-${i}`),
                    )
                ),
        ));

        if (Deck.CURRENT.format) {
            query += ` format:${Deck.CURRENT.format}`;
        }

        if (Deck.CURRENT.game) {
            query += ` game:${Deck.CURRENT.game}`;
        }

        const color_id = Deck.CURRENT.color_identity();
        if (color_id) {
            query += ` id:${color_id.code()}`;
        }

        const card_list = await API.card_search(query);
        if (card_list) {
            HTML.div({id: 'search-status'}, `Found ${count_plural(card_list.total_cards, 'card')}`);
            HTML.div({id: 'search-results', class: []}, HTML.div(
                {class: 'groups'},
                card_list.data
                    .map(card => DeckCard.from_card(card))
                    .map((card, i) => HTML.div(
                        {id: `search-stack-${i}`, class: 'stack'},
                        CardView.render(card, `search-result-${i}`, () => {
                            if (card.oracle_ids().some(id => CardPanel.SELECTED.oracle_ids().includes(id))) {
                                SetCardPrinting.do(CardPanel.SELECTED, card.card);
                            }
                        }),
                    )),
            ));
        } else {
            this.close();
            HTML.div({id: 'search-status'}, 'No cards found');
            HTML.div({id: 'search-results', class: []}, []);
        }
    }
}
