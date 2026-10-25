export class Format {
    public static standard = new Format('Standard');
    public static future = new Format('Future Standard', {code: 'future'});
    public static historic = new Format('Historic');
    public static timeless = new Format('Timeless');
    public static gladiator = new Format('Gladiator', {cards: 100, sideboard_limit: 0, copy_limit: 1});
    public static pioneer = new Format('Pioneer');
    public static modern = new Format('Modern');
    public static legacy = new Format('Legacy');
    public static pauper = new Format('Pauper');
    public static vintage = new Format('Vintage');
    public static penny = new Format('Penny Dreadful', {code: 'penny'});
    public static commander = new Format('Commander (EDH)', {code: 'commander', cards: 100, sideboard_limit: 0, copy_limit: 1, has_commander: true});
    public static oathbreaker = new Format('Oathbreaker', {cards: 60, sideboard_limit: 0, copy_limit: 1, has_oathbreaker: true, has_signature_spell: true});
    public static standard_brawl = new Format('Standard Brawl', {cards: 60, sideboard_limit: 0, copy_limit: 1, has_brawler: true});
    public static brawl = new Format('Brawl', {cards: 100, sideboard_limit: 0, copy_limit: 1, has_brawler: true});
    public static competitive_brawl = new Format('Competitive Brawl', {cards: 100, sideboard_limit: 0, copy_limit: 1, has_brawler: true});
    public static alchemy = new Format('Alchemy');
    public static pauper_commander = new Format('Pauper Commander', {cards: 100, sideboard_limit: 0, copy_limit: 1, has_commander: true});
    public static duel = new Format('Duel Commander', {code: 'duel'});
    public static oldschool = new Format('Old School 93/94', {code: 'oldschool'});
    public static premodern = new Format('Premodern');
    public static predh = new Format('PreDH', {cards: 100, sideboard_limit: 0, copy_limit: 1, has_commander: true});
    public static tlr = new Format('Tiny Leaders: Reborn', {code: 'tlr'});
    
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
