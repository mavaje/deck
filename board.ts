export type BoardName =
    'Commander' |
    'Companion' |
    'Deck' |
    'Sideboard' |
    'Maybeboard';

export const DEFAULT_BOARD: BoardName = 'Deck';

export class Board {
    private matcher: RegExp;

    constructor(
        public name: BoardName,
        public codes: string[],
        public count: boolean,
        public max: number = null,
    ) {
        const inner_re = this.codes
            .join('|')
            .replaceAll(' ', '.?');
        this.matcher = new RegExp(`^(${inner_re})({top})?$`, 'i');
    }

    matches(code: string): boolean {
        return this.matcher.test(code);
    }
}

export const BOARDS = [
    new Board('Commander', ['commander', 'cmdr'], true, 1),
    new Board('Companion', ['companion', 'cmpn'], false, 1),
    new Board('Deck', ['main board', 'main', 'deck'], true),
    new Board('Sideboard', ['side board', 'side', 'sb'], false, 15),
    new Board('Maybeboard', ['maybe board', 'maybe', 'mb'], false),
];

export function match_board(input: string): Board {
    for (const board of BOARDS) {
        if (board.matches(input)) {
            return board;
        }
    }

    return null;
}
