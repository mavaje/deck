import {CardClassifier} from "./card-classifier";
import {DeckCard} from "../deck-card";

export class PriceUSD extends CardClassifier {
    static name: string = 'Price - USD';

    compare(a: DeckCard, b: DeckCard): number {
        return this.compare_card_number(a, b, card => Number.parseFloat(card.card?.prices?.usd));
    }
}

export class PriceEUR extends CardClassifier {
    static name: string = 'Price - EUR';

    compare(a: DeckCard, b: DeckCard): number {
        return this.compare_card_number(a, b, card => Number.parseFloat(card.card?.prices?.eur));
    }
}

export class PriceTIX extends CardClassifier {
    static name: string = 'Price - TIX';

    compare(a: DeckCard, b: DeckCard): number {
        return this.compare_card_number(a, b, card => Number.parseFloat(card.card?.prices?.tix));
    }
}
