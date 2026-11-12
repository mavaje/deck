var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// value.ts
function is_nullish(value) {
  return value === null || value === void 0 || Number.isNaN(value);
}
var init_value = __esm({
  "value.ts"() {
  }
});

// ui/xml.ts
function create_element(tag, parameters, namespace) {
  let attributes = {};
  let children = null;
  parameters.forEach((parameter) => {
    if (Array.isArray(parameter)) {
      children = parameter;
    } else if (typeof parameter === "object" && !(parameter instanceof Node)) {
      if (parameter) Object.assign(attributes, parameter);
    } else {
      children ??= [];
      children.push(parameter);
    }
  });
  let element;
  if ("id" in attributes) {
    element = document.getElementById(String(attributes.id));
  }
  element ??= namespace ? document.createElementNS(namespace, tag) : document.createElement(tag);
  Object.entries(attributes).forEach(([key, value]) => {
    if (is_nullish(value)) return;
    key = key.replaceAll("_", "-");
    switch (key) {
      case "class":
        if (!Array.isArray(value)) value = value.split(/\s+/g);
        element.className = "";
        element.classList.add(...value.filter(Boolean));
        return;
      case "value":
        element.value = value;
        return;
      case "style":
        element.removeAttribute("style");
        if (typeof value === "object" && "style" in element) {
          Object.entries(value).map(([k, v]) => {
            if (v) element.style.setProperty(
              k.replaceAll("_", "-"),
              String(v)
            );
          });
          return;
        }
      // fallthrough
      default:
        if (key.startsWith("on") && typeof value === "function") {
          const event = key.slice(2);
          switch (event) {
            case "timeout":
              setTimeout(() => value(element));
              break;
            default:
              const listeners = EVENT_LISTENERS.get(element) ?? {};
              if (listeners[event]) {
                element.removeEventListener(event, listeners[event]);
              }
              const listener = (event2) => value(element, event2);
              element.addEventListener(event, listener);
              listeners[event] = listener;
              EVENT_LISTENERS.set(element, listeners);
          }
        } else {
          element.setAttribute(key, String(value));
        }
    }
  });
  if (children) {
    const new_children = children.filter((child) => child || child === 0).map((child) => child instanceof Node ? child : document.createTextNode(String(child)));
    const new_set = new Set(new_children);
    for (const old_child of [...element.childNodes]) {
      if (!new_set.has(old_child)) {
        old_child.remove();
      }
    }
    let last_child = null;
    for (const new_child of new_children) {
      if (last_child) {
        if (new_child !== last_child.nextSibling) {
          last_child.after(new_child);
        }
      } else {
        if (new_child !== element.childNodes[0]) {
          element.insertBefore(new_child, element.childNodes[0]);
        }
      }
      last_child = new_child;
    }
  }
  return element;
}
var EVENT_LISTENERS, HTML, SVG;
var init_xml = __esm({
  "ui/xml.ts"() {
    init_value();
    EVENT_LISTENERS = /* @__PURE__ */ new WeakMap();
    HTML = new Proxy(
      {},
      {
        get(_, tag) {
          return (...parameters) => {
            return create_element(tag, parameters);
          };
        }
      }
    );
    SVG = new Proxy(
      {},
      {
        get(_, tag) {
          return (...parameters) => {
            return create_element(tag, parameters, "http://www.w3.org/2000/svg");
          };
        }
      }
    );
  }
});

// scryfall/cache.ts
var Cache;
var init_cache = __esm({
  "scryfall/cache.ts"() {
    Cache = class {
      constructor(data = {}) {
        this.data = data;
      }
      data;
      normalise_key(key) {
        return key;
      }
      has(key) {
        key = this.normalise_key(key);
        return key in this.data;
      }
      has_any(keys) {
        return keys.some((key) => this.has(key));
      }
      get(key) {
        key = this.normalise_key(key);
        return this.data[key];
      }
      get_any(keys) {
        const key = keys.find((key2) => this.has(key2));
        return this.get(key);
      }
      put(key, data) {
        key = this.normalise_key(key);
        this.data[key] = data;
      }
      put_each(keys, data) {
        keys.forEach((key) => this.put(key, data));
      }
      put_all(data) {
        Object.entries(data).forEach(([key, data2]) => this.put(key, data2));
      }
      dump() {
        const sorted_data = {};
        Object.keys(this.data).sort().forEach((key) => sorted_data[key] = this.data[key]);
        console.log(sorted_data);
      }
    };
  }
});

// text.ts
function words_to_number(word) {
  const words = word.split(" ");
  const ten = TENS.indexOf(words[0]);
  if (ten > 1) {
    switch (words.length) {
      case 1:
        return 10 * ten;
      case 2:
        const unit2 = UNITS.indexOf(words[1]);
        if (unit2 > -1) {
          return 10 * ten + unit2;
        }
    }
  }
  const teen = TEENS.indexOf(words[0]);
  if (teen > -1 && words.length === 1) {
    return 10 + teen;
  }
  const unit = UNITS.indexOf(words[0]);
  if (unit > -1 && words.length === 1) {
    return unit;
  }
  return null;
}
function fraction(number) {
  const fraction2 = {
    [0.5]: "\xBD"
  }[Math.abs(number % 1)];
  if (fraction2) {
    const integer = Math.trunc(number);
    return integer ? `${integer}${fraction2}` : fraction2;
  }
  return `${number}`;
}
function normalise(text, uppercase = false, strip = /[^\w\s]/gi, separator = " ") {
  if (!text) return text;
  return (uppercase ? text.toUpperCase() : text.toLowerCase()).normalize("NFKD").replaceAll("\xE6", "ae").replaceAll(strip, "").replaceAll(/\s+/g, separator);
}
function preserve_case(target, template) {
  if (!target) return "";
  if (!template) return target;
  const first = template[0];
  const last = template.slice(-1);
  if (first === first.toLowerCase()) {
    return target.toLowerCase();
  } else if (last === last.toUpperCase()) {
    return target.toUpperCase();
  } else {
    return target;
  }
}
function trigram(a, b) {
  const [
    trigrams_a,
    trigrams_b
  ] = [a, b].map((string) => {
    const set = /* @__PURE__ */ new Set();
    string = ` ${string} `;
    for (let i = 0; i < string.length - 2; i++) {
      set.add(string.slice(i, i + 3));
    }
    return set;
  });
  if (trigrams_a.size === 0 || trigrams_b.size === 0) return 0;
  return trigrams_a.intersection(trigrams_b).size / trigrams_a.union(trigrams_b).size;
}
var UNITS, TEENS, TENS;
var init_text = __esm({
  "text.ts"() {
    UNITS = [
      "zero",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine"
    ];
    TEENS = [
      "ten",
      "eleven",
      "twelve",
      "thirteen",
      "fourteen",
      "fifteen",
      "sixteen",
      "seventeen",
      "eighteen",
      "nineteen"
    ];
    TENS = [
      null,
      null,
      "twenty",
      "thirty",
      "forty",
      "fifty",
      "sixty",
      "seventy",
      "eighty",
      "ninety"
    ];
  }
});

// designation/designation.ts
var Designation;
var init_designation = __esm({
  "designation/designation.ts"() {
    init_text();
    Designation = class _Designation {
      constructor(name, codes = []) {
        this.name = name;
        this.codes = codes;
      }
      name;
      codes;
      static allows_numeric_keys = false;
      static card_names = [
        "conspiracy"
      ];
      code(upper = false) {
        const code = this.codes[0] ?? this.name;
        return upper ? code.toUpperCase() : code;
      }
      regexp(code) {
        return new RegExp(`^(${normalise(code).replaceAll(" ", ".?")})$`, "i");
      }
      regexps() {
        return [this.name, ...this.codes].map((code) => this.regexp(code));
      }
      matches(input, exclude_card_names = false) {
        let regexps = this.regexps();
        if (exclude_card_names) {
          regexps = regexps.filter((re) => !_Designation.card_names.some((code) => re.test(code)));
        }
        return regexps.some((re) => re.test(input));
      }
      toString() {
        return this.code();
      }
      static match(input, exclude_card_names = false) {
        if (!this.allows_numeric_keys && !Number.isNaN(Number.parseInt(input))) return null;
        const map = this.map();
        if (map[input]) return map[input];
        for (const instance of this.all()) {
          if (instance.matches(input, exclude_card_names)) {
            return instance;
          }
        }
        return null;
      }
      static all() {
        return Object.values(this.map());
      }
      static map() {
        const collected = /* @__PURE__ */ new Set();
        return Object.fromEntries(
          Object.entries(this).filter(([_, value]) => {
            if (value instanceof this && !collected.has(value)) {
              collected.add(value);
              return true;
            }
            return false;
          })
        );
      }
      static clear() {
        Object.keys(this.map()).forEach((key) => delete this[key]);
      }
    };
  }
});

// designation/language.ts
var Language;
var init_language = __esm({
  "designation/language.ts"() {
    init_designation();
    Language = class _Language extends Designation {
      static english = new _Language("English", ["en"]);
      static spanish = new _Language("Spanish", ["es", "sp"]);
      static french = new _Language("French", ["fr"]);
      static german = new _Language("German", ["de", "ge"]);
      static italian = new _Language("Italian", ["it"]);
      static portuguese = new _Language("Portuguese", ["pt"]);
      static japanese = new _Language("Japanese", ["ja", "jp"]);
      static korean = new _Language("Korean", ["ko", "kr"]);
      static russian = new _Language("Russian", ["ru", "rs"]);
      static chinese_simplified = new _Language("Simplified Chinese", ["zhs", "cs"]);
      static chinese_traditional = new _Language("Traditional Chinese", ["zht", "ct"]);
      static hebrew = new _Language("Hebrew", ["he"]);
      static latin = new _Language("Latin", ["la"]);
      static ancient_greek = new _Language("Ancient Greek", ["grc", "ag"]);
      static arabic = new _Language("Arabic", ["ar"]);
      static sanskrit = new _Language("Sanskrit", ["sa"]);
      static phyrexian = new _Language("Phyrexian", ["ph"]);
      static quenya = new _Language("Quenya", ["qya"]);
      static dwarvish = new _Language("Dwarvish", ["dw"]);
      static klingon = new _Language("Klingon", ["tlh", "kl"]);
      static DEFAULT = this.english;
      is_default() {
        return this === _Language.DEFAULT;
      }
    };
  }
});

// scryfall/one-time-loader.ts
var OneTimeLoader;
var init_one_time_loader = __esm({
  "scryfall/one-time-loader.ts"() {
    OneTimeLoader = class {
      promise = null;
      is_loaded = false;
      async load(callback) {
        this.promise ??= callback();
        const result = await this.promise;
        this.is_loaded = true;
        return result;
      }
    };
  }
});

// scryfall/set-cache.ts
var SetCache;
var init_set_cache = __esm({
  "scryfall/set-cache.ts"() {
    init_one_time_loader();
    init_cache();
    init_api();
    init_text();
    SetCache = class extends Cache {
      loader = new OneTimeLoader();
      async load() {
        await this.loader.load(async () => {
          const set_list = await API.sets();
          set_list?.data.forEach((set) => {
            this.put(set.code, set);
            if (set.arena_code) {
              this.put(set.arena_code, set);
            }
            if (set.mtgo_code) {
              this.put(set.mtgo_code, set);
            }
          });
        });
      }
      is_loaded() {
        return this.loader.is_loaded;
      }
      normalise_key(key) {
        return normalise(
          key,
          false,
          /[^0-9a-z]/gi
        );
      }
      normalise(code, type = "code") {
        code = this.normalise_key(code);
        return code && this.get(code)?.[type] || code;
      }
    };
  }
});

