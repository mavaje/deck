export type ConditionCode =
    'nm' |
    'sl' |
    'mp' |
    'hp';

export class Condition {
    private matcher: RegExp;

    constructor(
        public code: ConditionCode,
        public name: string,
    ) {
        const inner_re = [code, name]
            .join('|')
            .replaceAll(' ', '.?');
        this.matcher = new RegExp(`^(${inner_re})$`, 'i');
    }

    matches(input: string): boolean {
        return this.matcher.test(input);
    }
}

export const CONDITIONS = [
    new Condition('nm', 'Near Mint'),
    new Condition('sl', 'Slightly Played'),
    new Condition('mp', 'Medium Played'),
    new Condition('hp', 'Heavily Played'),
];

export function match_condition(input: string): Condition {
    for (const condition of CONDITIONS) {
        if (condition.matches(input)) {
            return condition;
        }
    }

    return null;
}
