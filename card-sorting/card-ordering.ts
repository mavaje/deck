import {DeckCard} from "../deck-card";

export const STRING_COMPARATOR = new Intl.Collator('en', {numeric: true});

export interface CardOrdering {
    name: string;
    compare(card_a: DeckCard, card_b: DeckCard): number;
}

export function numeric_ordering(name: string, get: (card: DeckCard) => number): CardOrdering {
    return {
        name,
        compare: (card_a, card_b) => {
            const a = get(card_a);
            const b = get(card_b);
            return nulls_last(a, b) ?? a - b;
        },
    };
}

export function string_ordering(name: string, get: (card: DeckCard) => string): CardOrdering {
    return {
        name,
        compare: (card_a, card_b) => {
            const a = get(card_a);
            const b = get(card_b);
            return nulls_last(a, b)
                ?? STRING_COMPARATOR.compare(get(card_a), get(card_b))
        },
    };
}

export function nulls_last(a: any, b: any): number {
    const null_a = a === null || a === undefined || Number.isNaN(a) ? 1 : 0;
    const null_b = b === null || b === undefined || Number.isNaN(b) ? 1 : 0;
    if (null_a || null_b) return null_a - null_b;
    return null;
}