// scryfall/api.ts
var API;
var init_api = __esm({
  "scryfall/api.ts"() {
    init_cache();
    init_text();
    init_language();
    init_set_cache();
    API = class _API {
      static BASE_URL = "https://api.scryfall.com";
      static LAST_REQUEST = null;
      static TOO_MANY_REQUESTS = false;
      static CACHE = new Cache();
      static SETS = new SetCache();
      static {
        setTimeout(() => this.SETS.load().then(() => this.SETS.dump()));
      }
      static url(path, parameters = {}) {
        let url = `${this.BASE_URL}/${path}`;
        const query = new URLSearchParams();
        Object.entries(parameters).forEach(([key, value]) => {
          if (value) query.set(key, value);
        });
        if (query.size > 0) url += `?${query}`;
        return url;
      }
      static async request(method, url, body) {
        const can_cache = method === "GET" && !body;
        if (can_cache && this.CACHE.has(url)) {
          return this.CACHE.get(url);
        }
        return new Promise((done) => {
          const request = new XMLHttpRequest();
          request.open(method, url);
          request.setRequestHeader("Accept", "application/json");
          request.addEventListener("load", () => {
            const response = JSON.parse(request.responseText);
            if (response.object !== "error") {
              if (can_cache) this.CACHE.put(url, response);
              done(response);
            } else {
              console.error(response);
              done(null);
            }
          });
          request.addEventListener("error", () => {
            this.TOO_MANY_REQUESTS = true;
            done(null);
            setTimeout(() => this.TOO_MANY_REQUESTS = false, 1e4);
          });
          if (body) {
            request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
          }
          const throttle = this.TOO_MANY_REQUESTS ? 1e4 : /\/cards\/(search|named|random|collection)/.test(url) ? 500 : 100;
          const now = Date.now();
          const timeout = Math.max(0, _API.LAST_REQUEST - now + throttle);
          _API.LAST_REQUEST = now + timeout;
          setTimeout(() => {
            if (this.TOO_MANY_REQUESTS) {
              return done(null);
            }
            console.log(`${method} ${url}`, body ?? "");
            request.send(body ? JSON.stringify(body) : null);
          }, timeout);
        });
      }
      static async get(url) {
        return this.request("GET", url);
      }
      static async post(url, payload) {
        return this.request("POST", url, payload);
      }
      static card_url(set, collector_number, language, parameters = {}) {
        return this.url(language !== Language.DEFAULT.code() ? `cards/${set}/${collector_number}/${language}` : `cards/${set}/${collector_number}`, parameters);
      }
      static card_named_url(name, set, exact = false, parameters = {}) {
        name = normalise(name);
        return this.url(`cards/named`, {
          [exact ? "exact" : "fuzzy"]: name,
          set,
          ...parameters
        });
      }
      static card_random_url(parameters = {}) {
        return this.url(`cards/random`, parameters);
      }
      static card_search_url(query, parameters = {}) {
        return this.url(`cards/search`, { q: query, ...parameters });
      }
      static card_autocomplete_url(name, parameters = {}) {
        name = normalise(name);
        return this.url(`cards/autocomplete`, { q: name, ...parameters });
      }
      static set_url(code, parameters = {}) {
        return this.url(`sets/${code}`, parameters);
      }
      static sets_url(parameters = {}) {
        return this.url(`sets`, parameters);
      }
      static catalog_url(type, parameters = {}) {
        return this.url(`catalog/${type}`, parameters);
      }
      static card(set, collector_number, language) {
        return this.get(this.card_url(set, collector_number, language));
      }
      static card_named(name, set, exact = false) {
        return this.get(this.card_named_url(name, set, exact));
      }
      static random_card(query) {
        return this.get(this.card_random_url({ q: query }));
      }
      static card_autocomplete(name) {
        return this.get(this.card_autocomplete_url(name));
      }
      static CARDS_MAX = 75;
      static cards(identifiers) {
        identifiers.forEach((identifier) => {
          Object.entries({
            id: String,
            mtgo_id: Number,
            multiverse_id: Number,
            oracle_id: String,
            illustration_id: String,
            name: String,
            set: String,
            collector_number: String
          }).forEach(([key, type]) => {
            if (identifier[key]) {
              identifier[key] = type(identifier[key]);
            } else {
              delete identifier[key];
            }
          });
        });
        return this.post(this.url(`cards/collection`), { identifiers });
      }
      static card_search(query) {
        return this.get(this.card_search_url(query));
      }
      static card_search_first(query) {
        return this.card_search(query).then((list) => list?.data[0]);
      }
      static set(code) {
        return this.get(this.set_url(code));
      }
      static sets() {
        return this.get(this.sets_url());
      }
      static next_page(page) {
        console.assert(!!page.next_page);
        return this.get(page.next_page);
      }
      static catalog(type) {
        return this.get(this.catalog_url(type));
      }
    };
  }
});

// rule-break.ts
var RuleBreak;
var init_rule_break = __esm({
  "rule-break.ts"() {
    RuleBreak = class _RuleBreak {
      constructor(no_deck_max = false, deck_min_reduction = 0, extra_colors = 0, types = null, min_mv = 0) {
        this.no_deck_max = no_deck_max;
        this.deck_min_reduction = deck_min_reduction;
        this.extra_colors = extra_colors;
        this.types = types;
        this.min_mv = min_mv;
      }
      no_deck_max;
      deck_min_reduction;
      extra_colors;
      types;
      min_mv;
      static parse_types(types) {
        return types?.split(" and ").map((t) => t.split(" "));
      }
      static additional_color_id(types = null, min_mv) {
        return new _RuleBreak(
          void 0,
          void 0,
          1,
          this.parse_types(types),
          Number.parseInt(min_mv) || 0
        );
      }
      static any_color_id(types, min_mv) {
        return new _RuleBreak(
          void 0,
          void 0,
          Infinity,
          this.parse_types(types),
          Number.parseInt(min_mv) || 0
        );
      }
      static no_deck_max() {
        return new _RuleBreak(
          true
        );
      }
      static reduced_deck_min(reduction) {
        return new _RuleBreak(
          void 0,
          reduction
        );
      }
      breaks_color_identity(card) {
        if (card.card.cmc < this.min_mv) return false;
        if (this.types && !card.is_any_type(this.types)) return false;
        return this.extra_colors > 0;
      }
      breaks_deck_max() {
        return this.no_deck_max;
      }
      breaks_deck_min() {
        return this.deck_min_reduction;
      }
      use() {
        this.extra_colors -= 1;
      }
    };
  }
});

// designation/board.ts
var Board;
var init_board = __esm({
  "designation/board.ts"() {
    init_designation();
    init_text();
    Board = class _Board extends Designation {
      constructor(name, codes, cards = [0], copy_limit = null, card_types = null) {
        super(name, codes);
        this.name = name;
        this.codes = codes;
        this.cards = cards;
        this.copy_limit = copy_limit;
        this.card_types = card_types;
      }
      name;
      codes;
      cards;
      copy_limit;
      card_types;
      static vanguard = new _Board("Vanguard", ["vanguard"], 1, 1, ["Vanguard"]);
      static conspiracy = new _Board("Conspiracy", ["conspiracy"], [0], null, ["Conspiracy"]);
      static hero = new _Board("Hero", ["hero"], 1, 1, ["Hero"]);
      static commander = new _Board("Commander", ["cmdr", "commanders"]);
      static companion = new _Board("Companion", ["cmpn", "companions"]);
      static deck = new _Board("Deck", ["main", "main board", "main deck"]);
      static sideboard = new _Board("Sideboard", ["sb", "side board", "side"]);
      static stickers = new _Board("Sticker Deck", ["stickers"], [10], 1, ["Stickers"]);
      static attractions = new _Board("Attraction Deck", ["attraction", "attractions"], 10, 1, ["Artifact - Attraction"]);
      static contraptions = new _Board("Contraption Deck", ["contraption", "contraptions"], [15], 1, ["Artifact - Contraption"]);
      static planar = new _Board("Planar Deck", ["planar", "planes"], [10], 1, ["Plane", "Phenomenon"]);
      static schemes = new _Board("Scheme Deck", ["scheme", "schemes", "archenemy"], [20], 2, ["Scheme"]);
      static tokens = new _Board("Tokens", ["tokens", "emblems", "dungeons"], [20], 2, ["Token", "Emblem", "Dungeon", "Card"]);
      static maybeboard = new _Board("Maybeboard", ["mb", "maybe board", "maybe"]);
      static acquireboard = new _Board("Acquireboard", ["ab", "acquire", "acquire board"]);
      static DEFAULT = this.deck;
      static STARTING_DECK = [
        this.commander,
        this.deck
      ];
      static STANDARD = [
        this.commander,
        this.companion,
        this.deck,
        this.sideboard
      ];
      is_default() {
        return this === _Board.DEFAULT;
      }
      min_cards() {
        return (Array.isArray(this.cards) ? this.cards[0] : this.cards) ?? 0;
      }
      max_cards() {
        return (Array.isArray(this.cards) ? this.cards[1] : this.cards) ?? Infinity;
      }
      regexp(code) {
        return new RegExp(`^(${normalise(code).replaceAll(" ", ".?").replaceAll(/s$/g, "s?")})({top})?$`, "i");
      }
      can_include(card) {
        return this.card_types.some((type) => {
          const [card_type, subtype] = type.split(" - ");
          return card.is_card_type(card_type) && (!subtype || card.is_type(subtype));
        });
      }
      static default_for(card) {
        for (const board of this.all()) {
          if (board.card_types && board.can_include(card)) {
            return board;
          }
        }
        return _Board.deck;
      }
    };
  }
});

// designation/condition.ts
var Condition;
var init_condition = __esm({
  "designation/condition.ts"() {
    init_designation();
    init_text();
    Condition = class _Condition extends Designation {
      static near_mint = new _Condition("Near Mint", ["nm", "new", "mint"]);
      static slightly_played = new _Condition("Slightly Played", ["sl", "slight played", "slight wear"]);
      static medium_played = new _Condition("Medium Played", ["mp", "medium wear"]);
      static heavily_played = new _Condition("Heavily Played", ["hp", "heavy played", "heavy wear"]);
      regexp(code) {
        return new RegExp(`^(${normalise(code).replaceAll(" ", ".?").replaceAll(/ed$/g, "(ed)?")})$`, "i");
      }
    };
  }
});

// designation/finish.ts
var Finish;
var init_finish = __esm({
  "designation/finish.ts"() {
    init_designation();
    Finish = class _Finish extends Designation {
      static nonfoil = new _Finish("Non-Foil", ["nf"]);
      static foil = new _Finish("Foil", ["f"]);
      static etched = new _Finish("Etched", ["et"]);
      static DEFAULT = this.nonfoil;
      is_default() {
        return this === _Finish.DEFAULT;
      }
    };
  }
});

// designation/tag.ts
var Tag;
var init_tag = __esm({
  "designation/tag.ts"() {
    init_designation();
    Tag = class _Tag extends Designation {
      constructor(tag, codes, hex) {
        super(tag, codes);
        this.hex = hex;
      }
      hex;
      static allows_numeric_keys = true;
      static match_or_new(input, hex) {
        let tag = _Tag.match(input);
        if (!tag) {
          tag = new _Tag(input, void 0, hex?.toLowerCase());
          this[tag.code()] = tag;
        }
        return tag;
      }
      to_string(separator = ":") {
        return this.name + (this.hex ? separator + this.hex : "");
      }
      toString() {
        return this.to_string();
      }
    };
  }
});

// scryfall/types.ts
var COLORS;
var init_types = __esm({
  "scryfall/types.ts"() {
    COLORS = ["W", "U", "B", "R", "G"];
  }
});

// scryfall/catalog.ts
var Catalog;
var init_catalog = __esm({
  "scryfall/catalog.ts"() {
    init_api();
    init_one_time_loader();
    Catalog = class _Catalog {
      constructor(type, extra = []) {
        this.type = type;
        this.extra = extra;
        _Catalog.INSTANCES.push(this);
      }
      type;
      extra;
      static INSTANCES = [];
      static LOADER = new OneTimeLoader();
      static supertypes = new _Catalog("supertypes");
      static card_types = new _Catalog("card-types", [
        "Card",
        "Stickers",
        "Token"
      ]);
      static artifact_types = new _Catalog("artifact-types");
      static battle_types = new _Catalog("battle-types");
      static creature_types = new _Catalog("creature-types");
      static enchantment_types = new _Catalog("enchantment-types");
      static land_types = new _Catalog("land-types");
      static planeswalker_types = new _Catalog("planeswalker-types");
      static spell_types = new _Catalog("spell-types");
      static subtypes = {
        "Land": _Catalog.land_types,
        "Artifact": _Catalog.artifact_types,
        "Enchantment": _Catalog.enchantment_types,
        "Creature": _Catalog.creature_types,
        "Kindred": _Catalog.creature_types,
        "Battle": _Catalog.battle_types,
        "Planeswalker": _Catalog.planeswalker_types,
        "Instant": _Catalog.spell_types,
        "Sorcery": _Catalog.spell_types
      };
      static keyword_abilities = new _Catalog("keyword-abilities");
      loader = new OneTimeLoader();
      data = [];
      map = /* @__PURE__ */ new Set();
      async load() {
        await this.loader.load(async () => {
          const catalog = await API.catalog(this.type);
          if (catalog) {
            this.data = catalog.data;
            this.data.push(...this.extra);
            this.data.forEach((type) => {
              this.map.add(type);
              this.map.add(type.toLowerCase());
            });
          }
        });
      }
      static async load() {
        await this.LOADER.load(() => Promise.all(this.INSTANCES.map((catalog) => catalog.load())));
      }
      has(type) {
        return this.map.has(type);
      }
      all() {
        return this.data;
      }
      filter(callback) {
        return this.data.filter(callback);
      }
      any(callback) {
        return this.data.some(callback);
      }
    };
  }
});

