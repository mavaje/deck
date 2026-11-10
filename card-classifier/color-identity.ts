import {ColorSet} from "../color-set";
import {CardClassifier} from "./card-classifier";
import {DeckCard} from "../deck-card";
import {Group} from "./group";
import {color_group} from "./color-names";

export class ColorIdentity extends CardClassifier<number> {
    static name: string = 'Color Identity';

    groups() {
        return this.group_by(
            card => ColorSet.index(card.color_identity()),
            undefined,
            Object.entries(ColorSet.colors).map(([code, colors], index) => new Group({
                ...color_group(colors),
                value: index,
            })),
        );
    }

    compare(a: DeckCard, b: DeckCard): number {
        return this.compare_card_number(a, b, card => ColorSet.index(card.color_identity()));
    }
}
