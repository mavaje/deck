import {Color, COLORS} from "./scryfall/types";

export class ColorSet {
    static colorless = new ColorSet([], true);
    static white = new ColorSet(['W'], true);
    static blue = new ColorSet(['U'], true);
    static black = new ColorSet(['B'], true);
    static red = new ColorSet(['R'], true);
    static green = new ColorSet(['G'], true);
    static azorius = new ColorSet(['W', 'U'], true);
    static dimir = new ColorSet(['U', 'B'], true);
    static rakdos = new ColorSet(['B', 'R'], true);
    static gruul = new ColorSet(['R', 'G'], true);
    static selesnya = new ColorSet(['G', 'W'], true);
    static orzhov = new ColorSet(['W', 'B'], true);
    static izzet = new ColorSet(['U', 'R'], true);
    static golgari = new ColorSet(['B', 'G'], true);
    static boros = new ColorSet(['R', 'W'], true);
    static simic = new ColorSet(['G', 'U'], true);
    static esper = new ColorSet(['W', 'U', 'B'], true);
    static grixis = new ColorSet(['U', 'B', 'R'], true);
    static jund = new ColorSet(['B', 'R', 'G'], true);
    static naya = new ColorSet(['R', 'G', 'W'], true);
    static bant = new ColorSet(['G', 'W', 'U'], true);
    static abzan = new ColorSet(['W', 'B', 'G'], true);
    static jeskai = new ColorSet(['U', 'R', 'W'], true);
    static sultai = new ColorSet(['B', 'G', 'U'], true);
    static mardu = new ColorSet(['R', 'W', 'B'], true);
    static temur = new ColorSet(['G', 'U', 'R'], true);
    static artifice = new ColorSet(['W', 'U', 'B', 'R'], true);
    static chaos = new ColorSet(['U', 'B', 'R', 'G'], true);
    static aggression = new ColorSet(['B', 'R', 'G', 'W'], true);
    static altruism = new ColorSet(['R', 'G', 'W', 'U'], true);
    static growth = new ColorSet(['G', 'W', 'U', 'B'], true);
    static rainbow = new ColorSet(['W', 'U', 'B', 'R', 'G'], true);

    public colors: Color[];

    constructor(colors?: Color[] | ColorSet, strict?: false);
    constructor(colors: Color[], strict: true);
    constructor(colors: Color[] | ColorSet = [], strict: boolean = false) {
        this.colors = strict
            ? colors as Color[]
            : COLORS.filter(color => colors?.includes(color));
    }

    count(): number {
        return this.colors.length;
    }

    includes(color: Color): boolean {
        return this.colors.includes(color);
    }

    add(color: Color): void;
    add(colors: Color[] | ColorSet): void;
    add(colors: Color | Color[] | ColorSet): void {
        if (typeof colors === 'string') colors = [colors];
        this.colors = COLORS
            .filter(color => this.colors.includes(color) || colors.includes(color));
    }

    within(colors: Color[] | ColorSet): boolean {
        return this.colors.every(color => colors.includes(color));
    }

    contains(colors: Color[] | ColorSet): boolean {
        return new ColorSet(colors).within(this);
    }

    equals(colors: Color[] | ColorSet): boolean {
        if (!colors) return false;
        colors = new ColorSet(colors);
        return colors.within(this) && this.within(colors);
    }

    static all(): Record<string, ColorSet> {
        return Object.fromEntries(
            Object.entries(this)
                .filter(([_, value]) => value instanceof this)
        );
    }

    static index(colors: Color[] | ColorSet): number {
        const index = Object.values(ColorSet.all())
            .findIndex(identity => identity.equals(colors));
        return index === -1 ? null : index;
    }
}
