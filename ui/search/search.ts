import {HTML} from "../xml";
import {API} from "../../scryfall/api";
import {DeckCard} from "../../deck-card";
import {CardView} from "../card-view";

const SEARCH_INPUT = HTML.input({id: 'search-query'});
const SEARCH_RESULTS = HTML.input({id: 'search-results'});

export function initialise_search() {
    SEARCH_INPUT.addEventListener('keypress', ({key}) => {
        if (key === 'Enter') search();
    })

    HTML.input({
        id: 'search-button',
        onclick: () => search(),
    });
}

export async function search(query: string = SEARCH_INPUT.value): Promise<void> {
    SEARCH_INPUT.value = query;
    if (!query) return;
    SEARCH_RESULTS.classList.remove('collapsed');
    SEARCH_RESULTS.classList.add('loading');
    const card_list = await API.card_search(query);
    SEARCH_RESULTS.classList.remove('loading');
    HTML.input({
        id: 'search-results',
        class: 'groups',
    }, card_list.data
        .map(card => DeckCard.from_card(card, true))
        .map(card => HTML.div({
            class: 'stack',
        }, CardView.render(card))));
}
