import {HTML} from "../xml";
import {API} from "../../scryfall/api";
import {DeckCard} from "../../deck-card";
import {CardView} from "../card-view";
import {count_plural} from "../../text";

function expand_search() {
    HTML.div({id: 'search-results', class: '-collapsed'});
    HTML.button({id: 'search-collapse'}, '-');
}

function collapse_search() {
    HTML.div({id: 'search-results', class: 'collapsed'});
    HTML.button({id: 'search-collapse'}, '+');
}

export function initialise_search() {
    HTML.button({
        id: 'search-collapse',
        onclick: () => {
            if (HTML.div({id: 'search-results'}).classList.contains('collapsed')) {
                expand_search();
            } else {
                collapse_search();
            }
        },
    });

    HTML.input({
        id: 'search-query',
        onkeypress: (_, {key}) => {
            if (key === 'Enter') search();
        },
    });

    HTML.button({
        id: 'search-button',
        onclick: () => search(),
    });
}

export async function search(query: string = HTML.input({id: 'search-query'}).value): Promise<void> {
    HTML.input({id: 'search-query', value: query});
    if (!query) return;
    expand_search();
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
                        CardView.render(card, null, `search-result-${i}`),
                    )
                ),
        ));
    } else {
        collapse_search();
        HTML.div({id: 'search-status'}, 'No cards found');
        HTML.div({id: 'search-results', class: '-searching'}, []);
    }
}
