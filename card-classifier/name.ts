import {CardClassifier} from "./card-classifier";
import {DeckCard} from "../deck-card";

export class Name extends CardClassifier {
    static name: string = 'Name';

    compare(a: DeckCard, b: DeckCard): number {
        return this.compare_card_string(a, b, (_, card) => card
            .display_name());
    }
}
