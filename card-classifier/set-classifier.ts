import {CardClassifier, Group} from "./card-classifier";
import {DeckCard} from "../deck-card";
import {API} from "../scryfall/api";
import {Card, Set as SFSet} from "../scryfall/types";

export class SetClassifier extends CardClassifier<string> {
    static name: string = 'Set';
    static ungrouped_name: string = 'Unspecified';

    groups(): Group[] {
        if (API.SETS.is_loaded()) {
            const sets: Set<SFSet> = new Set();
            this.cards.forEach(card => {
                let set_code = card.card?.set ?? card.set;
                while (set_code) {
                    const set = API.SETS.get(set_code);
                    if (!set || sets.has(set)) break;
                    sets.add(set);
                    set_code = set.parent_set_code;
                }
            });
            return this.set_groups(
                [...sets],
                set => !set.parent_set_code,
            );
        } else {
            return this.group_by(
                card => card.card?.set ?? card.set,
                (code, card) => ({
                    name: card.card?.set_name ?? code.toUpperCase(),
                    value: code,
                }),
            );
        }
    }

    set_groups(sets: SFSet[], filter: (set: SFSet) => any): Group[] {
        return sets
            .filter(filter)
            .map(set => ({
                name: set.name,
                value: set.code,
                icon: set.icon_svg_uri,
                cards: this.cards.filter(card => API.SETS.normalise_key(card.card?.set ?? card.set) === set.code),
                groups: this.set_groups(sets, set => set.parent_set_code === set.code),
            } as Group<string>));
    }

    compare(a: DeckCard, b: DeckCard): number {
        return this.compare_string(a, b, face =>
            face.card?.set
                ? [
                    face.card.set,
                    face.card.collector_number,
                ].join('-')
                : null,
        );
    }
}
