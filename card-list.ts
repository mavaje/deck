import {DeckCard} from "./deck-card";
import {CardOrdering} from "./card-sorting/card-ordering";

export class CardList {

    constructor(public cards: DeckCard[] = []) {}

    add(card: DeckCard) {
        for (const existing_card of this.cards) {
            if (existing_card.matches(card)) {
                if (existing_card.quantity + card.quantity > 999) {
                    card.quantity += existing_card.quantity - 999;
                    existing_card.quantity = 999;
                } else {
                    existing_card.quantity += card.quantity;
                    return;
                }
            }
        }

        this.cards.push(card);
    }

    *flat(): Generator<DeckCard> {
        for (const card of this.cards) {
            for (let i = 0; i < card.quantity; i++) {
                yield card;
            }
        }
    }

    count(): number {
        return this.cards.reduce((count, card) => count + card.quantity, 0);
    }

    filter(predicate: (card: DeckCard) => any): CardList {
        return new CardList(this.cards.filter(predicate));
    }

    skip_empty(): CardList {
        return this.filter(card => card.quantity > 0);
    }

    filter_by_count(predicate: (count: number, card: DeckCard) => any): CardList {
        const counts = this.count_map();
        return new CardList(this.cards
            .filter(card => predicate(counts[card.name], card)));
    }

    each<T>(callback: (card: DeckCard, index: number) => T): T[] {
        return this.cards.map(callback);
    }

    sort(ordering: CardOrdering): CardList {
        this.cards.sort(ordering.compare);
        return this;
    }

    by_count<T>(callback: (count: number, card: DeckCard) => T): T[] {
        const counts = this.count_map();
        return this.each(card => callback(counts[card.name], card));
    }

    protected count_map(): Record<string, number> {
        const counts: Record<string, number> = {};
        this.cards.forEach(card => {
            counts[card.name] ??= 0;
            counts[card.name] += card.quantity;
        });
        return counts;
    }
}
