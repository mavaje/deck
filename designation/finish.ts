import {Card, Finish as SFFinish} from "../scryfall/types";
import {Designation} from "./designation";

export class Finish extends Designation {
    static nonfoil = new Finish('Non-Foil', ['nf']);
    static foil = new Finish('Foil', ['f']);
    static etched = new Finish('Etched', ['et']);

    static DEFAULT = this.nonfoil;

    sf_finish(): SFFinish {
        return this.name
            .toLowerCase()
            .replaceAll(/[^a-z]/g, '') as SFFinish;
    }

    is_default(): boolean {
        return this === Finish.DEFAULT;
    }

    static first_for_card(card: Card): Finish {
        return Finish.all()
            .find(finish => card.finishes.includes(finish.sf_finish()));
    }
}
