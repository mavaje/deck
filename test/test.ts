import { format } from "../text";
import {TestCounter} from "./test-counter";
import {Tag} from "../designation/tag";

export type DeepPartial<T> = {
    [K in keyof T]?: DeepPartial<T[K]>;
};

export type TestMatcher<T> = DeepPartial<{
    [K in keyof T]: T[K] extends string ? string | RegExp : T[K];
}>;

export class Test {

    static SUITE = new Test(
        'Passed all {count} tests',
        'Passed {passes}/{count} tests (failed {fails})'
    );

    protected condition: boolean = true;
    protected children: Test[] = [];
    protected negated: boolean = false;

    constructor(
        protected pass_message: string = null,
        protected fail_message: string = null,
    ) {}

    private has_children(): boolean {
        return this.children.length > 0;
    }

    private passes(): boolean {
        return !(this.has_children()
            ? this.children.every(test => test.passes())
            : this.condition) === this.negated;
    }

    public mark(passes: boolean): void {
        this.condition = passes;
    }

    public pass() {
        this.mark(true);
    }

    public fail() {
        this.mark(false);
    }

    public negate(): this {
        this.negated = true;
        return this;
    }

    public sub_test(
        pass_message: string,
        fail_message: string,
    ): Test {
        const test = new Test();
        test.pass_message = pass_message;
        test.fail_message = fail_message;
        this.children.push(test);
        return test;
    }

    public assert(
        condition: boolean,
        pass_message: string,
        fail_message: string,
    ): Test {
        const test = new Test();
        test.pass_message = pass_message;
        test.fail_message = fail_message;
        test.mark(condition);
        this.children.push(test);
        return test;
    }

    public assert_false(
        condition: boolean,
        pass_message: string,
        fail_message: string
    ) {
        return this.assert(condition, pass_message, fail_message).negate();
    }

    public assert_null(
        object: any,
        pass_message: string,
        fail_message: string,
    ): Test {
        const test = new Test();
        test.pass_message = pass_message;
        test.fail_message = fail_message;
        test.mark((object ?? null) === null);
        this.children.push(test);
        return test;
    }

    public assert_match(
        expected: any,
        actual: any,
        pass_message: string = `{actual} matches {expected}`,
        fail_message: string = `{actual} does not match {expected}`,
    ): Test {
        const test = this.assert(
            actual === expected,
            format(pass_message, {expected, actual}),
            format(fail_message, {expected, actual}),
        );

        if (Array.isArray(expected)) {
            test.assert(
                Array.isArray(actual),
                format('{actual} is array', {actual}),
                format('{actual} is not array', {actual}),
            );
            test.assert_match(
                expected.length,
                (actual as any[])?.length,
                `length {actual} matches expected`,
                `length {actual} does not match expected length {expected}`,
            );
            expected.forEach((value, i) => {
                test.assert_match(
                    value,
                    actual?.[i],
                    `{actual} at index ${i} matches expected`,
                    `{actual} at index ${i} does not match {expected}`,
                );
            });
        } else if (expected instanceof Set) {
            test.assert(
                actual instanceof Set,
                format('{actual} is Set', {actual}),
                format('{actual} is not Set', {actual}),
            );
            test.assert_match(
                expected.size,
                (actual as Set<any>)?.size,
                `size {actual} matches expected`,
                `size {actual} does not match expected size {expected}`,
            );
            expected.forEach(value => {
                test.assert(
                    (actual as Set<any>)?.has(value),
                    format(`{actual} has {value}`, {actual, value}),
                    format(`{actual} does not have {value}`, {actual, value}),
                );
            });
            Object.entries(expected).forEach(([key, value]) => {
                if (value === undefined) return;
                test.assert_match(
                    value,
                    actual?.[key],
                    `${key}: {actual} matches expected`,
                    `${key}: {actual} does not match {expected}`,
                );
            });
        } else if (expected instanceof RegExp) {
            test.mark(expected.test(String(actual)));
        } else if (expected && typeof expected === 'object') {
            if (actual === expected) {
                test.assert(
                    true,
                    format('{actual} is the same object as {expected}', {expected, actual}),
                    '',
                );
            } else {
                test.assert(
                    actual && typeof actual === 'object',
                    format('{actual} is object', {actual}),
                    format('{actual} is not object', {actual}),
                );
                Object.entries(expected).forEach(([key, value]) => {
                        if (value === undefined) return;
                        test.assert_match(
                            value,
                            actual?.[key],
                            `${key}: {actual} matches expected`,
                            `${key}: {actual} does not match {expected}`,
                        );
                    });
            }
        }

        return test;
    }

    public assert_not_match(
        expected: any,
        actual: any,
        pass_message: string = `{actual} does not match {expected}`,
        fail_message: string = `{actual} matches {expected}`,
    ): Test {
        return this.assert_match(expected, actual, pass_message, fail_message).negate();
    }

    private counter(): TestCounter {
        const counter = new TestCounter();
        if (this.has_children()) {
            return counter.accumulate(this.children.map(test => test.counter()));
        } else {
            return counter.add(this.passes());
        }
    }

    private log(expand_passed: boolean = false, pad: string = '') {
        if (expand_passed || !this.passes()) {
            const child_pad = pad
                .replaceAll('╭─', '  ')
                .replaceAll('├─', '│ ');
            this.children.forEach((test, i) => test.log(
                expand_passed,
                child_pad + (i === 0
                    ? '╭─'
                    : '├─'),
            ));
        }

        const {count, passes, fails} = this.counter();

        console.log(`${pad}${
            this.passes() ? '✅' : '❌'
        } ${
            format(this.passes() ? this.pass_message : this.fail_message, {count, passes, fails})
        }`);
    }

    protected async test(): Promise<void> {}

    protected async run(): Promise<void> {
        Test.SUITE.children.push(this);
        return this.test();
    }
    protected tag_set(...tags: string[]): Set<Tag> {
        return new Set(tags.map(tag => Tag.match_or_new(tag)));
    }

    public static async test(): Promise<void> {
        return new this().run();
    }

    public static log(expand_passed: boolean = false): void {
        Test.SUITE.log(expand_passed);
    }
}
