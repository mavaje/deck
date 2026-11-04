import {HTML} from "./html";
import {DeckCard} from "../deck-card";

export class CardEditView {

    static show(
        card: DeckCard,
    ): HTMLDivElement {
        return HTML.div({
            id: 'card-edit-modal',
            class: 'modal',
        });
    }
}
