export type ConditionCode =
    'nm' |
    'sl' |
    'mp' |
    'hp';

export class Condition {
    constructor(
        public code: ConditionCode,
        public name: string,
    ) {
    }
}

export const CONDITIONS = [
    new Condition('nm', 'Near Mint'),
    new Condition('sl', 'Slightly Played'),
    new Condition('mp', 'Medium Played'),
    new Condition('hp', 'Heavily Played'),
];

export function match_condition(code: string): Condition {
    for (const condition of CONDITIONS) {
        if (code.toLowerCase() === condition.code) {
            return condition;
        }
    }

    return null;
}
