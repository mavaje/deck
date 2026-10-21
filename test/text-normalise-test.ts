import {Test} from "./test";
import {normalise} from "../text";

export class TextNormaliseTest extends Test {

    protected pass_message: string = 'Passed all {count} text tests';
    protected fail_message: string = 'Passed {passes}/{count} text tests (failed {fails})';

    async test(): Promise<void> {
        Object.entries({
            'Éomer, King of Rohan': 'eomer king of rohan',
            'Ætherflux Reservoir': 'aetherflux reservoir',
        } as Record<string, string>).forEach(([input, expected]) => {
            const normalised = normalise(input);

            this.assert_match(expected, normalised);
        });
    }
}
