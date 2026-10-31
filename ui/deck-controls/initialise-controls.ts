import {initialise_deck_upload} from "./deck-upload";
import {initialise_deck_controls} from "./deck-controls";

export function initialise_controls() {
    initialise_deck_controls();
    initialise_deck_upload();
}
