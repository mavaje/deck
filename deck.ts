import {DeckCard} from "./deck-card";
import {Format} from "./format";
import {API} from "./scryfall/api";

export class Deck {

    cards: DeckCard[] = [];
    format: Format;

    static parse(input: string) {
        const deck = new Deck();

        input.split('\n').forEach(line => {
            const card = DeckCard.parse(line);
            if (card) deck.cards.push(card);
        });

        return deck;
    }

    async load(): Promise<this> {
        const unidentified: DeckCard[] = [];

        for (let i = 0; i < this.cards.length; i += 75) {
            const chunk = this.cards.slice(i, i + 75);

            const cards = await API.cards(chunk.map(c => c.identifier()));

            let offset = 0;
            for (const card of chunk) {
                const i1 = card.identifier();
                if (!cards.not_found.some(i2 =>
                    Object.keys(i1).length === Object.keys(i2).length &&
                    Object.keys(i1).every(key => i1[key] === i2[key])
                )) {
                    card.hydrate(cards.data[offset]);
                    offset++;
                } else {
                    unidentified.push(card);
                }
            }
        }

        await Promise.all(unidentified.map(card => card.load()));

        return this;
    }
}
