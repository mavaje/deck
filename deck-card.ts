import {Card, Identifier} from "./scryfall/types";
import {API} from "./scryfall/api";
import {LanguageCode, match_language, ENGLISH} from "./language";
import {ConditionCode, match_condition} from "./condition";
import {BoardCode, match_board} from "./board";

export class DeckCard {

    static REGEXP = new RegExp([
        '^',
        '((?<quantity>\\d{1,3})[x*×]?\\s)?',
        '(?<name>[^([^#*]+?(\\s*\\(Used\\))?)?',
        '(\\((?<set>[0-9A-Z]{3,5})((:|\\)\\s*)(?<collector_number>[^)[(#*:\\s]+))?\\)?)?',
        '(?<extra>([#*^[]).*)?',
        '$'
    ].join('\\s*'), 'i');

    raw?: string;

    name?: string = null;
    set?: string = null;
    collector_number?: string = null;
    language?: LanguageCode = ENGLISH;

    quantity: number = 1;
    board: BoardCode = 'main';
    is_foil: boolean = false;
    condition?: ConditionCode = null;

    tags: string[] = [];

    card: Card;
    card_lang: Card;
    not_found: boolean = false;

    constructor(card: Partial<DeckCard> = {}) {
        Object.assign(this, card);
    }

    static parse(
        input: string,
        default_board: BoardCode = 'main',
    ): DeckCard {
        const match = this.REGEXP.exec(input);
        if (!match) return null;

        const {
            quantity = '1',
            name = null,
            set = null,
            collector_number = null,
            extra,
        } = match.groups;

        const card = new DeckCard({
            raw: input,
            quantity: Number.parseInt(quantity),
            name,
            set: set?.toUpperCase() ?? null,
            collector_number,
            board: default_board,
        });

        if (!card.is_valid()) return null;

        if (extra) {
            let extra_left = extra;
            while (extra_left) {
                const match = extra_left.match(/^(\*(?<tag>[^*]+)\*)\s*/i)
                    ?? extra_left.match(/^\[(?<tag>[^\]]+)]\s*/i)
                    ?? extra_left.match(/^(\^(?<tag>[^^]+)\^)\s*/i)
                    ?? extra_left.match(/^#(?<tag>[^#]+)\s*/i);

                if (match) {
                    extra_left = extra_left.slice(match[0].length);
                    const {tag} = match.groups;

                    const lang = match_language(tag);
                    if (lang) {
                        card.language = lang.code;
                        continue;
                    }

                    const board = match_board(tag);
                    if (board) {
                        card.board = board.code;
                        continue;
                    }

                    const condition = match_condition(tag);
                    if (condition) {
                        card.condition = condition.code;
                        continue;
                    }

                    if (/^(foil|f)$/i.test(tag)) {
                        card.is_foil = true;
                        continue;
                    }

                    const hex_match = tag.match(/^(?<tag>.+),(?<hex>#[0-9a-f]{6})$/i);
                    if (hex_match) {
                        card.tags.push(hex_match.groups.tag);
                        continue;
                    }

                    card.tags.push(tag);
                    continue;
                }

                break;
            }
        }

        return card;
    }

    is_valid(): boolean {
        return Boolean(this.name || (this.set && this.collector_number));
    }

    identifier(): Identifier {
        const {name, set, collector_number} = this;

        if (set && collector_number) {
            return {set, collector_number};
        }

        if (name) {
            return {name, set};
        }

        return null;
    }

    async load(): Promise<this> {
        const {name, set, collector_number, language} = this;

        if (set && collector_number) {
            this.card ??= await API.card(set, collector_number);

            if (this.language !== ENGLISH) {
                this.card ??= this.card_lang ??= await API.card(set, collector_number, language);
            }
        }

        if (name) {
            if (!/[A-Z]/i.test(name)) {
                let query = `include:extras name:'${name}'`;
                if (set) query += ` set:${set}`;
                this.card ??= await API.find_card(query);
            }

            if (set) this.card ??= await API.card_named(name, set);
            this.card ??= await API.card_named(name);
        }

        if (this.card) {
            if (this.language === ENGLISH) {
                this.card_lang = this.card;
            } else {
                let query = `oracle_id:${this.card.oracle_id} lang:${language}`;
                if (set) query += ` set:${set}`;
                this.card_lang ??= await API.find_card(query);
            }
        } else {
            this.not_found = true;
        }

        return this.hydrate();
    }

    async reload(): Promise<this> {
        this.card = null;
        this.card_lang = null;
        return this.load();
    }

    hydrate(card = this.card) {
        if (card) {
            this.card = card;
            this.name = card.layout === 'split'
                ? card.name
                : card.name.split(/\s*\/\//)[0];
            if (this.set) this.set = card.set.toUpperCase();
            if (this.collector_number) this.collector_number = card.collector_number;
        }

        return this;
    }

    matches(card: DeckCard) {
        for (const field of [
            ...this.collector_number ? [] : ['name'],
            'set',
            'collector_number',
            'language',
            'board',
            'condition',
            'is_foil',
        ] as (keyof DeckCard)[]) {
            if (this[field] !== card[field]) {
                return false;
            }
        }

        return this.tags.length === card.tags.length
            && this.tags.every((tag) => card.tags.includes(tag));
    }

    to_string() {
        let string = `${this.quantity} ${this.name}`;

        if (this.set) {
            string += this.collector_number
                ? ` (${this.set}:${this.collector_number})`
                : ` (${this.set})`;
        }

        if (this.language !== ENGLISH) {
            string += ` *${this.language.toUpperCase()}*`;
        }

        if (this.is_foil) {
            string += ` *F*`;
        }

        if (this.condition) {
            string += ` *${this.condition.toUpperCase()}*`;
        }

        this.tags.forEach(tag => {
            string += ` [${tag}]`;
        });

        return string;
    }

    toString() {
        return this.to_string();
    }
}
