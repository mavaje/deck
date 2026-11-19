import {Action} from "./action";
import {DeckCard} from "../deck-card";
import {Deck} from "../deck";
import {DeckView} from "../ui/deck-view";
import {DeleteCard} from "./delete-card";

export class AddCard extends Action {

    constructor(
        private deck: Deck,
        private card: DeckCard,
        private index: number = null,
    ) {
        super();
    }

    message(): string {
        return `Add card "${this.card.name}"`;
    }

    execute(): void {
        const {deck, card, index} = this;
        if (index === null) {
            deck.push(card);
        } else {
            deck.splice(index, 0, card);
        }
        DeckView.render();
    }

    reverse(): Action {
        return new DeleteCard(
            this.deck,
            this.card,
        );
    }

    is_noop(): boolean {
        const {deck, card} = this;
        return deck.includes(card);
    }
}
