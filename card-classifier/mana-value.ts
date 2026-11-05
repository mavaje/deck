import {CardClassifier, Group} from "./card-classifier";
import {DeckCard} from "../deck-card";
import {fraction} from "../text";

export class ManaValue extends CardClassifier<number> {
    static name: string = 'Mana Value';
    static ungrouped_name: string = 'No Mana Cost';

    groups(): Group[] {
        return this.group_by(
            card => card.main_face().is_type('Land') ? -1 : card.main_face().mana_value(),
            mv => ({
                name: mv < 0 ? 'Land' : `${fraction(mv)}-drop`,
                value: mv,
            }),
        );
    }

    compare(a: DeckCard, b: DeckCard): number {
        return this.lands_first(a, b)
            || this.compare_number(a, b, card => card.main_face().mana_value());
    }
}
