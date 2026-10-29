import {Designation} from "./designation";
import {normalise} from "../text";

export class Condition extends Designation {
    static near_mint = new Condition('Near Mint', ['nm', 'new', 'mint']);
    static slightly_played = new Condition('Slightly Played', ['sl', 'slight played', 'slight wear']);
    static medium_played = new Condition('Medium Played', ['mp', 'medium wear']);
    static heavily_played = new Condition('Heavily Played', ['hp', 'heavy played', 'heavy wear']);

    regexp(code: string): RegExp {
        return new RegExp(`^(${
            normalise(code)
                .replaceAll(' ', '.?')
                .replaceAll(/ed$/g, '(ed)?')
        })$`, 'i');
    }
}
