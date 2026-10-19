import { format } from "../formatter";
import {TestCounter} from "./test-counter";

export type DeepPartial<T> = {
    [K in keyof T]?: DeepPartial<T[K]>;
};

export type TestValue<T> = DeepPartial<{
    [K in keyof T]: T[K] extends string ? string | RegExp : T[K];
}>;

export class Test {

    static SUITE = new Test(
        'Passed all {count} tests',
        'Passed {passes}/{count} tests (failed {fails})'
    );

    protected condition: boolean = true;
    protected children: Test[] = [];

    constructor(
        protected pass_message: string = null,
        protected fail_message: string = null,
    ) {}

    private has_children(): boolean {
        return this.children.length > 0;
    }

    private passes(): boolean {
        return this.has_children()
            ? this.children.every(test => test.passes())
            : this.condition;
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

    public assert(
        condition: boolean,
        pass_message: string,
        fail_message: string
    ): Test {
        const test = new Test();
        test.pass_message = pass_message;
        test.fail_message = fail_message;
        test.mark(condition);
        this.children.push(test);
        return test;
    }

    public assert_is_array(
        actual: any,
        pass_message: string = `{actual} is array`,
        fail_message: string = `{actual} is not array`,
    ): Test {
        return this.assert(
            Array.isArray(actual),
            format(pass_message, {actual}),
            format(fail_message, {actual}),
        );
    }

    public assert_is_object(
        actual: any,
        pass_message: string = `{actual} is object`,
        fail_message: string = `{actual} is not object`,
    ): Test {
        return this.assert(
            actual && typeof actual === 'object',
            format(pass_message, {actual}),
            format(fail_message, {actual}),
        );
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
            test.assert_is_array(actual);
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
        } else if (expected instanceof RegExp) {
            test.mark(expected.test(String(actual)));
        } else if (expected && typeof expected === 'object') {
            test.assert_is_object(actual);
            Object.entries(expected).forEach(([key, value]) => {
                test.assert_match(
                    value,
                    actual?.[key],
                    `${key}: {actual} matches expected`,
                    `${key}: {actual} does not match {expected}`,
                );
            });
        }

        return test;
    }

    private counter(): TestCounter {
        const counter = new TestCounter();
        if (this.has_children()) {
            return counter.accumulate(...this.children.map(test => test.counter()));
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

    public static async test(): Promise<void> {
        return new this().run();
    }

    public static log(expand_passed: boolean = false): void {
        Test.SUITE.log(expand_passed);
    }
}
