import {CardClassifier} from "./card-classifier";
import {DeckCard} from "../deck-card";

export class RankEDHREC extends CardClassifier {
    static name: string = 'Rank - EDHREC';

    compare(a: DeckCard, b: DeckCard): number {
        return this.compare_card_number(a, b, card => card.card?.edhrec_rank);
    }
}

export class RankPenny extends CardClassifier {
    static name: string = 'Rank - Penny Dreadful';

    compare(a: DeckCard, b: DeckCard): number {
        return this.compare_card_number(a, b, card => card.card?.penny_rank);
    }
}
