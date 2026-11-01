import {Card, Identifier} from "./scryfall/types";
import {API} from "./scryfall/api";
import {normalise, normalise_set, preserve_case, words_to_number} from "./text";
import {Format} from "./format";
import {Cache} from "./scryfall/cache";
import {RuleBreak} from "./rule-break";
import {Language} from "./designation/language";
import {Board} from "./designation/board";
import {Condition} from "./designation/condition";
import {Finish} from "./designation/finish";
import {Deck} from "./deck";
import {Tag} from "./designation/tag";
import {Face} from "./face";

export class DeckCard extends Face {

    static CACHE = new Cache<Card>();

    static BASIC_LAND_REGEXP = /^(snow(.?cover(ed)?).?)?(plains?|island|swamp|mountain|forest|wastes?)$/i;

    static LINE_REGEXP: RegExp = null;

    static bracket_words = new Set([
        'Used',
        'Plane',
        'Summer',
        'Theme',
    ]);

    static DEFAULT_CARD_BACK_ID = '0aeebaf5-8c7d-4636-9e82-8c27447861f7';

    raw?: string;

    name?: string = null;
    set?: string = null;
    collector_number?: string = null;
    language?: Language = Language.DEFAULT;

    quantity: number = 1;
    finish: Finish = Finish.DEFAULT;
    condition?: Condition = null;
    board: Board = Board.DEFAULT;

    tags: Set<Tag> = new Set();

    display_face_id: number = 0;
    not_found: boolean = false;

    constructor(card: Partial<DeckCard> = {}) {
        super(card.card);
        Object.assign(this, card);
    }

    static regenerate_line_regexp(): void {
        this.LINE_REGEXP = new RegExp([
            '^',
            '((?<quantity>\\d{1,3})[x*×]?\\s)?',
            `(?<name>[^([^#*]+?(\\s*\\((\d{4}|[^)]*[ '][^)]*|${[...this.bracket_words].join('|')})\\))?)?`,
            '(\\((?<set>[0-9A-Z]{3,5})((:|\\)\\s*)(?<collector_number>[^)[(#*:\\s]+))?\\)?)?',
            '(?<extra>([#*^[]).*)?',
            '$'
        ].join('\\s*'), 'i');
    }

    static async patch(): Promise<void> {
        const bracket_cards = (await API.card_search('name:/\\([0-9A-Z]{3,5}(:.+)?\\)$/'))?.data;
        bracket_cards.forEach(card => {
            const matches = card.name.matchAll(/\((?<word>[0-9A-Z]{3,5}(:.+)?)\)/gi);
            for (const match of matches) {
                const word = match.groups.word;
                if (word.match(/[A-Z]/i)) {
                    this.bracket_words.add(word);
                }
            }
        });
        this.regenerate_line_regexp();

        const number_cards = (await API.card_search('name:/^\\d{1,3}\\s/'))?.data;
        if (number_cards?.length > 0) {
            console.error(`cards starting with numbers < 1000: `, number_cards.map(card => card.name));
        }
    }

    static parse(
        input: string,
        deck?: Deck,
        default_board: Board = Board.DEFAULT,
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
                    ?? extra_left.match(/^#(?<tag>[^#]+)#?\s*/i);

                if (!match) break;

                extra_left = extra_left.slice(match[0].length);
                const {tag} = match.groups;

                const language = Language.match(tag);
                if (language) {
                    card.language = language;
                    continue;
                }

                const condition = Condition.match(tag);
                if (condition) {
                    card.condition = condition;
                    continue;
                }

                const finish = Finish.match(tag);
                if (finish) {
                    card.finish = finish;
                    continue;
                }

                const board = Board.match(tag);
                if (board) {
                    card.board = board;
                    continue;
                }

                const hex_match = tag.match(/^(?<tag>.+)[,;:](?<hex>#[0-9a-f]{6})$/i);
                if (hex_match) {
                    card.tags.add(Tag.match_or_new(hex_match.groups.tag, hex_match.groups.hex));
                } else {
                    card.tags.add(Tag.match_or_new(tag));
                }
            }
        }

        deck?.add(card);

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
            if (this.card) keys.push(`(${this.card.set.toUpperCase()}:${this.card.collector_number}:${this.card.lang})`);
            keys.push(`${normalise(this.name)} (${this.set ?? ''}::${this.language})`);
        }

        return keys;
    }

    identifier(): Identifier {
        const {set, collector_number} = this;
        if (set && collector_number) {
            return {set, collector_number};
        }

        if (this.name) {
            const name = this.name.split(/\s*\/\/\s*/g)[0];
            return set
                ? {name, set}
                : {name};
        }

        return null;
    }

