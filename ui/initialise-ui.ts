import {initialise_deck_upload} from "./deck/deck-upload";
import {initialise_deck_panel} from "./deck/deck-panel";
import {initialise_search} from "./search/search";

export function initialise_ui() {
    initialise_search();
    initialise_deck_upload();
    initialise_deck_panel();
}
