import {Designation} from "./designation";

export class Board extends Designation {
    static vanguard = new Board('Vanguard', ['vanguard'], true, 1, null, ['Vanguard']);
    static commander = new Board('Commander', ['cmdr', 'commanders']);
    static companion = new Board('Companion', ['cmpn']);
    static deck = new Board('Deck', ['deck', 'main board', 'main', 'main deck']);
    static sideboard = new Board('Sideboard', ['sb', 'side board', 'side']);
    static maybeboard = new Board('Maybeboard', ['mb', 'maybe board', 'maybe']);
    static acquireboard = new Board('Acquireboard', ['acquire', 'acquire board']);
    static stickers = new Board('Sticker Deck', ['sticker', 'stickers'], true, 10, 1, ['Stickers']);
    static attractions = new Board('Attraction Deck', ['attraction', 'attractions'], true, 10, 1, ['Attraction']);
    static contraptions = new Board('Contraption Deck', ['contraption', 'contraptions'], true, 15, 1, ['Contraption']);
    static planar = new Board('Planar Deck', ['planar', 'planes'], true, 10, 1, ['Plane', 'Phenomenon']);
    static schemes = new Board('Scheme Deck', ['scheme', 'schemes', 'archenemy'], true, 20, 2, ['Scheme']);

    static DEFAULT = this.deck;

    static COMPRISES_DECK = [
        this.commander,
        this.deck,
    ];

    static LIMITED_COPIES = [
        this.commander,
        this.companion,
        this.deck,
        this.sideboard,
    ];

    constructor(
        public name: string,
        public codes: string[],
        public non_standard: boolean = false,
        public min_cards: number = 0,
        public copy_limit: number = null,
        public card_types: string[] = null,
    ) {
        super(name, codes);
    }

    matches(input: string): boolean {
        return [this.name, ...this.codes]
            .map(code => code
                .replaceAll(' ', '.?')
                .replaceAll(/s$/g, 's?'))
            .some(code => new RegExp(`^(${code})({top})?$`, 'i').test(input));
    }
}
