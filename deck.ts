import {DeckCard} from "./deck-card";
import {Format} from "./format";
import {API} from "./scryfall/api";
import {BoardName, DEFAULT_BOARD, match_board} from "./board";

export class Deck {

    cards: DeckCard[] = [];
    format: Format;

    static parse(input: string) {
        const deck = new Deck();

        let about_section: boolean = false;
        let group_board: BoardName = DEFAULT_BOARD;

        input.split('\n').forEach(line => {
            if (/^\s*$/.test(line)) {
                about_section = false;
                group_board = DEFAULT_BOARD;
                return;
            }

            if (about_section) return;

            const header_match = line.match(/^\s*(\/\/|#)?\s*(?<header>\w.*?):?(\s*\(\d+\):?)?\s*$/i);
            if (header_match) {
                const {header} = header_match.groups;

                if (/^about$/i.test(header)) {
                    about_section = true;
                    return;
                }

                const board = match_board(header);
                if (board) {
                    group_board = board.name;
                    return;
                }
            }

            const card = DeckCard.parse(line, group_board);
            if (card) {
                deck.add(card);
            } else {
                console.error(`Failed to parse line "${line}"`);
            }
        });

        return deck;
    }

    async load(): Promise<this> {
        for (let i = 0; i < this.cards.length; i += API.CARDS_MAX) {
            const chunk = this.cards.slice(i, i + API.CARDS_MAX);

            const cards = await API.cards(chunk.map(c => c.identifier()));

            let index = 0;
            for (const card of chunk) {
                const i1 = card.identifier();
                if (!cards.not_found.some(i2 =>
                    Object.keys(i1).length === Object.keys(i2).length &&
                    Object.keys(i1).every(key => i1[key] === i2[key])
                )) {
                    card.hydrate(cards.data[index++]);
                }
            }
        }

        await Promise.all(this.cards.map(card => card.load()));

        return this;
    }

    add(card: DeckCard) {
        for (const existing_card of this.cards) {
            if (existing_card.matches(card) && existing_card.quantity + card.quantity < 1000) {
                existing_card.quantity += card.quantity;
                return;
            }
        }

        this.cards.push(card);
    }
}
