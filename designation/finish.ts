import {Designation} from "./designation";

export class Finish extends Designation {
    static nonfoil = new Finish('Non-Foil', ['nf']);
    static foil = new Finish('Foil', ['f']);
    static etched = new Finish('Etched', ['et']);

    static DEFAULT = this.nonfoil;

    is_default(): boolean {
        return this === Finish.DEFAULT;
    }
}
