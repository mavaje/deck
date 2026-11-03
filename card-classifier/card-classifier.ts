import {DeckCard} from "../deck-card";
import {is_nullish} from "../value";
import {CardList} from "../card-list";
import {Face} from "../face";

export type Group = {
    name?: string;
    cards?: CardList;
    color?: string[];
};

export abstract class CardClassifier {
    static STRING_COMPARATOR = new Intl.Collator('en', {numeric: true});

    static name: string = 'None';
    static ungrouped_name: string = 'Unknown';

    constructor(protected cards: CardList) {}

    groups(): Group[] {
        return [{
            cards: this.cards,
        }];
    }

    protected group_by<T extends string | number>(
        get: (card: DeckCard) => T | T[],
        group: (value: T, card?: DeckCard) => Group = value => ({name: String(value)}),
        groups: Partial<Record<T, Group>> = {},
    ): Group[] {
        this.cards
            .map(card => {
                let values = get(card);
                if (!Array.isArray(values)) values = [values];
                values.forEach(value => {
                    if (is_nullish(value)) return;
                    groups[value] ??= group(value, card);
                    groups[value].cards ??= new CardList();
                    groups[value].cards.push(card);
                });
            });
        return (Object.values(groups) as Group[])
            .sort((g1, g2) => {
                const a = g1.cards?.[0];
                const b = g2.cards?.[0];
                return a && b ? this.compare(a, b) : 0;
            });
    }

    compare(a: DeckCard, b: DeckCard): number {
        return 0;
    }

    protected compare_number(a: DeckCard, b: DeckCard, get: (card: DeckCard) => number): number {
        const value_a = get(a);
        const value_b = get(b);
        return this.nulls_last(value_a, value_b)
            || value_a - value_b;
    }

    protected compare_string(a: DeckCard, b: DeckCard, get: (card: DeckCard) => string): number {
        const value_a = get(a);
        const value_b = get(b);
        return this.nulls_last(value_a, value_b)
            || CardClassifier.STRING_COMPARATOR.compare(value_a, value_b);
    }

    protected compare_index<T>(a: DeckCard, b: DeckCard, get: (card: DeckCard) => T, ordering: T[]): number {
        const value_a = get(a);
        const value_b = get(b);
        return this.nulls_last(value_a, value_b)
            || ordering.indexOf(value_a) - ordering.indexOf(value_b);
    }

    protected nulls_last(a: any, b: any): number {
        const null_a = is_nullish(a) ? 1 : 0;
        const null_b = is_nullish(b) ? 1 : 0;
        return null_a - null_b;
    }

    protected lands_first(a: Face, b: Face): number {
        const land_a = a?.is_type('Land') ? 1 : 0;
        const land_b = b?.is_type('Land') ? 1 : 0;
        return land_b - land_a;
    }
}
