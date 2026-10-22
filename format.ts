export class Format {
    public code: string;
    public cards: number | [number, number] = [60, Infinity];
    public sideboard_limit: number = 15;
    public copy_limit: number = 4;
    public has_commander: boolean = false;
    public has_brawler: boolean = false;
    public has_oathbreaker: boolean = false;
    public has_signature_spell: boolean = false;

    constructor(public name: string, format: Partial<Format> = {}) {
        this.code = name.toLowerCase().replaceAll(/\s/g, '');
        Object.assign(this, format);
    }

    min_cards(): number {
        return Array.isArray(this.cards)
            ? this.cards[0]
            : this.cards;
    }

    max_cards(): number {
        return Array.isArray(this.cards)
            ? this.cards[1]
            : this.cards;
    }

    has_command_zone(): boolean {
        return this.has_commander
            || this.has_brawler
            || this.has_oathbreaker;
    }
}

export const FORMATS = [
    new Format('Standard'),
    new Format('Future Standard', {code: 'future'}),
    new Format('Historic'),
    new Format('Timeless'),
    new Format('Gladiator', {cards: 100, sideboard_limit: 0, copy_limit: 1}),
    new Format('Pioneer'),
    new Format('Modern'),
    new Format('Legacy'),
    new Format('Pauper'),
    new Format('Vintage'),
    new Format('Penny Dreadful', {code: 'penny'}),
    new Format('Commander (EDH)', {code: 'commander', cards: 100, sideboard_limit: 0, copy_limit: 1, has_commander: true}),
    new Format('Oathbreaker', {cards: 60, sideboard_limit: 0, copy_limit: 1, has_oathbreaker: true, has_signature_spell: true}),
    new Format('Standard Brawl', {cards: 60, sideboard_limit: 0, copy_limit: 1, has_brawler: true}),
    new Format('Brawl', {cards: 100, sideboard_limit: 0, copy_limit: 1, has_brawler: true}),
    new Format('Competitive Brawl', {cards: 100, sideboard_limit: 0, copy_limit: 1, has_brawler: true}),
    new Format('Alchemy'),
    new Format('Pauper Commander', {cards: 100, sideboard_limit: 0, copy_limit: 1, has_commander: true}),
    new Format('Duel Commander', {code: 'duel'}),
    new Format('Old School 93/94', {code: 'oldschool'}),
    new Format('Premodern'),
    new Format('PreDH', {cards: 100, sideboard_limit: 0, copy_limit: 1, has_commander: true}),
    new Format('Tiny Leaders: Reborn', {code: 'tlr'}),
];

export function match_format(code: string): Format {
    for (const format of FORMATS) {
        if (format.code === code) {
            return format;
        }
    }

    return null;
}