    load_from_cache(): void {
        if (!this.card) {
            this.card = DeckCard.CACHE.get_any(this.cache_keys());
            this.hydrate();
        }
    }

    async load(): Promise<this> {
        if (this.not_found) return this;

        const {name, set, collector_number, language} = this;

        this.load_from_cache();

        if (set && collector_number) {
            this.card ??= await API.card(set, collector_number, language.code());
        }

        if (name) {
            if (/^_{6,}$/.test(name) && !set) {
                this.card ??= await API.random_card(`include:extras name:'${name}'`);
            }

            this.card ??= await API.card_named(name, set);

            if (this.card && this.card.lang !== language.code()) {
                let query = `oracle_id:${this.card.oracle_id} lang:${language}`;
                if (set) query += ` set:${normalise_set(set)}`
                this.card = await API.random_card(query) ?? this.card;
            }
        }

        this.not_found = !this.card;

        return this
            .hydrate()
            .cache();
    }

    async reload(): Promise<this> {
        this.flush();
        this.not_found = false;
        return this.load();
    }

    hydrate(card = this.card): this {
        super.hydrate(card);
        if (card) {
            if (this.set !== normalise_set(card.set, true)) {
                this.set = null;
            }

            if (this.collector_number !== card.collector_number) {
                this.collector_number = null;
            }

            if (card.card_faces?.[1]?.name === this.name
                || card.card_faces?.[1]?.printed_name === this.name
            ) {
                this.display_face_id = 1;
            }

            this.name = card.name;
        }

        return this;
    }

    cache(): this {
        if (this.card) {
            DeckCard.CACHE.put_each(this.cache_keys(), this.card);
        }

        return this;
    }

    // face(face?: number): Card | CardFace;
    // face<K extends keyof (Card | CardFace)>(property: K, face?: number): Card[K] | CardFace[K];
    // face<T = Card | CardFace>(callback: (card: Card | CardFace) => T, face: number): T;
    // face(
    //     callback: ((card: (Card | CardFace)) => any) | keyof Card | keyof CardFace | number = card => card,
    //     face: number = 0,
    // ): any {
    //     let result = null;
    //
    //     if (typeof callback === 'number') {
    //         face = callback;
    //         callback = card => card;
    //     } else if (typeof callback === 'string') {
    //         const key = callback;
    //         callback = card => card[key];
    //     }
    //
    //     if (typeof face === 'number' && this.card?.card_faces?.[face]) {
    //         result ??= callback(this.card.card_faces[face]);
    //     }
    //
    //     if (!face && this.card) {
    //         result ??= callback(this.card);
    //     }
    //
    //     return result;
    // }

    main_face(display: boolean = false): Face {
        return this.is_layout('split')
            ? this
            : this.faces()[display ? this.display_face_id : 0];
    }

    back_face(): Face {
        return this.faces()[1];
    }

    image_urls(): string[] {
        let urls: string[] = super.image_urls();

        if (urls.length === 0) {
            const {set, collector_number, language} = this;
            const parameters = {format: 'image', version: 'grid'};

            if (set && collector_number) {
                urls.push(API.card_url(set, collector_number, language.code(), parameters));
            }
        }

        if (urls.length === 0) console.log(this);

        return urls;
    }

    back_id(): string {
        return this.card?.card_back_id;
    }

    has_alternative_back(): boolean {
        return this.back_id() && this.back_id() !== DeckCard.DEFAULT_CARD_BACK_ID;
    }

    matches(card: DeckCard) {
        for (const field of [
            'name',
            'set',
            'collector_number',
            'language',
            'board',
            'condition',
            'is_foil',
            'display_face_id',
        ] as (keyof DeckCard)[]) {
            if (this[field] !== card[field]) {
                return false;
            }
        }

        return this.tags.size === card.tags.size
            && [...this.tags].every(tag => card.tags.has(tag));
    }

    on_board(board: Board): boolean;
    on_board(...boards: Board[]): boolean;
    on_board(...boards: Board[]): boolean {
        return boards.length === 0 || boards.includes(this.board);
    }

    all_names(printed: boolean = true): string[] {
        return (this.faces()
            .map(face => face.card_name(printed))
            .filter(Boolean)
            .join(' // ') || this.name)
            .split(/\s*\/+\s*/g);
    }

    deck_list_name(): string {
        return this.main_face(true).card_name(true) || this.name;
    }

    is_basic_land(): boolean {
        return super.is_basic_land() ?? (this.name && DeckCard.BASIC_LAND_REGEXP.test(this.name));
    }

    can_command(format: Format): boolean {
        return (format.has_commander && this.can_be_commander())
            || (format.has_brawler && this.can_be_brawler())
            || (format.has_oathbreaker && this.can_be_oathbreaker());
    }

