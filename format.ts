
export class Format {
    public name: string;
    public code: string;
    public min_cards: number;
    public max_cards: number;

    constructor(format: Partial<Format> = {}) {
        Object.assign(this, format);
        this.code ??= this.name.toLowerCase().replaceAll(/\s/g, '');
    }
}

export const FORMATS = [
    new Format({name: 'Standard', min_cards: 60}),
    new Format({name: 'Future Standard', code: 'future'}),
    new Format({name: 'Historic'}),
    new Format({name: 'Timeless'}),
    new Format({name: 'Gladiator'}),
    new Format({name: 'Pioneer'}),
    new Format({name: 'Modern'}),
    new Format({name: 'Legacy'}),
    new Format({name: 'Pauper'}),
    new Format({name: 'Vintage'}),
    new Format({name: 'Penny Dreadful', code: 'penny'}),
    new Format({name: 'Commander', min_cards: 100, max_cards: 100}),
    new Format({name: 'Oathbreaker'}),
    new Format({name: 'Standard Brawl'}),
    new Format({name: 'Brawl'}),
    new Format({name: 'Competitive Brawl'}),
    new Format({name: 'Alchemy'}),
    new Format({name: 'Pauper Commander'}),
    new Format({name: 'Duel Commander', code: 'duel'}),
    new Format({name: 'Old School 93/94', code: 'oldschool'}),
    new Format({name: 'Premodern'}),
    new Format({name: 'Predh'}),
    new Format({name: 'Tiny Leaders: Reborn', code: 'tlr'}),
];
