import {HTML} from "../html";
import {Deck} from "../deck";
import {DeckCard} from "../deck-card";

export function deck_upload_button() {
    HTML.button({
        id: 'deck-upload-button',
        onclick: () => file_input.click(),
    });

    const file_input = HTML.input({
        id: 'deck-file-input',
        oninput: () => {
            const file = file_input.files[0];
            file.text()
                .then(input => Deck.load_current(input))
                .then(deck => {
                    DeckCard.CACHE.dump();
                    console.log(deck.to_string());
                });
        },
    });
}
