import {Action} from "./action";
import {DeckCard} from "../deck-card";
import {Card} from "../scryfall/types";

export class SetCardPrinting extends Action {

    private old_values: Partial<DeckCard>;

    constructor(
        private card: DeckCard,
        private printing: Card,
    ) {
        super();
    }

    message(): string {
        const {set, collector_number} = this.printing;
        return `Set card printing to ${set}:${collector_number}`;
    }

    execute(): void {
        const {card, printing} = this;
        this.old_values = {
            name: card.name,
            set: card.set,
            collector_number: card.collector_number,
            language: card.language,
            finish: card.finish,
            card: card.card,
        };
        card.hydrate_printing(printing);
    }

    reverse(): Action {
        return new RevertCardPrinting(
            this.card,
            this.old_values,
        );
    }

    is_noop(): boolean {
        const {card, printing} = this;
        return printing.id === card.card?.id
            && printing.name === card.card_name()
            && printing.set === card.set
            && printing.collector_number === card.collector_number
            && printing.lang === card.language.code()
            && printing.finishes.includes(card.finish.sf_finish());
    }
}

class RevertCardPrinting extends Action {

    private old_printing: Card;

    constructor(
        private card: DeckCard,
        private values: Partial<DeckCard>,
    ) {
        super();
    }

    message(): string {
        return `Revert card printing`;
    }

    execute(): void {
        const {card, values} = this;
        this.old_printing = card.card;
        Object.assign(card, values);
        card.hydrate();
    }

    reverse(): Action {
        return new SetCardPrinting(
            this.card,
            this.old_printing,
        );
    }
}
