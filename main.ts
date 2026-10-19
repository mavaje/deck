import {Test} from "./test/test";
import {CardParseTest} from "./test/card-parse-test";
import {CardLoadTest} from "./test/card-load-test";
import {DeckParseTest} from "./test/deck-parse-test";

Promise.all([
    CardParseTest.test(),
    // CardLoadTest.test(),
    DeckParseTest.test(),
]).then(() => Test.log());
