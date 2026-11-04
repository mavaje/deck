import {CardClassifier, Group} from "./card-classifier";
import {DeckCard} from "../deck-card";
import {fraction} from "../text";

export class ManaValue extends CardClassifier {
    static name: string = 'Mana Value';
    static ungrouped_name: string = 'No Mana Cost';

    groups(): Group[] {
        return this.group_by(
            card => card.main_face().is_type('Land') ? -1 : card.main_face().mana_value(),
            mv => ({name: `${fraction(mv)}-drop`}),
            {[-1]: {name: 'Land'}},
        );
    }

    compare(a: DeckCard, b: DeckCard): number {
        return this.lands_first(a, b)
            || this.compare_number(a, b, card => card.main_face().mana_value());
    }
}
