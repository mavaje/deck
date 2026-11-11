import {run_tests} from "./test/test-runner";
import {initialise_ui} from "./ui/initialise-ui";
import {Deck} from "./deck";

// run_tests();

initialise_ui();

Deck.load_current(`
Lightning Bolt
Grizzly Bears *F*
Etali, Primal Conqueror *ET*
`);
