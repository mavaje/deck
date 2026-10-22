import {DeckCard} from "./deck-card";

export type BoardName =
    'Commander' |
    'Companion' |
    'Deck' |
    'Sideboard' |
    'Maybeboard' |
    'Acquireboard' |
    'Sticker Deck' |
    'Attraction Deck' |
    'Contraption Deck' |
    'Planar Deck' |
    'Scheme Deck' |
    'Vanguard';

export const DEFAULT_BOARD: BoardName = 'Deck';

export class Board {
    private matcher: RegExp;

    constructor(
        public name: BoardName,
        public codes: string[],
        public non_standard: boolean = false,
        public min_count: number = 0,
        public copy_limit: number = null,
        public card_types: string[] = null,
    ) {
        const inner_re = this.codes
            .join('|')
            .replaceAll(' ', '.?')
            .replaceAll(/s$/g, 's?');
        this.matcher = new RegExp(`^(${inner_re})({top})?$`, 'i');
    }

    matches(code: string): boolean {
        return this.matcher.test(code);
    }
}

export const BOARDS = [
    new Board('Commander', ['commander', 'cmdr']),
    new Board('Companion', ['companion', 'cmpn']),
    new Board('Deck', ['main board', 'main', 'main deck', 'deck']),
    new Board('Sideboard', ['side board', 'side', 'sb']),
    new Board('Maybeboard', ['maybe board', 'maybe', 'mb']),
    new Board('Acquireboard', ['acquire board']),
    new Board('Sticker Deck', ['sticker deck', 'stickers'], true, 10, 1, ['Stickers']),
    new Board('Attraction Deck', ['attraction deck', 'attractions'], true, 10, 1, ['Attraction']),
    new Board('Contraption Deck', ['contraption deck', 'contraptions'], true, 15, 1, ['Contraption']),
    new Board('Planar Deck', ['planar deck', 'planar', 'planes'], true, 10, 1, ['Plane', 'Phenomenon']),
    new Board('Scheme Deck', ['scheme deck', 'scheme', 'archenemy'], true, 20, 2, ['Scheme']),
    new Board('Vanguard', ['vanguard'], true, 1, null, ['Vanguard']),
];

export function match_board(input: string): Board {
    for (const board of BOARDS) {
        if (board.matches(input)) {
            return board;
        }
    }

    return null;
}

export function switch_board(card: DeckCard) {
    for (const board_name of [
        'Planar Deck',
        'Contraption Deck',
        'Attraction Deck',
        'Sticker Deck',
        'Deck',
    ] as BoardName[]) {
        const board = match_board(board_name);
        if (board.card_types.some(type => card.is_type(type))) {
            card.board = board_name;
            return;
        }
    }
}
