import {ColorSet} from "../color-set";
import {gradient} from "../color";
import {CardClassifier} from "./card-classifier";
import {DeckCard} from "../deck-card";
import {Color} from "./color";
import {Group} from "./group";

export class ColorIdentity extends CardClassifier<number> {
    static name: string = 'Color Identity';

    groups() {
        return this.group_by(
            card => ColorSet.index(card.color_identity()),
            undefined,
            Object.entries(ColorSet.all()).map(([name, colors], index) => new Group({
                name,
                value: index,
                color: gradient(colors),
                ...Color.COLOR_GROUPS[name] ?? {},
            })),
        );
    }

    compare(a: DeckCard, b: DeckCard): number {
        return this.compare_card_number(a, b, card => ColorSet.index(card.color_identity()));
    }
}
