import {Test} from "./test";
import {Language} from "../designation/language";
import {Designation} from "../designation/designation";
import {Finish} from "../designation/finish";
import {Condition} from "../designation/condition";
import {Board} from "../designation/board";

export class DesignationTest extends Test {

    protected pass_message: string = 'Passed all {count} designation tests';
    protected fail_message: string = 'Passed {passes}/{count} designation tests (failed {fails})';

    async test(): Promise<void> {
        const designations: (typeof Designation)[] = [
            Board,
            Condition,
            Finish,
            Language,
        ];

        for (const designation of designations) {
            const self_test = this.sub_test(
                `Passed all {count} ${designation.name} self tests`,
                `Passed {passes}/{count} ${designation.name} self tests (failed {fails})`,
            );

            designation.all().forEach(type => {
                designation.all().forEach(test => {
                    if (test !== type) {
                        [type.name, ...type.codes].forEach(code => self_test.assert_false(
                                test.matches(code),
                                `${test} does not match "${code}"`,
                                `${test} matches "${code}"`,
                            ));
                    }
                })
            });

            const cross_test = this.sub_test(
                `Passed all {count} ${designation.name} cross tests`,
                `Passed {passes}/{count} ${designation.name} cross tests (failed {fails})`,
            );

            for (const designation_2 of designations) {
                if (designation_2 !== designation) {
                    designation.all().forEach(type => {
                        [type.name, ...type.codes].forEach(code => cross_test.assert_null(
                            designation_2.match(code),
                            `${designation_2.name} has no matches for "${code}"`,
                            `${designation_2.name} has a match for "${code}"`,
                        ));
                    });
                }
            }
        }
    }
}
