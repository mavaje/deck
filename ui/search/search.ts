import {HTML} from "../xml";
import {API} from "../../scryfall/api";
import {DeckCard} from "../../deck-card";
import {CardView} from "../card-view";
import {count_plural} from "../../text";
import {Panel} from "../panel";
import {CardPanel} from "../deck/card-panel";
import {set_card_printing} from "../../history/history";

export class Search extends Panel {
    static id: string = 'search-results';

    static initialise() {
        HTML.button({
            id: 'search-collapse',
            onclick: () => this.toggle(),
        });

        HTML.input({
            id: 'search-query',
            onkeypress: (input, {key}) => {
                if (key === 'Enter') {
                    this.run();
                    input.blur();
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

    static async run(query: string = HTML.input({id: 'search-query'}).value): Promise<void> {
        HTML.input({id: 'search-query', value: query});
        if (!query) return;
        this.open();
        HTML.div({id: 'search-status'}, 'Searching...');
        HTML.div({id: 'search-results', class: 'searching'}, HTML.div(
            {class: 'groups'},
            [...Array(5)]
                .map((_, i) =>
                    HTML.div({id: `search-stack-${i}`, class: 'stack'},
                        CardView.render(DeckCard.empty(), null, `search-result-${i}`),
                    )
                ),
        ));
        const card_list = await API.card_search(query);
        if (card_list) {
            HTML.div({id: 'search-status'}, `Found ${count_plural(card_list.total_cards, 'card')}`);
            HTML.div({id: 'search-results', class: '-searching'}, HTML.div(
                {class: 'groups'},
                card_list.data
                    .map(card => DeckCard.from_card(card, true))
                    .map((card, i) =>
                        HTML.div({id: `search-stack-${i}`, class: 'stack'},
                            CardView.render(
                                card,
                                null,
                                `search-result-${i}`,
                                false,
                                () => {
                                    if (card.card.oracle_id === CardPanel.SELECTED?.card?.oracle_id) {
                                        set_card_printing(CardPanel.SELECTED, card.card);
                                    }
                                },
                            ),
                        )
                    ),
            ));
        } else {
            this.close();
            HTML.div({id: 'search-status'}, 'No cards found');
            HTML.div({id: 'search-results', class: '-searching'}, []);
        }
    }
}
