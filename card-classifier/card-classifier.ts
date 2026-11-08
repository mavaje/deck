import {DeckCard} from "../deck-card";
import {is_nullish} from "../value";
import {CardList} from "../card-list";
import {Face} from "../face";
import {DeckView} from "../ui/deck-view";
import {FaceSelector} from "./face-selector";

export type BaseGroup<T = string | number> = {
    name?: string;
    value?: T;
    icon?: string;
    color?: string[];
};

export type CardGroup<T = string | number> = BaseGroup<T> & {
    cards: CardList;
};

export type SuperGroup<T = string | number> = BaseGroup<T> & {
    groups: Group<T>[];
    count: number;
};

export type Group<T = string | number> = CardGroup<T> | SuperGroup<T>;

export abstract class CardClassifier<T extends string | number = string | number> {
    static STRING_COMPARATOR = new Intl.Collator('en', {numeric: true});

    static name: string = 'None';
    static ungrouped_name: string = 'Unknown';

    split_by_face: boolean = false;

    constructor(protected cards: CardList) {}

    groups(): Group[] {
        return [{
            cards: this.cards,
        }];
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
        group?: (value: T, face: Face) => BaseGroup<T>,
        groups?: Partial<Record<T, Partial<CardGroup>>>,
    ) {
        return this.group_by(
            card => DeckView.FACE_SELECTOR.get(card).flatMap(get),
            group,
            groups,
        );
    }

    protected group_by(
        get: (card: DeckCard) => T | T[],
        group: (value: T, card: DeckCard) => BaseGroup<T> = value => ({name: String(value), value}),
        groups: Partial<Record<T, Partial<CardGroup>>> = {},
    ): Group[] {
        this.cards
            .map(card => {
                let values = get(card);
                if (!Array.isArray(values)) values = [values];
                [...new Set(values)].forEach(value => {
                    if (is_nullish(value)) return;
                    groups[value] ??= group(value, card);
                    if (groups[value]) {
                        groups[value].cards ??= new CardList();
                        groups[value].cards.push(card);
                    }
                });
            });
        return (Object.values(groups) as CardGroup[])
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

    protected compare_number(a: DeckCard, b: DeckCard, get: (face: Face, card: DeckCard) => number): number {
        const value_a = get(DeckView.FACE_SELECTOR.get(a)[0], a);
        const value_b = get(DeckView.FACE_SELECTOR.get(b)[0], b);
        return this.nulls_last(value_a, value_b)
            || value_a - value_b;
    }

    protected compare_string(a: DeckCard, b: DeckCard, get: (face: Face, card: DeckCard) => string): number {
        const value_a = get(DeckView.FACE_SELECTOR.get(a)[0], a);
        const value_b = get(DeckView.FACE_SELECTOR.get(b)[0], b);
        return this.nulls_last(value_a, value_b)
            || CardClassifier.STRING_COMPARATOR.compare(value_a, value_b);
    }

    protected compare_index<T>(a: DeckCard, b: DeckCard, get: (face: Face, card: DeckCard) => T, ordering: T[]): number {
        const value_a = get(DeckView.FACE_SELECTOR.get(a)[0], a);
        const value_b = get(DeckView.FACE_SELECTOR.get(b)[0], b);
        return this.nulls_last(value_a, value_b)
            || ordering.indexOf(value_a) - ordering.indexOf(value_b);
    }

    protected nulls_last(a: any, b: any): number {
        const null_a = is_nullish(a) ? 1 : 0;
        const null_b = is_nullish(b) ? 1 : 0;
        return null_a - null_b;
    }

    protected lands_first(a: DeckCard, b: DeckCard): number {
        const land_a = DeckView.FACE_SELECTOR.get(a)[0]?.is_type('Land') ? 1 : 0;
        const land_b = DeckView.FACE_SELECTOR.get(b)[0]?.is_type('Land') ? 1 : 0;
        return land_b - land_a;
    }
}