    can_be_commander(): boolean {
        const card = this.main_face();
        return Boolean(card.is_type('Legendary') && card.power() && card.toughness())
            || /~ can be your commander\./.test(this.oracle());
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

    copy_limit(format?: Format): number {
        if (this.card) {
            if (this.legality(format) === 'restricted') {
                return 1;
            }

            if (this.is_basic_land()) {
                return Infinity;
            }

            const limit_match = this.main_face().oracle().match(/A deck can have (?<any>(any number of)|(up to|only) (?<limit>[0-9a-z ]+)) cards? named ~\./);
            if (limit_match) {
                const {any, limit} = limit_match.groups;
                return any
                    ? Infinity
                    : Number.parseInt(limit) || words_to_number(limit);
            }
        }

        return format?.copy_limit ?? Infinity;
    }

    allows_second_commander(second: DeckCard, format: Format): boolean {
        if (this.card) {
            if (!this.can_command(format)) return false;

            if (format.has_signature_spell && second.can_be_signature_spell(this)) return true;

            if (this.has_keyword('Partner')
                && second.has_keyword('Partner')
            ) {
                const [ability_1, ability_2] = [this, second]
                    .map(card => card.oracle().match(/Partner(—([^(]+))?(?= \(|$)/));

                if (ability_1 && ability_2 && ability_1[0] === ability_2[0]) {
                    return true;
                }
            }

            if (this.has_keyword('Partner with')) {
                const name_match = this.oracle()
                    .match(/Partner with (?<name>[^(]+) (\(|$)/);
                const {name} = name_match.groups;

                if (name === second.card_name()) {
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
        const oracle = this.main_face().oracle();
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

    to_string(format: string = '1 Name (SET:000?)? *EN*? *F*? *NM*? [Tag]') {
        return format
            .replaceAll(/1[x*×]?\??|\(SET(:000+\??)?\)\??|\*[\w\s]+\*\??|\[[\w\s]+]\??|#[\w\s]+#?\??|\/+\s*back|(name|set|000)\??/gi, block => block
                .replace(/^1([x*×]?)(\?)?$/i, (_, x, opt) =>
                    opt && this.quantity === 1 ? ''
                        : `${this.quantity}${x}`)
                .replace(/^\((SET)(:000(\?)?)?\)(\?)?$/i, (_, set, __, opt_cn, opt) =>
                    opt && !this.set ? ''
                        : `(${preserve_case(this.card?.set ?? this.set, set)}${
                            opt_cn && !this.collector_number ? ''
                                : `:${this.card?.collector_number ?? this.collector_number}`
                        })`)
                .replace(/^([*[#^]([\w\s]+)[*\]#^]?)(\?)?$/i, (full, string: string, input: string, opt: string) => {
                    if (Language.match(input)) {
                        return opt && this.language.is_default() ? ''
                            : string.replace(/[\w\s]+/, preserve_case(input.length > 3 ? this.language.name : this.language.code(), input));
                    } else if (Finish.match(input)) {
                        return opt && this.finish.is_default() ? ''
                            : string.replace(/[\w\s]+/, preserve_case(input.length > 2 ? this.finish.name : this.finish.code(), input));
                    } else if (Condition.match(input)) {
                        return !this.condition ? ''
                            : string.replace(/[\w\s]+/, preserve_case(input.length > 2 ? this.condition.name : this.condition.code(), input));
                    } else if (input.match(/^(board|brd)$/i)) {
                        return opt && this.board.is_default() ? ''
                            : string.replace(/[\w\s]+/, preserve_case(input.length > 3 ? this.board.name : this.board.code(), input));
                    } else if (input.match(/tag/i)) {
                        return [...this.tags]
                            .sort()
                            .map(tag => string.replace(/[\w\s]+/, preserve_case(tag.to_string(), input)))
                            .join(' ');
                    } else {
                        return full;
                    }
                })
                .replace(/^(name)\??$/i, (_, name) =>
                    preserve_case(this.deck_list_name(), name))
                .replace(/^(\/+\s*)(back)$/i, (_, slash, back) =>
                    this.is_type('split') ? ''
                        : this.all_names().slice(1).map(face => slash + preserve_case(face, back)).join(''))
                .replace(/^(set)(\?)?$/i, (_, set, opt) =>
                    opt && !(this.card?.set ?? this.set) ? '' : preserve_case(this.card?.set ?? this.set, set))
            )
            .replaceAll(/\s+/g, ' ')
            .replaceAll(/^\s|\s$/g, '');
    }

    toString() {
        return this.to_string();
    }
}

DeckCard.regenerate_line_regexp();
// DeckCard.patch();
