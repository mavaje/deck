import {Action} from "./action";
import {DeckCard} from "../deck-card";
import {Deck} from "../deck";
import {DeckView} from "../ui/deck/deck-view";
import {CardPanel} from "../ui/deck/card-panel";
import {AddCard} from "./add-card";

export class DeleteCard extends Action {

    private index: number;

    constructor(
        private deck: Deck,
        private card: DeckCard,
    ) {
        super();
    }

    message(): string {
        return `Delete card "${this.card.name}"`;
    }

    execute(): void {
        const {deck, card} = this;
        this.index = deck.indexOf(card);
        deck.splice(this.index, 1);
        DeckView.render();
        if (card === CardPanel.SELECTED) {
            CardPanel.close();
        }
    }

    reverse(): Action {
        return new AddCard(
            this.deck,
            this.card,
            this.index,
        );
    }

    is_noop(): boolean {
        const {deck, card} = this;
        return deck.indexOf(card) < 0;
    }
}
