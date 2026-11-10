import {Color, COLORS} from "./scryfall/types";

export type ColorCode = keyof (typeof ColorSet)['colors'];

export class ColorSet extends Set<Color> {
    static colors = {
        c: new ColorSet([]),
        w: new ColorSet(['W']),
        u: new ColorSet(['U']),
        b: new ColorSet(['B']),
        r: new ColorSet(['R']),
        g: new ColorSet(['G']),
        uw: new ColorSet(['W', 'U']),
        bu: new ColorSet(['U', 'B']),
        br: new ColorSet(['B', 'R']),
        gr: new ColorSet(['R', 'G']),
        gw: new ColorSet(['G', 'W']),
        bw: new ColorSet(['W', 'B']),
        ru: new ColorSet(['U', 'R']),
        bg: new ColorSet(['B', 'G']),
        rw: new ColorSet(['R', 'W']),
        gu: new ColorSet(['G', 'U']),
        buw: new ColorSet(['W', 'U', 'B']),
        bru: new ColorSet(['U', 'B', 'R']),
        bgr: new ColorSet(['B', 'R', 'G']),
        grw: new ColorSet(['R', 'G', 'W']),
        guw: new ColorSet(['G', 'W', 'U']),
        bgw: new ColorSet(['W', 'B', 'G']),
        ruw: new ColorSet(['U', 'R', 'W']),
        bgu: new ColorSet(['B', 'G', 'U']),
        brw: new ColorSet(['R', 'W', 'B']),
        gru: new ColorSet(['G', 'U', 'R']),
        bruw: new ColorSet(['W', 'U', 'B', 'R']),
        bgru: new ColorSet(['U', 'B', 'R', 'G']),
        bgrw: new ColorSet(['B', 'R', 'G', 'W']),
        gruw: new ColorSet(['R', 'G', 'W', 'U']),
        bguw: new ColorSet(['G', 'W', 'U', 'B']),
        bgruw: new ColorSet(['W', 'U', 'B', 'R', 'G']),
    };

    private constructor(public colors: Color[]) {
        super(colors);
    }

    static from(colors: Color | Color[] | Set<Color>): ColorSet {
        if (typeof colors === 'string') {
            colors = [colors];
        }
        if (!(colors instanceof Set)) {
            colors = new Set(colors);
        }
        const key = ColorSet.code([...colors]);
        return this.colors[key];
    }

    private static code(colors: Color[]): ColorCode {
        return (colors
            .map(c => c.toLowerCase())
            .filter(c => COLORS.includes(c.toUpperCase() as Color))
            .sort()
            .join('') || 'c') as ColorCode;
    }

    code(): ColorCode {
        return ColorSet.code([...this]);
    }

    plus(colors: Color | Color[] | Set<Color>): ColorSet {
        if (this.size === 5) return this;
        return ColorSet.from(this.union(ColorSet.from(colors)));
    }

    within(colors: Color | Color[] | Set<Color>): boolean {
        if (this.size === 0) return true;
        colors = ColorSet.from(colors);
        return this.size <= colors.size
            && this.size === this.intersection(colors).size;
    }

    contains(colors: Color | Color[] | Set<Color>): boolean {
        if (this.size === 5) return true;
        colors = ColorSet.from(colors);
        return this.size >= colors.size
            && this.size === this.union(colors).size;
    }

    equals(colors: Color | Color[] | Set<Color>): boolean {
        return this === ColorSet.from(colors);
    }

    static index(colors: Color | Color[] | Set<Color>): number {
        const code = ColorSet.from(colors).code();
        const index = Object.keys(ColorSet.colors).indexOf(code);
        return index === -1 ? null : index;
    }
}
