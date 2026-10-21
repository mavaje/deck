export type BoardName =
    'Commander' |
    'Companion' |
    'Deck' |
    'Sideboard' |
    'Maybeboard' |
    'Acquireboard' |
    'Planar Deck' |
    'Contraption Deck' |
    'Attraction Deck' |
    'Stickers';

export const DEFAULT_BOARD: BoardName = 'Deck';

export class Board {
    private matcher: RegExp;

    constructor(
        public name: BoardName,
        public codes: string[],
        public min_count?: number,
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
    new Board('Planar Deck', ['planar deck', 'planar', 'planes'], 10),
    new Board('Contraption Deck', ['contraption deck', 'contraptions'], 15),
    new Board('Attraction Deck', ['attraction deck', 'attractions'], 10),
    new Board('Stickers', ['sticker deck', 'stickers'], 10),
];

export function match_board(input: string): Board {
    for (const board of BOARDS) {
        if (board.matches(input)) {
            return board;
        }
    }

    return null;
}
