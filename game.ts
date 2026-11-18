import {Designation} from "./designation/designation";

export class Game extends Designation {
    public static paper = new Game('Paper');
    public static mtgo = new Game('Magic Online', ['mtgo']);
    public static arena = new Game('Arena');

    constructor(
        name: string,
        codes: string[] = [name.toLowerCase().replaceAll(/\s/g, '')],
    ) {
        super(name, codes);
    }
}
