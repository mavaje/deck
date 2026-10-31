import {DeckCard} from "../deck-card";
import {Deck} from "../deck";
import {STRING_COMPARATOR} from "./card-ordering";

export type Group = {
    name: string;
    color?: string[];
};

export interface CardGrouping<T = Group> {
    name: string;
    remainder_group_name?: string;
    groups(deck: Deck): T[];
    test(card: DeckCard, group: T): boolean;
}

export function field_grouping<T>(
    name: string,
    get: (card: DeckCard) => T,
    group_name: (value: T) => string = value => String(value),
    remainder_group_name?: string,
): CardGrouping<Group & {value: T;}> {
    return {
        name,
        remainder_group_name,
        groups(deck: Deck) {
            const values = new Set<T>();
            deck.each(card => values.add(get(card)));
            return [...values]
                .filter(value => value !== undefined && value !== null)
                .sort((a, b) => STRING_COMPARATOR.compare(String(a), String(b)))
                .map(value => ({
                    name: group_name(value),
                    value,
                }));
        },
        test: (card, group) => get(card) === group.value,
    };
}
