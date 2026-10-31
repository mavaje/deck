import {Color, COLORS} from "./scryfall/types";

export class ColorIdentity {
    static colorless = new ColorIdentity([], true);
    static white = new ColorIdentity(['W'], true);
    static blue = new ColorIdentity(['U'], true);
    static black = new ColorIdentity(['B'], true);
    static red = new ColorIdentity(['R'], true);
    static green = new ColorIdentity(['G'], true);
    static azorius = new ColorIdentity(['W', 'U'], true);
    static dimir = new ColorIdentity(['U', 'B'], true);
    static rakdos = new ColorIdentity(['B', 'R'], true);
    static gruul = new ColorIdentity(['R', 'G'], true);
    static selesnya = new ColorIdentity(['G', 'W'], true);
    static orzhov = new ColorIdentity(['W', 'B'], true);
    static izzet = new ColorIdentity(['U', 'R'], true);
    static golgari = new ColorIdentity(['B', 'G'], true);
    static boros = new ColorIdentity(['R', 'W'], true);
    static simic = new ColorIdentity(['G', 'U'], true);
    static esper = new ColorIdentity(['W', 'U', 'B'], true);
    static grixis = new ColorIdentity(['U', 'B', 'R'], true);
    static jund = new ColorIdentity(['B', 'R', 'G'], true);
    static naya = new ColorIdentity(['R', 'G', 'W'], true);
    static bant = new ColorIdentity(['G', 'W', 'U'], true);
    static abzan = new ColorIdentity(['W', 'B', 'G'], true);
    static jeskai = new ColorIdentity(['U', 'R', 'W'], true);
    static sultai = new ColorIdentity(['B', 'G', 'U'], true);
    static mardu = new ColorIdentity(['R', 'W', 'B'], true);
    static temur = new ColorIdentity(['G', 'U', 'R'], true);
    static artifice = new ColorIdentity(['W', 'U', 'B', 'R'], true);
    static chaos = new ColorIdentity(['U', 'B', 'R', 'G'], true);
    static aggression = new ColorIdentity(['B', 'R', 'G', 'W'], true);
    static altruism = new ColorIdentity(['R', 'G', 'W', 'U'], true);
    static growth = new ColorIdentity(['G', 'W', 'U', 'B'], true);
    static rainbow = new ColorIdentity(['W', 'U', 'B', 'R', 'G'], true);

    public colors: Color[];

    constructor(colors?: Color[] | ColorIdentity, strict?: false);
    constructor(colors: Color[], strict: true);
    constructor(colors: Color[] | ColorIdentity = [], strict: boolean = false) {
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
    add(colors: Color[] | ColorIdentity): void;
    add(colors: Color | Color[] | ColorIdentity): void {
        if (typeof colors === 'string') colors = [colors];
        this.colors = COLORS
            .filter(color => this.colors.includes(color) || colors.includes(color));
    }

    within(colors: Color[] | ColorIdentity): boolean {
        return this.colors.every(color => colors.includes(color));
    }

    contains(colors: Color[] | ColorIdentity): boolean {
        return new ColorIdentity(colors).within(this);
    }

    equals(colors: Color[] | ColorIdentity): boolean {
        if (!colors) return false;
        colors = new ColorIdentity(colors);
        return colors.within(this) && this.within(colors);
    }

    static all(): Record<string, ColorIdentity> {
        return Object.fromEntries(
            Object.entries(this)
                .filter(([_, value]) => value instanceof ColorIdentity)
        );
    }

    static index(colors: Color[] | ColorIdentity): number {
        return Object.values(ColorIdentity.all())
            .findIndex(identity => identity.equals(colors));
    }
}
