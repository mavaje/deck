import {Designation} from "./designation";
import {DeckCard} from "../deck-card";
import {normalise} from "../text";

export class Board extends Designation {
    static vanguard = new Board('Vanguard', ['vanguard'], 1, 1, ['Vanguard']);
    static conspiracy = new Board('Conspiracy', ['conspiracy'], [0], null, ['Conspiracy']);
    static hero = new Board('Hero', ['hero'], 1, 1, ['Hero']);
    static commander = new Board('Commander', ['cmdr', 'commanders']);
    static companion = new Board('Companion', ['cmpn', 'companions']);
    static deck = new Board('Deck', ['main', 'main board', 'main deck']);
    static sideboard = new Board('Sideboard', ['sb', 'side board', 'side']);
    static stickers = new Board('Sticker Deck', ['stickers'], [10], 1, ['Stickers']);
    static attractions = new Board('Attraction Deck', ['attraction', 'attractions'], 10, 1, ['Artifact - Attraction']);
    static contraptions = new Board('Contraption Deck', ['contraption', 'contraptions'], [15], 1, ['Artifact - Contraption']);
    static planar = new Board('Planar Deck', ['planar', 'planes'], [10], 1, ['Plane', 'Phenomenon']);
    static schemes = new Board('Scheme Deck', ['scheme', 'schemes', 'archenemy'], [20], 2, ['Scheme']);
    static tokens = new Board('Tokens', ['tokens', 'emblems', 'dungeons'], [20], 2, ['Token', 'Emblem', 'Dungeon', 'Card']);
    static maybeboard = new Board('Maybeboard', ['mb', 'maybe board', 'maybe']);
    static acquireboard = new Board('Acquireboard', ['ab', 'acquire', 'acquire board']);

    static DEFAULT = this.deck;

    static STARTING_DECK = [
        this.commander,
        this.deck,
    ];

    static STANDARD = [
        this.commander,
        this.companion,
        this.deck,
        this.sideboard,
    ];

    constructor(
        public name: string,
        public codes: string[],
        public cards: number | [number, number?] = [0],
        public copy_limit: number = null,
        public card_types: string[] = null,
    ) {
        super(name, codes);
    }

    is_default(): boolean {
        return this === Board.DEFAULT;
    }

    min_cards(): number {
        return (Array.isArray(this.cards)
            ? this.cards[0]
            : this.cards) ?? 0;
    }

    max_cards(): number {
        return (Array.isArray(this.cards)
            ? this.cards[1]
            : this.cards) ?? Infinity;
    }

    regexp(code: string): RegExp {
        return new RegExp(`^(${
            normalise(code)
                .replaceAll(' ', '.?')
                .replaceAll(/s$/g, 's?')
        })({top})?$`, 'i');
    }

    can_include(card: DeckCard): boolean {
        return this.card_types.some(type => {
            const [card_type, subtype] = type.split(' - ');
            return card.is_card_type(card_type)
                && (!subtype || card.is_type(subtype));
        });
    }

    static default_for(card: DeckCard): Board {
        for (const board of this.all()) {
            if (board.card_types && board.can_include(card)) {
                return board;
            }
        }

        return Board.deck;
    }
}