// color-set.ts
var ColorSet;
var init_color_set = __esm({
  "color-set.ts"() {
    init_types();
    ColorSet = class _ColorSet extends Set {
      constructor(colors) {
        super(colors);
        this.colors = colors;
      }
      colors;
      static colors = {
        c: new _ColorSet([]),
        w: new _ColorSet(["W"]),
        u: new _ColorSet(["U"]),
        b: new _ColorSet(["B"]),
        r: new _ColorSet(["R"]),
        g: new _ColorSet(["G"]),
        uw: new _ColorSet(["W", "U"]),
        bu: new _ColorSet(["U", "B"]),
        br: new _ColorSet(["B", "R"]),
        gr: new _ColorSet(["R", "G"]),
        gw: new _ColorSet(["G", "W"]),
        bw: new _ColorSet(["W", "B"]),
        ru: new _ColorSet(["U", "R"]),
        bg: new _ColorSet(["B", "G"]),
        rw: new _ColorSet(["R", "W"]),
        gu: new _ColorSet(["G", "U"]),
        buw: new _ColorSet(["W", "U", "B"]),
        bru: new _ColorSet(["U", "B", "R"]),
        bgr: new _ColorSet(["B", "R", "G"]),
        grw: new _ColorSet(["R", "G", "W"]),
        guw: new _ColorSet(["G", "W", "U"]),
        bgw: new _ColorSet(["W", "B", "G"]),
        ruw: new _ColorSet(["U", "R", "W"]),
        bgu: new _ColorSet(["B", "G", "U"]),
        brw: new _ColorSet(["R", "W", "B"]),
        gru: new _ColorSet(["G", "U", "R"]),
        bruw: new _ColorSet(["W", "U", "B", "R"]),
        bgru: new _ColorSet(["U", "B", "R", "G"]),
        bgrw: new _ColorSet(["B", "R", "G", "W"]),
        gruw: new _ColorSet(["R", "G", "W", "U"]),
        bguw: new _ColorSet(["G", "W", "U", "B"]),
        bgruw: new _ColorSet(["W", "U", "B", "R", "G"])
      };
      static from(colors) {
        if (typeof colors === "string") {
          colors = [colors];
        }
        if (!(colors instanceof Set)) {
          colors = new Set(colors);
        }
        const key = _ColorSet.code([...colors]);
        return this.colors[key];
      }
      static code(colors) {
        return colors.map((c) => c.toLowerCase()).filter((c) => COLORS.includes(c.toUpperCase())).sort().join("") || "c";
      }
      code() {
        return _ColorSet.code([...this]);
      }
      plus(colors) {
        if (this.size === 5) return this;
        return _ColorSet.from(this.union(_ColorSet.from(colors)));
      }
      within(colors) {
        if (this.size === 0) return true;
        colors = _ColorSet.from(colors);
        return this.size <= colors.size && this.size === this.intersection(colors).size;
      }
      contains(colors) {
        if (this.size === 5) return true;
        colors = _ColorSet.from(colors);
        return this.size >= colors.size && this.size === this.union(colors).size;
      }
      equals(colors) {
        return this === _ColorSet.from(colors);
      }
      static index(colors) {
        const code = _ColorSet.from(colors).code();
        const index = Object.keys(_ColorSet.colors).indexOf(code);
        return index === -1 ? null : index;
      }
    };
  }
});

