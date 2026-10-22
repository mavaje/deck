import {Test} from "./test/test";
import {CardParseTest} from "./test/card-parse-test";
import {CardLoadTest} from "./test/card-load-test";
import {DeckParseTest} from "./test/deck-parse-test";
import {DeckLoadTest} from "./test/deck-load-test";
import {DeckValidationTest} from "./test/deck-validation-test";
import {load_api_cache} from "./test/fixtures/api-cache-fixture";
import {API} from "./scryfall/api";
import {TextNormaliseTest} from "./test/text-normalise-test";
import {TextWordsToNumberTest} from "./test/text-words-to-number-test";
import {DeckCard} from "./deck-card";
import {load_card_cache} from "./test/fixtures/card-cache-fixture";

load_card_cache();
load_api_cache();

Promise.all([
    TextNormaliseTest.test(),
    TextWordsToNumberTest.test(),
    CardParseTest.test(),
    CardLoadTest.test(),
    DeckParseTest.test(),
    DeckLoadTest.test(),
    DeckValidationTest.test(),
]).finally(() => {
    Test.log();
    API.CACHE.dump();
    DeckCard.CACHE.dump();
});
