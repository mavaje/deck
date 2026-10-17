
export interface Language {
    name: string;
    codes: string[];
}

export const language = {
    en: {
        name: 'English',
        codes: ['en'],
    },
    es: {
        name: 'Spanish',
        codes: ['es', 'sp'],
    },
    fr: {
        name: 'French',
        codes: ['fr'],
    },
    de: {
        name: 'German',
        codes: ['de', 'ge'],
    },
    it: {
        name: 'Italian',
        codes: ['it'],
    },
    pt: {
        name: 'Portuguese',
        codes: ['pt'],
    },
    ja: {
        name: 'Japanese',
        codes: ['ja', 'jp'],
    },
    ko: {
        name: 'Korean',
        codes: ['ko', 'kr'],
    },
    ru: {
        name: 'Russian',
        codes: ['ru', 'rs'],
    },
    zhs: {
        name: 'Simplified Chinese',
        codes: ['zhs', 'cs'],
    },
    zht: {
        name: 'Traditional Chinese',
        codes: ['zht', 'ct'],
    },
    he: {
        name: 'Hebrew',
        codes: ['he'],
    },
    la: {
        name: 'Latin',
        codes: ['la'],
    },
    grc: {
        name: 'Ancient Greek',
        codes: ['grc', 'ag'],
    },
    ar: {
        name: 'Arabic',
        codes: ['ar'],
    },
    sa: {
        name: 'Sanskrit',
        codes: ['sa'],
    },
    ph: {
        name: 'Phyrexian',
        codes: ['ph'],
    },
    qya: {
        name: 'Quenya',
        codes: ['qya'],
    },
    dw: {
        name: 'Dwarvish',
        codes: ['dw'],
    },
    tlh: {
        name: 'Klingon',
        codes: ['tlh', 'kl'],
    },
};

export function get_language(code: string): Language {
    code = code.toLowerCase();
    if (code in language) return language[code];
    for (const lang of Object.values(language)) {
        if (lang.codes.includes(code)) return lang;
    }
    return null;
}
