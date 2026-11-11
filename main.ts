import {run_tests} from "./test/test-runner";
import {initialise_controls} from "./ui/deck-controls/initialise-controls";
import {Deck} from "./deck";

// run_tests();

initialise_controls();

Deck.load_current(`
Lightning Bolt
Grizzly Bears
Etali, Primal Conqueror    
`)
