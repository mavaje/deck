import {CardClassifier} from "./card-classifier";
import {DeckCard} from "../deck-card";
import {API} from "../scryfall/api";
import {Group} from "./group";

export class SetClassifier extends CardClassifier<string> {
    static name: string = 'Set';
    static ungrouped_name: string = 'Unspecified';

    private group_map: Record<string, Group<string>> = {};

    private add_set(top_groups: Group<string>[], set_code: string): Group<string> {
        const set = API.SETS.get(set_code);

        if (!set) return null;

        if (set.code in this.group_map) {
            return this.group_map[set.code];
        }

        const cards = this.cards.filter(card => card.set_code() === set.code);
        const group = new Group<string>({
            name: set.name,
            value: set.code,
            icon: set.icon_svg_uri,
            groups: [
                new Group<string>({cards}),
            ],
        });
        this.group_map[set.code] = group;

        const parent = this.add_set(top_groups, set.parent_set_code);
        if (parent) {
            parent.groups.push(group);
            parent.groups.sort((a, b) =>
                this.nulls_first(a.value, b.value)
                || this.compare_string(a.value, b.value));
        } else {
            top_groups.push(group);
        }

        return group;
    }

    groups(): Group<string>[] {
        const groups: Group<string>[] = [];

        this.cards.forEach(card => {
            let set_code = card.set_code();
            this.add_set(groups, set_code);
        });

        return groups.sort((a, b) => this.compare_string(a.value, b.value));
    }

    compare(a: DeckCard, b: DeckCard): number {
        return this.compare_card_string(a, b, face =>
            face.card?.set
                ? [
                    face.card.set,
                    face.card.collector_number,
                ].join('-')
                : null,
        );
    }
}
