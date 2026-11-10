import {ColorSet} from "../color-set";
import {CardClassifier} from "./card-classifier";
import {DeckCard} from "../deck-card";
import {Type} from "./type";
import {Group} from "./group";
import {color_group} from "./color-names";

export class Color extends CardClassifier<number> {
    static name: string = 'Color';

    split_by_face: boolean = true;

    groups() {
        return this.group_by_face(
            face => face.is_type('Land')
                ? 0
                : ColorSet.index(face.colors()) + 1,
            undefined,
            [
                new Group({
                    name: 'Land',
                    value: 0,
                    ...Type.TYPE_GROUPS['Land'],
                }),
                ...Object.entries(ColorSet.colors).map(([code, colors], index) => new Group({
                    ...color_group(colors),
                    value: index + 1,
                })),
            ],
        );
    }

    compare(a: DeckCard, b: DeckCard): number {
        return this.lands_first(a, b)
            || this.compare_card_number(a, b, face => ColorSet.index(face.colors()));
    }
}
