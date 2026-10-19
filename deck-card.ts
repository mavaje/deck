import {Card, CardImagery, Identifier} from "./scryfall/types";
import {API} from "./scryfall/api";
import {LanguageCode, match_language, DEFAULT_LANGUAGE} from "./language";
import {ConditionCode, match_condition} from "./condition";
import {BoardName, DEFAULT_BOARD, match_board} from "./board";

export type CardFormatOptions = {
    board?: boolean;
}

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
    language?: LanguageCode = DEFAULT_LANGUAGE;

    quantity: number = 1;
    board: BoardName = DEFAULT_BOARD;
    is_foil: boolean = false;
    condition?: ConditionCode = null;

    tags: string[] = [];

    card: Card;
    not_found: boolean = false;

    constructor(card: Partial<DeckCard> = {}) {
        Object.assign(this, card);
    }

    static parse(
        input: string,
        default_board: BoardName = DEFAULT_BOARD,
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
                        card.board = board.name;
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
            this.card ??= await API.card(set, collector_number, language);
        }

        if (name) {
            if (!/[A-Z]/i.test(name)) {
                const base_query = `include:extras name:'${name}'`;

                if (set) {
                    this.card ??= await API.card_search_first(base_query + ` set:${set} lang:${language}`);
                    this.card ??= await API.card_search_first(base_query + ` set:${set}`);
                }

                this.card ??= await API.card_search_first(base_query + ` lang:${language}`);
                this.card ??= await API.card_search_first(base_query);
            }

            this.card ??= await API.card_named(name, set);

            if (this.card && this.card.lang !== language) {
                let query = `oracle_id:${this.card.oracle_id} lang:${language}`;
                if (set) query += ` set:${set}`;
                this.card = await API.card_search_first(query) ?? this.card;
            }
        }

        this.not_found = !this.card;

        return this.hydrate();
    }

    async reload(): Promise<this> {
        this.card = null;
        this.not_found = false;
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

    card_image_url(format: keyof CardImagery = 'grid'): string {
        if (this.card) {
            return this.card.image_uris[format];
        } else if (!this.not_found) {
            const {name, set, collector_number, language} = this;
            const parameters = {format: 'image', version: format};

            if (set && collector_number) {
                return API.card_url(set, collector_number, language, parameters);
            }

            if (name) {
                if (!/[A-Z]/i.test(name)) {
                    let query = `include:extras name:'${name}'`;
                    if (set) query += ` set:${set}`;
                    return API.card_random_url({q: query, ...parameters});
                }

                return API.card_named_url(name, set, false, parameters);
            }
        }

        return null;
    }

    to_string(options: CardFormatOptions = {}) {
        let string = `${this.quantity} ${this.name}`;

        if (this.set) {
            string += this.collector_number
                ? ` (${this.set}:${this.collector_number})`
                : ` (${this.set})`;
        }

        if (this.language !== DEFAULT_LANGUAGE) {
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

        if (options.board) {
            string += ` #${this.board}`;
        }

        return string;
    }

    toString() {
        return this.to_string();
    }
}
