import {CardClassifier} from "./card-classifier";
import {DeckCard} from "../deck-card";

export class Set extends CardClassifier {
    static name: string = 'Set';
    static ungrouped_name: string = 'Unspecified';

    groups() {
        return this.group_by(
            card => card.set,
            (value, card) => ({name: card.card?.set_name
                    ? `${card.card.set_name} (${value})`
                    : value}),
        );
    }

    compare(a: DeckCard, b: DeckCard): number {
        return this.compare_string(a, b, card =>
            card.set
                ? [
                    card.set,
                    card.card?.collector_number ?? card.collector_number,
                ].join('-')
                : null,
        );
    }
}
