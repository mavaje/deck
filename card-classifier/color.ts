import {ColorSet} from "../color-set";
import {gradient} from "../color";
import {CardClassifier, Group} from "./card-classifier";
import {DeckCard} from "../deck-card";

export class Color extends CardClassifier {
    static name: string = 'Color';

    groups() {
        return this.group_by<number>(
            card => card.main_face().is_type('Land')
                ? 0
                : ColorSet.index(card.main_face().colors()) + 1,
            undefined,
            [
                {name: 'Land'},
                ...Object.entries(ColorSet.all()).map(([name, colors]) => ({
                    name,
                    color: gradient(colors),
                } as Group)),
            ],
        );
    }

    compare(a: DeckCard, b: DeckCard): number {
        return this.lands_first(a.main_face(), b.main_face())
            || this.compare_number(a, b, card => ColorSet.index(card.main_face().colors()));
    }
}
