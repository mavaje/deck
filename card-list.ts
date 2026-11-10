import {DeckCard} from "./deck-card";

export class CardList extends Array<DeckCard> {

    constructor(cards: number | DeckCard[] = []) {
        if (Array.isArray(cards)) {
            super(...cards);
        } else {
            super(cards);
        }
    }

    count(): number {
        return this.reduce((count, card) => count + card.quantity, 0);
    }

    copy(): CardList {
        return new CardList(this);
    }

    filter(predicate: (card: DeckCard, index: number, array: CardList) => any): CardList {
        return new CardList(super.filter(predicate));
    }

    skip_empty(): CardList {
        return this.filter(card => card.quantity > 0);
    }

    filter_by_count(predicate: (count: number, card: DeckCard) => any): CardList {
        const counts = this.count_map();
        return this.filter(card => predicate(counts[card.name], card));
    }

    by_count<T>(callback: (count: number, card: DeckCard) => T): T[] {
        const counts = this.count_map();
        return this.map(card => callback(counts[card.name], card));
    }

    protected count_map(): Record<string, number> {
        const counts: Record<string, number> = {};
        this.forEach(card => {
            counts[card.name] ??= 0;
            counts[card.name] += card.quantity;
        });
        return counts;
    }
}
