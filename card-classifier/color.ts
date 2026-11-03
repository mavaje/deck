import {ColorSet} from "../color-set";
import {gradient} from "../color";
import {CardClassifier} from "./card-classifier";
import {DeckCard} from "../deck-card";

export class Color extends CardClassifier {
    static name: string = 'Color';
    static ungrouped_name: string = 'Unknown';

    groups() {
        return [
            {name: 'Land', cards: this.deck.filter(card => card.is_type('Land'))},
            ...this.group_by(
                card => card.is_type('Land') ? null : ColorSet.index(card.main_face().colors()),
                undefined,
                Object.fromEntries(Object.entries(ColorSet.all()).map(([name, colors], index) => [index, {
                    name,
                    color: gradient(colors),
                }])),
            ),
        ];
    }

    compare(a: DeckCard, b: DeckCard): number {
        return this.lands_first(a, b)
            || this.compare_number(a, b, card => ColorSet.index(card.main_face().colors()));
    }
}
