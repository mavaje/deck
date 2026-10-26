import {Designation} from "./designation";

export class Board extends Designation {
    static commander = new Board('Commander', ['cmdr', 'commanders']);
    static companion = new Board('Companion', ['cmpn']);
    static deck = new Board('Deck', ['main board', 'main', 'main deck']);
    static sideboard = new Board('Sideboard', ['sb', 'side board', 'side']);
    static maybeboard = new Board('Maybeboard', ['mb', 'maybe board', 'maybe']);
    static acquireboard = new Board('Acquireboard', ['acquire', 'acquire board']);
    static vanguard = new Board('Vanguard', ['vanguard'], 1, null, ['Vanguard']);
    static conspiracies = new Board('Conspiracies', ['conspiracy'], [0], null, ['Conspiracy']);
    static stickers = new Board('Sticker Deck', ['stickers'], [10], 1, ['Stickers']);
    static attractions = new Board('Attraction Deck', ['attractions'], 10, 1, ['Attraction']);
    static contraptions = new Board('Contraption Deck', ['contraptions'], [15], 1, ['Contraption']);
    static planar = new Board('Planar Deck', ['planar', 'planes'], [10], 1, ['Plane', 'Phenomenon']);
    static schemes = new Board('Scheme Deck', ['schemes', 'archenemy'], [20], 2, ['Scheme']);

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

    matches(input: string, exclude_card_names: boolean = false): boolean {
        if (exclude_card_names && /conspiracy/i.test(input)) return  false;

        return [this.name, ...this.codes]
            .map(code => code
                .replaceAll(' ', '.?')
                .replaceAll(/s$/g, 's?'))
            .some(code => new RegExp(`^(${code})({top})?$`, 'i').test(input));
    }
}
