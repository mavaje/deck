import {normalise_set} from "../text";
import {CardClassifier} from "./card-classifier";
import {DeckCard} from "../deck-card";

export class Set extends CardClassifier {
    static name: string = 'Set';
    static ungrouped_name: string = 'Unknown';

    groups() {
        return this.group_by(
            card => normalise_set(card.card?.set ?? card.set, true),
            (value, card) => ({name: card.card?.set_name
                    ? `${card.card.set_name} (${value})`
                    : value}),
        );
    }

    compare(a: DeckCard, b: DeckCard): number {
        return this.compare_string(a, b, card =>
            card.card?.set ?? card.set
                ? [
                    normalise_set(card.card?.set ?? card.set, true),
                    card.card?.collector_number ?? card.collector_number,
                ].join('-')
                : null,
        );
    }
}
