import {Card, CardFace, CardImagery, Identifier, Legality} from "./scryfall/types";
import {API} from "./scryfall/api";
import {LanguageCode, match_language, DEFAULT_LANGUAGE} from "./language";
import {ConditionCode, match_condition} from "./condition";
import {BoardName, DEFAULT_BOARD, match_board} from "./board";
import {normalise, normalise_set, words_to_number} from "./text";
import {Format} from "./format";
import {Cache} from "./scryfall/cache";
import {ColorIdentity} from "./color-identity";
import {RuleBreak} from "./rule-break";

export type CardFormatOptions = {
    board?: boolean;
}

export class DeckCard {

    static LINE_REGEXP = new RegExp([
        '^',
        '((?<quantity>\\d{1,3})[x*×]?\\s)?',
        '(?<name>[^([^#*]+?(\\s*\\(Used\\))?)?',
        '(\\((?<set>[0-9A-Z]{3,5})((:|\\)\\s*)(?<collector_number>[^)[(#*:\\s]+))?\\)?)?',
        '(?<extra>([#*^[]).*)?',
        '$'
    ].join('\\s*'), 'i');

    static BASIC_LAND_REGEXP = /^(snow(.?cover(ed)?)\s)?(plains?|island|swamp|mountain|forest|wastes?)$/i;

