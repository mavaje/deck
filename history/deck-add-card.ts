import {Action} from "./action";
import {DeckCard} from "../deck-card";
import {Deck} from "../deck";
import {DeckView} from "../ui/deck/deck-view";
import {DeckDeleteCard} from "./deck-delete-card";
import {CardEditFields} from "./card-edit-fields";

export class DeckAddCard extends Action {

    private original_quantity: number = null;

    constructor(
        private deck: Deck,
        private card: DeckCard,
        private index: number = null,
        private match_existing: (new_card: DeckCard, existing_card: DeckCard) => boolean = null,
    ) {
        super();
    }

    message(): string {
        return `Add card "${this.card.name}"`;
    }

    execute(): void {
        const {deck, card, index, match_existing} = this;

        if (match_existing) {
            for (const existing_card of deck) {
                if (match_existing(card, existing_card)) {
                    this.original_quantity = existing_card.quantity;
                    existing_card.quantity += card.quantity;
                    this.card = existing_card;

                    this.card.render_hooks();

                    return;
                }
            }
        }

        if (index === null) {
            deck.push(card);
        } else {
            deck.splice(index, 0, card);
        }

        DeckView.render();
    }

    reverse(): Action {
        if (this.original_quantity === null) {
            return new DeckDeleteCard(
                this.deck,
                this.card,
            );
        } else {
            return new CardEditFields(
                this.card,
                {quantity: this.original_quantity},
            );
        }
    }

    is_noop(): boolean {
        const {deck, card} = this;
        return deck.includes(card);
    }
}
