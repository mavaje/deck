import {DeckCard} from "./deck-card";
import {test_card_parsing} from "./test/card-test";
import {test_results} from "./test/assert";
import {Deck} from "./deck";

test_card_parsing();

test_results();

// Deck.parse(`
// hazmat suit
// hazmat suit (used)
// hazmat suit (ust)
// hazmat suit (used) (ust)
// hazmat suit (ust:57)
// hazmat suit (used) (ust:57)
// swamp (ust:57)
// `)
//     .load()
//     .then(console.log);
