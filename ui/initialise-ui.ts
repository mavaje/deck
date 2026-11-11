import {initialise_deck_upload} from "./deck/deck-upload";
import {initialise_deck_controls} from "./deck/deck-controls";
import {initialise_search} from "./search/search";

export function initialise_ui() {
    initialise_search();
    initialise_deck_controls();
    initialise_deck_upload();
}
