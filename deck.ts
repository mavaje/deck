import {DeckCard} from "./deck-card";
import {Format} from "./format";
import {API} from "./scryfall/api";
import {ColorIdentity} from "./color-identity";
import {Board} from "./designation/board";
import {CardList} from "./card-list";
import { HTML } from "./html";
import {Tag} from "./designation/tag";
import {DeckView} from "./ui/deck-view";

export class Deck extends CardList {

    static current: Deck = new Deck();

    format: Format;

    static parse(input: string) {
        const deck = new Deck();

        let group_board: Board = Board.DEFAULT;
        let group_tag: Tag = null;

        input.split('\n').forEach(line => {
            if (/^\s*$/.test(line)) {
                group_board = Board.DEFAULT;
                group_tag = null;
                return;
            }

            // if (/^about$/i.test(group_tag.name)) return;

            const header_match = line.match(/^\s*(?<tag>\/\/|#)?\s*(?<header>\w.*?):?(\s*\(\d+\):?)?\s*$/i);
            if (header_match) {
                const {tag, header} = header_match.groups;

                const board = Board.match(header, !tag);
                if (board) {
                    group_board = board;
                    return;
                }

                if (tag || /^about$/i.test(header)) {
                    group_tag = Tag.match_or_new(header);
                    return;
                }
            }

            const card = DeckCard.parse(line, deck, group_board);
            if (card) {
                if (group_tag) {
                    card.tags.add(group_tag);
                }
            } else {
                console.error(`Failed to parse line "${line}"`);
            }
        });

        return deck;
    }

    static async load_current(input: string): Promise<Deck> {
        Deck.current = Deck.parse(input);
        DeckView.render();
        await Deck.current.load();
        DeckView.render();
        const first = Deck.current.cards[0];
        if (first?.card) {
            HTML.div({id: 'card-image', style: {
                background_image: `url(${first.face(0, f => f?.image_uris?.art)})`,
            }});
        }
        return Deck.current;
    }

    async load(): Promise<this> {
        this.cards.forEach(card => card.load_from_cache());

        const deck_cards = this.cards
            .filter(card => !card.card && !card.not_found);

        for (let i = 0; i < deck_cards.length; i += API.CARDS_MAX) {
            const chunk = deck_cards.slice(i, i + API.CARDS_MAX);

            if (chunk.length < 2) break;

            const cards = await API.cards(chunk.map(c => c.identifier()));
            if (!cards) break;

            let index = 0;
            for (const card of chunk) {
                const i1 = card.identifier();
                if (!cards.not_found.some(i2 =>
                    Object.keys(i1).length === Object.keys(i2).length &&
                    Object.keys(i1).every(key => i1[key] === i2[key])
                )) {
                    card.hydrate(cards.data[index++]).cache();
                }
            }
        }

        await Promise.all(deck_cards.map(card => card.load()));

        return this;
    }

    board(board: Board): CardList;
    board(...boards: Board[]): CardList;
    board(...boards: Board[]): CardList {
        return this.filter(card => card.on_board(...boards));
    }

    color_identity(): ColorIdentity {
        const commanders = this.board(Board.commander).skip_empty();

        if (commanders.count() === 0) return null;

        const color_identity = new ColorIdentity();
        commanders.cards.forEach(card => color_identity.add(card.color_identity()));

        return color_identity;
    }

    to_string(card_format?: string): string {
        return Board.all()
            .filter(board => this.board(board).cards.length > 0)
            .map(board => `# ${board.name}\n`
                + this.board(board).cards.map(card => card.to_string(card_format)).join('\n') + '\n')
            .join('\n');
    }

    toString(): string {
        return this.to_string();
    }
}
