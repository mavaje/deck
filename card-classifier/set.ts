import {CardClassifier} from "./card-classifier";
import {DeckCard} from "../deck-card";
import {SET_CACHE} from "../scryfall/set";

export class Set extends CardClassifier<string> {
    static name: string = 'Set';
    static ungrouped_name: string = 'Unspecified';

    groups() {
        return this.group_by(
            card => card.set,
            (code, card) => ({
                name: card.card?.set_name
                    ? `${card.card.set_name} (${code})`
                    : code,
                value: code,
                icon: SET_CACHE.get(code.toLowerCase())?.icon_svg_uri,
            }),
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
