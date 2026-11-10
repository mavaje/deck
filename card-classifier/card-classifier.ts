import {DeckCard} from "../deck-card";
import {is_nullish} from "../value";
import {CardList} from "../card-list";
import {Face} from "../face";
import {DeckView} from "../ui/deck-view";
import {FaceSelector} from "./face-selector";
import {Group} from "./group";

export abstract class CardClassifier<T extends string | number = string | number> {
    static STRING_COMPARATOR = new Intl.Collator('en', {numeric: true});

    static name: string = 'None';
    static ungrouped_name: string = 'Unknown';

    split_by_face: boolean = false;

    constructor(protected cards: CardList) {}

    groups(): Group<T>[] {
        return [
            new Group({cards: this.cards.copy()}),
        ];
    }

    match_face(face: Face, value: T): boolean {
        return true;
    }

    face_id(card: DeckCard, value: T): number {
        if (this.split_by_face && DeckView.FACE_SELECTOR === FaceSelector.front) {
            return 0;
        } else if (this.match_face(card.main_face(true), value)) {
            return card.display_face_id;
        } else {
            const face_id = card.faces().findIndex(face => this.match_face(face, value));
            return face_id >= 0 ? face_id : 0;
        }
    }

    protected group_by_face(
        get: (face: Face) => T | T[],
        group?: (value: T, face: Face) => Partial<Group<T>>,
        groups?: Record<T, Group>,
    ): Group<T>[] {
        return this.group_by(
            card => DeckView.FACE_SELECTOR.get(card).flatMap(get),
            group,
            groups,
        );
    }

    protected group_by(
        get: (card: DeckCard) => T | T[],
        group: (value: T, card: DeckCard) => Partial<Group<T>> = value => new Group({name: String(value), value}),
        groups: Record<T, Group> = {} as Record<T, Group>,
    ): Group<T>[] {
        this.cards
            .map(card => {
                let values = get(card);
                if (!Array.isArray(values)) values = [values];
                [...new Set(values)].forEach(value => {
                    if (is_nullish(value)) return;
                    const g = group(value, card);
                    if (g) {
                        groups[value] ??= new Group(g);
                        groups[value].cards ??= new CardList();
                        groups[value].cards.push(card);
                    }
                });
            });
        return (Object.values(groups) as Group<T>[])
            .filter(Boolean)
            .sort((g1, g2) => {
                const a = g1.cards?.[0];
                const b = g2.cards?.[0];
                return a && b ? this.compare(a, b) : 0;
            });
    }

    compare(a: DeckCard, b: DeckCard): number {
        return 0;
    }

    protected compare_card_number(a: DeckCard, b: DeckCard, get: (face: Face, card: DeckCard) => number): number {
        const value_a = get(DeckView.FACE_SELECTOR.get(a)[0], a);
        const value_b = get(DeckView.FACE_SELECTOR.get(b)[0], b);
        return this.nulls_last(value_a, value_b)
            || value_a - value_b;
    }

    protected compare_card_string(a: DeckCard, b: DeckCard, get: (face: Face, card: DeckCard) => string): number {
        const value_a = get(DeckView.FACE_SELECTOR.get(a)[0], a);
        const value_b = get(DeckView.FACE_SELECTOR.get(b)[0], b);
        return this.nulls_last(value_a, value_b)
            || this.compare_string(value_a, value_b);
    }

    protected compare_card_index<T>(a: DeckCard, b: DeckCard, get: (face: Face, card: DeckCard) => T, ordering: T[]): number {
        const value_a = get(DeckView.FACE_SELECTOR.get(a)[0], a);
        const value_b = get(DeckView.FACE_SELECTOR.get(b)[0], b);
        return this.compare_index(value_a, value_b, ordering);
    }

    protected compare_string(a: string, b: string): number {
        return CardClassifier.STRING_COMPARATOR.compare(a, b);
    }

    protected compare_index<T>(a: T, b: T, ordering: T[]): number {
        let index_a = ordering.indexOf(a);
        if (index_a < 0) index_a = Infinity;
        let index_b = ordering.indexOf(b);
        if (index_b < 0) index_a = Infinity;
        return index_a - index_b || 0;
    }

    protected lands_first(a: DeckCard, b: DeckCard): number {
        const land_a = DeckView.FACE_SELECTOR.get(a)[0]?.is_type('Land') ? 1 : 0;
        const land_b = DeckView.FACE_SELECTOR.get(b)[0]?.is_type('Land') ? 1 : 0;
        return land_b - land_a;
    }

    protected nulls_first(a: any, b: any): number {
        return this.nulls_last(b, a);
    }

    protected nulls_last(a: any, b: any): number {
        const null_a = is_nullish(a) ? 1 : 0;
        const null_b = is_nullish(b) ? 1 : 0;
        return null_a - null_b;
    }
}
