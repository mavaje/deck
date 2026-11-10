import {Group} from "./group";
import {ColorCode, ColorSet} from "../color-set";
import {MTG_COLORS} from "../color";

type ColorGroupSet = Partial<Record<ColorCode, Partial<Group>>>;

export const BASE: ColorGroupSet = {
    c: {icon: 'public/icon/colorless.svg'},
    w: {icon: 'public/icon/white.svg'},
    u: {icon: 'public/icon/blue.svg'},
    b: {icon: 'public/icon/black.svg'},
    r: {icon: 'public/icon/red.svg'},
    g: {icon: 'public/icon/green.svg'},
};

export const COLORLESS = {
    name: {
        c: {name: 'Colorless'},
    },
}

export const MONO = {
    name: {
        w: {name: 'White'},
        u: {name: 'Blue'},
        b: {name: 'Black'},
        r: {name: 'Red'},
        g: {name: 'Green'},
    },
};

export const ALLY = {
    ravnica_guild: {
        uw: {name: 'Azorius', icon: 'public/icon/azorius.webp'},
        bu: {name: 'Dimir', icon: 'public/icon/dimir.webp'},
        br: {name: 'Rakdos', icon: 'public/icon/rakdos.webp'},
        gr: {name: 'Gruul', icon: 'public/icon/gruul.webp'},
        gw: {name: 'Selesnya', icon: 'public/icon/selesnya.webp'},
    },
    hexhaven_college: {
        uw: {name: 'Fatehold'},
        bu: {name: 'Theorix'},
        br: {name: 'Stingerquill'},
        gr: {name: 'Konstrari'},
        gw: {name: 'Vigorbloom'},
    },
};

export const ENEMY = {
    ravnica_guild: {
        bw: {name: 'Orzhov', icon: 'public/icon/orzhov.webp'},
        ru: {name: 'Izzet', icon: 'public/icon/izzet.webp'},
        bg: {name: 'Golgari', icon: 'public/icon/golgari.webp'},
        rw: {name: 'Boros', icon: 'public/icon/boros.webp'},
        gu: {name: 'Simic', icon: 'public/icon/simic.webp'},
    },
    strixhaven_college: {
        bw: {name: 'Silverquill', icon: 'public/icon/silverquill.svg'},
        ru: {name: 'Prismari', icon: 'public/icon/prismari.svg'},
        bg: {name: 'Witherbloom', icon: 'public/icon/witherbloom.svg'},
        rw: {name: 'Lorehold', icon: 'public/icon/lorehold.svg'},
        gu: {name: 'Quandrix', icon: 'public/icon/quandrix.svg'},
    },
};

export const SHARD = {
    alara_shard: {
        buw: {name: 'Esper'},
        bru: {name: 'Grixis'},
        bgr: {name: 'Jund'},
        grw: {name: 'Naya'},
        guw: {name: 'Bant'},
    },
    new_capenna_crime_family: {
        buw: {name: 'Obscura', icon: 'public/icon/obscura.svg'},
        bru: {name: 'Maestros', icon: 'public/icon/maestros.svg'},
        bgr: {name: 'Riveteers', icon: 'public/icon/riveteers.svg'},
        grw: {name: 'Cabaretti', icon: 'public/icon/cabaretti.svg'},
        guw: {name: 'Brokers', icon: 'public/icon/brokers.svg'},
    },
};

export const WEDGE = {
    tarkir_clan: {
        bgw: {name: 'Abzan', icon: 'public/icon/abzan.webp'},
        ruw: {name: 'Jeskai', icon: 'public/icon/jeskai.webp'},
        bgu: {name: 'Sultai', icon: 'public/icon/sultai.webp'},
        brw: {name: 'Mardu', icon: 'public/icon/mardu.webp'},
        gru: {name: 'Temur', icon: 'public/icon/temur.webp'},
    },
    ikoria_triome: {
        bgw: {name: 'Indatha'},
        ruw: {name: 'Raugrin'},
        bgu: {name: 'Zagoth'},
        brw: {name: 'Savai'},
        gru: {name: 'Ketria'},
    },
};

export const FOUR_COLOR = {
    theme: {
        bruw: {name: 'Artifice'},
        bgru: {name: 'Aggression'},
        bgrw: {name: 'Chaos'},
        gruw: {name: 'Altruism'},
        bguw: {name: 'Growth'},
    },
    nephilim: {
        bruw: {name: 'Yore-Tiller'},
        bgru: {name: 'Glint-Eye'},
        bgrw: {name: 'Dune-Brood'},
        gruw: {name: 'Ink-Treader'},
        bguw: {name: 'Witch-Maw'},
    },
};

export const FIVE_COLOR = {
    rainbow: {
        bgruw: {name: 'Rainbow'},
    },
};

export function color_group(colors: ColorSet): Partial<Group> {
    const code = colors.code();

    let base_group: Partial<Group> = BASE[code] ?? {};

    let named_group: Partial<Group> = {
        ...COLORLESS.name,
        ...MONO.name,
        ...ALLY.ravnica_guild,
        ...ENEMY.ravnica_guild,
        ...SHARD.alara_shard,
        ...WEDGE.tarkir_clan,
        ...FOUR_COLOR.theme,
        ...FIVE_COLOR.rainbow,
    }[code] ?? {};
    
    return {
        ...base_group,
        name: colors.colors.join('') || 'C',
        color: gradient(colors),
        ...named_group,
    };
}

export function gradient(colors: ColorSet): string[] {
    if (colors.size === 0) {
        return [MTG_COLORS.silver];
    } else {
        return colors.colors.map(c => MTG_COLORS[c]);
    }
}