    static CACHE = new Cache<Card>();

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
        const match = this.LINE_REGEXP.exec(input);
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
            set: normalise_set(set, true),
            collector_number,
            board: default_board,
        });

        if (!card.name && !(card.set && card.collector_number)) return null;

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

    static from_card(card: Card, exact: boolean = false): DeckCard {
        const deck_card = new DeckCard({card});

        deck_card.hydrate(card);

        if (exact) {
            deck_card.set = normalise_set(card.set, true);
            deck_card.collector_number = card.collector_number;
        }

        return deck_card;
    }

    cache_keys(): string[] {
        const keys: string[] = [];

        if (this.set && this.collector_number) {
            keys.push(`(${this.set}:${this.collector_number}:${this.language})`);
        } else if (this.name) {
            // if (this.card) keys.push(`(${this.card.set.toUpperCase()}:${this.card.collector_number}:${this.card.lang})`);
            keys.push(`${normalise(this.name)} (${this.set ?? ''}::${this.language})`);
        }

        return keys;
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

    card_image_url(format: keyof CardImagery = 'grid'): string {
        if (this.card) {
            return this.card.image_uris?.[format] ?? null;
        } else if (!this.not_found) {
            const {name, set, collector_number, language} = this;
            const parameters = {format: 'image', version: format};

            if (set && collector_number) {
                return API.card_url(set, collector_number, language, parameters);
            }

            if (name) {
                return API.card_named_url(name, set, false, parameters);
            }
        }

        return null;
    }

    load_from_cache(): void {
        this.card ??= DeckCard.CACHE.get_any(this.cache_keys());
    }

    async load(): Promise<this> {
        if (this.not_found) return this;

        const {name, set, collector_number, language} = this;

        this.load_from_cache();

        if (set && collector_number) {
            this.card ??= await API.card(set, collector_number, language);
        }

        if (name) {
            if (/^_{6,}$/.test(name) && !set) {
                this.card ??= await API.random_card(`include:extras name:'${name}'`);
            }

            this.card ??= await API.card_named(name, set);

            if (this.card && this.card.lang !== language) {
                let query = `oracle_id:${this.card.oracle_id} lang:${language}`;
                if (set) query += ` set:${normalise_set(set)}`
                this.card = await API.random_card(query) ?? this.card;
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

            if (this.set !== normalise_set(card.set, true)) {
                this.set = null;
            }

            if (this.collector_number !== card.collector_number) {
                this.collector_number = null;
            }

            DeckCard.CACHE.put_each(this.cache_keys(), card);

            this.name = this.is_layout('split')
                ? card.name
                : this.all_names()[0];
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

    on_board(board: BoardName): boolean;
    on_board(...boards: BoardName[]): boolean;
    on_board(...boards: BoardName[]): boolean {
        return boards.length === 0 || boards.includes(this.board);
    }

    all_names(): string[] {
        return (this.card?.name ?? this.name).split(' // ');
    }

    is_layout(layout: string): boolean {
        return this.card?.layout === layout;
    }

    front_card(): Card | CardFace {
        return this.card?.card_faces?.[0] ?? this.card ?? null;
    }

    is_type(type: string): boolean;
    is_type(...types: string[]): boolean;
    is_type(...types: string[]): boolean {
        if (!this.card) return false;
        return types.every(type => new RegExp(`\\b${type}\\b`, 'i')
            .test(this.front_card().type_line));
    }

    is_any_type(types: (string | string[])[]): boolean {
        return types.some(type => this.is_type(...Array.isArray(type) ? type : [type]));
    }

    is_permanent(): boolean {
        return this.is_any_type([
            'Artifact',
            'Battle',
            'Creature',
            'Enchantment',
            'Land',
            'Planeswalker',
        ]);
    }

    has_keyword(keyword: string): boolean {
        return this.card?.keywords.includes(keyword);
    }

    is_basic_land(): boolean {
        return this.card
            ? this.is_type('Basic', 'Land')
            : this.name && DeckCard.BASIC_LAND_REGEXP.test(this.name);
    }

    can_command(format: Format): boolean {
        return (format.has_commander && this.can_be_commander())
            || (format.has_brawler && this.can_be_brawler())
            || (format.has_oathbreaker && this.can_be_oathbreaker());
    }

    can_be_commander(): boolean {
        return Boolean(this.is_type('Legendary') && this.front_card().power && this.front_card().toughness)
            || /~ can be your commander\./.test(this.plain_oracle());
    }

    can_be_brawler(): boolean {
        return this.can_be_commander()
            || this.can_be_oathbreaker();
    }

    can_be_oathbreaker(): boolean {
        return this.is_type('Legendary', 'Planeswalker');
    }

    can_be_signature_spell(oathbreaker: DeckCard): boolean {
        return (this.is_type('Instant') || this.is_type('Sorcery'))
            && this.color_identity().within(oathbreaker.color_identity());
    }

    legality(format: Format): Legality {
        return this.card?.legalities[format.code];
    }

    is_legal(format: Format): boolean {
        if (this.card) {
            const legality = this.legality(format);
            return !['not_legal', 'banned'].includes(legality);
        }

        return true;
    }

    color_identity(): ColorIdentity {
        return this.card
            ? new ColorIdentity(this.card.color_identity)
            : null;
    }

    plain_oracle(): string {
        return this.front_card()?.oracle_text.replaceAll(this.front_card().name, '~');
    }

    copy_limit(format?: Format): number {
        if (this.card) {
            if (this.is_basic_land()) return Infinity

            const oracle = this.plain_oracle();

            const no_limit_match = oracle.match(/A deck can have any number of cards named ~\./);
            if (no_limit_match) return Infinity;

            const limit_match = oracle.match(/A deck can have (up to|only) (?<limit>[a-z ]+) cards? named ~\./);
            if (limit_match) {
                const {limit} = limit_match.groups;
                return words_to_number(limit);
            }

            if (format && this.card.legalities[format.code] === 'restricted') {
                return 1;
            }
        }

        return format.copy_limit;
    }

    allows_second_commander(second: DeckCard, format: Format): boolean {
        if (this.card) {
            if (!this.can_command(format)) return false;

            if (format.has_signature_spell && second.can_be_signature_spell(this)) return true;

            if (this.has_keyword('Partner')
                && second.has_keyword('Partner')
            ) {
                const [ability_1, ability_2] = [this, second]
                    .map(card => card.plain_oracle().match(/Partner(—([^(]+))?(?= \(|$)/));

                if (ability_1 && ability_2 && ability_1[0] === ability_2[0]) {
                    return true;
                }
            }

            if (this.has_keyword('Partner with')) {
                const name_match = this.plain_oracle()
                    .match(/Partner with (?<name>[^(]+) (\(|$)/);
                const {name} = name_match.groups;

                if (name === second.all_names()[0]) {
                    return true;
                }
            }

            if (this.has_keyword('Doctor\'s companion')
                && second.is_type('Time Lord', 'Doctor')) {
                return true;
            }

            if (this.has_keyword('Choose a background')
                && second.is_type('Legendary', 'Enchantment', 'Background')) {
                return true;
            }
        }

        return false;
    }

    rulebreaks(): RuleBreak[] {
        const oracle = this.plain_oracle();
        const breaks: RuleBreak[] = [];

        const additional_color_id_match =
            oracle.match(/If ~ is your commander, choose a color before the game begins. ~ is the chosen color\./) ??
            oracle.match(/If ~ is your commander, the color identity of (?<type_1>[\w\s]+) cards in your deck can include one color of your choice not in your commander's color identity, and your deck can have any (?<type_2>[\w\s]+) cards\./);
        if (additional_color_id_match) {
            const {
                type_1,
                type_2,
            } = additional_color_id_match.groups ?? {};

            breaks.push(RuleBreak.additional_color_id(type_1));

            if (type_2) {
                breaks.push(RuleBreak.any_color_id(type_2));
            }
        }

        const any_color_id_match = oracle
            .match(/A deck with this commander can have ((?<type_1>[\w\s]+) cards (with mana value (?<min_mv>\d+) or greater )?of any color identity and )?any (?<type_2>[\w\s]+) cards\./);

        if (any_color_id_match) {
            const {
                type_1,
                type_2,
                min_mv,
            } = any_color_id_match.groups;

            if (type_1) {
                breaks.push(RuleBreak.any_color_id(type_1, min_mv));
            }

            if (type_2) {
                breaks.push(RuleBreak.any_color_id(type_2));
            }
        }

        const no_deck_max_match = oracle
            .match(/A deck with this commander has no maximum deck size\./);
        if (no_deck_max_match) {
            breaks.push(RuleBreak.no_deck_max());
        }

        return breaks;
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
