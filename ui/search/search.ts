import {HTML} from "../xml";
import {API} from "../../scryfall/api";
import {DeckCard} from "../../deck-card";
import {CardView} from "../card-view";

const SEARCH_INPUT = HTML.input({id: 'search-query'});
const SEARCH_RESULTS = HTML.div({id: 'search-results'});

export function initialise_search() {
    SEARCH_INPUT.addEventListener('keypress', ({key}) => {
        if (key === 'Enter') search();
    })

    HTML.button({
        id: 'search-button',
        onclick: () => search(),
    });
}

export async function search(query: string = SEARCH_INPUT.value): Promise<void> {
    SEARCH_INPUT.value = query;
    if (!query) return;
    SEARCH_RESULTS.classList.remove('collapsed');
    SEARCH_RESULTS.classList.add('loading');
    HTML.div({id: 'search-results'}, HTML.div(
        {class: 'groups'},
        [...Array(3)]
            .map((_, i) =>
                HTML.div({id: `search-stack-${i}`, class: 'stack'},
                    CardView.render(DeckCard.empty(), null, `search-result-${i}`),
                )
            ),
    ));
    const card_list = await API.card_search(query);
    await new Promise(resolve => setTimeout(resolve, 3000));
    SEARCH_RESULTS.classList.remove('loading');
    if (card_list) {
        HTML.div({id: 'search-results'}, HTML.div(
            {class: 'groups'},
            card_list.data
                .map(card => DeckCard.from_card(card, true))
                .map((card, i) =>
                    HTML.div({id: `search-stack-${i}`, class: 'stack'},
                        CardView.render(card, null, `search-result-${i}`),
                    )
                ),
        ));
    }
}
