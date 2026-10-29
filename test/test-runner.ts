import {load_api_cache} from "./fixtures/api-cache-fixture";
import {load_card_cache} from "./fixtures/card-cache-fixture";
import {Catalog} from "../scryfall/catalog";
import {TextNormaliseTest} from "./text-normalise-test";
import {TextWordsToNumberTest} from "./text-words-to-number-test";
import {DesignationTest} from "./designation-test";
import {CardParseTest} from "./card-parse-test";
import {CardLoadTest} from "./card-load-test";
import {DeckParseTest} from "./deck-parse-test";
import {DeckLoadTest} from "./deck-load-test";
import {DeckValidationTest} from "./deck-validation-test";
import {Test} from "./test";
import {API} from "../scryfall/api";
import {DeckCard} from "../deck-card";

export async function run_tests() {
    load_card_cache();
    load_api_cache();

    await Catalog.load();

    Promise.all([
        TextNormaliseTest.test(),
        TextWordsToNumberTest.test(),
        DesignationTest.test(),
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
}
