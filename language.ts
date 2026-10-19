export type LanguageCode =
    'en' |
    'es' |
    'fr' |
    'de' |
    'it' |
    'pt' |
    'ja' |
    'ko' |
    'ru' |
    'zhs' |
    'zht' |
    'he' |
    'la' |
    'grc' |
    'ar' |
    'sa' |
    'ph' |
    'qya' |
    'dw' |
    'tlh';

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

export class Language {
    private matcher: RegExp;

    constructor(
        public code: LanguageCode,
        public name: string,
        public alt_codes: string[] = [],
    ) {
        const inner_re = [code, name, ...alt_codes]
            .join('|')
            .replaceAll(' ', '.?');
        this.matcher = new RegExp(`^(${inner_re})$`, 'i');
    }

    matches(input: string): boolean {
        return this.matcher.test(input);
    }
}

export const LANGUAGES = [
    new Language('en', 'English'),
    new Language('es', 'Spanish', ['sp']),
    new Language('fr', 'French'),
    new Language('de', 'German', ['ge']),
    new Language('it', 'Italian'),
    new Language('pt', 'Portuguese'),
    new Language('ja', 'Japanese', ['jp']),
    new Language('ko', 'Korean', ['kr']),
    new Language('ru', 'Russian', ['rs']),
    new Language('zhs', 'Simplified Chinese', ['cs']),
    new Language('zht', 'Traditional Chinese', ['ct']),
    new Language('he', 'Hebrew'),
    new Language('la', 'Latin'),
    new Language('grc', 'Ancient Greek', ['ag']),
    new Language('ar', 'Arabic'),
    new Language('sa', 'Sanskrit'),
    new Language('ph', 'Phyrexian'),
    new Language('qya', 'Quenya'),
    new Language('dw', 'Dwarvish'),
    new Language('tlh', 'Klingon', ['kl']),
];

export function match_language(input: string): Language {
    for (const lang of LANGUAGES) {
        if (lang.matches(input)) {
            return lang;
        }
    }

    return null;
}
