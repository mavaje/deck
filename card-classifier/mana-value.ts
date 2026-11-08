import {CardClassifier, Group} from "./card-classifier";
import {DeckCard} from "../deck-card";
import {fraction} from "../text";
import {Type} from "./type";

export class ManaValue extends CardClassifier<number> {
    static name: string = 'Mana Value';
    static ungrouped_name: string = 'No Mana Cost';

    split_by_face: boolean = true;

    groups(): Group[] {
        return this.group_by_face(
            face => face.is_type('Land') ? -1 : face.mana_value(),
            mv => (mv < 0 ? {
                name: 'Land',
                value: mv,
                ...Type.TYPE_GROUPS['Land'],
            } : {
                name: `${fraction(mv)}-drop`,
                value: mv,
            }),
        );
    }

    compare(a: DeckCard, b: DeckCard): number {
        return this.lands_first(a, b)
            || this.compare_number(a, b, face => face.mana_value());
    }
}
