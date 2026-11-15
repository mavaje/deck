import {DeckPanel} from "./deck/deck-panel";
import {Search} from "./search/search";

export function initialise_ui() {
    Search.initialise();
    DeckPanel.initialise();
}
