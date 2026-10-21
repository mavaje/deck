import {DeckCard} from "./deck-card";
import {Format} from "./format";
import {API} from "./scryfall/api";
import {BoardName, DEFAULT_BOARD, match_board} from "./board";
import {validate} from "./deck-error";
import {ColorIdentity} from "./color-identity";

export class Deck {

    cards: DeckCard[] = [];
    format: Format;

    static card_count(cards: DeckCard[]): number {
        return cards.reduce((count, card) => count + card.quantity, 0);
    }

    static parse(input: string) {
        const deck = new Deck();

        let group_board: BoardName = DEFAULT_BOARD;
        let group_tag: string = null;

        input.split('\n').forEach(line => {
            if (/^\s*$/.test(line)) {
                group_board = DEFAULT_BOARD;
                group_tag = null;
                return;
            }

            if (/^about$/i.test(group_tag)) return;

            const header_match = line.match(/^\s*(?<tag>\/\/|#)?\s*(?<header>\w.*?):?(\s*\(\d+\):?)?\s*$/i);
            if (header_match) {
                const {tag, header} = header_match.groups;

                const board = match_board(header);
                if (board) {
                    group_board = board.name;
                    return;
                }

                if (tag) {
                    group_tag = header;
                    return;
                }
            }

            const card = DeckCard.parse(line, group_board);
            if (card) {
                if (group_tag) {
                    card.tags.push(group_tag);
                }
                deck.add(card);
            } else {
                console.error(`Failed to parse line "${line}"`);
            }
        });

        return deck;
    }

    async load(): Promise<this> {
        this.cards.forEach(card => card.load_from_cache());

        const deck_cards = this.cards
            .filter(card => !card.card && !card.not_found);

        for (let i = 0; i < deck_cards.length; i += API.CARDS_MAX) {
            const chunk = deck_cards.slice(i, i + API.CARDS_MAX);

            if (chunk.length < 2) break;

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

        await Promise.all(deck_cards.map(card => card.load()));

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

    count(board: BoardName): number;
    count(...boards: BoardName[]): number;
    count(...boards: BoardName[]): number {
        return this.cards_on_board(...boards)
            .reduce((count, card) => count + card.quantity, 0);
    }

    cards_on_board(board: BoardName): DeckCard[];
    cards_on_board(...boards: BoardName[]): DeckCard[];
    cards_on_board(...boards: BoardName[]): DeckCard[] {
        return this.cards
            .filter(card => card.quantity > 0 && card.on_board(...boards));
    }

    is_valid(): boolean {
        return validate(this).length === 0;
    }

    color_identity(): ColorIdentity {
        const commanders = this.cards_on_board('Commander');

        if (commanders.length === 0) return null;

        const color_identity = new ColorIdentity();
        commanders.forEach(card => color_identity.add(card.color_identity()));

        return color_identity;
    }
}
