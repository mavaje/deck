import {ColorSet} from "../color-set";
import {gradient} from "../color";
import {CardClassifier} from "./card-classifier";
import {DeckCard} from "../deck-card";

export class ColorIdentity extends CardClassifier {
    static name: string = 'Color Identity';

    groups() {
        return this.group_by(
            card => ColorSet.index(card.color_identity()),
            undefined,
            Object.fromEntries(Object.entries(ColorSet.all()).map(([name, colors], index) => [index, {
                name,
                color: gradient(colors),
            }])),
        );
    }

    compare(a: DeckCard, b: DeckCard): number {
        return this.compare_number(a, b, card => ColorSet.index(card.color_identity()));
    }
}
