export type BoardCode =
    'commander' |
    'companion' |
    'main' |
    'side' |
    'maybe';

export class Board {
    public codes: string[];
    private matcher: RegExp;

    constructor(
        public code: BoardCode,
        public name: string,
        public alt_codes: string[],
    ) {
        this.codes = [code, ...alt_codes];
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
    new Board('commander', 'Commander', ['cmdr']),
    new Board('companion', 'Companion', ['cmpn']),
    new Board('main', 'Deck', ['main board', 'deck']),
    new Board('side', 'Sideboard', ['side board', 'sb']),
    new Board('maybe', 'Maybeboard', ['maybe board', 'mb']),
];

export function match_board(code: string): Board {
    for (const board of BOARDS) {
        if (board.matches(code)) {
            return board;
        }
    }

    return null;
}
