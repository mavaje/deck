import {CardClassifier, Group} from "./card-classifier";
import {DeckCard} from "../deck-card";
import {fraction} from "../text";

export class ManaValue extends CardClassifier {
    static name: string = 'Mana Value';
    static ungrouped_name: string = 'Unknown';

    groups(): Group[] {
        return [
            {name: 'Land', cards: this.deck.filter(card => card.is_type('Land'))},
            ...this.group_by(
                card => card.is_type('Land') ? null : card.main_face().mana_value(),
                mv => ({name: `${fraction(mv)}-drop`})
            ),
        ];
    }

    compare(a: DeckCard, b: DeckCard): number {
        return this.lands_first(a, b)
            || a.main_face().mana_value() - b.main_face().mana_value();
    }
}