// face.ts
var Face;
var init_face = __esm({
  "face.ts"() {
    init_types();
    init_language();
    init_catalog();
    init_color_set();
    Face = class _Face {
      constructor(card, face = card) {
        this.card = card;
        this.face = face;
      }
      card;
      face;
      static DEFAULT_CARD_BACK_ID = "0aeebaf5-8c7d-4636-9e82-8c27447861f7";
      flush() {
        this.card = null;
        this.face = null;
        return this;
      }
      hydrate(card, face = card) {
        this.card = card;
        this.face = face;
        return this;
      }
      is_card() {
        return this.face?.object === "card";
      }
      is_face() {
        return this.face?.object === "card_face";
      }
      faces() {
        return this.is_card() && this.card.card_faces?.map((face) => new _Face(this.card, face)) || [this];
      }
      off_battlefield_overrides() {
        const match = this.oracle()?.match(/(^|\n)~ is also a (?<type_line>\w+(,? \w+)*)\./i) ?? this.oracle()?.match(/(^|\n)As long as ~ isn't on the battlefield, it's a ((?<power>\d+)\/(?<toughness>\d+) )?(?<type_line>\w+( \w+)*) in addition to its other types\./i);
        return match?.groups ?? {};
      }
      legality(format) {
        return this.card?.legalities[format?.code];
      }
      is_legal(format) {
        return ![
          "not_legal",
          "banned"
        ].includes(this.legality(format));
      }
      is_default_language() {
        return !this.card || this.card?.lang === Language.DEFAULT.code();
      }
      layout() {
        return this.card?.layout ?? "normal";
      }
      is_double_faced() {
        switch (this.layout()) {
          case "transform":
          case "modal_dfc":
          case "double_faced_token":
          case "reversible_card":
          case "art_series":
            return true;
          default:
            return false;
        }
      }
      is_layout(...layouts) {
        return layouts.some((layout) => this.card?.layout === layout);
      }
      colors() {
        const colors = this.face?.colors;
        return colors ? ColorSet.from(colors) : this.infer_colors();
      }
      color_identity() {
        return this.card ? ColorSet.from(this.card.color_identity) : null;
      }
      colors_produced() {
        return this.card ? ColorSet.from(this.card.produced_mana) : null;
      }
      infer_colors() {
        let colors = ColorSet.colors.c;
        if (this.face?.mana_cost) {
          COLORS.forEach((color) => {
            if (this.face.mana_cost.includes(color)) {
              colors = colors.plus(color);
            }
          });
        }
        return colors;
      }
      modified_type_line() {
        return (this.off_battlefield_overrides()?.type_line ?? "").replaceAll(/, (and )?/g, " ") + " " + this.face?.type_line;
      }
      card_types() {
        Catalog.card_types.load();
        return Catalog.card_types.filter((type) => this.is_card_type(type));
      }
      is_card_type(card_type) {
        if (!this.card) return null;
        return new RegExp(`^[a-z ]*\\b${card_type}\\b`, "i").test(this.modified_type_line()) || {
          creature: /\b(Summon|Eaturecray)\b/i,
          phenomenon: /\bPhenome-nom\b/i,
          planeswalker: /\bUniversewalker\b/i
        }[card_type.toLowerCase()]?.test(this.modified_type_line());
      }
      is_any_card_type(...card_types) {
        if (!this.card) return null;
        return card_types.some((type) => this.is_card_type(type));
      }
      is_all_types(card_type) {
        return this.is_card_type(card_type) && ({
          creature: /(^|\n)Changeling\b/i,
          land: /(^|\n)Rangeling\b/i
        }[card_type.toLowerCase()]?.test(this.oracle()) ?? false);
      }
      is_specified_type(...types) {
        if (!this.card) return null;
        return types.every(
          (type) => this.is_card_type(type) || new RegExp(`\\b${type}\\b`, "i").test(this.modified_type_line()) || {
            boar: /\bIgpay\b/i
          }[type.toLowerCase()]?.test(this.modified_type_line())
        );
      }
      is_type(...types) {
        if (!this.card) return null;
        return this.is_specified_type(...types) || types.every(
          (type) => Catalog.card_types.any(
            (card_type) => this.is_all_types(card_type) && Catalog.subtypes[card_type]?.has(type)
          )
        );
      }
      is_any_type(type_groups) {
        if (!this.card) return null;
        return type_groups.some((types) => this.is_type(...Array.isArray(types) ? types : [types]));
      }
      is_basic_land() {
        return this.is_type("Basic", "Land");
      }
      is_permanent() {
        return this.is_any_type([
          "Artifact",
          "Battle",
          "Creature",
          "Enchantment",
          "Land",
          "Planeswalker"
        ]);
      }
      infer_mana_cost() {
        let mana_value = null;
        if (this.face?.mana_cost) {
          for (const match of this.face.mana_cost.matchAll(/\{(?<code>[^}]+)}/g)) {
            const { code } = match.groups;
            mana_value ??= 0;
            mana_value += Number.isNaN(Number.parseFloat(code)) ? {
              "\xBD": 0.5,
              "HW": 0.5,
              "HU": 0.5,
              "HB": 0.5,
              "HR": 0.5,
              "HG": 0.5,
              "\u221E": Infinity
            }[code] ?? 1 : Number.parseFloat(code);
          }
        }
        return mana_value;
      }
      mana_value() {
        const mv = this.face?.cmc ?? this.infer_mana_cost();
        if (mv !== 0) return mv;
        if (this.is_any_card_type(
          "Boss",
          "Conspiracy",
          "Dungeon",
          "Emblem",
          "Event",
          "Hero",
          "Phenomenon",
          "Plane",
          "Scheme",
          "Stickers",
          "Token",
          "Vanguard",
          "Card"
        ) || this.is_any_type([
          ["Artifact", "Attraction"],
          ["Artifact", "Contraption"]
        ])) {
          return null;
        } else {
          return mv;
        }
      }
      power() {
        return this.face?.power ?? this.off_battlefield_overrides()?.power;
      }
      toughness() {
        return this.face?.toughness ?? this.off_battlefield_overrides()?.toughness;
      }
      loyalty() {
        return this.face?.loyalty;
      }
      defense() {
        return this.face?.defense;
      }
      oracle() {
        return this.is_card() && this.is_layout("split") ? this.faces().map((face) => face.oracle()).join("\n") : this.face?.oracle_text?.replaceAll(this.card_name(), "~").replaceAll(this.card_name().split(",")[0], "~");
      }
      has_ability(ability) {
        if (!(ability instanceof RegExp)) ability = new RegExp(`(^|\\n)${ability}(\u2014| [d{(]|$)`, "i");
        return ability.test(this.oracle());
      }
      has_activate_ability() {
        if (!this.card) return false;
        if (this.oracle().match(/(^|\n)[^"]+("[^"]+"[^"]*)*:/)) {
          return true;
        }
        if (this.is_any_type([
          "Plains",
          "Island",
          "Swamp",
          "Mountain",
          "Forest"
        ])) {
          return true;
        }
        const activated_ability_words = {
          "Augment": true,
          "Aura Swap": true,
          "Commander ninjutsu": true,
          "Craft": true,
          "Crew": true,
          "Cycling": true,
          "Embalm": true,
          "Encore": true,
          "Equip": true,
          "Equipment Swap": true,
          "Eternalize": true,
          "Fortify": true,
          "Host": true,
          "Level Up": true,
          "Ninjutsu": true,
          "Outlast": true,
          "Reconfigure": true,
          "Reinforce": true,
          "Saddle": true,
          "Scavenge": true,
          "Shackle": true,
          "Specialize": true,
          "Station": true,
          "Transfigure": true,
          "Transmute": true,
          "Unearth": true
        };
        if (this.card.keywords.some((kw) => activated_ability_words[kw])) {
          return true;
        }
        return Object.entries(activated_ability_words).filter(([_, activated]) => activated).some(([kw]) => this.has_ability(kw));
      }
      has_keyword(keyword) {
        return this.card?.keywords.includes(keyword);
      }
      image_urls() {
        const image_uris = this.face?.image_uris ?? this.card?.image_uris;
        if (image_uris) {
          return [
            image_uris.grid,
            image_uris.thumb
          ].filter(Boolean);
        }
        return [];
      }
      back_id() {
        return this.card?.card_back_id;
      }
      has_alternative_back() {
        return this.back_id() !== _Face.DEFAULT_CARD_BACK_ID;
      }
      back_image_url() {
        const id = this.back_id();
        if (!id) return null;
        return `https://backs.scryfall.io/large/${id[0]}/${id[1]}/${id}.jpg`;
      }
      card_name(printed = false) {
        return printed && this.is_default_language() ? this.face?.printed_name ?? this.face?.name : this.face?.name;
      }
      artist() {
        return this.face?.artist ?? this.card?.artist;
      }
    };
  }
});

// deck-card.ts
var DeckCard;
var init_deck_card = __esm({
  "deck-card.ts"() {
    init_api();
    init_text();
    init_cache();
    init_rule_break();
    init_language();
    init_board();
    init_condition();
    init_finish();
    init_tag();
    init_face();
    DeckCard = class _DeckCard extends Face {
      static CACHE = new Cache();
      static BASIC_LAND_REGEXP = /^(snow(.?cover(ed)?).?)?(plains?|island|swamp|mountain|forest|wastes?)$/i;
      static LINE_REGEXP = null;
      static bracket_words = /* @__PURE__ */ new Set([
        "Used",
        "Plane",
        "Summer",
        "Theme"
      ]);
      id;
      raw;
      raw_name = null;
      name = null;
      set = null;
      collector_number = null;
      language = Language.DEFAULT;
      quantity = 1;
      finish = Finish.DEFAULT;
      condition = null;
      board = Board.DEFAULT;
      tags = /* @__PURE__ */ new Set();
      display_face_id = null;
      constructor(card = {}) {
        super(card.card);
        Object.assign(this, card);
        this.raw_name ??= this.name;
      }
      static regenerate_line_regexp() {
        this.LINE_REGEXP = new RegExp([
          "^",
          "((?<quantity>\\d{1,3})[x*\xD7]?\\s)?",
          `(?<name>[^([^#*]+?(\\s*\\((d{4}|[^)]*[ '][^)]*|${[...this.bracket_words].join("|")})\\))?)?`,
          "(?<set_num>\\([0-9A-Z]{3,5}\\)(\\s*[^)[(#*:\\s]+)?|\\([0-9A-Z]{3,5}:[^)[(#*:\\s]+\\))?",
          "(?<extra>([#*^[]).*)?",
          "$"
        ].join("\\s*"), "i");
      }
      static async patch() {
        const bracket_cards = (await API.card_search("name:/\\([0-9A-Z]{3,5}(:.+)?\\)$/"))?.data;
        bracket_cards.forEach((card) => {
          const matches = card.name.matchAll(/\((?<word>[0-9A-Z]{3,5}(:.+)?)\)/gi);
          for (const match of matches) {
            const word = match.groups.word;
            if (word.match(/[A-Z]/i)) {
              this.bracket_words.add(word);
            }
          }
        });
        this.regenerate_line_regexp();
        const number_cards = (await API.card_search("name:/^\\d{1,3}\\s/"))?.data;
        if (number_cards?.length > 0) {
          console.error(`cards starting with numbers < 1000: `, number_cards.map((card) => card.name));
        }
      }
      static empty() {
        return new _DeckCard({ quantity: 0 });
      }
      static parse(input, deck, default_board = Board.DEFAULT) {
        const match = this.LINE_REGEXP.exec(input);
        if (!match) return null;
        const {
          quantity = "1",
          name = null,
          set_num = null,
          extra
        } = match.groups;
        let set = null;
        let collector_number = null;
        if (set_num) {
          const match2 = /\((?<set>[0-9A-Z]{3,5})\)(\s*(?<collector_number>[^)[(#*:\s]+))?/i.exec(set_num) ?? /\((?<set>[0-9A-Z]{3,5}):(?<collector_number>[^)[(#*:\s]+)\)/i.exec(set_num);
          ({
            set = null,
            collector_number = null
          } = match2?.groups ?? {});
        }
        const card = new _DeckCard({
          raw: input,
          quantity: Number.parseInt(quantity),
          name,
          raw_name: name,
          set: API.SETS.normalise(set),
          collector_number,
          board: default_board
        });
        if (!card.name && !(card.set && card.collector_number)) return null;
        if (extra) {
          let extra_left = extra;
          while (extra_left) {
            const match2 = extra_left.match(/^(\*(?<tag>[^*]+)\*)\s*/i) ?? extra_left.match(/^\[(?<tag>[^\]]+)]\s*/i) ?? extra_left.match(/^(\^(?<tag>[^^]+)\^)\s*/i) ?? extra_left.match(/^#(?<tag>[^#]+)#?\s*/i);
            if (!match2) break;
            extra_left = extra_left.slice(match2[0].length);
            const { tag } = match2.groups;
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
        if (deck) {
          card.id = deck.length;
          deck.push(card);
        }
        return card;
      }
      static from_card(card, exact = false) {
        const deck_card = new _DeckCard({
          card,
          finish: Object.entries(Finish.map()).find(([finish]) => card.finishes.includes(finish))?.[1] ?? Finish.DEFAULT
        });
        deck_card.hydrate(card);
        if (exact) {
          deck_card.set = API.SETS.normalise(card.set);
          deck_card.collector_number = card.collector_number;
        }
        return deck_card;
      }
      cache_keys() {
        const keys = [];
        if (this.set && this.collector_number) {
          keys.push(`(${this.set}:${this.collector_number}:${this.language})`);
        } else if (this.name) {
          [
            this.raw_name,
            this.main_face(false).card_name(true),
            this.main_face(true).card_name(true)
          ].forEach((name) => {
            if (name) keys.push(`${normalise(name)} (${this.set ?? ""}::${this.language})`);
          });
        }
        return keys;
      }
      can_bulk_load() {
        return [
          !this.card,
          this.identifier(),
          !/^y\d\d$/i.test(this.set)
        ].every(Boolean);
      }
      identifier() {
        const { set, collector_number } = this;
        if (set && collector_number) {
          return { set, collector_number };
        }
        if (this.name) {
          const name = this.name.split(/\s*\/\/\s*/g)[0];
          return set ? { name, set } : { name };
        }
        return null;
      }
      load_from_cache() {
        if (!this.card) {
          this.card = _DeckCard.CACHE.get_any(this.cache_keys());
          this.hydrate();
        }
      }
      async load() {
        this.load_from_cache();
        const { name, set, collector_number, language } = this;
        const is_alchemy_set = /^y\d\d$/i.test(set);
        if (set && collector_number && !is_alchemy_set) {
          this.card ??= await API.card(set, collector_number, language.code());
        }
        if (name) {
          if (/^_{6,}$/.test(name) && !set) {
            this.card ??= await API.random_card(`include:extras name:'${name}'`);
          }
          if (is_alchemy_set) {
            this.card ??= await API.random_card(`st:alchemy name:'${name}'`);
          } else if (set && !collector_number) {
            this.card ??= await API.card_named(name, set);
          }
          this.card ??= await API.card_named(name);
          if (this.card && this.card.lang !== language.code() && !language.is_default()) {
            let query = `oracle_id:${this.card.oracle_id} lang:${language}`;
            if (set && !is_alchemy_set) query += ` set:${set}`;
            this.card = await API.random_card(query) ?? this.card;
          }
        }
        return this.hydrate().cache();
      }
      async reload() {
        this.flush();
        return this.load();
      }
      hydrate(card = this.card) {
        super.hydrate(card);
        if (card) {
          if (this.set !== card.set) {
            this.set = null;
          }
          if (this.collector_number !== card.collector_number) {
            this.collector_number = null;
          }
          if (this.language.code() !== card.lang && this.language.is_default()) {
            this.language = Language.match(card.lang);
          }
          if (this.name && card.card_faces) {
            const normal_name = normalise(this.name);
            let max_similarity = Math.max(...[
              this.card_name(false),
              this.all_names(true).join(" // ")
            ].map((name) => trigram(normal_name, normalise(name))));
            if (max_similarity < 1) {
              this.faces().some((face, id) => [
                face.card_name(false),
                face.card_name(true)
              ].some((name) => {
                const similarity = trigram(normal_name, normalise(name));
                if (similarity > max_similarity) {
                  max_similarity = similarity;
                  this.display_face_id = id;
                  return max_similarity === 1;
                }
              }));
            }
          }
          this.name = this.deck_list_name();
        }
        return this;
      }
      cache() {
        if (this.card) {
          _DeckCard.CACHE.put_each(this.cache_keys(), this.card);
        }
        return this;
      }
      set_code() {
        return API.SETS.normalise(this.set ?? this.card?.set);
      }
      main_face(display = null) {
        display ??= {
          "double_faced_token": true,
          "reversible_card": true,
          "art_series": true
        }[this.card?.layout] ?? false;
        const face = display ? this.display_face_id : null;
        return (face !== null || !this.is_layout("split")) && this.faces()[face ?? 0] || this;
      }
      back_face() {
        return this.faces()[1];
      }
      all_faces() {
        return [
          ...this.faces(),
          this
        ];
      }
      matches(card) {
        for (const field of [
          "name",
          "set",
          "collector_number",
          "language",
          "board",
          "condition",
          "is_foil",
          "display_face_id"
        ]) {
          if (this[field] !== card[field]) {
            return false;
          }
        }
        return this.tags.size === card.tags.size && [...this.tags].every((tag) => card.tags.has(tag));
      }
      on_board(...boards) {
        return boards.length === 0 || boards.includes(this.board);
      }
      card_name(printed = false) {
        return super.card_name(printed) ?? this.name;
      }
      all_names(printed = true) {
        return (this.faces().map((face) => face.card_name(printed)).filter(Boolean).join(" // ") || this.name).split(/\s*\/+\s*/g);
      }
      deck_list_name() {
        return this.main_face(true).card_name(true) || this.name;
      }
      is_basic_land() {
        return super.is_basic_land() ?? (this.name && _DeckCard.BASIC_LAND_REGEXP.test(this.name));
      }
      can_command(format) {
        return format.has_commander && this.can_be_commander() || format.has_brawler && this.can_be_brawler() || format.has_oathbreaker && this.can_be_oathbreaker();
      }
      can_be_commander() {
        const card = this.main_face();
        return Boolean(card.is_type("Legendary") && card.power() && card.toughness()) || /~ can be your commander\./.test(this.oracle());
      }
      can_be_brawler() {
        return this.can_be_commander() || this.can_be_oathbreaker();
      }
      can_be_oathbreaker() {
        return this.is_type("Legendary", "Planeswalker");
      }
      can_be_signature_spell(oathbreaker) {
        return (this.is_type("Instant") || this.is_type("Sorcery")) && this.color_identity().within(oathbreaker.color_identity());
      }
      copy_limit(format) {
        if (this.card) {
          if (this.legality(format) === "restricted") {
            return 1;
          }
          if (this.is_basic_land()) {
            return Infinity;
          }
          const limit_match = this.main_face().oracle().match(/A deck can have (?<any>(any number of)|(up to|only) (?<limit>[0-9a-z ]+)) cards? named ~\./);
          if (limit_match) {
            const { any, limit } = limit_match.groups;
            return any ? Infinity : Number.parseInt(limit) || words_to_number(limit);
          }
        }
        return format?.copy_limit ?? Infinity;
      }
      allows_second_commander(second, format) {
        if (this.card) {
          if (!this.can_command(format)) return false;
          if (format.has_signature_spell && second.can_be_signature_spell(this)) return true;
          if (this.has_keyword("Partner") && second.has_keyword("Partner")) {
            const [ability_1, ability_2] = [this, second].map((card) => card.oracle().match(/Partner(—([^(]+))?(?= \(|$)/));
            if (ability_1 && ability_2 && ability_1[0] === ability_2[0]) {
              return true;
            }
          }
          if (this.has_keyword("Partner with")) {
            const name_match = this.oracle().match(/Partner with (?<name>[^(]+) (\(|$)/);
            const { name } = name_match.groups;
            if (name === second.card_name()) {
              return true;
            }
          }
          if (this.has_keyword("Doctor's companion") && second.is_type("Time Lord", "Doctor")) {
            return true;
          }
          if (this.has_keyword("Choose a background") && second.is_type("Legendary", "Enchantment", "Background")) {
            return true;
          }
          if (this.has_ability("Legendary partner") && !second.is_type("Legendary") && second.main_face().power() && second.main_face().toughness()) {
            return true;
          }
          const free_match = this.oracle().match(/You may play ~ and any other legend with (?<id>\w+|\d+) color identity or less as your commanders as though they each had partner\./);
          if (free_match) {
            const { id } = free_match.groups;
            const id_count = words_to_number(id) ?? Number.parseInt(id);
            if (second.is_type("Legendary", "Creature") && second.color_identity().size <= id_count) {
              return true;
            }
          }
        }
        return false;
      }
      rulebreaks() {
        const oracle = this.main_face().oracle();
        const breaks = [];
        const additional_color_id_match = oracle.match(/If ~ is your commander, choose a color before the game begins. ~ is the chosen color\./) ?? oracle.match(/If ~ is your commander, the color identity of (?<type_1>[\w\s]+) cards in your deck can include one color of your choice not in your commander's color identity, and your deck can have any (?<type_2>[\w\s]+) cards\./);
        if (additional_color_id_match) {
          const {
            type_1,
            type_2
          } = additional_color_id_match.groups ?? {};
          breaks.push(RuleBreak.additional_color_id(type_1));
          if (type_2) {
            breaks.push(RuleBreak.any_color_id(type_2));
          }
        }
        const any_color_id_match = oracle.match(/A deck with this commander can have ((?<type_1>[\w\s]+) cards (with mana value (?<min_mv>\d+) or greater )?of any color identity and )?any (?<type_2>[\w\s]+) cards\./);
        if (any_color_id_match) {
          const {
            type_1,
            type_2,
            min_mv
          } = any_color_id_match.groups;
          if (type_1) {
            breaks.push(RuleBreak.any_color_id(type_1, min_mv));
          }
          if (type_2) {
            breaks.push(RuleBreak.any_color_id(type_2));
          }
        }
        const no_deck_max_match = oracle.match(/A deck with this commander has no maximum deck size\./);
        if (no_deck_max_match) {
          breaks.push(RuleBreak.no_deck_max());
        }
        const reduced_deck_min_match = oracle.match(/Your minimum deck size is reduced by (?<reduction>\w+|\d+)\./);
        if (reduced_deck_min_match) {
          const { reduction: reduction_string } = reduced_deck_min_match.groups;
          const reduction = words_to_number(reduction_string) ?? Number.parseInt(reduction_string);
          breaks.push(RuleBreak.reduced_deck_min(reduction));
        }
        return breaks;
      }
      to_string(format = "1 Name (SET:000?)? *EN*? *F*? *NM*? [Tag]") {
        return format.replaceAll(
          /1[x*×]?\??|\(SET(:000+\??)?\)\??|\*[\w\s]+\*\??|\[[\w\s]+]\??|#[\w\s]+#?\??|\/+\s*back|(name|set|000)\??/gi,
          (block) => block.replace(/^1([x*×]?)(\?)?$/i, (_, x, opt) => opt && this.quantity === 1 ? "" : `${this.quantity}${x}`).replace(/^\((SET)(:000(\?)?)?\)(\?)?$/i, (_, set, __, opt_cn, opt) => opt && !this.set ? "" : `(${preserve_case(this.card?.set ?? this.set, set)}${opt_cn && !this.collector_number ? "" : `:${this.card?.collector_number ?? this.collector_number}`})`).replace(/^([*[#^]([\w\s]+)[*\]#^]?)(\?)?$/i, (full, string, input, opt) => {
            if (Language.match(input)) {
              return opt && this.language.is_default() ? "" : string.replace(/[\w\s]+/, preserve_case(input.length > 3 ? this.language.name : this.language.code(), input));
            } else if (Finish.match(input)) {
              return opt && this.finish.is_default() ? "" : string.replace(/[\w\s]+/, preserve_case(input.length > 2 ? this.finish.name : this.finish.code(), input));
            } else if (Condition.match(input)) {
              return !this.condition ? "" : string.replace(/[\w\s]+/, preserve_case(input.length > 2 ? this.condition.name : this.condition.code(), input));
            } else if (input.match(/^(board|brd)$/i)) {
              return opt && this.board.is_default() ? "" : string.replace(/[\w\s]+/, preserve_case(input.length > 3 ? this.board.name : this.board.code(), input));
            } else if (input.match(/tag/i)) {
              return [...this.tags].sort().map((tag) => string.replace(/[\w\s]+/, preserve_case(tag.to_string(), input))).join(" ");
            } else {
              return full;
            }
          }).replace(/^(name)\??$/i, (_, name) => preserve_case(this.deck_list_name(), name)).replace(/^(\/+\s*)(back)$/i, (_, slash, back) => this.is_type("split") ? "" : this.all_names().slice(1).map((face) => slash + preserve_case(face, back)).join("")).replace(/^(set)(\?)?$/i, (_, set, opt) => opt && !(this.card?.set ?? this.set) ? "" : preserve_case(this.card?.set ?? this.set, set))
        ).replaceAll(/\s+/g, " ").replaceAll(/^\s|\s$/g, "");
      }
      toString() {
        return this.to_string();
      }
    };
    DeckCard.regenerate_line_regexp();
  }
});

// card-list.ts
var CardList;
var init_card_list = __esm({
  "card-list.ts"() {
    CardList = class _CardList extends Array {
      constructor(cards = []) {
        if (Array.isArray(cards)) {
          super(...cards);
        } else {
          super(cards);
        }
      }
      count() {
        return this.reduce((count, card) => count + card.quantity, 0);
      }
      copy() {
        return new _CardList(this);
      }
      filter(predicate) {
        return new _CardList(super.filter(predicate));
      }
      skip_empty() {
        return this.filter((card) => card.quantity > 0);
      }
      filter_by_count(predicate) {
        const counts = this.count_map();
        return this.filter((card) => predicate(counts[card.name], card));
      }
      by_count(callback) {
        const counts = this.count_map();
        return this.map((card) => callback(counts[card.name], card));
      }
      count_map() {
        const counts = {};
        this.forEach((card) => {
          counts[card.name] ??= 0;
          counts[card.name] += card.quantity;
        });
        return counts;
      }
    };
  }
});

// ui/skeleton.ts
function skeleton(name) {
  return SVG.svg({
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 25 35"
  }, [
    SVG.rect({ x: 0, y: 0, width: 25, height: 35, fill: "#000000" }),
    SVG.rect({ x: 2, y: 2, width: 21, height: 31, fill: "#1f1f1f" }),
    SVG.g({ fill: "#3f3f3f", stroke: "#000000", stroke_width: 1 }, [
      SVG.rect({ x: 0.5, y: 0.5, width: 24, height: 3, rx: 1.5 }),
      SVG.rect({ x: 0.5, y: 19.5, width: 24, height: 3, rx: 1.5 }),
      SVG.rect({ x: 18.5, y: 31.5, width: 6, height: 3, rx: 1.5 })
    ]),
    name && SVG.text({ x: 2, y: 2.5, font_size: 1.5, font_family: "monospace", fill: "#ffffff" }, name.length > 24 ? name.slice(0, 21) + "..." : name)
  ]);
}
function skeleton_back() {
  return SVG.svg({
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 25 35"
  }, [
    SVG.rect({ x: 0, y: 0, width: 25, height: 35, fill: "#000000" }),
    SVG.rect({ x: 2, y: 2, width: 21, height: 31, fill: "#0000001f" })
  ]);
}
function data_url(svg) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.outerHTML).replaceAll(/[()"']/g, (s) => "%" + s.charCodeAt(0).toString(16))}`;
}
var init_skeleton = __esm({
  "ui/skeleton.ts"() {
    init_xml();
  }
});

// ui/card-view.ts
var CardView;
var init_card_view = __esm({
  "ui/card-view.ts"() {
    init_xml();
    init_skeleton();
    CardView = class _CardView {
      static renderings = /* @__PURE__ */ new WeakMap();
      static render(card, face_id = card.display_face_id, id = null, is_duplicate = false, last_in_stack = true, on_click = null) {
        const card_class = /* @__PURE__ */ new Set(["card"]);
        if (is_duplicate) card_class.add("duplicate");
        if (card.quantity < 1) card_class.add("ghost");
        const faces = [];
        switch (card.layout()) {
          case "transform":
          case "modal_dfc":
          case "double_faced_token":
          case "reversible_card":
          case "art_series":
            card_class.add("transform");
            if (face_id === 1) card_class.add("invert");
            break;
          case "split":
            if (card.has_keyword("Aftermath")) {
              card_class.add("aftermath");
              if (face_id === 1) card_class.add("invert");
            } else {
              card_class.add("landscape");
            }
            break;
          case "flip":
            card_class.add("flip");
            if (face_id === 1) card_class.add("invert");
            break;
          case "meld":
            const parts = card.card.all_parts;
            const my_part = parts.find((part) => part.name === card.card.name);
            if (my_part?.component === "meld_result") {
              card_class.add("double");
            }
            break;
          case "scheme":
          case "vanguard":
            card_class.add("double");
            break;
          case "planar":
            card_class.add("double");
            card_class.add("landscape");
            break;
        }
        if (card.is_type("Battle")) {
          card_class.add("landscape-front");
        }
        let faces_style = {};
        switch (card.card?.id) {
          // Hawkins National Laboratory // The Upside Down
          case "83a86763-c3fe-4cff-8b65-22cb329d112c":
            faces_style["--transform-initial"] = "rotateX(0deg)";
            faces_style["--transform-final"] = "rotateX(180deg)";
            break;
        }
        switch (card.card?.oracle_id) {
          // Topsy Turvy
          case "4516f30c-fb21-4371-818f-7dd211612a72":
            card_class.add("flip");
            card_class.add("invert");
            break;
          // Burning Cinder Fury of Crimson Chaos Fire
          case "9716976e-1b52-4351-932e-b99fe206afbd":
            card_class.add("landscape");
            break;
          // Who // What // When // Where // Why
          case "adfe1b07-dd82-4c39-a7a6-ded0b1c39761":
            card_class.delete("landscape");
            card_class.add("landscape-front");
            if ([2, 3, 4].includes(face_id)) card_class.add("invert");
            faces_style["transform-origin"] = "calc(var(--card-width) / 2) 50%";
            faces_style["--transform-initial"] = "rotateZ(90deg)";
            faces_style["--transform-final"] = "rotateZ(0deg)";
            break;
        }
        if (card.card?.oversized) {
          card_class.add("double");
        }
        [0, 1].forEach((face_id2) => {
          if (face_id2 > 0 && !(card.is_double_faced() || card.has_alternative_back())) {
            return;
          }
          const urls = [];
          if (face_id2 === 0 || card.is_double_faced()) {
            const face = card.faces()[face_id2];
            urls.push(...face.image_urls());
            let name = card.is_double_faced() && face.card_name(true) || card.card_name(true);
            if (card.set && card.collector_number) {
              name ||= `[${card.set.toUpperCase()}:${card.collector_number}]`;
            }
            urls.push(data_url(skeleton(name)));
          } else if (card.has_alternative_back()) {
            const back_url = card.back_image_url();
            if (back_url) {
              card_class.add("transform");
              urls.push(card.back_image_url());
              urls.push(data_url(skeleton_back()));
            }
          }
          faces.push(HTML.div({
            id: `${id}-face-${faces.length}`,
            class: [
              "card-face",
              ["front", "back"][face_id2],
              !card.finish.is_default() && card.finish.name.toLowerCase()
            ],
            style: {
              background_image: urls.map((url) => `url(${url})`).join(", ")
            }
          }));
        });
        let tilt = null;
        const elements = _CardView.renderings.get(card) ?? [];
        const card_view = HTML.div(
          {
            id,
            class: [...card_class],
            onpointermove: (_, { x, y }) => {
              const { top, left, width, height } = card_view.getBoundingClientRect();
              const effective_height = last_in_stack ? height : card_view.children[0].getBoundingClientRect().height;
              const dx = x - (left + 24) - width / 2;
              const dy = y - top - effective_height / 2;
              const angle = Math.atan2(dy, dx);
              const azimuth = -10 * Math.min(Math.hypot(dx, dy) / 100, 1);
              tilt.style.setProperty("--tilt-angle", `${angle}rad`);
              tilt.style.setProperty("--tilt-azimuth", `${azimuth}deg`);
            },
            onpointerenter: () => {
              _CardView.renderings.get(card)?.forEach((element) => element.classList.add("focus"));
            },
            onpointerleave: () => {
              _CardView.renderings.get(card)?.forEach((element) => element.classList.remove("focus"));
              tilt.style.setProperty("--tilt-angle", `0`);
              tilt.style.setProperty("--tilt-azimuth", `0`);
            },
            onclick: on_click
          },
          // HTML.div({class: 'backdrop'}),
          HTML.div({ class: "trigger" }),
          HTML.div(
            {
              id: id && `${id}-shift`,
              class: "card-shift"
            },
            !is_duplicate && HTML.div({ class: "count" }, `${card.quantity}\xD7`),
            tilt = HTML.div(
              {
                id: id && `${id}-tilt`,
                class: "card-tilt"
              },
              HTML.div({
                id: id && `${id}-faces`,
                class: "card-faces",
                style: faces_style
              }, faces)
            )
          )
        );
        elements.push(card_view);
        _CardView.renderings.set(card, elements);
        return card_view;
      }
    };
  }
});

// card-classifier/face-selector.ts
var FaceSelector;
var init_face_selector = __esm({
  "card-classifier/face-selector.ts"() {
    FaceSelector = class _FaceSelector {
      constructor(name, get) {
        this.name = name;
        this.get = get;
      }
      name;
      get;
      static front = new _FaceSelector("Front", (card) => [card?.main_face()]);
      static display = new _FaceSelector("Display", (card) => [card?.main_face(true)]);
      static any = new _FaceSelector("Any Faces", (card) => card?.all_faces() ?? []);
      static all() {
        return Object.fromEntries(
          Object.entries(this).filter(([_, value]) => value instanceof this)
        );
      }
    };
  }
});

// card-classifier/group.ts
var Group;
var init_group = __esm({
  "card-classifier/group.ts"() {
    Group = class {
      name;
      value;
      icon;
      color;
      cards;
      groups;
      constructor(group) {
        Object.assign(this, group);
      }
      count() {
        let count = this.cards?.count() ?? 0;
        this.groups?.forEach((group) => count += group.count());
        return count;
      }
    };
  }
});

// card-classifier/card-classifier.ts
var CardClassifier;
var init_card_classifier = __esm({
  "card-classifier/card-classifier.ts"() {
    init_value();
    init_card_list();
    init_deck_view();
    init_face_selector();
    init_group();
    CardClassifier = class _CardClassifier {
      constructor(cards) {
        this.cards = cards;
      }
      cards;
      static STRING_COMPARATOR = new Intl.Collator("en", { numeric: true });
      static name = "None";
      static ungrouped_name = "Unknown";
      split_by_face = false;
      groups() {
        return [
          new Group({ cards: this.cards.copy() })
        ];
      }
      match_face(face, value) {
        return true;
      }
      face_id(card, value) {
        if (this.split_by_face && DeckView.FACE_SELECTOR === FaceSelector.front) {
          return 0;
        } else if (this.match_face(card.main_face(true), value)) {
          return card.display_face_id;
        } else {
          const face_id = card.faces().findIndex((face) => this.match_face(face, value));
          return face_id >= 0 ? face_id : 0;
        }
      }
      group_by_face(get, group, groups) {
        return this.group_by(
          (card) => DeckView.FACE_SELECTOR.get(card).flatMap(get),
          group,
          groups
        );
      }
      group_by(get, group = (value) => new Group({ name: String(value), value }), groups = {}) {
        this.cards.map((card) => {
          let values = get(card);
          if (!Array.isArray(values)) values = [values];
          [...new Set(values)].forEach((value) => {
            if (is_nullish(value)) return;
            const g = group(value, card);
            if (g) {
              groups[value] ??= new Group(g);
              groups[value].cards ??= new CardList();
              groups[value].cards.push(card);
            }
          });
        });
        return Object.values(groups).filter(Boolean).sort((g1, g2) => {
          const a = g1.cards?.[0];
          const b = g2.cards?.[0];
          return a && b ? this.compare(a, b) : 0;
        });
      }
      compare(a, b) {
        return 0;
      }
      compare_card_number(a, b, get) {
        const value_a = get(DeckView.FACE_SELECTOR.get(a)[0], a);
        const value_b = get(DeckView.FACE_SELECTOR.get(b)[0], b);
        return this.nulls_last(value_a, value_b) || value_a - value_b;
      }
      compare_card_string(a, b, get) {
        const value_a = get(DeckView.FACE_SELECTOR.get(a)[0], a);
        const value_b = get(DeckView.FACE_SELECTOR.get(b)[0], b);
        return this.nulls_last(value_a, value_b) || this.compare_string(value_a, value_b);
      }
      compare_card_index(a, b, get, ordering) {
        const value_a = get(DeckView.FACE_SELECTOR.get(a)[0], a);
        const value_b = get(DeckView.FACE_SELECTOR.get(b)[0], b);
        return this.compare_index(value_a, value_b, ordering);
      }
      compare_string(a, b) {
        return _CardClassifier.STRING_COMPARATOR.compare(a, b);
      }
      compare_index(a, b, ordering) {
        let index_a = ordering.indexOf(a);
        if (index_a < 0) index_a = Infinity;
        let index_b = ordering.indexOf(b);
        if (index_b < 0) index_b = Infinity;
        return index_a - index_b || 0;
      }
      lands_first(a, b) {
        const land_a = DeckView.FACE_SELECTOR.get(a)[0]?.is_type("Land") ? 1 : 0;
        const land_b = DeckView.FACE_SELECTOR.get(b)[0]?.is_type("Land") ? 1 : 0;
        return land_b - land_a;
      }
      nulls_first(a, b) {
        return this.nulls_last(b, a);
      }
      nulls_last(a, b) {
        const null_a = is_nullish(a) ? 1 : 0;
        const null_b = is_nullish(b) ? 1 : 0;
        return null_a - null_b;
      }
    };
  }
});

// ui/modal/modal.ts
function show_modal(modal) {
  hide_all_modals();
  modal.classList.add("show");
  modal.addEventListener("click", (event) => event.stopPropagation());
}
function hide_all_modals() {
  for (const child of MODALS.children) {
    hide_modal(child);
  }
}
function hide_modal(modal) {
  modal.classList.remove("show");
}
var MODALS;
var init_modal = __esm({
  "ui/modal/modal.ts"() {
    init_xml();
    MODALS = HTML.div({
      id: "modals",
      onclick: () => hide_all_modals()
    });
  }
});

// ui/modal/card-edit-modal.ts
function edit_card_modal(card) {
  show_modal(HTML.div({
    id: "card-edit-modal"
  }, [
    HTML.div({ class: "row" }, [
      quantity_input(card),
      ...card.card ? [
        card.name,
        HTML.span({ class: "light" }, card.to_string(" (SET:000)? *EN*?"))
      ] : [name_input(card)]
    ]),
    !card.card && HTML.div([
      set_input(card),
      collector_number_input(card),
      language_input(card)
    ]),
    HTML.div([])
  ]));
}
var quantity_input, name_input, set_input, collector_number_input, language_input;
var init_card_edit_modal = __esm({
  "ui/modal/card-edit-modal.ts"() {
    init_xml();
    init_modal();
    init_language();
    init_deck_view();
    init_value();
    init_api();
    quantity_input = (card) => HTML.input({
      id: "quantity-input",
      type: "number",
      min: 0,
      value: card.quantity,
      style: { width: "5ch" },
      onchange: ({ value }) => {
        card.quantity = Number.parseInt(value);
        if (is_nullish(card.quantity)) card.quantity = 1;
        DeckView.render();
      }
    });
    name_input = (card) => HTML.input({
      id: "name-input",
      type: "text",
      value: card.name,
      placeholder: "Card Name",
      style: { width: "30ch" },
      onchange: ({ value }) => {
        card.name = value;
        DeckView.render();
      }
    });
    set_input = (card) => HTML.input({
      id: "set-input",
      type: "text",
      value: card.set?.toUpperCase(),
      placeholder: "Set",
      style: { width: "5ch" },
      onchange: (element) => {
        element.value = element.value.toUpperCase() || null;
        card.set = API.SETS.normalise(element.value);
        DeckView.render();
      }
    });
    collector_number_input = (card) => HTML.input({
      id: "collector-number-input",
      type: "text",
      value: card.collector_number,
      placeholder: "Number",
      style: { width: "6ch" },
      onchange: ({ value }) => {
        card.collector_number = value;
        DeckView.render();
      }
    });
    language_input = (card) => HTML.select({
      id: "language-input",
      value: card.language.code(),
      placeholder: "Language",
      onchange: ({ value }) => {
        card.language = Language.match(value);
        DeckView.render();
      },
      ontimeout: (element) => {
        element.value = card.language.code();
      }
    }, Language.all().map((language) => HTML.option({ value: language.code() }, language.name)));
  }
});

// ui/deck-view.ts
var DeckView;
var init_deck_view = __esm({
  "ui/deck-view.ts"() {
    init_xml();
    init_board();
    init_deck();
    init_card_view();
    init_card_classifier();
    init_face_selector();
    init_group();
    init_card_edit_modal();
    DeckView = class {
      static BY_BOARD = true;
      static GROUPING = CardClassifier;
      static ORDERING = CardClassifier;
      static FACE_SELECTOR = FaceSelector.front;
      static DECK_ELEMENT = HTML.div({ id: "deck" });
      static render(deck = Deck.current) {
        CardView.renderings = /* @__PURE__ */ new WeakMap();
        const show_boards = this.BY_BOARD && deck.some((card) => !card.board.is_default());
        return HTML.div(
          { id: "deck-cards", class: "groups" },
          show_boards ? Board.all().map((board) => this.render_board(deck.board(board), board)) : [this.render_board(deck.copy())]
        );
      }
      static render_board(cards, board) {
        const grouping = new this.GROUPING(cards);
        if (cards.length === 0) return null;
        const id = `board-${board ?? "all"}`;
        return HTML.div(
          {
            id,
            class: "group"
          },
          board && HTML.div({
            id: `${id}-label`,
            class: "label"
          }, HTML.div(
            HTML.span({ style: { font_weight: "bold" } }, board.name),
            ` (${cards.count()})`
          )),
          HTML.div(
            {
              id: `${id}-groups`,
              class: "groups"
            },
            ...grouping.groups().map((group, j) => this.render_group(group, `${id}-group-${j}`, grouping)),
            this.render_group(new Group({
              name: this.GROUPING.ungrouped_name,
              cards: cards.filter((card) => !CardView.renderings.has(card))
            }), `${id}-ungrouped`)
          )
        );
      }
      static render_group(group, id = 0, grouping) {
        if (!group) return null;
        const { cards, groups } = group;
        if (!cards?.length && !groups?.length) return null;
        const ordering = new this.ORDERING();
        return HTML.div(
          {
            id,
            class: "group"
          },
          group.name && HTML.div(
            {
              id: `${id}-label`,
              class: "label",
              style: {
                "--gradient": group.color && `linear-gradient(to right in oklab, ${group.color.map((c, i, { length }) => `${c} ${{ 0: "4px", [length - 1]: "calc(100% - 4px)" }[i] ?? ""}`).join(",")})`
              },
              ontimeout: (element) => {
                const top = element.getBoundingClientRect().top;
                const { offsetTop, scrollTop } = this.DECK_ELEMENT;
                element.style.top = `${top + scrollTop - offsetTop}px`;
              }
            },
            HTML.div(
              group.icon && HTML.img({ class: "icon", src: group.icon }),
              HTML.span({ style: { font_weight: "bold" } }, group.name),
              ` (${group.count()})`
            )
          ),
          groups && HTML.div(
            {
              id: `${id}-groups`,
              class: "groups"
            },
            groups.map((group2, i) => this.render_group(group2, `${id}-${i}`, grouping)) ?? []
          ),
          cards && HTML.div(
            {
              id: `${id}-stack`,
              class: "stack"
            },
            cards.sort((a, b) => ordering.compare(a, b)).flatMap((card, i, cards2) => {
              const last_deck_card = i === cards2.length - 1;
              const elements = [];
              const quantity = Math.max(1, card.quantity);
              for (let j = 0; j < quantity; j++) {
                const last_of_card = j === quantity - 1;
                elements.push(CardView.render(
                  card,
                  grouping?.face_id(card, group.value),
                  `${id}-card-${card.id}-${quantity - 1 - j}`,
                  !last_of_card,
                  last_deck_card && last_of_card,
                  () => edit_card_modal(card)
                ));
              }
              return elements;
            })
          )
        );
      }
      static set_background(card) {
        const url = card.main_face().face?.image_uris.art;
        if (url) {
          HTML.div({
            id: "background",
            style: {
              "--card-image-url": `url(${url})`
            }
          });
          return true;
        }
        return false;
      }
    };
  }
});

// deck.ts
var deck_exports = {};
__export(deck_exports, {
  Deck: () => Deck
});
var Deck;
var init_deck = __esm({
  "deck.ts"() {
    init_deck_card();
    init_api();
    init_color_set();
    init_board();
    init_card_list();
    init_tag();
    init_deck_view();
    Deck = class _Deck extends CardList {
      static current = new _Deck();
      raw;
      format = null;
      game = null;
      static parse(input) {
        const deck = new _Deck();
        deck.raw = input;
        let group_board = Board.DEFAULT;
        let group_tag = null;
        input.split("\n").forEach((line) => {
          if (/^\s*$/.test(line)) {
            group_board = Board.DEFAULT;
            group_tag = null;
            return;
          }
          const header_match = line.match(/^\s*(?<tag>\/\/|#)?\s*(?<header>\w.*?):?(\s*\(\d+\):?)?\s*$/i);
          if (header_match) {
            const { tag, header } = header_match.groups;
            const board = Board.match(header, !tag);
            if (board) {
              group_board = board;
              return;
            }
            if (tag || /^about$/i.test(header)) {
              group_tag = Tag.match_or_new(header);
              return;
            }
          }
          const card = DeckCard.parse(line, deck, group_board);
          if (card) {
            if (group_tag) {
              card.tags.add(group_tag);
            }
          } else {
            console.error(`Failed to parse line "${line}"`);
          }
        });
        return deck;
      }
      static async load_current(input) {
        Tag.clear();
        _Deck.current = _Deck.parse(input);
        DeckView.render();
        await _Deck.current.load(() => DeckView.render());
        for (let i = 0; i < _Deck.current.length; i++) {
          if (DeckView.set_background(_Deck.current[i])) break;
        }
        return _Deck.current;
      }
      async load(on_progress = null) {
        this.forEach((card) => card.load_from_cache());
        on_progress?.();
        const card_map = {};
        this.forEach((card) => {
          if (card.can_bulk_load()) {
            const id = JSON.stringify(card.identifier());
            card_map[id] ??= [];
            card_map[id].push(card);
          }
        });
        const unique_cards = Object.values(card_map);
        for (let i = 0; i < unique_cards.length; i += API.CARDS_MAX) {
          const chunk = unique_cards.slice(i, i + API.CARDS_MAX);
          if (chunk.length < 2) break;
          const card_list = await API.cards(chunk.map((c) => c[0].identifier()));
          if (!card_list) break;
          let index = 0;
          for (const cards of chunk) {
            const i1 = cards[0].identifier();
            if (!card_list.not_found.some(
              (i2) => Object.keys(i1).length === Object.keys(i2).length && Object.keys(i1).every((key) => i1[key] === i2[key])
            )) {
              cards.forEach((card) => card.hydrate(card_list.data[index]).cache());
              index++;
            }
          }
          on_progress?.();
        }
        await Promise.all(this.map(async (card) => {
          await card.load();
          on_progress?.();
        }));
        return this;
      }
      board(...boards) {
        return this.filter((card) => card.on_board(...boards));
      }
      color_identity() {
        const commanders = this.board(Board.commander).skip_empty();
        if (commanders.count() === 0) return null;
        let color_identity = ColorSet.colors.c;
        commanders.forEach((card) => color_identity = color_identity.plus(card.color_identity()));
        return color_identity;
      }
      to_string(card_format) {
        return Board.all().filter((board) => this.board(board).length > 0).map((board) => `# ${board.name}
` + this.board(board).map((card) => card.to_string(card_format)).join("\n") + "\n").join("\n");
      }
      toString() {
        return this.to_string();
      }
    };
  }
});

// ui/deck/deck-upload.ts
function initialise_deck_upload() {
  HTML.button({
    id: "deck-upload-button",
    onclick: () => file_input.click()
  });
  const file_input = HTML.input({
    id: "deck-file-input",
    oninput: () => {
      const file = file_input.files[0];
      file.text().then((input) => Deck.load_current(input)).then((deck) => {
        DeckCard.CACHE.dump();
        console.log(deck.to_string());
      });
    }
  });
}
var init_deck_upload = __esm({
  "ui/deck/deck-upload.ts"() {
    init_xml();
    init_deck();
    init_deck_card();
  }
});

// card-classifier/type.ts
var Type;
var init_type = __esm({
  "card-classifier/type.ts"() {
    init_card_classifier();
    init_group();
    Type = class _Type extends CardClassifier {
      static name = "Type";
      static CARD_TYPE_ORDER = [
        "Vanguard",
        "Hero",
        "Conspiracy",
        "Creature",
        "Planeswalker",
        "Artifact",
        "Enchantment",
        "Battle",
        "Instant",
        "Sorcery",
        "Land",
        "Kindred",
        "Stickers",
        "Plane",
        "Phenomenon",
        "Scheme",
        "Boss",
        "Event",
        "Token",
        "Emblem",
        "Dungeon",
        "Card"
      ];
      static TYPE_GROUPS = {
        "Land": { icon: "public/icon/land.svg" },
        "Artifact": { icon: "public/icon/artifact.svg" },
        "Enchantment": { icon: "public/icon/enchantment.svg" },
        "Creature": { icon: "public/icon/creature.svg" },
        "Battle": { icon: "public/icon/battle.svg" },
        "Planeswalker": { icon: "public/icon/planeswalker.svg" },
        "Instant": { icon: "public/icon/instant.svg" },
        "Sorcery": { icon: "public/icon/sorcery.svg" }
      };
      split_by_face = true;
      groups() {
        return this.group_by_face(
          (face) => face.card_types(),
          void 0,
          Object.fromEntries(_Type.CARD_TYPE_ORDER.map((type) => [
            type,
            new Group({
              name: type,
              value: type,
              ..._Type.TYPE_GROUPS[type] ?? {}
            })
          ]))
        );
      }
      match_face(face, type) {
        return face.is_card_type(type);
      }
    };
  }
});

// color.ts
var MTG_COLORS;
var init_color = __esm({
  "color.ts"() {
    MTG_COLORS = {
      blue: "#009fff",
      red: "#ff2f00",
      green: "#2fdf00",
      yellow: "#ffdf3f",
      silver: "#9fbfdf",
      purple: "#7f00bf",
      orange: "#ff9f00"
    };
    MTG_COLORS["W"] = MTG_COLORS.yellow;
    MTG_COLORS["U"] = MTG_COLORS.blue;
    MTG_COLORS["B"] = MTG_COLORS.purple;
    MTG_COLORS["R"] = MTG_COLORS.red;
    MTG_COLORS["G"] = MTG_COLORS.green;
  }
});

// card-classifier/color-names.ts
function color_group(colors) {
  const code = colors.code();
  let base_group = BASE[code] ?? {};
  let named_group = {
    ...COLORLESS.name,
    ...MONO.name,
    ...ALLY.ravnica_guild,
    ...ENEMY.ravnica_guild,
    ...SHARD.alara_shard,
    ...WEDGE.tarkir_clan,
    ...FOUR_COLOR.theme,
    ...FIVE_COLOR.rainbow
  }[code] ?? {};
  return {
    ...base_group,
    name: colors.colors.join("") || "C",
    color: gradient(colors),
    ...named_group
  };
}
function gradient(colors) {
  if (colors.size === 0) {
    return [MTG_COLORS.silver];
  } else {
    return colors.colors.map((c) => MTG_COLORS[c]);
  }
}
var BASE, COLORLESS, MONO, ALLY, ENEMY, SHARD, WEDGE, FOUR_COLOR, FIVE_COLOR;
var init_color_names = __esm({
  "card-classifier/color-names.ts"() {
    init_color();
    BASE = {
      c: { icon: "public/icon/colorless.svg" },
      w: { icon: "public/icon/white.svg" },
      u: { icon: "public/icon/blue.svg" },
      b: { icon: "public/icon/black.svg" },
      r: { icon: "public/icon/red.svg" },
      g: { icon: "public/icon/green.svg" }
    };
    COLORLESS = {
      name: {
        c: { name: "Colorless" }
      }
    };
    MONO = {
      name: {
        w: { name: "White" },
        u: { name: "Blue" },
        b: { name: "Black" },
        r: { name: "Red" },
        g: { name: "Green" }
      }
    };
    ALLY = {
      ravnica_guild: {
        uw: { name: "Azorius", icon: "public/icon/azorius.svg" },
        bu: { name: "Dimir", icon: "public/icon/dimir.svg" },
        br: { name: "Rakdos", icon: "public/icon/rakdos.svg" },
        gr: { name: "Gruul", icon: "public/icon/gruul.svg" },
        gw: { name: "Selesnya", icon: "public/icon/selesnya.svg" }
      },
      hexhaven_college: {
        uw: { name: "Fatehold" },
        bu: { name: "Theorix" },
        br: { name: "Stingerquill" },
        gr: { name: "Konstrari" },
        gw: { name: "Vigorbloom" }
      }
    };
    ENEMY = {
      ravnica_guild: {
        bw: { name: "Orzhov", icon: "public/icon/orzhov.svg" },
        ru: { name: "Izzet", icon: "public/icon/izzet.svg" },
        bg: { name: "Golgari", icon: "public/icon/golgari.svg" },
        rw: { name: "Boros", icon: "public/icon/boros.svg" },
        gu: { name: "Simic", icon: "public/icon/simic.svg" }
      },
      strixhaven_college: {
        bw: { name: "Silverquill", icon: "public/icon/silverquill.svg" },
        ru: { name: "Prismari", icon: "public/icon/prismari.svg" },
        bg: { name: "Witherbloom", icon: "public/icon/witherbloom.svg" },
        rw: { name: "Lorehold", icon: "public/icon/lorehold.svg" },
        gu: { name: "Quandrix", icon: "public/icon/quandrix.svg" }
      }
    };
    SHARD = {
      alara_shard: {
        buw: { name: "Esper" },
        bru: { name: "Grixis" },
        bgr: { name: "Jund" },
        grw: { name: "Naya" },
        guw: { name: "Bant" }
      },
      new_capenna_crime_family: {
        buw: { name: "Obscura", icon: "public/icon/obscura.svg" },
        bru: { name: "Maestros", icon: "public/icon/maestros.svg" },
        bgr: { name: "Riveteers", icon: "public/icon/riveteers.svg" },
        grw: { name: "Cabaretti", icon: "public/icon/cabaretti.svg" },
        guw: { name: "Brokers", icon: "public/icon/brokers.svg" }
      }
    };
    WEDGE = {
      tarkir_clan: {
        bgw: { name: "Abzan", icon: "public/icon/abzan.svg" },
        ruw: { name: "Jeskai", icon: "public/icon/jeskai.svg" },
        bgu: { name: "Sultai", icon: "public/icon/sultai.svg" },
        brw: { name: "Mardu", icon: "public/icon/mardu.svg" },
        gru: { name: "Temur", icon: "public/icon/temur.svg" }
      },
      apocalypse: {
        bgw: { name: "Necra" },
        ruw: { name: "Raka" },
        bgu: { name: "Ana" },
        brw: { name: "Dega" },
        gru: { name: "Ceta" }
      }
    };
    FOUR_COLOR = {
      theme: {
        bruw: { name: "Artifice" },
        bgru: { name: "Aggression" },
        bgrw: { name: "Chaos" },
        gruw: { name: "Altruism" },
        bguw: { name: "Growth" }
      },
      nephilim: {
        bruw: { name: "Yore-Tiller" },
        bgru: { name: "Glint-Eye" },
        bgrw: { name: "Dune-Brood" },
        gruw: { name: "Ink-Treader" },
        bguw: { name: "Witch-Maw" }
      }
    };
    FIVE_COLOR = {
      rainbow: {
        bgruw: { name: "Rainbow" }
      }
    };
  }
});

// card-classifier/color.ts
var Color3;
var init_color2 = __esm({
  "card-classifier/color.ts"() {
    init_color_set();
    init_card_classifier();
    init_type();
    init_group();
    init_color_names();
    Color3 = class extends CardClassifier {
      static name = "Color";
      split_by_face = true;
      groups() {
        return this.group_by_face(
          (face) => face.is_type("Land") ? 0 : ColorSet.index(face.colors()) + 1,
          void 0,
          [
            new Group({
              name: "Land",
              value: 0,
              ...Type.TYPE_GROUPS["Land"]
            }),
            ...Object.entries(ColorSet.colors).map(([code, colors], index) => new Group({
              ...color_group(colors),
              value: index + 1
            }))
          ]
        );
      }
      compare(a, b) {
        return this.lands_first(a, b) || this.compare_card_number(a, b, (face) => ColorSet.index(face.colors()));
      }
    };
  }
});

// card-classifier/color-identity.ts
var ColorIdentity;
var init_color_identity = __esm({
  "card-classifier/color-identity.ts"() {
    init_color_set();
    init_card_classifier();
    init_group();
    init_color_names();
    ColorIdentity = class extends CardClassifier {
      static name = "Color Identity";
      groups() {
        return this.group_by(
          (card) => ColorSet.index(card.color_identity()),
          void 0,
          Object.entries(ColorSet.colors).map(([code, colors], index) => new Group({
            ...color_group(colors),
            value: index
          }))
        );
      }
      compare(a, b) {
        return this.compare_card_number(a, b, (card) => ColorSet.index(card.color_identity()));
      }
    };
  }
});

// card-classifier/mana-value.ts
var ManaValue;
var init_mana_value = __esm({
  "card-classifier/mana-value.ts"() {
    init_card_classifier();
    init_text();
    init_type();
    ManaValue = class extends CardClassifier {
      static name = "Mana Value";
      static ungrouped_name = "No Mana Cost";
      split_by_face = true;
      groups() {
        return this.group_by_face(
          (face) => face.is_type("Land") ? -1 : face.mana_value(),
          (mv) => mv < 0 ? {
            name: "Land",
            value: mv,
            ...Type.TYPE_GROUPS["Land"]
          } : {
            name: `${fraction(mv)}-drop`,
            value: mv
          }
        );
      }
      compare(a, b) {
        return this.lands_first(a, b) || this.compare_card_number(a, b, (face) => face.mana_value());
      }
    };
  }
});

// card-classifier/set-classifier.ts
var SetClassifier;
var init_set_classifier = __esm({
  "card-classifier/set-classifier.ts"() {
    init_card_classifier();
    init_api();
    init_group();
    SetClassifier = class extends CardClassifier {
      static name = "Set";
      static ungrouped_name = "Unspecified";
      group_map = {};
      add_set(top_groups, set_code) {
        const set = API.SETS.get(set_code);
        if (!set) return null;
        if (set.code in this.group_map) {
          return this.group_map[set.code];
        }
        const cards = this.cards.filter((card) => card.set_code() === set.code);
        const group = new Group({
          name: set.name,
          value: set.code,
          icon: set.icon_svg_uri,
          groups: [
            new Group({ cards })
          ]
        });
        this.group_map[set.code] = group;
        const parent = this.add_set(top_groups, set.parent_set_code);
        if (parent) {
          parent.groups.push(group);
          parent.groups.sort((a, b) => this.nulls_first(a.value, b.value) || this.compare_string(a.value, b.value));
        } else {
          top_groups.push(group);
        }
        return group;
      }
      groups() {
        const groups = [];
        this.cards.forEach((card) => {
          let set_code = card.set_code();
          this.add_set(groups, set_code);
        });
        return groups.sort((a, b) => this.compare_string(a.value, b.value));
      }
      compare(a, b) {
        return this.compare_card_string(
          a,
          b,
          (face) => face.card?.set ? [
            face.card.set,
            face.card.collector_number
          ].join("-") : null
        );
      }
    };
  }
});

// card-classifier/rarity.ts
var RARITIES, Rarity;
var init_rarity = __esm({
  "card-classifier/rarity.ts"() {
    init_color();
    init_card_classifier();
    init_group();
    RARITIES = {
      common: { name: "Common" },
      uncommon: { name: "Uncommon", color: [MTG_COLORS.silver] },
      rare: { name: "Rare", color: [MTG_COLORS.yellow] },
      mythic: { name: "Mythic Rare", color: [MTG_COLORS.red] },
      special: { name: "Special", color: [MTG_COLORS.purple] },
      bonus: { name: "Bonus", color: [MTG_COLORS.orange] }
    };
    Rarity = class extends CardClassifier {
      static name = "Rarity";
      groups() {
        return this.group_by(
          (card) => card.card?.rarity,
          void 0,
          Object.fromEntries(Object.entries(RARITIES).map(([key, group]) => [key, new Group({ value: key, ...group })]))
        );
      }
      compare(a, b) {
        return this.compare_card_index(a, b, (card) => card.card?.rarity, Object.keys(RARITIES));
      }
    };
  }
});

// card-classifier/tag.ts
var Tag2;
var init_tag2 = __esm({
  "card-classifier/tag.ts"() {
    init_tag();
    init_card_classifier();
    Tag2 = class extends CardClassifier {
      static name = "Tag";
      static ungrouped_name = "Untagged";
      groups() {
        return this.group_by(
          (card) => [...card.tags].map((tag) => tag.name),
          (tag_name) => {
            const tag = Tag.match(tag_name);
            return tag ? {
              name: tag.name,
              value: tag.name,
              color: tag.hex ? [tag.hex] : null
            } : null;
          }
        );
      }
    };
  }
});

// card-classifier/name.ts
var Name;
var init_name = __esm({
  "card-classifier/name.ts"() {
    init_card_classifier();
    Name = class extends CardClassifier {
      static name = "Name";
      compare(a, b) {
        return this.compare_card_string(a, b, (_, card) => card.main_face(true).card_name(true));
      }
    };
  }
});

// card-classifier/price.ts
var PriceUSD, PriceEUR, PriceTIX;
var init_price = __esm({
  "card-classifier/price.ts"() {
    init_card_classifier();
    PriceUSD = class extends CardClassifier {
      static name = "Price - USD";
      compare(a, b) {
        return this.compare_card_number(a, b, (card) => Number.parseFloat(card.card?.prices?.usd));
      }
    };
    PriceEUR = class extends CardClassifier {
      static name = "Price - EUR";
      compare(a, b) {
        return this.compare_card_number(a, b, (card) => Number.parseFloat(card.card?.prices?.eur));
      }
    };
    PriceTIX = class extends CardClassifier {
      static name = "Price - TIX";
      compare(a, b) {
        return this.compare_card_number(a, b, (card) => Number.parseFloat(card.card?.prices?.tix));
      }
    };
  }
});

// card-classifier/rank.ts
var RankEDHREC, RankPenny;
var init_rank = __esm({
  "card-classifier/rank.ts"() {
    init_card_classifier();
    RankEDHREC = class extends CardClassifier {
      static name = "Rank - EDHREC";
      compare(a, b) {
        return this.compare_card_number(a, b, (card) => card.card?.edhrec_rank);
      }
    };
    RankPenny = class extends CardClassifier {
      static name = "Rank - Penny Dreadful";
      compare(a, b) {
        return this.compare_card_number(a, b, (card) => card.card?.penny_rank);
      }
    };
  }
});

// card-classifier/subtype.ts
var Subtype;
var init_subtype = __esm({
  "card-classifier/subtype.ts"() {
    init_catalog();
    init_card_classifier();
    init_type();
    init_color();
    init_deck_view();
    init_group();
    Subtype = class _Subtype extends CardClassifier {
      static name = "Subtype";
      static SUBTYPE_ORDER = [
        "Plains",
        "Island",
        "Swamp",
        "Mountain",
        "Forest"
      ];
      static SUBTYPE_GROUPS = {
        "Plains": { icon: "public/icon/white.svg", color: [MTG_COLORS.yellow] },
        "Island": { icon: "public/icon/blue.svg", color: [MTG_COLORS.blue] },
        "Swamp": { icon: "public/icon/black.svg", color: [MTG_COLORS.purple] },
        "Mountain": { icon: "public/icon/red.svg", color: [MTG_COLORS.red] },
        "Forest": { icon: "public/icon/green.svg", color: [MTG_COLORS.green] }
      };
      static {
        Catalog.load();
      }
      split_by_face = true;
      groups() {
        return Type.CARD_TYPE_ORDER.map((type) => {
          const catalog = Catalog.subtypes[type];
          const cards = this.cards.filter((card) => DeckView.FACE_SELECTOR.get(card).some((face) => face.is_card_type(type)));
          if (cards.length === 0) return null;
          return new Group({
            name: type,
            value: type,
            groups: [
              ...catalog?.all().map((subtype) => new Group({
                name: subtype,
                value: `${type} - ${subtype}`,
                cards: cards.filter((card) => DeckView.FACE_SELECTOR.get(card).some((face) => face.is_specified_type(subtype))),
                ..._Subtype.SUBTYPE_GROUPS[subtype] ?? {}
              })).sort((a, b) => this.compare_index(a.name, b.name, _Subtype.SUBTYPE_ORDER)) ?? [],
              new Group({
                name: `All ${type} types`,
                value: `${type} - *`,
                cards: cards.filter((card) => DeckView.FACE_SELECTOR.get(card).some((face) => face.is_all_types(type)))
              }),
              new Group({
                value: type,
                cards: cards.filter((card) => !catalog?.all().some((subtype) => DeckView.FACE_SELECTOR.get(card).some((face) => face.is_type(subtype))))
              })
            ],
            ...Type.TYPE_GROUPS[type] ?? {}
          });
        });
      }
      match_face(face, type_line) {
        const [type, subtype] = type_line.split(" - ");
        if (!face.is_card_type(type)) return false;
        if (subtype === "*") {
          return face.is_all_types(type);
        } else if (subtype) {
          return face.is_type(subtype);
        } else {
          return true;
        }
      }
    };
  }
});

// card-classifier/keyword.ts
var Keyword;
var init_keyword = __esm({
  "card-classifier/keyword.ts"() {
    init_card_classifier();
    Keyword = class extends CardClassifier {
      static name = "Keyword";
      static ungrouped_name = "No Keywords";
      groups() {
        return this.group_by((card) => card.card?.keywords);
      }
    };
  }
});

// card-classifier/artist.ts
var Artist;
var init_artist = __esm({
  "card-classifier/artist.ts"() {
    init_card_classifier();
    Artist = class extends CardClassifier {
      static name = "Artist";
      static ungrouped_name = "No Art";
      groups() {
        return this.group_by(
          (card) => card.card?.artist_ids,
          (id, card) => {
            let name = null;
            const face = card.faces().find((face2) => this.match_face(face2, id));
            name ??= face?.face?.artist ?? face?.card?.artist;
            const index = card.card.artist_ids.indexOf(id);
            if (index >= 0) name ??= card.card.artist.split(/\s*&\s*/g)[index];
            return {
              name,
              value: id
            };
          }
        );
      }
      match_face(face, id) {
        return face.face?.artist_id === id;
      }
    };
  }
});

// card-classifier/type-primary.ts
var TypePrimary;
var init_type_primary = __esm({
  "card-classifier/type-primary.ts"() {
    init_card_classifier();
    init_group();
    init_type();
    TypePrimary = class _TypePrimary extends CardClassifier {
      static name = "Type - Primary";
      static PRIMARY_TYPE_ORDER = [
        "Token",
        "Land",
        "Planeswalker",
        "Creature",
        "Battle",
        "Artifact",
        "Enchantment",
        "Instant",
        "Sorcery"
      ];
      split_by_face = true;
      static primary_type(card) {
        return _TypePrimary.PRIMARY_TYPE_ORDER.find((type) => card.is_card_type(type)) ?? card.card_types()[0];
      }
      groups() {
        return this.group_by_face(
          (face) => _TypePrimary.primary_type(face),
          void 0,
          Object.fromEntries(Type.CARD_TYPE_ORDER.map((type) => [
            type,
            new Group({
              name: type,
              value: type,
              ...Type.TYPE_GROUPS[type] ?? {}
            })
          ]))
        );
      }
      match_face(face, type) {
        return face.is_card_type(type);
      }
      compare(a, b) {
        return this.compare_card_index(
          a,
          b,
          (face) => _TypePrimary.primary_type(face),
          Type.CARD_TYPE_ORDER
        );
      }
    };
  }
});

// ui/deck/deck-controls.ts
function initialise_deck_controls() {
  const group_select = HTML.select({
    id: "group-by",
    onchange: () => {
      DeckView.GROUPING = CARD_GROUPINGS[group_select.value];
      DeckView.render();
    }
  }, CARD_GROUPINGS.map((grouping, i) => HTML.option({ value: i }, grouping.name)));
  const by_board = HTML.input({
    id: "by-board",
    onchange: () => {
      DeckView.BY_BOARD = by_board.checked;
      DeckView.render();
    }
  });
  const order_select = HTML.select({
    id: "order-by",
    onchange: () => {
      DeckView.ORDERING = CARD_ORDERINGS[order_select.value];
      DeckView.render();
    }
  }, CARD_ORDERINGS.map((ordering, i) => HTML.option({ value: i }, ordering.name)));
}
var CARD_GROUPINGS, CARD_ORDERINGS;
var init_deck_controls = __esm({
  "ui/deck/deck-controls.ts"() {
    init_xml();
    init_deck_view();
    init_type();
    init_color2();
    init_color_identity();
    init_mana_value();
    init_set_classifier();
    init_rarity();
    init_tag2();
    init_name();
    init_price();
    init_rank();
    init_card_classifier();
    init_subtype();
    init_keyword();
    init_artist();
    init_type_primary();
    CARD_GROUPINGS = [
      CardClassifier,
      SetClassifier,
      Rarity,
      Type,
      TypePrimary,
      Subtype,
      Color3,
      ColorIdentity,
      ManaValue,
      Artist,
      Keyword,
      Tag2
    ];
    CARD_ORDERINGS = [
      CardClassifier,
      Name,
      SetClassifier,
      Rarity,
      TypePrimary,
      Color3,
      ColorIdentity,
      PriceUSD,
      PriceEUR,
      PriceTIX,
      ManaValue,
      RankEDHREC,
      RankPenny
    ];
  }
});

// ui/search/search.ts
function initialise_search() {
  SEARCH_INPUT.addEventListener("keypress", ({ key }) => {
    if (key === "Enter") search();
  });
  HTML.button({
    id: "search-button",
    onclick: () => search()
  });
}
async function search(query = SEARCH_INPUT.value) {
  SEARCH_INPUT.value = query;
  if (!query) return;
  SEARCH_RESULTS.classList.remove("collapsed");
  SEARCH_RESULTS.classList.add("loading");
  HTML.div({ id: "search-results" }, HTML.div(
    { class: "groups" },
    [...Array(3)].map(
      (_, i) => HTML.div(
        { id: `search-stack-${i}`, class: "stack" },
        CardView.render(DeckCard.empty(), null, `search-result-${i}`)
      )
    )
  ));
  const card_list = await API.card_search(query);
  await new Promise((resolve) => setTimeout(resolve, 3e3));
  SEARCH_RESULTS.classList.remove("loading");
  if (card_list) {
    HTML.div({ id: "search-results" }, HTML.div(
      { class: "groups" },
      card_list.data.map((card) => DeckCard.from_card(card, true)).map(
        (card, i) => HTML.div(
          { id: `search-stack-${i}`, class: "stack" },
          CardView.render(card, null, `search-result-${i}`)
        )
      )
    ));
  }
}
var SEARCH_INPUT, SEARCH_RESULTS;
var init_search = __esm({
  "ui/search/search.ts"() {
    init_xml();
    init_api();
    init_deck_card();
    init_card_view();
    SEARCH_INPUT = HTML.input({ id: "search-query" });
    SEARCH_RESULTS = HTML.div({ id: "search-results" });
  }
});

// ui/initialise-ui.ts
var initialise_ui_exports = {};
__export(initialise_ui_exports, {
  initialise_ui: () => initialise_ui
});
function initialise_ui() {
  initialise_search();
  initialise_deck_controls();
  initialise_deck_upload();
}
var init_initialise_ui = __esm({
  "ui/initialise-ui.ts"() {
    init_deck_upload();
    init_deck_controls();
    init_search();
  }
});

// main.js
var require_main = __commonJS({
  "main.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var initialise_ui_1 = (init_initialise_ui(), __toCommonJS(initialise_ui_exports));
    var deck_1 = (init_deck(), __toCommonJS(deck_exports));
    (0, initialise_ui_1.initialise_ui)();
    deck_1.Deck.load_current(`
Lightning Bolt
Grizzly Bears *F*
Etali, Primal Conqueror *ET*
`);
  }
});
export default require_main();
