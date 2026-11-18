import {run_tests} from "./test/test-runner";
import {initialise_ui} from "./ui/initialise-ui";
import {Deck} from "./deck";
import {Storage} from "./storage";

// run_tests();

initialise_ui();

Storage.load_deck();

if (Deck.current.length === 0) {
    Deck.load_current(`
        Lightning Bolt
        Grizzly Bears *F*
        Etali, Primal Conqueror *ET*
    `);
}
