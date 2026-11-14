import {DeckCard} from "./deck-card";
import {Format} from "./format";
import {API} from "./scryfall/api";
import {ColorSet} from "./color-set";
import {Board} from "./designation/board";
import {CardList} from "./card-list";
import {Tag} from "./designation/tag";
import {DeckView} from "./ui/deck-view";
import {Game} from "./game";

export class Deck extends CardList {

    static current: Deck = new Deck();

    raw?: string;

    format: Format = null;
    game: Game = null;

    static parse(input: string) {
        const deck = new Deck();
        deck.raw = input;

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
        Tag.clear();
        Deck.current = Deck.parse(input);
        DeckView.render();
        await Deck.current.load(() => DeckView.render());

        const invalid_boards = Board.all()
            .filter(board => {
                if (!board.card_types) return false;
                return Deck.current.board(board)
                    .every(card => !board.can_include(card));
            });
        console.log(invalid_boards);

        for (let i = 0; i < Deck.current.length; i++) {
            if (DeckView.set_background(Deck.current[i])) break;
        }
        DeckCard.CACHE.dump();
        return Deck.current;
    }

    async load(on_progress: () => void = null): Promise<this> {
        this.forEach(card => card.load_from_cache());
        on_progress?.();

        const card_map: Record<string, DeckCard[]> = {};

        this.forEach(card => {
            if (card.can_bulk_load()) {
                const id = JSON.stringify(card.identifier());
                card_map[id] ??= [];
                card_map[id].push(card);
            }
        });

        const unique_cards = Object.values(card_map);

        for (let i = 0; i < unique_cards.length; i += API.CARDS_MAX) {
            const chunk = unique_cards.slice(i, i + API.CARDS_MAX);

            if (chunk.length < 2) break;

            const card_list = await API.cards(chunk.map(c => c[0].identifier()));
            if (!card_list) break;

            let index = 0;
            for (const cards of chunk) {
                const i1 = cards[0].identifier();
                if (!card_list.not_found.some(i2 =>
                    Object.keys(i1).length === Object.keys(i2).length &&
                    Object.keys(i1).every(key => i1[key] === i2[key])
                )) {
                    cards.forEach(card => card.hydrate(card_list.data[index]).cache());
                    index++;
                }
            }

            on_progress?.();
        }

        await Promise.all(this.map(async card => {
            await card.load();
            on_progress?.();
        }));

        return this;
    }

    board(board: Board): CardList;
    board(...boards: Board[]): CardList;
    board(...boards: Board[]): CardList {
        return this.filter(card => card.on_board(...boards));
    }

    color_identity(): ColorSet {
        const commanders = this.board(Board.commander).skip_empty();

        if (commanders.count() === 0) return null;

        let color_identity = ColorSet.colors.c;
        commanders.forEach(card => color_identity = color_identity.plus(card.color_identity()));

        return color_identity;
    }

    to_string(card_format?: string): string {
        return Board.all()
            .filter(board => this.board(board).length > 0)
            .map(board => `# ${board.name}\n`
                + this.board(board).map(card => card.to_string(card_format)).join('\n') + '\n')
            .join('\n');
    }

    toString(): string {
        return this.to_string();
    }
}
