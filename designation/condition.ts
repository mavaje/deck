import {Designation} from "./designation";

export class Condition extends Designation {
    static near_mint = new Condition('Near Mint', ['nm', 'new', 'mint']);
    static slightly_played = new Condition('Slightly Played', ['sl', 'slight played', 'slight wear']);
    static medium_played = new Condition('Medium Played', ['mp', 'medium wear']);
    static heavily_played = new Condition('Heavily Played', ['hp', 'heavy played', 'heavy wear']);

    matches(input: string): boolean {
        return [this.name, ...this.codes]
            .map(code => code
                .replaceAll(' ', '.?')
                .replaceAll(/ed$/g, '(ed)?'))
            .some(code => new RegExp(`^(${code})$`, 'i').test(input));
    }
}
