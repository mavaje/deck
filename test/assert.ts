
let assertions = 0;
let passes = 0;
let fails = 0;

type Assert = [
    boolean,
    string?,
    string?,
    Assert[]?,
];

export function assert(
    assertion: boolean,
    pass_message?: string,
    fail_message?: string,
    sub_asserts: Assert[] = [],
    pad: string = '',
) {
    assertions++;

    if (assertion) {
        passes++;
        if (pass_message) console.log(`${pad}✅ ${pass_message}`);
    } else {
        fails++;
        if (fail_message) console.log(`${pad}❌ ${fail_message}`);
    }

    sub_asserts.forEach(sub_assert =>
        assert(
            sub_assert[0],
            !(assertion && sub_assert[0]) && sub_assert[1],
            sub_assert[2],
            sub_assert[3],
            '  ' + pad,
        ));

    return assertion;
}

export function test_results() {
    if (passes === assertions) {
        console.log(`✅ Passed all ${assertions} assertions`);
    } else {
        console.log(`❌ Passed ${passes}/${assertions} assertions (failed ${fails})`);

    }
}
