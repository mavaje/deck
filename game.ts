export class Game {
    public static paper = new Game('Paper');
    public static mtgo = new Game('Magic Online', 'mtgo');
    public static arena = new Game('Arena');


    constructor(
        public name: string,
        public code: string = name.toLowerCase().replaceAll(/\s/g, ''),
    ) {}

    static all(): Record<string, Game> {
        return Object.fromEntries(
            Object.entries(this)
                .filter(([_, value]) => value instanceof this)
        );
    }
}
