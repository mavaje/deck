import {Test} from "./test";
import {words_to_number} from "../text";

export class TextWordsToNumberTest extends Test {

    protected pass_message: string = 'Passed all {count} word to number tests';
    protected fail_message: string = 'Passed {passes}/{count} word to number tests (failed {fails})';

    async test(): Promise<void> {
        Object.entries({
            'zero': 0,
            'one': 1,
            'two': 2,
            'three': 3,
            'four': 4,
            'five': 5,
            'ten': 10,
            'eleven': 11,
            'twelve': 12,
            'twenty': 20,
            'twenty one': 21,
            'twenty two': 22,
            'ninety nine': 99,
        } as Record<string, number>).forEach(([input, expected]) => {
            const number = words_to_number(input);

            this.assert_match(expected, number);
        });
    }
}
