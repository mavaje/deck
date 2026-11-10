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
function format(message, values = {}) {
  message = message.replaceAll(/^\s*|\s*$/g, "").replaceAll(/\s*\n\s*/g, " \u21B5 ");
  Object.entries(values).forEach(([name, value]) => {
    if (value instanceof RegExp) {
      value = value.toString();
    } else if (value instanceof Set) {
      value = `{${[...value].join(", ")}}`;
    } else {
      const visited = /* @__PURE__ */ new WeakSet();
      value = JSON.stringify(value, (k, v) => {
        if (v && typeof v === "object") {
          if (visited.has(v)) return String(v);
          visited.add(v);
        }
        return v;
      }) ?? "undefined";
    }
    if (value.length > 40) value = value.slice(0, 32) + " ... " + value.slice(-8);
    message = message.replaceAll(`{${name}}`, value);
  });
  return message;
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

// test/fixtures/api-cache-fixture.ts
function load_api_cache() {
  API.CACHE.put_all(TEST_FIXTURE);
}
var TEST_FIXTURE;
var init_api_cache_fixture = __esm({
  "test/fixtures/api-cache-fixture.ts"() {
    init_api();
    TEST_FIXTURE = {
      "https://api.scryfall.com/catalog/artifact-types": {
        "object": "catalog",
        "uri": "https://api.scryfall.com/catalog/artifact-types",
        "total_values": 21,
        "data": [
          "Attraction",
          "Blood",
          "Bobblehead",
          "Book",
          "Clue",
          "Communicator",
          "Contraption",
          "Equipment",
          "Food",
          "Fortification",
          "Gold",
          "Incubator",
          "Infinity",
          "Junk",
          "Map",
          "Powerstone",
          "Stone",
          "Terminus",
          "Treasure",
          "Vehicle",
          "Spacecraft"
        ]
      },
      "https://api.scryfall.com/catalog/battle-types": {
        "object": "catalog",
        "uri": "https://api.scryfall.com/catalog/battle-types",
        "total_values": 1,
        "data": [
          "Siege"
        ]
      },
      "https://api.scryfall.com/catalog/card-types": {
        "object": "catalog",
        "uri": "https://api.scryfall.com/catalog/card-types",
        "total_values": 19,
        "data": [
          "Artifact",
          "Battle",
          "Boss",
          "Conspiracy",
          "Creature",
          "Dungeon",
          "Emblem",
          "Enchantment",
          "Event",
          "Hero",
          "Instant",
          "Kindred",
          "Land",
          "Phenomenon",
          "Plane",
          "Planeswalker",
          "Scheme",
          "Sorcery",
          "Vanguard"
        ]
      },
      "https://api.scryfall.com/catalog/creature-types": {
        "object": "catalog",
        "uri": "https://api.scryfall.com/catalog/creature-types",
        "total_values": 377,
        "data": [
          "Advisor",
          "Aenar",
          "Aetherborn",
          "Alien",
          "Ally",
          "Andorian",
          "Android",
          "Angel",
          "Antelope",
          "Ape",
          "Archer",
          "Archon",
          "Armadillo",
          "Army",
          "Artificer",
          "Assassin",
          "Assembly-Worker",
          "Astartes",
          "Atog",
          "Aurochs",
          "Automaton",
          "Avatar",
          "Azra",
          "Badger",
          "Bajoran",
          "Balloon",
          "Barbarian",
          "Bard",
          "Basilisk",
          "Bat",
          "Bear",
          "Beast",
          "Beaver",
          "Beeble",
          "Beholder",
          "Berserker",
          "Betazoid",
          "Bird",
          "Bison",
          "Blinkmoth",
          "Boar",
          "Bolian",
          "Borg",
          "Brainiac",
          "Brikar",
          "Bringer",
          "Brushwagg",
          "C'tan",
          "Caitian",
          "Camarid",
          "Camel",
          "Capybara",
          "Cardassian",
          "Caribou",
          "Carrier",
          "Cat",
          "Centaur",
          "Chicken",
          "Child",
          "Chimera",
          "Citizen",
          "Cleric",
          "Clown",
          "Cockatrice",
          "Construct",
          "Coward",
          "Coyote",
          "Crab",
          "Crocodile",
          "Custodes",
          "Cyberman",
          "Cyclops",
          "Dalek",
          "Dauthi",
          "Demigod",
          "Demon",
          "Denobulan",
          "Deserter",
          "Detective",
          "Devil",
          "Dinosaur",
          "Djinn",
          "Doctor",
          "Dog",
          "Dragon",
          "Drake",
          "Dreadnought",
          "Drix",
          "Drone",
          "Druid",
          "Dryad",
          "Dwarf",
          "Echidna",
          "Edosian",
          "Efreet",
          "Egg",
          "El-Aurian",
          "Elder",
          "Eldrazi",
          "Elemental",
          "Elephant",
          "Elf",
          "Elk",
          "Employee",
          "Eternal",
          "Excalbian",
          "Eye",
          "Faerie",
          "Ferengi",
          "Ferret",
          "Fish",
          "Flagbearer",
          "Fox",
          "Fractal",
          "Frog",
          "Fungus",
          "Gamer",
          "Gamma",
          "Gargoyle",
          "Germ",
          "Giant",
          "Giraffe",
          "Gith",
          "Glimmer",
          "Gnoll",
          "Gnome",
          "Goat",
          "Goblin",
          "God",
          "Golem",
          "Gorgon",
          "Gorn",
          "Graveborn",
          "Gremlin",
          "Griffin",
          "Guest",
          "Hag",
          "Halfling",
          "Hamster",
          "Harpy",
          "Head",
          "Hedgehog",
          "Hellion",
          "Hero",
          "Hippo",
          "Hippogriff",
          "Hirogen",
          "Homarid",
          "Homunculus",
          "Horror",
          "Horse",
          "Human",
          "Hydra",
          "Hyena",
          "Illusion",
          "Illyrian",
          "Imp",
          "Incarnation",
          "Inhuman",
          "Inkling",
          "Inquisitor",
          "Insect",
          "Jackal",
          "Jellyfish",
          "Jem'Hadar",
          "Juggernaut",
          "Kangaroo",
          "Kavu",
          "Kelpien",
          "Kirin",
          "Kithkin",
          "Klingon",
          "Knight",
          "Kobold",
          "Kor",
          "Kraken",
          "Kree",
          "Kwejian",
          "Lamia",
          "Lammasu",
          "Lanthanite",
          "Leech",
          "Lemur",
          "Leviathan",
          "Lhurgoyf",
          "Licid",
          "Lizard",
          "Llama",
          "Lobster",
          "Manticore",
          "Masticore",
          "Medusan",
          "Melkotian",
          "Mercenary",
          "Merfolk",
          "Metathran",
          "Mindless-One",
          "Minion",
          "Minotaur",
          "Mite",
          "Mole",
          "Monger",
          "Mongoose",
          "Monk",
          "Monkey",
          "Moogle",
          "Moonfolk",
          "Mount",
          "Mouse",
          "Mutant",
          "Myr",
          "Mystic",
          "Na'kuhl",
          "Naga",
          "Nautilus",
          "Necron",
          "Nephilim",
          "Nightmare",
          "Nightstalker",
          "Ninja",
          "Noble",
          "Noggle",
          "Nomad",
          "Nymph",
          "Ocampa",
          "Octopus",
          "Officer",
          "Ogre",
          "Ooze",
          "Orb",
          "Orc",
          "Orgg",
          "Orion",
          "Otter",
          "Ouphe",
          "Ox",
          "Oyster",
          "Pangolin",
          "Peasant",
          "Pegasus",
          "Pentavite",
          "Performer",
          "Pest",
          "Phelddagrif",
          "Phoenix",
          "Phyrexian",
          "Pilot",
          "Pincher",
          "Pirate",
          "Plant",
          "Platypus",
          "Porcupine",
          "Possum",
          "Praetor",
          "Primarch",
          "Prism",
          "Processor",
          "Q",
          "Qu",
          "Rabbit",
          "Raccoon",
          "Ranger",
          "Rat",
          "Rebel",
          "Reflection",
          "Reveler",
          "Rhino",
          "Rigger",
          "Robot",
          "Rogue",
          "Romulan",
          "Rukh",
          "Sable",
          "Salamander",
          "Samurai",
          "Sand",
          "Saproling",
          "Satyr",
          "Scarecrow",
          "Scientist",
          "Scion",
          "Scorpion",
          "Scout",
          "Sculpture",
          "Seal",
          "Serf",
          "Serpent",
          "Servo",
          "Shade",
          "Shaman",
          "Shapeshifter",
          "Shark",
          "Sheep",
          "Shi'ar",
          "Siren",
          "Skeleton",
          "Skrull",
          "Skunk",
          "Slith",
          "Sliver",
          "Sloth",
          "Slug",
          "Snail",
          "Snake",
          "Soldier",
          "Soltari",
          "Sorcerer",
          "Spawn",
          "Specter",
          "Spellshaper",
          "Sphinx",
          "Spider",
          "Spike",
          "Spirit",
          "Splinter",
          "Sponge",
          "Spy",
          "Squid",
          "Squirrel",
          "Starfish",
          "Surrakar",
          "Survivor",
          "Symbiote",
          "Synth",
          "Talaxian",
          "Talosian",
          "Tamarian",
          "Teddy",
          "Tellarite",
          "Tentacle",
          "Tetravite",
          "Thalakos",
          "Tholian",
          "Thopter",
          "Thrull",
          "Tiefling",
          "Time Lord",
          "Tosk",
          "Toy",
          "Treefolk",
          "Tribble",
          "Trill",
          "Trilobite",
          "Triskelavite",
          "Troll",
          "Turtle",
          "Tyranid",
          "Unicorn",
          "Urzan",
          "Utrom",
          "Vampire",
          "Varmint",
          "Vau-N'Akat",
          "Vedalken",
          "Villain",
          "Volver",
          "Vorta",
          "Vulcan",
          "Wall",
          "Walrus",
          "Warlock",
          "Warrior",
          "Weasel",
          "Weird",
          "Werewolf",
          "Whale",
          "Wizard",
          "Wolf",
          "Wolverine",
          "Wombat",
          "Worm",
          "Wraith",
          "Wurm",
          "Xindi",
          "Yeti",
          "Zombie",
          "Zubera"
        ]
      },
      "https://api.scryfall.com/catalog/enchantment-types": {
        "object": "catalog",
        "uri": "https://api.scryfall.com/catalog/enchantment-types",
        "total_values": 13,
        "data": [
          "Aura",
          "Background",
          "Cartouche",
          "Case",
          "Class",
          "Curse",
          "Plan",
          "Role",
          "Room",
          "Rune",
          "Saga",
          "Shard",
          "Shrine"
        ]
      },
      "https://api.scryfall.com/catalog/keyword-abilities": {
        "object": "catalog",
        "uri": "https://api.scryfall.com/catalog/keyword-abilities",
        "total_values": 224,
        "data": [
          "Living weapon",
          "Jump-start",
          "Commander ninjutsu",
          "Legendary landwalk",
          "Nonbasic landwalk",
          "Megamorph",
          "Haunt",
          "Forecast",
          "Graft",
          "Fortify",
          "Frenzy",
          "Gravestorm",
          "Hideaway",
          "Level Up",
          "Infect",
          "Reach",
          "Rampage",
          "Phasing",
          "Multikicker",
          "Morph",
          "Provoke",
          "Modular",
          "Ninjutsu",
          "Replicate",
          "Recover",
          "Poisonous",
          "Reinforce",
          "Persist",
          "Retrace",
          "Rebound",
          "Miracle",
          "Overload",
          "Outlast",
          "Prowess",
          "Renown",
          "Myriad",
          "Shroud",
          "Trample",
          "Vigilance",
          "Soulshift",
          "Splice",
          "Transmute",
          "Ripple",
          "Vanishing",
          "Transfigure",
          "Wither",
          "Soulbond",
          "Unleash",
          "Ascend",
          "Assist",
          "Afterlife",
          "Companion",
          "Fabricate",
          "Embalm",
          "Escape",
          "Fuse",
          "Menace",
          "Ingest",
          "Melee",
          "Improvise",
          "Mentor",
          "Partner",
          "Mutate",
          "Scavenge",
          "Tribute",
          "Surge",
          "Skulk",
          "Riot",
          "Spectacle",
          "Forestwalk",
          "Islandwalk",
          "Mountainwalk",
          "Double strike",
          "Cumulative upkeep",
          "First strike",
          "Encore",
          "Deathtouch",
          "Defender",
          "Amplify",
          "Affinity",
          "Bushido",
          "Convoke",
          "Bloodthirst",
          "Absorb",
          "Aura Swap",
          "Changeling",
          "Conspire",
          "Cascade",
          "Annihilator",
          "Battle Cry",
          "Cipher",
          "Bestow",
          "Dash",
          "Awaken",
          "Crew",
          "Aftermath",
          "Afflict",
          "Flanking",
          "Foretell",
          "Fading",
          "Eternalize",
          "Entwine",
          "Epic",
          "Dredge",
          "Delve",
          "Evoke",
          "Exalted",
          "Evolve",
          "Extort",
          "Dethrone",
          "Exploit",
          "Devoid",
          "Emerge",
          "Escalate",
          "Flying",
          "Haste",
          "Hexproof",
          "Indestructible",
          "Intimidate",
          "Lifelink",
          "Horsemanship",
          "Kicker",
          "Madness",
          "Swampwalk",
          "Desertwalk",
          "Craft",
          "Plainswalk",
          "Split second",
          "Augment",
          "Double agenda",
          "Reconfigure",
          "Ward",
          "Partner with",
          "Nightbound",
          "Decayed",
          "Disturb",
          "Squad",
          "Enlist",
          "Read Ahead",
          "Ravenous",
          "Blitz",
          "Offering",
          "Suspend",
          "Living metal",
          "Backup",
          "Banding",
          "Hidden agenda",
          "For Mirrodin!",
          "Friends forever",
          "Casualty",
          "Protection",
          "Compleated",
          "Enchant",
          "Flash",
          "Boast",
          "Landwalk",
          "Typecycling",
          "Demonstrate",
          "Sunburst",
          "Flashback",
          "Cycling",
          "Buyback",
          "Hexproof from",
          "Landcycling",
          "More Than Meets the Eye",
          "Cleave",
          "Champion",
          "Specialize",
          "Training",
          "Prototype",
          "Toxic",
          "Unearth",
          "Intensity",
          "Disguise",
          "Slivercycling",
          "Plainscycling",
          "Swampcycling",
          "Basic landcycling",
          "Islandcycling",
          "Mountaincycling",
          "Forestcycling",
          "Wizardcycling",
          "Bargain",
          "Doctor's companion",
          "Choose a background",
          "Echo",
          "Umbra armor",
          "Freerunning",
          "Spree",
          "Saddle",
          "Shadow",
          "Warp",
          "Station",
          "Devour",
          "Undaunted",
          "Gift",
          "Offspring",
          "Impending",
          "Harmonize",
          "Exhaust",
          "Max speed",
          "Tiered",
          "Mobilize",
          "Double team",
          "Job select",
          "Mayhem",
          "Web-slinging",
          "Prowl",
          "Solved",
          "Sneak",
          "Increment",
          "Paradigm",
          "Teamwork",
          "Storm",
          "Fear",
          "Storied",
          "Firebending",
          "Power-up",
          "Halflingcycling",
          "Equip",
          "Affinitycycling",
          "Daybound",
          "Undying",
          "Follow the 3rd Rule"
        ]
      },
      "https://api.scryfall.com/catalog/land-types": {
        "object": "catalog",
        "uri": "https://api.scryfall.com/catalog/land-types",
        "total_values": 18,
        "data": [
          "Cave",
          "Cloud",
          "Desert",
          "Forest",
          "Gate",
          "Island",
          "Lair",
          "Locus",
          "Mine",
          "Mountain",
          "Sphere",
          "Plains",
          "Planet",
          "Power-Plant",
          "Swamp",
          "Tower",
          "Town",
          "Urza's"
        ]
      },
      "https://api.scryfall.com/catalog/planeswalker-types": {
        "object": "catalog",
        "uri": "https://api.scryfall.com/catalog/planeswalker-types",
        "total_values": 99,
        "data": [
          "Abian",
          "Ajani",
          "Aminatou",
          "Angrath",
          "Arlinn",
          "Arzakon",
          "Ashiok",
          "B.O.B.",
          "Bahamut",
          "Basri",
          "Bolas",
          "Calix",
          "Chandra",
          "Comet",
          "Dack",
          "Dakkon",
          "Daretti",
          "Davriel",
          "Deb",
          "Dellian",
          "Dihada",
          "Domri",
          "Dovin",
          "Duck",
          "Dungeon",
          "Dyfed",
          "Ellywick",
          "Elminster",
          "Elspeth",
          "Ersta",
          "Estrid",
          "Feroz",
          "Freyalise",
          "Garruk",
          "Gideon",
          "Greensleeves",
          "Grist",
          "Guff",
          "Huatli",
          "Inzerva",
          "Jace",
          "Jared",
          "Jaya",
          "Jeska",
          "Kaito",
          "Karn",
          "Kasmina",
          "Kaya",
          "Kiora",
          "Koth",
          "Liliana",
          "Lolth",
          "Lukka",
          "Luxior",
          "Master",
          "Minsc",
          "Monopoly",
          "Mordenkainen",
          "Nahiri",
          "Narset",
          "Niko",
          "Nissa",
          "Nixilis",
          "Oko",
          "Quintorius",
          "Ral",
          "Rowan",
          "Saheeli",
          "Samut",
          "Sarkhan",
          "Serra",
          "Sifa",
          "Sivitri",
          "Sorin",
          "Svega",
          "Szat",
          "Tamiyo",
          "Tasha",
          "Teferi",
          "Teyo",
          "Tezzeret",
          "Thomil",
          "Tibalt",
          "Tyvar",
          "Ugin",
          "Urza",
          "Venser",
          "Vivien",
          "Vraska",
          "Vronos",
          "Wanderer",
          "Will",
          "Windgrace",
          "Worzel",
          "Wrenn",
          "Xenagos",
          "Yanggu",
          "Yanling",
          "Zariel"
        ]
      },
      "https://api.scryfall.com/catalog/spell-types": {
        "object": "catalog",
        "uri": "https://api.scryfall.com/catalog/spell-types",
        "total_values": 6,
        "data": [
          "Adventure",
          "Arcane",
          "Chorus",
          "Lesson",
          "Omen",
          "Trap"
        ]
      },
      "https://api.scryfall.com/catalog/supertypes": {
        "object": "catalog",
        "uri": "https://api.scryfall.com/catalog/supertypes",
        "total_values": 7,
        "data": [
          "Basic",
          "Elite",
          "Legendary",
          "Ongoing",
          "Snow",
          "Token",
          "World"
        ]
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
      legality(format2) {
        return this.card?.legalities[format2?.code];
      }
      is_legal(format2) {
        return ![
          "not_legal",
          "banned"
        ].includes(this.legality(format2));
      }
      is_default_language() {
        return !this.card || this.card?.lang === Language.DEFAULT.code();
      }
      layout() {
        return this.card?.layout ?? "normal";
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
          finish: Object.entries(Finish.map()).find(([finish]) => card.finishes.includes(finish))[1]
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
        if (this.card) return;
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
      can_command(format2) {
        return format2.has_commander && this.can_be_commander() || format2.has_brawler && this.can_be_brawler() || format2.has_oathbreaker && this.can_be_oathbreaker();
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
      copy_limit(format2) {
        if (this.card) {
          if (this.legality(format2) === "restricted") {
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
        return format2?.copy_limit ?? Infinity;
      }
      allows_second_commander(second, format2) {
        if (this.card) {
          if (!this.can_command(format2)) return false;
          if (format2.has_signature_spell && second.can_be_signature_spell(this)) return true;
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
      to_string(format2 = "1 Name (SET:000?)? *EN*? *F*? *NM*? [Tag]") {
        return format2.replaceAll(
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

// test/fixtures/card-cache-fixture.ts
function load_card_cache() {
  DeckCard.CACHE.put_all(TEST_FIXTURE2);
}
var TEST_FIXTURE2;
var init_card_cache_fixture = __esm({
  "test/fixtures/card-cache-fixture.ts"() {
    init_deck_card();
    TEST_FIXTURE2 = {
      "(KTK:267:en)": {
        "object": "card",
        "id": "722111d4-99f4-463b-b232-96821c18f189",
        "oracle_id": "b34bb2dc-c1af-4d77-b0b3-a0fb342a5fc6",
        "multiverse_ids": [
          386540
        ],
        "mtgo_id": 54236,
        "mtgo_foil_id": 54237,
        "tcgplayer_id": 93005,
        "cardmarket_id": 269177,
        "name": "Forest",
        "lang": "en",
        "released_at": "2014-09-26",
        "uri": "https://api.scryfall.com/cards/722111d4-99f4-463b-b232-96821c18f189",
        "scryfall_uri": "https://scryfall.com/card/ktk/267/forest?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T10:37:18Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/7/2/722111d4-99f4-463b-b232-96821c18f189.jpg?1783939038",
          "normal": "https://cards.scryfall.io/normal/front/7/2/722111d4-99f4-463b-b232-96821c18f189.jpg?1783939038",
          "large": "https://cards.scryfall.io/large/front/7/2/722111d4-99f4-463b-b232-96821c18f189.jpg?1783939038",
          "png": "https://cards.scryfall.io/png/front/7/2/722111d4-99f4-463b-b232-96821c18f189.png?1783939038",
          "art_crop": "https://cards.scryfall.io/art_crop/front/7/2/722111d4-99f4-463b-b232-96821c18f189.jpg?1783939038",
          "border_crop": "https://cards.scryfall.io/border_crop/front/7/2/722111d4-99f4-463b-b232-96821c18f189.jpg?1783939038",
          "thumb": "https://cards.scryfall.io/thumb/front/7/2/722111d4-99f4-463b-b232-96821c18f189.webp?1783939038",
          "grid": "https://cards.scryfall.io/grid/front/7/2/722111d4-99f4-463b-b232-96821c18f189.webp?1783939038",
          "display": "https://cards.scryfall.io/display/front/7/2/722111d4-99f4-463b-b232-96821c18f189.webp?1783939038",
          "art": "https://cards.scryfall.io/art/front/7/2/722111d4-99f4-463b-b232-96821c18f189.webp?1783939038",
          "crop": "https://cards.scryfall.io/crop/front/7/2/722111d4-99f4-463b-b232-96821c18f189.webp?1783939038",
          "jpeg": "https://cards.scryfall.io/normal/front/7/2/722111d4-99f4-463b-b232-96821c18f189.jpg?1783939038"
        },
        "mana_cost": "",
        "cmc": 0,
        "type_line": "Basic Land \u2014 Forest",
        "oracle_text": "({T}: Add {G}.)",
        "colors": [],
        "color_identity": [
          "G"
        ],
        "keywords": [],
        "produced_mana": [
          "G"
        ],
        "all_parts": [
          {
            "object": "related_card",
            "id": "b742ffa7-915f-45ce-b3f2-8391723bb34c",
            "component": "combo_piece",
            "name": "Forest",
            "type_line": "Basic Land \u2014 Forest",
            "uri": "https://api.scryfall.com/cards/b742ffa7-915f-45ce-b3f2-8391723bb34c"
          },
          {
            "object": "related_card",
            "id": "aed8ae06-ae54-4a16-8830-6547164ce6ae",
            "component": "combo_piece",
            "name": "Gilt-Leaf Alchemist",
            "type_line": "Creature \u2014 Elf Druid",
            "uri": "https://api.scryfall.com/cards/aed8ae06-ae54-4a16-8830-6547164ce6ae"
          }
        ],
        "legalities": {
          "standard": "legal",
          "future": "legal",
          "historic": "legal",
          "timeless": "legal",
          "gladiator": "legal",
          "pioneer": "legal",
          "modern": "legal",
          "legacy": "legal",
          "pauper": "legal",
          "vintage": "legal",
          "penny": "legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "legal",
          "brawl": "legal",
          "competitivebrawl": "legal",
          "alchemy": "legal",
          "paupercommander": "legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "legal",
          "predh": "legal",
          "tlr": "legal"
        },
        "games": [
          "paper",
          "mtgo",
          "arena"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": true,
        "variation": false,
        "set_id": "6c7a715c-ded9-449e-89b0-c665773e9c3c",
        "set": "ktk",
        "set_name": "Khans of Tarkir",
        "set_type": "expansion",
        "set_uri": "https://api.scryfall.com/sets/6c7a715c-ded9-449e-89b0-c665773e9c3c",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Aktk&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/ktk?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/722111d4-99f4-463b-b232-96821c18f189/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3Ab34bb2dc-c1af-4d77-b0b3-a0fb342a5fc6&unique=prints",
        "collector_number": "267",
        "digital": false,
        "rarity": "common",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Titus Lunter",
        "artist_ids": [
          "b11e6b3a-f4ca-4cf1-8fd7-475696de5f5c"
        ],
        "illustration_id": "8e7b8696-fbc2-4076-bf59-faea696bc271",
        "border_color": "black",
        "frame": "2015",
        "full_art": false,
        "textless": false,
        "booster": true,
        "story_spotlight": false,
        "prices": {
          "usd": "0.16",
          "usd_foil": "0.69",
          "usd_etched": null,
          "eur": "0.09",
          "eur_foil": "0.27",
          "tix": "0.03"
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=386540&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DForest",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DForest",
          "edhrec": "https://edhrec.com/route/?cc=Forest"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F93005%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=269177&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/54236?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "(KTK:267:fr)": {
        "object": "card",
        "id": "39ca107a-db70-4115-9d12-2f90a2778f2a",
        "oracle_id": "b34bb2dc-c1af-4d77-b0b3-a0fb342a5fc6",
        "multiverse_ids": [
          387616
        ],
        "name": "Forest",
        "printed_name": "For\xEAt",
        "lang": "fr",
        "released_at": "2014-09-26",
        "uri": "https://api.scryfall.com/cards/39ca107a-db70-4115-9d12-2f90a2778f2a",
        "scryfall_uri": "https://scryfall.com/card/ktk/267/fr/for%C3%AAt-(forest)?utm_source=api",
        "layout": "normal",
        "highres_image": false,
        "image_status": "lowres",
        "image_updated_at": "2026-07-02T04:35:55Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/3/9/39ca107a-db70-4115-9d12-2f90a2778f2a.jpg?1782966955",
          "normal": "https://cards.scryfall.io/normal/front/3/9/39ca107a-db70-4115-9d12-2f90a2778f2a.jpg?1782966955",
          "large": "https://cards.scryfall.io/large/front/3/9/39ca107a-db70-4115-9d12-2f90a2778f2a.jpg?1782966955",
          "png": "https://cards.scryfall.io/png/front/3/9/39ca107a-db70-4115-9d12-2f90a2778f2a.png?1782966955",
          "art_crop": "https://cards.scryfall.io/art_crop/front/3/9/39ca107a-db70-4115-9d12-2f90a2778f2a.jpg?1782966955",
          "border_crop": "https://cards.scryfall.io/border_crop/front/3/9/39ca107a-db70-4115-9d12-2f90a2778f2a.jpg?1782966955",
          "thumb": "https://cards.scryfall.io/thumb/front/3/9/39ca107a-db70-4115-9d12-2f90a2778f2a.webp?1782966955",
          "grid": "https://cards.scryfall.io/grid/front/3/9/39ca107a-db70-4115-9d12-2f90a2778f2a.webp?1782966955",
          "display": "https://cards.scryfall.io/display/front/3/9/39ca107a-db70-4115-9d12-2f90a2778f2a.webp?1782966955",
          "art": "https://cards.scryfall.io/art/front/3/9/39ca107a-db70-4115-9d12-2f90a2778f2a.webp?1782966955",
          "crop": "https://cards.scryfall.io/crop/front/3/9/39ca107a-db70-4115-9d12-2f90a2778f2a.webp?1782966955",
          "jpeg": "https://cards.scryfall.io/normal/front/3/9/39ca107a-db70-4115-9d12-2f90a2778f2a.jpg?1782966955"
        },
        "mana_cost": "",
        "cmc": 0,
        "type_line": "Basic Land \u2014 Forest",
        "printed_type_line": "Terrain de base : for\xEAt",
        "oracle_text": "({T}: Add {G}.)",
        "colors": [],
        "color_identity": [
          "G"
        ],
        "keywords": [],
        "produced_mana": [
          "G"
        ],
        "legalities": {
          "standard": "legal",
          "future": "legal",
          "historic": "legal",
          "timeless": "legal",
          "gladiator": "legal",
          "pioneer": "legal",
          "modern": "legal",
          "legacy": "legal",
          "pauper": "legal",
          "vintage": "legal",
          "penny": "legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "legal",
          "brawl": "legal",
          "competitivebrawl": "legal",
          "alchemy": "legal",
          "paupercommander": "legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "legal",
          "predh": "legal",
          "tlr": "legal"
        },
        "games": [
          "paper",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": true,
        "variation": false,
        "set_id": "6c7a715c-ded9-449e-89b0-c665773e9c3c",
        "set": "ktk",
        "set_name": "Khans of Tarkir",
        "set_type": "expansion",
        "set_uri": "https://api.scryfall.com/sets/6c7a715c-ded9-449e-89b0-c665773e9c3c",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Aktk&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/ktk?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/39ca107a-db70-4115-9d12-2f90a2778f2a/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3Ab34bb2dc-c1af-4d77-b0b3-a0fb342a5fc6&unique=prints",
        "collector_number": "267",
        "digital": false,
        "rarity": "common",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Titus Lunter",
        "artist_ids": [
          "b11e6b3a-f4ca-4cf1-8fd7-475696de5f5c"
        ],
        "illustration_id": "8e7b8696-fbc2-4076-bf59-faea696bc271",
        "border_color": "black",
        "frame": "2015",
        "full_art": false,
        "textless": false,
        "booster": true,
        "story_spotlight": false,
        "prices": {
          "usd": null,
          "usd_foil": null,
          "usd_etched": null,
          "eur": null,
          "eur_foil": null,
          "tix": null
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=387616&printed=true",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DForest",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DForest",
          "edhrec": "https://edhrec.com/route/?cc=Forest"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fmagic%2Fproduct%3FproductLineName%3Dmagic%26q%3DForest%26view%3Dgrid",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products/Search?referrer=scryfall&searchString=Forest&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards?affiliate_id=scryfall&data%5Bsearch%5D=Forest&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "2 mace (::en)": {
        "object": "card",
        "id": "e882c9f9-bf30-46b6-bedc-379d2c80e5cb",
        "oracle_id": "629fe1be-272d-465f-b9b1-2ce177410f13",
        "multiverse_ids": [],
        "mtgo_id": 91504,
        "arena_id": 77106,
        "tcgplayer_id": 243201,
        "cardmarket_id": 571299,
        "name": "+2 Mace",
        "lang": "en",
        "released_at": "2021-07-23",
        "uri": "https://api.scryfall.com/cards/e882c9f9-bf30-46b6-bedc-379d2c80e5cb",
        "scryfall_uri": "https://scryfall.com/card/afr/1/+2-mace?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T07:08:59Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/e/8/e882c9f9-bf30-46b6-bedc-379d2c80e5cb.jpg?1783926539",
          "normal": "https://cards.scryfall.io/normal/front/e/8/e882c9f9-bf30-46b6-bedc-379d2c80e5cb.jpg?1783926539",
          "large": "https://cards.scryfall.io/large/front/e/8/e882c9f9-bf30-46b6-bedc-379d2c80e5cb.jpg?1783926539",
          "png": "https://cards.scryfall.io/png/front/e/8/e882c9f9-bf30-46b6-bedc-379d2c80e5cb.png?1783926539",
          "art_crop": "https://cards.scryfall.io/art_crop/front/e/8/e882c9f9-bf30-46b6-bedc-379d2c80e5cb.jpg?1783926539",
          "border_crop": "https://cards.scryfall.io/border_crop/front/e/8/e882c9f9-bf30-46b6-bedc-379d2c80e5cb.jpg?1783926539",
          "thumb": "https://cards.scryfall.io/thumb/front/e/8/e882c9f9-bf30-46b6-bedc-379d2c80e5cb.webp?1783926539",
          "grid": "https://cards.scryfall.io/grid/front/e/8/e882c9f9-bf30-46b6-bedc-379d2c80e5cb.webp?1783926539",
          "display": "https://cards.scryfall.io/display/front/e/8/e882c9f9-bf30-46b6-bedc-379d2c80e5cb.webp?1783926539",
          "art": "https://cards.scryfall.io/art/front/e/8/e882c9f9-bf30-46b6-bedc-379d2c80e5cb.webp?1783926539",
          "crop": "https://cards.scryfall.io/crop/front/e/8/e882c9f9-bf30-46b6-bedc-379d2c80e5cb.webp?1783926539",
          "jpeg": "https://cards.scryfall.io/normal/front/e/8/e882c9f9-bf30-46b6-bedc-379d2c80e5cb.jpg?1783926539"
        },
        "mana_cost": "{1}{W}",
        "cmc": 2,
        "type_line": "Artifact \u2014 Equipment",
        "oracle_text": "Equipped creature gets +2/+2.\nEquip {3} ({3}: Attach to target creature you control. Equip only as a sorcery.)",
        "colors": [
          "W"
        ],
        "color_identity": [
          "W"
        ],
        "keywords": [
          "Equip"
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "legal",
          "timeless": "legal",
          "gladiator": "legal",
          "pioneer": "legal",
          "modern": "legal",
          "legacy": "legal",
          "pauper": "legal",
          "vintage": "legal",
          "penny": "not_legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "not_legal",
          "brawl": "legal",
          "competitivebrawl": "legal",
          "alchemy": "not_legal",
          "paupercommander": "legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "legal"
        },
        "games": [
          "arena",
          "paper",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": false,
        "variation": false,
        "set_id": "e1ef87ba-ba92-4573-817f-543b996d2851",
        "set": "afr",
        "set_name": "Adventures in the Forgotten Realms",
        "set_type": "expansion",
        "set_uri": "https://api.scryfall.com/sets/e1ef87ba-ba92-4573-817f-543b996d2851",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Aafr&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/afr?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/e882c9f9-bf30-46b6-bedc-379d2c80e5cb/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A629fe1be-272d-465f-b9b1-2ce177410f13&unique=prints",
        "collector_number": "1",
        "digital": false,
        "rarity": "common",
        "flavor_text": "The weight of this magic weapon falls heavy on the wicked.",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Jarel Threat",
        "artist_ids": [
          "0fd89fbd-bd59-4ded-890e-731a8982f278"
        ],
        "illustration_id": "444cd469-4a05-4a58-a098-8af8a7b0f886",
        "border_color": "black",
        "frame": "2015",
        "full_art": false,
        "textless": false,
        "booster": true,
        "story_spotlight": false,
        "edhrec_rank": 18134,
        "preview": {
          "source": "Wizards of the Coast",
          "source_uri": "https://twitter.com/MTG_Arena/status/1410327287317270534",
          "previewed_at": "2021-07-01"
        },
        "prices": {
          "usd": "0.20",
          "usd_foil": "0.20",
          "usd_etched": null,
          "eur": "0.08",
          "eur_foil": "0.14",
          "tix": "0.03"
        },
        "related_uris": {
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3D%252B2%2BMace",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3D%252B2%2BMace",
          "edhrec": "https://edhrec.com/route/?cc=%2B2+Mace"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F243201%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=571299&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/91504?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "_____ (::en)": {
        "object": "card",
        "id": "5aa90ab6-2686-4462-8725-5d4370c05437",
        "oracle_id": "4e536142-4ebe-4062-887b-5dd123c41d39",
        "multiverse_ids": [
          74252
        ],
        "tcgplayer_id": 37817,
        "cardmarket_id": 14786,
        "name": "_____",
        "lang": "en",
        "released_at": "2004-11-19",
        "uri": "https://api.scryfall.com/cards/5aa90ab6-2686-4462-8725-5d4370c05437",
        "scryfall_uri": "https://scryfall.com/card/unh/23/_____?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T12:04:20Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/5/a/5aa90ab6-2686-4462-8725-5d4370c05437.jpg?1783944260",
          "normal": "https://cards.scryfall.io/normal/front/5/a/5aa90ab6-2686-4462-8725-5d4370c05437.jpg?1783944260",
          "large": "https://cards.scryfall.io/large/front/5/a/5aa90ab6-2686-4462-8725-5d4370c05437.jpg?1783944260",
          "png": "https://cards.scryfall.io/png/front/5/a/5aa90ab6-2686-4462-8725-5d4370c05437.png?1783944260",
          "art_crop": "https://cards.scryfall.io/art_crop/front/5/a/5aa90ab6-2686-4462-8725-5d4370c05437.jpg?1783944260",
          "border_crop": "https://cards.scryfall.io/border_crop/front/5/a/5aa90ab6-2686-4462-8725-5d4370c05437.jpg?1783944260",
          "thumb": "https://cards.scryfall.io/thumb/front/5/a/5aa90ab6-2686-4462-8725-5d4370c05437.webp?1783944260",
          "grid": "https://cards.scryfall.io/grid/front/5/a/5aa90ab6-2686-4462-8725-5d4370c05437.webp?1783944260",
          "display": "https://cards.scryfall.io/display/front/5/a/5aa90ab6-2686-4462-8725-5d4370c05437.webp?1783944260",
          "art": "https://cards.scryfall.io/art/front/5/a/5aa90ab6-2686-4462-8725-5d4370c05437.webp?1783944260",
          "crop": "https://cards.scryfall.io/crop/front/5/a/5aa90ab6-2686-4462-8725-5d4370c05437.webp?1783944260",
          "jpeg": "https://cards.scryfall.io/normal/front/5/a/5aa90ab6-2686-4462-8725-5d4370c05437.jpg?1783944260"
        },
        "mana_cost": "{1}{U}",
        "cmc": 2,
        "type_line": "Creature \u2014 Shapeshifter",
        "oracle_text": "{1}: This card's name becomes the card name of your choice. Activate anywhere, anytime.",
        "power": "1",
        "toughness": "1",
        "colors": [
          "U"
        ],
        "color_identity": [
          "U"
        ],
        "keywords": [],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "not_legal",
          "timeless": "not_legal",
          "gladiator": "not_legal",
          "pioneer": "not_legal",
          "modern": "not_legal",
          "legacy": "not_legal",
          "pauper": "not_legal",
          "vintage": "not_legal",
          "penny": "not_legal",
          "commander": "not_legal",
          "oathbreaker": "not_legal",
          "standardbrawl": "not_legal",
          "brawl": "not_legal",
          "competitivebrawl": "not_legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "not_legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "not_legal"
        },
        "games": [
          "paper"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": false,
        "variation": false,
        "set_id": "4c8bc76a-05a5-43db-aaf0-34deb347b871",
        "set": "unh",
        "set_name": "Unhinged",
        "set_type": "funny",
        "set_uri": "https://api.scryfall.com/sets/4c8bc76a-05a5-43db-aaf0-34deb347b871",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Aunh&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/unh?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/5aa90ab6-2686-4462-8725-5d4370c05437/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A4e536142-4ebe-4062-887b-5dd123c41d39&unique=prints",
        "collector_number": "23",
        "digital": false,
        "rarity": "uncommon",
        "flavor_text": "{1}: This card's flavor text becomes the flavor text of your choice. (This ability doesn't work because it's flavor text, not rules text (but neither does this reminder text, so you figure it out).)",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Ron Spears",
        "artist_ids": [
          "fce9030b-86bd-4439-b06a-920a1eeb184c"
        ],
        "illustration_id": "5fc75011-f171-44a2-a793-a2800ae07f96",
        "border_color": "silver",
        "frame": "2003",
        "full_art": false,
        "textless": false,
        "booster": true,
        "story_spotlight": false,
        "prices": {
          "usd": "0.41",
          "usd_foil": "3.40",
          "usd_etched": null,
          "eur": "0.36",
          "eur_foil": "3.14",
          "tix": null
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=74252&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3D_____",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3D_____",
          "edhrec": "https://edhrec.com/route/?cc=_____"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F37817%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=14786&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards?affiliate_id=scryfall&data%5Bsearch%5D=_____&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "_____ goblin (::en)": {
        "object": "card",
        "id": "5819e3f3-da49-4003-88ce-f3b7bb495787",
        "oracle_id": "88222fd2-8316-426c-8218-64f6be5ca0f8",
        "multiverse_ids": [
          580670
        ],
        "tcgplayer_id": 288079,
        "cardmarket_id": 677324,
        "name": "_____ Goblin",
        "lang": "en",
        "released_at": "2022-10-07",
        "uri": "https://api.scryfall.com/cards/5819e3f3-da49-4003-88ce-f3b7bb495787",
        "scryfall_uri": "https://scryfall.com/card/unf/107/_____-goblin?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-14T23:45:07Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/5/8/5819e3f3-da49-4003-88ce-f3b7bb495787.jpg?1784072707",
          "normal": "https://cards.scryfall.io/normal/front/5/8/5819e3f3-da49-4003-88ce-f3b7bb495787.jpg?1784072707",
          "large": "https://cards.scryfall.io/large/front/5/8/5819e3f3-da49-4003-88ce-f3b7bb495787.jpg?1784072707",
          "png": "https://cards.scryfall.io/png/front/5/8/5819e3f3-da49-4003-88ce-f3b7bb495787.png?1784072707",
          "art_crop": "https://cards.scryfall.io/art_crop/front/5/8/5819e3f3-da49-4003-88ce-f3b7bb495787.jpg?1784072707",
          "border_crop": "https://cards.scryfall.io/border_crop/front/5/8/5819e3f3-da49-4003-88ce-f3b7bb495787.jpg?1784072707",
          "thumb": "https://cards.scryfall.io/thumb/front/5/8/5819e3f3-da49-4003-88ce-f3b7bb495787.webp?1784072707",
          "grid": "https://cards.scryfall.io/grid/front/5/8/5819e3f3-da49-4003-88ce-f3b7bb495787.webp?1784072707",
          "display": "https://cards.scryfall.io/display/front/5/8/5819e3f3-da49-4003-88ce-f3b7bb495787.webp?1784072707",
          "art": "https://cards.scryfall.io/art/front/5/8/5819e3f3-da49-4003-88ce-f3b7bb495787.webp?1784072707",
          "crop": "https://cards.scryfall.io/crop/front/5/8/5819e3f3-da49-4003-88ce-f3b7bb495787.webp?1784072707",
          "jpeg": "https://cards.scryfall.io/normal/front/5/8/5819e3f3-da49-4003-88ce-f3b7bb495787.jpg?1784072707"
        },
        "mana_cost": "{2}{R}",
        "cmc": 3,
        "type_line": "Creature \u2014 Goblin Guest",
        "oracle_text": "When this creature enters, you may put a name sticker on it. Add {R} for each unique vowel on that sticker. (The vowels are A, E, I, O, U, and Y.)",
        "power": "2",
        "toughness": "2",
        "colors": [
          "R"
        ],
        "color_identity": [
          "R"
        ],
        "keywords": [],
        "produced_mana": [
          "R"
        ],
        "all_parts": [
          {
            "object": "related_card",
            "id": "40f80bd8-7ce2-449d-b06c-d3e353b54daa",
            "component": "combo_piece",
            "name": "_____ Goblin",
            "type_line": "Creature \u2014 Goblin Guest",
            "uri": "https://api.scryfall.com/cards/40f80bd8-7ce2-449d-b06c-d3e353b54daa"
          },
          {
            "object": "related_card",
            "id": "fd1442b4-da59-4042-835f-143c8dcaa73b",
            "component": "combo_piece",
            "name": '"Name Sticker" Goblin',
            "type_line": "Creature \u2014 Goblin Guest",
            "uri": "https://api.scryfall.com/cards/fd1442b4-da59-4042-835f-143c8dcaa73b"
          }
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "not_legal",
          "timeless": "not_legal",
          "gladiator": "not_legal",
          "pioneer": "not_legal",
          "modern": "not_legal",
          "legacy": "banned",
          "pauper": "banned",
          "vintage": "banned",
          "penny": "not_legal",
          "commander": "legal",
          "oathbreaker": "banned",
          "standardbrawl": "not_legal",
          "brawl": "not_legal",
          "competitivebrawl": "not_legal",
          "alchemy": "not_legal",
          "paupercommander": "legal",
          "duel": "banned",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "not_legal"
        },
        "games": [
          "paper",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": false,
        "variation": false,
        "set_id": "b314f553-8f07-4ba9-96c8-16be7784eff3",
        "set": "unf",
        "set_name": "Unfinity",
        "set_type": "funny",
        "set_uri": "https://api.scryfall.com/sets/b314f553-8f07-4ba9-96c8-16be7784eff3",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Aunf&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/unf?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/5819e3f3-da49-4003-88ce-f3b7bb495787/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A88222fd2-8316-426c-8218-64f6be5ca0f8&unique=prints",
        "collector_number": "107",
        "digital": false,
        "rarity": "common",
        "flavor_text": "The Astrotorium has never been a place for self-restraint.",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Chuck Lukacs",
        "artist_ids": [
          "2bdf4da7-c66c-4c46-a253-284c856ccfab"
        ],
        "illustration_id": "dc9d1ea9-a6cb-47da-9203-ad0d9338a0c7",
        "border_color": "black",
        "frame": "2015",
        "full_art": false,
        "textless": false,
        "booster": true,
        "story_spotlight": false,
        "edhrec_rank": 6735,
        "prices": {
          "usd": "0.38",
          "usd_foil": "5.61",
          "usd_etched": null,
          "eur": "0.59",
          "eur_foil": "2.78",
          "tix": null
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=580670&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3D_____%2BGoblin",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3D_____%2BGoblin",
          "edhrec": "https://edhrec.com/route/?cc=_____+Goblin"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F288079%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=677324&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards?affiliate_id=scryfall&data%5Bsearch%5D=_____+Goblin&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "______ (::en)": {
        "object": "card",
        "id": "a505ba37-b131-48d2-a2d7-a340763343f8",
        "oracle_id": "571ccaf0-d2a0-46d3-af4b-14245a9a79ff",
        "multiverse_ids": [],
        "tcgplayer_id": 650158,
        "name": "______",
        "lang": "en",
        "released_at": "2025-02-21",
        "uri": "https://api.scryfall.com/cards/a505ba37-b131-48d2-a2d7-a340763343f8",
        "scryfall_uri": "https://scryfall.com/card/unk/RL01c/______?utm_source=api",
        "layout": "normal",
        "highres_image": false,
        "image_status": "lowres",
        "image_updated_at": "2026-07-13T01:52:12Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/a/5/a505ba37-b131-48d2-a2d7-a340763343f8.jpg?1783907532",
          "normal": "https://cards.scryfall.io/normal/front/a/5/a505ba37-b131-48d2-a2d7-a340763343f8.jpg?1783907532",
          "large": "https://cards.scryfall.io/large/front/a/5/a505ba37-b131-48d2-a2d7-a340763343f8.jpg?1783907532",
          "png": "https://cards.scryfall.io/png/front/a/5/a505ba37-b131-48d2-a2d7-a340763343f8.png?1783907532",
          "art_crop": "https://cards.scryfall.io/art_crop/front/a/5/a505ba37-b131-48d2-a2d7-a340763343f8.jpg?1783907532",
          "border_crop": "https://cards.scryfall.io/border_crop/front/a/5/a505ba37-b131-48d2-a2d7-a340763343f8.jpg?1783907532",
          "thumb": "https://cards.scryfall.io/thumb/front/a/5/a505ba37-b131-48d2-a2d7-a340763343f8.webp?1783907532",
          "grid": "https://cards.scryfall.io/grid/front/a/5/a505ba37-b131-48d2-a2d7-a340763343f8.webp?1783907532",
          "display": "https://cards.scryfall.io/display/front/a/5/a505ba37-b131-48d2-a2d7-a340763343f8.webp?1783907532",
          "art": "https://cards.scryfall.io/art/front/a/5/a505ba37-b131-48d2-a2d7-a340763343f8.webp?1783907532",
          "crop": "https://cards.scryfall.io/crop/front/a/5/a505ba37-b131-48d2-a2d7-a340763343f8.webp?1783907532",
          "jpeg": "https://cards.scryfall.io/normal/front/a/5/a505ba37-b131-48d2-a2d7-a340763343f8.jpg?1783907532"
        },
        "mana_cost": "",
        "cmc": 0,
        "type_line": "Land",
        "oracle_text": "When you play this land for the first time, its name forever becomes a creature type and a noncreature card type of your choice belonging to your first name. (For example, Gavin's Dragon and Sorceries. Make sure to fill in the name so everyone knows where they're shopping.)\n{T}: Add {C}.\n{T}: Add one mana of any color. Spend this mana only to cast spells of the chosen types or spells whose names begin with the first letter of your name.",
        "colors": [],
        "color_identity": [],
        "keywords": [],
        "produced_mana": [
          "B",
          "C",
          "G",
          "R",
          "U",
          "W"
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "not_legal",
          "timeless": "not_legal",
          "gladiator": "not_legal",
          "pioneer": "not_legal",
          "modern": "not_legal",
          "legacy": "not_legal",
          "pauper": "not_legal",
          "vintage": "not_legal",
          "penny": "not_legal",
          "commander": "not_legal",
          "oathbreaker": "not_legal",
          "standardbrawl": "not_legal",
          "brawl": "not_legal",
          "competitivebrawl": "not_legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "not_legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "not_legal"
        },
        "games": [
          "paper"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": false,
        "nonfoil": true,
        "finishes": [
          "nonfoil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": false,
        "variation": false,
        "set_id": "d2703c4f-66b6-438d-9368-ebb55aa12e78",
        "set": "unk",
        "set_name": "Unknown Event",
        "set_type": "funny",
        "set_uri": "https://api.scryfall.com/sets/d2703c4f-66b6-438d-9368-ebb55aa12e78",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Aunk&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/unk?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/a505ba37-b131-48d2-a2d7-a340763343f8/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A571ccaf0-d2a0-46d3-af4b-14245a9a79ff&unique=prints",
        "collector_number": "RL01c",
        "digital": false,
        "rarity": "rare",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "",
        "border_color": "black",
        "frame": "2015",
        "full_art": false,
        "textless": false,
        "booster": false,
        "story_spotlight": false,
        "promo_types": [
          "playtest"
        ],
        "prices": {
          "usd": null,
          "usd_foil": null,
          "usd_etched": null,
          "eur": null,
          "eur_foil": null,
          "tix": null
        },
        "related_uris": {
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3D______",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3D______",
          "edhrec": "https://edhrec.com/route/?cc=______"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F650158%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products/Search?referrer=scryfall&searchString=______&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards?affiliate_id=scryfall&data%5Bsearch%5D=______&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "absolute virtue (::en)": {
        "object": "card",
        "id": "aa192912-c9ee-403f-8a46-a338c9edb4b9",
        "oracle_id": "d4fddf20-6b3a-42c3-a245-002dacbb4725",
        "multiverse_ids": [],
        "resource_id": "D51B5891DE143EA8E0D5946123CFF67AA8BA2479A2C02AD80F3BA47697E94F3C",
        "mtgo_id": 141371,
        "arena_id": 96080,
        "tcgplayer_id": 630988,
        "cardmarket_id": 824156,
        "name": "Absolute Virtue",
        "lang": "en",
        "released_at": "2025-06-13",
        "uri": "https://api.scryfall.com/cards/aa192912-c9ee-403f-8a46-a338c9edb4b9",
        "scryfall_uri": "https://scryfall.com/card/fin/212/absolute-virtue?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T01:36:16Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/a/a/aa192912-c9ee-403f-8a46-a338c9edb4b9.jpg?1783906576",
          "normal": "https://cards.scryfall.io/normal/front/a/a/aa192912-c9ee-403f-8a46-a338c9edb4b9.jpg?1783906576",
          "large": "https://cards.scryfall.io/large/front/a/a/aa192912-c9ee-403f-8a46-a338c9edb4b9.jpg?1783906576",
          "png": "https://cards.scryfall.io/png/front/a/a/aa192912-c9ee-403f-8a46-a338c9edb4b9.png?1783906576",
          "art_crop": "https://cards.scryfall.io/art_crop/front/a/a/aa192912-c9ee-403f-8a46-a338c9edb4b9.jpg?1783906576",
          "border_crop": "https://cards.scryfall.io/border_crop/front/a/a/aa192912-c9ee-403f-8a46-a338c9edb4b9.jpg?1783906576",
          "thumb": "https://cards.scryfall.io/thumb/front/a/a/aa192912-c9ee-403f-8a46-a338c9edb4b9.webp?1783906576",
          "grid": "https://cards.scryfall.io/grid/front/a/a/aa192912-c9ee-403f-8a46-a338c9edb4b9.webp?1783906576",
          "display": "https://cards.scryfall.io/display/front/a/a/aa192912-c9ee-403f-8a46-a338c9edb4b9.webp?1783906576",
          "art": "https://cards.scryfall.io/art/front/a/a/aa192912-c9ee-403f-8a46-a338c9edb4b9.webp?1783906576",
          "crop": "https://cards.scryfall.io/crop/front/a/a/aa192912-c9ee-403f-8a46-a338c9edb4b9.webp?1783906576",
          "jpeg": "https://cards.scryfall.io/normal/front/a/a/aa192912-c9ee-403f-8a46-a338c9edb4b9.jpg?1783906576"
        },
        "mana_cost": "{6}{W}{U}",
        "cmc": 8,
        "type_line": "Legendary Creature \u2014 Avatar Warrior",
        "oracle_text": "This spell can't be countered.\nFlying\nYou have protection from each of your opponents. (You can't be dealt damage, enchanted, or targeted by anything controlled by your opponents.)",
        "power": "8",
        "toughness": "8",
        "colors": [
          "U",
          "W"
        ],
        "color_identity": [
          "U",
          "W"
        ],
        "keywords": [
          "Flying"
        ],
        "legalities": {
          "standard": "legal",
          "future": "legal",
          "historic": "legal",
          "timeless": "legal",
          "gladiator": "legal",
          "pioneer": "legal",
          "modern": "legal",
          "legacy": "legal",
          "pauper": "not_legal",
          "vintage": "legal",
          "penny": "legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "legal",
          "brawl": "legal",
          "competitivebrawl": "legal",
          "alchemy": "legal",
          "paupercommander": "not_legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "not_legal"
        },
        "games": [
          "paper",
          "arena",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": false,
        "variation": false,
        "set_id": "d7beb4b7-e1ff-4d35-ab07-5700f17ea1ea",
        "set": "fin",
        "set_name": "Final Fantasy",
        "set_type": "expansion",
        "set_uri": "https://api.scryfall.com/sets/d7beb4b7-e1ff-4d35-ab07-5700f17ea1ea",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Afin&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/fin?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/aa192912-c9ee-403f-8a46-a338c9edb4b9/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3Ad4fddf20-6b3a-42c3-a245-002dacbb4725&unique=prints",
        "collector_number": "212",
        "digital": false,
        "rarity": "mythic",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Toni Infante",
        "artist_ids": [
          "958bbc4a-3420-439a-b261-c988b8e4b580"
        ],
        "illustration_id": "64707873-239f-4862-ba84-fcd3ecada763",
        "border_color": "black",
        "frame": "2015",
        "frame_effects": [
          "legendary"
        ],
        "security_stamp": "triangle",
        "full_art": false,
        "textless": false,
        "booster": true,
        "story_spotlight": false,
        "promo_types": [
          "universesbeyond",
          "ffxi"
        ],
        "edhrec_rank": 4289,
        "penny_rank": 4545,
        "prices": {
          "usd": "6.65",
          "usd_foil": "8.42",
          "usd_etched": null,
          "eur": "4.37",
          "eur_foil": "6.05",
          "tix": "0.03"
        },
        "related_uris": {
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DAbsolute%2BVirtue",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DAbsolute%2BVirtue",
          "edhrec": "https://edhrec.com/route/?cc=Absolute+Virtue"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F630988%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=824156&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/141371?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "ach hans run (::en)": {
        "object": "card",
        "id": "84f2c8f5-8e11-4639-b7de-00e4a2cbabee",
        "oracle_id": "a2c5ee76-6084-413c-bb70-45490d818374",
        "multiverse_ids": [
          73935
        ],
        "tcgplayer_id": 37816,
        "cardmarket_id": 14879,
        "name": '"Ach! Hans, Run!"',
        "lang": "en",
        "released_at": "2004-11-19",
        "uri": "https://api.scryfall.com/cards/84f2c8f5-8e11-4639-b7de-00e4a2cbabee",
        "scryfall_uri": "https://scryfall.com/card/unh/116/ach!-hans-run!?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T12:03:54Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/8/4/84f2c8f5-8e11-4639-b7de-00e4a2cbabee.jpg?1783944234",
          "normal": "https://cards.scryfall.io/normal/front/8/4/84f2c8f5-8e11-4639-b7de-00e4a2cbabee.jpg?1783944234",
          "large": "https://cards.scryfall.io/large/front/8/4/84f2c8f5-8e11-4639-b7de-00e4a2cbabee.jpg?1783944234",
          "png": "https://cards.scryfall.io/png/front/8/4/84f2c8f5-8e11-4639-b7de-00e4a2cbabee.png?1783944234",
          "art_crop": "https://cards.scryfall.io/art_crop/front/8/4/84f2c8f5-8e11-4639-b7de-00e4a2cbabee.jpg?1783944234",
          "border_crop": "https://cards.scryfall.io/border_crop/front/8/4/84f2c8f5-8e11-4639-b7de-00e4a2cbabee.jpg?1783944234",
          "thumb": "https://cards.scryfall.io/thumb/front/8/4/84f2c8f5-8e11-4639-b7de-00e4a2cbabee.webp?1783944234",
          "grid": "https://cards.scryfall.io/grid/front/8/4/84f2c8f5-8e11-4639-b7de-00e4a2cbabee.webp?1783944234",
          "display": "https://cards.scryfall.io/display/front/8/4/84f2c8f5-8e11-4639-b7de-00e4a2cbabee.webp?1783944234",
          "art": "https://cards.scryfall.io/art/front/8/4/84f2c8f5-8e11-4639-b7de-00e4a2cbabee.webp?1783944234",
          "crop": "https://cards.scryfall.io/crop/front/8/4/84f2c8f5-8e11-4639-b7de-00e4a2cbabee.webp?1783944234",
          "jpeg": "https://cards.scryfall.io/normal/front/8/4/84f2c8f5-8e11-4639-b7de-00e4a2cbabee.jpg?1783944234"
        },
        "mana_cost": "{2}{R}{R}{G}{G}",
        "cmc": 6,
        "type_line": "Enchantment",
        "oracle_text": `At the beginning of your upkeep, you may say "Ach! Hans, run! It's the . . ." and the name of a creature card. If you do, search your library for a card with that name, put it onto the battlefield, then shuffle. That creature gains haste. Exile it at the beginning of the next end step.`,
        "colors": [
          "G",
          "R"
        ],
        "color_identity": [
          "G",
          "R"
        ],
        "keywords": [],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "not_legal",
          "timeless": "not_legal",
          "gladiator": "not_legal",
          "pioneer": "not_legal",
          "modern": "not_legal",
          "legacy": "not_legal",
          "pauper": "not_legal",
          "vintage": "not_legal",
          "penny": "not_legal",
          "commander": "not_legal",
          "oathbreaker": "not_legal",
          "standardbrawl": "not_legal",
          "brawl": "not_legal",
          "competitivebrawl": "not_legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "not_legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "not_legal"
        },
        "games": [
          "paper"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": false,
        "variation": false,
        "set_id": "4c8bc76a-05a5-43db-aaf0-34deb347b871",
        "set": "unh",
        "set_name": "Unhinged",
        "set_type": "funny",
        "set_uri": "https://api.scryfall.com/sets/4c8bc76a-05a5-43db-aaf0-34deb347b871",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Aunh&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/unh?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/84f2c8f5-8e11-4639-b7de-00e4a2cbabee/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3Aa2c5ee76-6084-413c-bb70-45490d818374&unique=prints",
        "collector_number": "116",
        "digital": false,
        "rarity": "rare",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Quinton Hoover",
        "artist_ids": [
          "1a2db619-92a5-431a-822b-101cdcc5bd5d"
        ],
        "illustration_id": "be49af2a-e561-49d6-b21f-4f3bf451f11b",
        "border_color": "silver",
        "frame": "2003",
        "full_art": false,
        "textless": false,
        "booster": true,
        "story_spotlight": false,
        "prices": {
          "usd": "3.75",
          "usd_foil": "29.31",
          "usd_etched": null,
          "eur": "2.81",
          "eur_foil": "25.79",
          "tix": null
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=73935&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3D%2522Ach%2521%2BHans%252C%2BRun%2521%2522",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3D%2522Ach%2521%2BHans%252C%2BRun%2521%2522",
          "edhrec": "https://edhrec.com/route/?cc=%22Ach%21+Hans%2C+Run%21%22"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F37816%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=14879&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards?affiliate_id=scryfall&data%5Bsearch%5D=%22Ach%21+Hans%2C+Run%21%22&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "aclazotz deepest betrayal (::en)": {
        "object": "card",
        "id": "627c392c-4d18-4eb2-a4e8-c668f61f5487",
        "oracle_id": "fcdfe9d5-2743-4d3e-ab57-bf0f96beaa15",
        "multiverse_ids": [
          636791,
          636792
        ],
        "mtgo_id": 117978,
        "arena_id": 87231,
        "tcgplayer_id": 524352,
        "cardmarket_id": 741095,
        "name": "Aclazotz, Deepest Betrayal // Temple of the Dead",
        "lang": "en",
        "released_at": "2023-11-17",
        "uri": "https://api.scryfall.com/cards/627c392c-4d18-4eb2-a4e8-c668f61f5487",
        "scryfall_uri": "https://scryfall.com/card/lci/88/aclazotz-deepest-betrayal-temple-of-the-dead?utm_source=api",
        "layout": "transform",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T03:36:29Z",
        "cmc": 5,
        "type_line": "Legendary Creature \u2014 Bat God // Land",
        "color_identity": [
          "B"
        ],
        "keywords": [
          "Flying",
          "Lifelink",
          "Transform"
        ],
        "produced_mana": [
          "B"
        ],
        "card_faces": [
          {
            "object": "card_face",
            "name": "Aclazotz, Deepest Betrayal",
            "mana_cost": "{3}{B}{B}",
            "type_line": "Legendary Creature \u2014 Bat God",
            "oracle_text": "Flying, lifelink\nWhenever Aclazotz attacks, each opponent discards a card. For each opponent who can't, you draw a card.\nWhenever an opponent discards a land card, create a 1/1 black Bat creature token with flying.\nWhen Aclazotz dies, return it to the battlefield tapped and transformed under its owner's control.",
            "colors": [
              "B"
            ],
            "power": "4",
            "toughness": "4",
            "artist": "Steve Prescott",
            "artist_id": "a1139fb8-41f5-4a9e-9a74-f662e1a23b35",
            "illustration_id": "d17519eb-412f-4b92-81ea-f93893e35c18",
            "image_uris": {
              "small": "https://cards.scryfall.io/small/front/6/2/627c392c-4d18-4eb2-a4e8-c668f61f5487.jpg?1783913789",
              "normal": "https://cards.scryfall.io/normal/front/6/2/627c392c-4d18-4eb2-a4e8-c668f61f5487.jpg?1783913789",
              "large": "https://cards.scryfall.io/large/front/6/2/627c392c-4d18-4eb2-a4e8-c668f61f5487.jpg?1783913789",
              "png": "https://cards.scryfall.io/png/front/6/2/627c392c-4d18-4eb2-a4e8-c668f61f5487.png?1783913789",
              "art_crop": "https://cards.scryfall.io/art_crop/front/6/2/627c392c-4d18-4eb2-a4e8-c668f61f5487.jpg?1783913789",
              "border_crop": "https://cards.scryfall.io/border_crop/front/6/2/627c392c-4d18-4eb2-a4e8-c668f61f5487.jpg?1783913789",
              "thumb": "https://cards.scryfall.io/thumb/front/6/2/627c392c-4d18-4eb2-a4e8-c668f61f5487.webp?1783913789",
              "grid": "https://cards.scryfall.io/grid/front/6/2/627c392c-4d18-4eb2-a4e8-c668f61f5487.webp?1783913789",
              "display": "https://cards.scryfall.io/display/front/6/2/627c392c-4d18-4eb2-a4e8-c668f61f5487.webp?1783913789",
              "art": "https://cards.scryfall.io/art/front/6/2/627c392c-4d18-4eb2-a4e8-c668f61f5487.webp?1783913789",
              "crop": "https://cards.scryfall.io/crop/front/6/2/627c392c-4d18-4eb2-a4e8-c668f61f5487.webp?1783913789",
              "jpeg": "https://cards.scryfall.io/normal/front/6/2/627c392c-4d18-4eb2-a4e8-c668f61f5487.jpg?1783913789"
            }
          },
          {
            "object": "card_face",
            "name": "Temple of the Dead",
            "mana_cost": "",
            "type_line": "Land",
            "oracle_text": "(Transforms from Aclazotz, Deepest Betrayal.)\n{T}: Add {B}.\n{2}{B}, {T}: Transform this land. Activate only if a player has one or fewer cards in hand and only as a sorcery.",
            "colors": [],
            "flavor_text": "Chimil gave the Oltec peace in death. Aclazotz ripped it away.",
            "artist": "Steve Prescott",
            "artist_id": "a1139fb8-41f5-4a9e-9a74-f662e1a23b35",
            "illustration_id": "8febd932-8ada-4e95-9868-dbc98d17ff54",
            "image_uris": {
              "small": "https://cards.scryfall.io/small/back/6/2/627c392c-4d18-4eb2-a4e8-c668f61f5487.jpg?1783913789",
              "normal": "https://cards.scryfall.io/normal/back/6/2/627c392c-4d18-4eb2-a4e8-c668f61f5487.jpg?1783913789",
              "large": "https://cards.scryfall.io/large/back/6/2/627c392c-4d18-4eb2-a4e8-c668f61f5487.jpg?1783913789",
              "png": "https://cards.scryfall.io/png/back/6/2/627c392c-4d18-4eb2-a4e8-c668f61f5487.png?1783913789",
              "art_crop": "https://cards.scryfall.io/art_crop/back/6/2/627c392c-4d18-4eb2-a4e8-c668f61f5487.jpg?1783913789",
              "border_crop": "https://cards.scryfall.io/border_crop/back/6/2/627c392c-4d18-4eb2-a4e8-c668f61f5487.jpg?1783913789",
              "thumb": "https://cards.scryfall.io/thumb/back/6/2/627c392c-4d18-4eb2-a4e8-c668f61f5487.webp?1783913789",
              "grid": "https://cards.scryfall.io/grid/back/6/2/627c392c-4d18-4eb2-a4e8-c668f61f5487.webp?1783913789",
              "display": "https://cards.scryfall.io/display/back/6/2/627c392c-4d18-4eb2-a4e8-c668f61f5487.webp?1783913789",
              "art": "https://cards.scryfall.io/art/back/6/2/627c392c-4d18-4eb2-a4e8-c668f61f5487.webp?1783913789",
              "crop": "https://cards.scryfall.io/crop/back/6/2/627c392c-4d18-4eb2-a4e8-c668f61f5487.webp?1783913789",
              "jpeg": "https://cards.scryfall.io/normal/back/6/2/627c392c-4d18-4eb2-a4e8-c668f61f5487.jpg?1783913789"
            }
          }
        ],
        "all_parts": [
          {
            "object": "related_card",
            "id": "95775b13-2761-424e-9828-2275ec987368",
            "component": "combo_piece",
            "name": "Aclazotz, Deepest Betrayal // Temple of the Dead",
            "type_line": "Legendary Creature \u2014 Bat God // Land",
            "uri": "https://api.scryfall.com/cards/95775b13-2761-424e-9828-2275ec987368"
          },
          {
            "object": "related_card",
            "id": "00841e4b-0995-4fb5-93d6-e177beba4934",
            "component": "token",
            "name": "Bat",
            "type_line": "Token Creature \u2014 Bat",
            "uri": "https://api.scryfall.com/cards/00841e4b-0995-4fb5-93d6-e177beba4934"
          }
        ],
        "legalities": {
          "standard": "legal",
          "future": "legal",
          "historic": "legal",
          "timeless": "legal",
          "gladiator": "legal",
          "pioneer": "legal",
          "modern": "legal",
          "legacy": "legal",
          "pauper": "not_legal",
          "vintage": "legal",
          "penny": "legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "legal",
          "brawl": "legal",
          "competitivebrawl": "legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "not_legal"
        },
        "games": [
          "paper",
          "arena",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": false,
        "variation": false,
        "set_id": "70169a6e-89d1-4a3a-aef7-3152958d55ac",
        "set": "lci",
        "set_name": "The Lost Caverns of Ixalan",
        "set_type": "expansion",
        "set_uri": "https://api.scryfall.com/sets/70169a6e-89d1-4a3a-aef7-3152958d55ac",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Alci&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/lci?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/627c392c-4d18-4eb2-a4e8-c668f61f5487/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3Afcdfe9d5-2743-4d3e-ab57-bf0f96beaa15&unique=prints",
        "collector_number": "88",
        "digital": false,
        "rarity": "mythic",
        "artist": "Steve Prescott",
        "artist_ids": [
          "a1139fb8-41f5-4a9e-9a74-f662e1a23b35"
        ],
        "border_color": "black",
        "frame": "2015",
        "frame_effects": [
          "legendary"
        ],
        "security_stamp": "oval",
        "full_art": false,
        "textless": false,
        "booster": true,
        "story_spotlight": false,
        "edhrec_rank": 2591,
        "penny_rank": 1821,
        "preview": {
          "source": "RTGame",
          "source_uri": "https://vxtwitter.com/RTGameCrowd/status/1717146692363940120",
          "previewed_at": "2023-10-25"
        },
        "prices": {
          "usd": "9.33",
          "usd_foil": "11.59",
          "usd_etched": null,
          "eur": "7.18",
          "eur_foil": "8.48",
          "tix": "0.03"
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=636791&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DAclazotz%252C%2BDeepest%2BBetrayal%2B%252F%252F%2BTemple%2Bof%2Bthe%2BDead",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DAclazotz%252C%2BDeepest%2BBetrayal%2B%252F%252F%2BTemple%2Bof%2Bthe%2BDead",
          "edhrec": "https://edhrec.com/route/?cc=Aclazotz%2C+Deepest+Betrayal"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F524352%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=741095&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/117978?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "advantageous proclamation (::en)": {
        "object": "card",
        "id": "f8c37fe8-43b3-454e-a70b-5b0d0f396a33",
        "oracle_id": "86373537-7424-416a-8d89-cc38f6538458",
        "multiverse_ids": [
          382206
        ],
        "tcgplayer_id": 83144,
        "cardmarket_id": 267042,
        "name": "Advantageous Proclamation",
        "lang": "en",
        "released_at": "2014-06-06",
        "uri": "https://api.scryfall.com/cards/f8c37fe8-43b3-454e-a70b-5b0d0f396a33",
        "scryfall_uri": "https://scryfall.com/card/cns/1/advantageous-proclamation?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T10:43:01Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/f/8/f8c37fe8-43b3-454e-a70b-5b0d0f396a33.jpg?1783939381",
          "normal": "https://cards.scryfall.io/normal/front/f/8/f8c37fe8-43b3-454e-a70b-5b0d0f396a33.jpg?1783939381",
          "large": "https://cards.scryfall.io/large/front/f/8/f8c37fe8-43b3-454e-a70b-5b0d0f396a33.jpg?1783939381",
          "png": "https://cards.scryfall.io/png/front/f/8/f8c37fe8-43b3-454e-a70b-5b0d0f396a33.png?1783939381",
          "art_crop": "https://cards.scryfall.io/art_crop/front/f/8/f8c37fe8-43b3-454e-a70b-5b0d0f396a33.jpg?1783939381",
          "border_crop": "https://cards.scryfall.io/border_crop/front/f/8/f8c37fe8-43b3-454e-a70b-5b0d0f396a33.jpg?1783939381",
          "thumb": "https://cards.scryfall.io/thumb/front/f/8/f8c37fe8-43b3-454e-a70b-5b0d0f396a33.webp?1783939381",
          "grid": "https://cards.scryfall.io/grid/front/f/8/f8c37fe8-43b3-454e-a70b-5b0d0f396a33.webp?1783939381",
          "display": "https://cards.scryfall.io/display/front/f/8/f8c37fe8-43b3-454e-a70b-5b0d0f396a33.webp?1783939381",
          "art": "https://cards.scryfall.io/art/front/f/8/f8c37fe8-43b3-454e-a70b-5b0d0f396a33.webp?1783939381",
          "crop": "https://cards.scryfall.io/crop/front/f/8/f8c37fe8-43b3-454e-a70b-5b0d0f396a33.webp?1783939381",
          "jpeg": "https://cards.scryfall.io/normal/front/f/8/f8c37fe8-43b3-454e-a70b-5b0d0f396a33.jpg?1783939381"
        },
        "mana_cost": "",
        "cmc": 0,
        "type_line": "Conspiracy",
        "oracle_text": "(Start the game with this conspiracy face up in the command zone.)\nYour minimum deck size is reduced by five.",
        "colors": [],
        "color_identity": [],
        "keywords": [],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "not_legal",
          "timeless": "not_legal",
          "gladiator": "not_legal",
          "pioneer": "not_legal",
          "modern": "not_legal",
          "legacy": "banned",
          "pauper": "not_legal",
          "vintage": "banned",
          "penny": "not_legal",
          "commander": "banned",
          "oathbreaker": "banned",
          "standardbrawl": "not_legal",
          "brawl": "not_legal",
          "competitivebrawl": "not_legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "banned",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "not_legal"
        },
        "games": [
          "paper"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": false,
        "variation": false,
        "set_id": "7d4ebb59-a50b-45b8-8fff-ab70767819a5",
        "set": "cns",
        "set_name": "Conspiracy",
        "set_type": "draft_innovation",
        "set_uri": "https://api.scryfall.com/sets/7d4ebb59-a50b-45b8-8fff-ab70767819a5",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Acns&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/cns?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/f8c37fe8-43b3-454e-a70b-5b0d0f396a33/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A86373537-7424-416a-8d89-cc38f6538458&unique=prints",
        "collector_number": "1",
        "digital": false,
        "rarity": "uncommon",
        "watermark": "conspiracy",
        "flavor_text": `"The beneficent council deems you worthy of favor. They hope this doesn't provoke envy from your peers."`,
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Izzy",
        "artist_ids": [
          "2c3d2473-ff5d-4309-8194-e0b2def2ab65"
        ],
        "illustration_id": "e6eb64bb-a1ce-4db2-b13b-5e9505dd197d",
        "border_color": "black",
        "frame": "2003",
        "full_art": false,
        "textless": false,
        "booster": true,
        "story_spotlight": false,
        "prices": {
          "usd": "0.20",
          "usd_foil": "0.72",
          "usd_etched": null,
          "eur": "0.19",
          "eur_foil": "0.87",
          "tix": null
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=382206&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DAdvantageous%2BProclamation",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DAdvantageous%2BProclamation",
          "edhrec": "https://edhrec.com/route/?cc=Advantageous+Proclamation"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F83144%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=267042&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards?affiliate_id=scryfall&data%5Bsearch%5D=Advantageous+Proclamation&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "aetherflux reservoir (::en)": {
        "object": "card",
        "id": "96b6b2e1-c3e6-464c-8a13-b15deb34e862",
        "oracle_id": "5f15125e-ae89-471e-b055-226a783bc7c1",
        "multiverse_ids": [
          417765
        ],
        "mtgo_id": 61805,
        "mtgo_foil_id": 61806,
        "tcgplayer_id": 122709,
        "cardmarket_id": 292548,
        "name": "Aetherflux Reservoir",
        "lang": "en",
        "released_at": "2016-09-30",
        "uri": "https://api.scryfall.com/cards/96b6b2e1-c3e6-464c-8a13-b15deb34e862",
        "scryfall_uri": "https://scryfall.com/card/kld/192/aetherflux-reservoir?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T10:06:04Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/9/6/96b6b2e1-c3e6-464c-8a13-b15deb34e862.jpg?1783937164",
          "normal": "https://cards.scryfall.io/normal/front/9/6/96b6b2e1-c3e6-464c-8a13-b15deb34e862.jpg?1783937164",
          "large": "https://cards.scryfall.io/large/front/9/6/96b6b2e1-c3e6-464c-8a13-b15deb34e862.jpg?1783937164",
          "png": "https://cards.scryfall.io/png/front/9/6/96b6b2e1-c3e6-464c-8a13-b15deb34e862.png?1783937164",
          "art_crop": "https://cards.scryfall.io/art_crop/front/9/6/96b6b2e1-c3e6-464c-8a13-b15deb34e862.jpg?1783937164",
          "border_crop": "https://cards.scryfall.io/border_crop/front/9/6/96b6b2e1-c3e6-464c-8a13-b15deb34e862.jpg?1783937164",
          "thumb": "https://cards.scryfall.io/thumb/front/9/6/96b6b2e1-c3e6-464c-8a13-b15deb34e862.webp?1783937164",
          "grid": "https://cards.scryfall.io/grid/front/9/6/96b6b2e1-c3e6-464c-8a13-b15deb34e862.webp?1783937164",
          "display": "https://cards.scryfall.io/display/front/9/6/96b6b2e1-c3e6-464c-8a13-b15deb34e862.webp?1783937164",
          "art": "https://cards.scryfall.io/art/front/9/6/96b6b2e1-c3e6-464c-8a13-b15deb34e862.webp?1783937164",
          "crop": "https://cards.scryfall.io/crop/front/9/6/96b6b2e1-c3e6-464c-8a13-b15deb34e862.webp?1783937164",
          "jpeg": "https://cards.scryfall.io/normal/front/9/6/96b6b2e1-c3e6-464c-8a13-b15deb34e862.jpg?1783937164"
        },
        "mana_cost": "{4}",
        "cmc": 4,
        "type_line": "Artifact",
        "oracle_text": "Whenever you cast a spell, you gain 1 life for each spell you've cast this turn.\nPay 50 life: This artifact deals 50 damage to any target.",
        "colors": [],
        "color_identity": [],
        "keywords": [],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "legal",
          "timeless": "legal",
          "gladiator": "legal",
          "pioneer": "legal",
          "modern": "legal",
          "legacy": "legal",
          "pauper": "not_legal",
          "vintage": "legal",
          "penny": "legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "not_legal",
          "brawl": "legal",
          "competitivebrawl": "legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "not_legal"
        },
        "games": [
          "paper",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": false,
        "variation": false,
        "set_id": "d667e468-be8f-411f-a030-473d148deb74",
        "set": "kld",
        "set_name": "Kaladesh",
        "set_type": "expansion",
        "set_uri": "https://api.scryfall.com/sets/d667e468-be8f-411f-a030-473d148deb74",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Akld&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/kld?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/96b6b2e1-c3e6-464c-8a13-b15deb34e862/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A5f15125e-ae89-471e-b055-226a783bc7c1&unique=prints",
        "collector_number": "192",
        "digital": false,
        "rarity": "rare",
        "flavor_text": "While most power is used for ordinary, everyday tasks, one shouldn't underestimate its potential for the extraordinary.",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Cliff Childs",
        "artist_ids": [
          "ed6f7e03-20ba-4c73-bdda-4a4928480721"
        ],
        "illustration_id": "cd276d68-b400-42ce-b0c1-8b3bddfa490a",
        "border_color": "black",
        "frame": "2015",
        "security_stamp": "oval",
        "full_art": false,
        "textless": false,
        "booster": true,
        "story_spotlight": false,
        "edhrec_rank": 366,
        "penny_rank": 1521,
        "prices": {
          "usd": "20.32",
          "usd_foil": "35.06",
          "usd_etched": null,
          "eur": "15.37",
          "eur_foil": "23.29",
          "tix": "0.02"
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=417765&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DAetherflux%2BReservoir",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DAetherflux%2BReservoir",
          "edhrec": "https://edhrec.com/route/?cc=Aetherflux+Reservoir"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F122709%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=292548&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/61805?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "agyrem (::en)": {
        "object": "card",
        "id": "6caf8b21-1807-442c-a461-c89c7591df70",
        "oracle_id": "38f84e55-049c-441e-b4e2-1e207ab5dbe5",
        "multiverse_ids": [
          423592
        ],
        "tcgplayer_id": 125571,
        "cardmarket_id": 294406,
        "name": "Agyrem",
        "lang": "en",
        "released_at": "2016-11-25",
        "uri": "https://api.scryfall.com/cards/6caf8b21-1807-442c-a461-c89c7591df70",
        "scryfall_uri": "https://scryfall.com/card/opca/11/agyrem?utm_source=api",
        "layout": "planar",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T10:02:05Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/6/c/6caf8b21-1807-442c-a461-c89c7591df70.jpg?1783936925",
          "normal": "https://cards.scryfall.io/normal/front/6/c/6caf8b21-1807-442c-a461-c89c7591df70.jpg?1783936925",
          "large": "https://cards.scryfall.io/large/front/6/c/6caf8b21-1807-442c-a461-c89c7591df70.jpg?1783936925",
          "png": "https://cards.scryfall.io/png/front/6/c/6caf8b21-1807-442c-a461-c89c7591df70.png?1783936925",
          "art_crop": "https://cards.scryfall.io/art_crop/front/6/c/6caf8b21-1807-442c-a461-c89c7591df70.jpg?1783936925",
          "border_crop": "https://cards.scryfall.io/border_crop/front/6/c/6caf8b21-1807-442c-a461-c89c7591df70.jpg?1783936925",
          "thumb": "https://cards.scryfall.io/thumb/front/6/c/6caf8b21-1807-442c-a461-c89c7591df70.webp?1783936925",
          "grid": "https://cards.scryfall.io/grid/front/6/c/6caf8b21-1807-442c-a461-c89c7591df70.webp?1783936925",
          "display": "https://cards.scryfall.io/display/front/6/c/6caf8b21-1807-442c-a461-c89c7591df70.webp?1783936925",
          "art": "https://cards.scryfall.io/art/front/6/c/6caf8b21-1807-442c-a461-c89c7591df70.webp?1783936925",
          "crop": "https://cards.scryfall.io/crop/front/6/c/6caf8b21-1807-442c-a461-c89c7591df70.webp?1783936925",
          "jpeg": "https://cards.scryfall.io/normal/front/6/c/6caf8b21-1807-442c-a461-c89c7591df70.jpg?1783936925"
        },
        "mana_cost": "",
        "cmc": 0,
        "type_line": "Plane \u2014 Ravnica",
        "oracle_text": "Whenever a white creature dies, return it to the battlefield under its owner's control at the beginning of the next end step.\nWhenever a nonwhite creature dies, return it to its owner's hand at the beginning of the next end step.\nWhenever chaos ensues, creatures can't attack you until a player planeswalks.",
        "colors": [],
        "color_identity": [],
        "keywords": [],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "not_legal",
          "timeless": "not_legal",
          "gladiator": "not_legal",
          "pioneer": "not_legal",
          "modern": "not_legal",
          "legacy": "not_legal",
          "pauper": "not_legal",
          "vintage": "not_legal",
          "penny": "not_legal",
          "commander": "not_legal",
          "oathbreaker": "not_legal",
          "standardbrawl": "not_legal",
          "brawl": "not_legal",
          "competitivebrawl": "not_legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "not_legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "not_legal"
        },
        "games": [
          "paper"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": false,
        "nonfoil": true,
        "finishes": [
          "nonfoil"
        ],
        "oversized": true,
        "promo": false,
        "reprint": true,
        "variation": false,
        "set_id": "ada3345c-d416-49bc-92e0-73363ddee5c8",
        "set": "opca",
        "set_name": "Planechase Anthology Planes",
        "set_type": "planechase",
        "set_uri": "https://api.scryfall.com/sets/ada3345c-d416-49bc-92e0-73363ddee5c8",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Aopca&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/opca?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/6caf8b21-1807-442c-a461-c89c7591df70/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A38f84e55-049c-441e-b4e2-1e207ab5dbe5&unique=prints",
        "collector_number": "11",
        "digital": false,
        "rarity": "common",
        "card_back_id": "7840c131-f96b-4700-9347-2215c43156e6",
        "artist": "Todd Lockwood",
        "artist_ids": [
          "d0b9f3cc-13fb-42b6-bc43-b034728e5c7b"
        ],
        "illustration_id": "995f5b3f-7988-4eb5-9335-284f5c3a1e10",
        "border_color": "black",
        "frame": "2015",
        "full_art": false,
        "textless": false,
        "booster": false,
        "story_spotlight": false,
        "prices": {
          "usd": "4.97",
          "usd_foil": null,
          "usd_etched": null,
          "eur": "4.46",
          "eur_foil": null,
          "tix": null
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=423592&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DAgyrem",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DAgyrem",
          "edhrec": "https://edhrec.com/route/?cc=Agyrem"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F125571%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=294406&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards?affiliate_id=scryfall&data%5Bsearch%5D=Agyrem&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "akoum (::en)": {
        "object": "card",
        "id": "a1c7f2eb-0654-46f9-ae3d-11efcac837b8",
        "oracle_id": "25650a32-4014-4065-ad01-7357c3ad3995",
        "multiverse_ids": [
          423593
        ],
        "tcgplayer_id": 125572,
        "cardmarket_id": 294407,
        "name": "Akoum",
        "lang": "en",
        "released_at": "2016-11-25",
        "uri": "https://api.scryfall.com/cards/a1c7f2eb-0654-46f9-ae3d-11efcac837b8",
        "scryfall_uri": "https://scryfall.com/card/opca/12/akoum?utm_source=api",
        "layout": "planar",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T10:02:02Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/a/1/a1c7f2eb-0654-46f9-ae3d-11efcac837b8.jpg?1783936922",
          "normal": "https://cards.scryfall.io/normal/front/a/1/a1c7f2eb-0654-46f9-ae3d-11efcac837b8.jpg?1783936922",
          "large": "https://cards.scryfall.io/large/front/a/1/a1c7f2eb-0654-46f9-ae3d-11efcac837b8.jpg?1783936922",
          "png": "https://cards.scryfall.io/png/front/a/1/a1c7f2eb-0654-46f9-ae3d-11efcac837b8.png?1783936922",
          "art_crop": "https://cards.scryfall.io/art_crop/front/a/1/a1c7f2eb-0654-46f9-ae3d-11efcac837b8.jpg?1783936922",
          "border_crop": "https://cards.scryfall.io/border_crop/front/a/1/a1c7f2eb-0654-46f9-ae3d-11efcac837b8.jpg?1783936922",
          "thumb": "https://cards.scryfall.io/thumb/front/a/1/a1c7f2eb-0654-46f9-ae3d-11efcac837b8.webp?1783936922",
          "grid": "https://cards.scryfall.io/grid/front/a/1/a1c7f2eb-0654-46f9-ae3d-11efcac837b8.webp?1783936922",
          "display": "https://cards.scryfall.io/display/front/a/1/a1c7f2eb-0654-46f9-ae3d-11efcac837b8.webp?1783936922",
          "art": "https://cards.scryfall.io/art/front/a/1/a1c7f2eb-0654-46f9-ae3d-11efcac837b8.webp?1783936922",
          "crop": "https://cards.scryfall.io/crop/front/a/1/a1c7f2eb-0654-46f9-ae3d-11efcac837b8.webp?1783936922",
          "jpeg": "https://cards.scryfall.io/normal/front/a/1/a1c7f2eb-0654-46f9-ae3d-11efcac837b8.jpg?1783936922"
        },
        "mana_cost": "",
        "cmc": 0,
        "type_line": "Plane \u2014 Zendikar",
        "oracle_text": "Players may cast enchantment spells as though they had flash.\nWhenever chaos ensues, destroy target creature that isn't enchanted.",
        "colors": [],
        "color_identity": [],
        "keywords": [],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "not_legal",
          "timeless": "not_legal",
          "gladiator": "not_legal",
          "pioneer": "not_legal",
          "modern": "not_legal",
          "legacy": "not_legal",
          "pauper": "not_legal",
          "vintage": "not_legal",
          "penny": "not_legal",
          "commander": "not_legal",
          "oathbreaker": "not_legal",
          "standardbrawl": "not_legal",
          "brawl": "not_legal",
          "competitivebrawl": "not_legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "not_legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "not_legal"
        },
        "games": [
          "paper"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": false,
        "nonfoil": true,
        "finishes": [
          "nonfoil"
        ],
        "oversized": true,
        "promo": false,
        "reprint": true,
        "variation": false,
        "set_id": "ada3345c-d416-49bc-92e0-73363ddee5c8",
        "set": "opca",
        "set_name": "Planechase Anthology Planes",
        "set_type": "planechase",
        "set_uri": "https://api.scryfall.com/sets/ada3345c-d416-49bc-92e0-73363ddee5c8",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Aopca&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/opca?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/a1c7f2eb-0654-46f9-ae3d-11efcac837b8/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A25650a32-4014-4065-ad01-7357c3ad3995&unique=prints",
        "collector_number": "12",
        "digital": false,
        "rarity": "common",
        "card_back_id": "7840c131-f96b-4700-9347-2215c43156e6",
        "artist": "Rob Alexander",
        "artist_ids": [
          "35906871-6c78-4ab2-9ed1-e6792c8efb74"
        ],
        "illustration_id": "0d0681f8-ecba-4289-ac18-2292b9dc9c0b",
        "border_color": "black",
        "frame": "2015",
        "full_art": false,
        "textless": false,
        "booster": false,
        "story_spotlight": false,
        "prices": {
          "usd": "2.82",
          "usd_foil": null,
          "usd_etched": null,
          "eur": "1.40",
          "eur_foil": null,
          "tix": null
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=423593&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DAkoum",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DAkoum",
          "edhrec": "https://edhrec.com/route/?cc=Akoum"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F125572%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=294407&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards?affiliate_id=scryfall&data%5Bsearch%5D=Akoum&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "alisaie leveilleur (::en)": {
        "object": "card",
        "id": "ba96f831-02cb-4a74-a2e4-7f76444e3cd7",
        "oracle_id": "4bd1d079-314e-4fb5-9b43-c9c83e5528bc",
        "multiverse_ids": [],
        "resource_id": "46F206628794EB04D87DBDDD9F297F30F4020CA60778C36E2E64BA0DFE8133AE",
        "mtgo_id": 140009,
        "tcgplayer_id": 631095,
        "cardmarket_id": 824497,
        "name": "Alisaie Leveilleur",
        "lang": "en",
        "released_at": "2025-06-13",
        "uri": "https://api.scryfall.com/cards/ba96f831-02cb-4a74-a2e4-7f76444e3cd7",
        "scryfall_uri": "https://scryfall.com/card/fic/9/alisaie-leveilleur?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T01:32:51Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/b/a/ba96f831-02cb-4a74-a2e4-7f76444e3cd7.jpg?1783906371",
          "normal": "https://cards.scryfall.io/normal/front/b/a/ba96f831-02cb-4a74-a2e4-7f76444e3cd7.jpg?1783906371",
          "large": "https://cards.scryfall.io/large/front/b/a/ba96f831-02cb-4a74-a2e4-7f76444e3cd7.jpg?1783906371",
          "png": "https://cards.scryfall.io/png/front/b/a/ba96f831-02cb-4a74-a2e4-7f76444e3cd7.png?1783906371",
          "art_crop": "https://cards.scryfall.io/art_crop/front/b/a/ba96f831-02cb-4a74-a2e4-7f76444e3cd7.jpg?1783906371",
          "border_crop": "https://cards.scryfall.io/border_crop/front/b/a/ba96f831-02cb-4a74-a2e4-7f76444e3cd7.jpg?1783906371",
          "thumb": "https://cards.scryfall.io/thumb/front/b/a/ba96f831-02cb-4a74-a2e4-7f76444e3cd7.webp?1783906371",
          "grid": "https://cards.scryfall.io/grid/front/b/a/ba96f831-02cb-4a74-a2e4-7f76444e3cd7.webp?1783906371",
          "display": "https://cards.scryfall.io/display/front/b/a/ba96f831-02cb-4a74-a2e4-7f76444e3cd7.webp?1783906371",
          "art": "https://cards.scryfall.io/art/front/b/a/ba96f831-02cb-4a74-a2e4-7f76444e3cd7.webp?1783906371",
          "crop": "https://cards.scryfall.io/crop/front/b/a/ba96f831-02cb-4a74-a2e4-7f76444e3cd7.webp?1783906371",
          "jpeg": "https://cards.scryfall.io/normal/front/b/a/ba96f831-02cb-4a74-a2e4-7f76444e3cd7.jpg?1783906371"
        },
        "mana_cost": "{2}{W}",
        "cmc": 3,
        "type_line": "Legendary Creature \u2014 Elf Wizard",
        "oracle_text": "Partner with Alphinaud Leveilleur (When this creature enters, target player may put Alphinaud Leveilleur into their hand from their library, then shuffle.)\nFirst strike\nDualcast \u2014 The second spell you cast each turn costs {2} less to cast.",
        "power": "3",
        "toughness": "2",
        "colors": [
          "W"
        ],
        "color_identity": [
          "W"
        ],
        "keywords": [
          "Dualcast",
          "Partner with",
          "First strike",
          "Partner"
        ],
        "all_parts": [
          {
            "object": "related_card",
            "id": "de9e594c-fe46-4c24-8e64-a5929472453d",
            "component": "combo_piece",
            "name": "Alisaie Leveilleur",
            "type_line": "Legendary Creature \u2014 Elf Wizard",
            "uri": "https://api.scryfall.com/cards/de9e594c-fe46-4c24-8e64-a5929472453d"
          },
          {
            "object": "related_card",
            "id": "37e4ab61-bf18-4f9f-ba78-3e08a21aaf4d",
            "component": "combo_piece",
            "name": "Alphinaud Leveilleur",
            "type_line": "Legendary Creature \u2014 Elf Wizard",
            "uri": "https://api.scryfall.com/cards/37e4ab61-bf18-4f9f-ba78-3e08a21aaf4d"
          }
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "not_legal",
          "timeless": "not_legal",
          "gladiator": "not_legal",
          "pioneer": "not_legal",
          "modern": "not_legal",
          "legacy": "legal",
          "pauper": "not_legal",
          "vintage": "legal",
          "penny": "not_legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "not_legal",
          "brawl": "not_legal",
          "competitivebrawl": "not_legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "legal"
        },
        "games": [
          "paper",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": false,
        "variation": false,
        "set_id": "30659956-4558-4cbf-a65f-34cd00c89579",
        "set": "fic",
        "set_name": "Final Fantasy Commander",
        "set_type": "commander",
        "set_uri": "https://api.scryfall.com/sets/30659956-4558-4cbf-a65f-34cd00c89579",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Afic&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/fic?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/ba96f831-02cb-4a74-a2e4-7f76444e3cd7/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A4bd1d079-314e-4fb5-9b43-c9c83e5528bc&unique=prints",
        "collector_number": "9",
        "digital": false,
        "rarity": "rare",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Justyna Dura",
        "artist_ids": [
          "d2340aef-8ca9-4e0d-864c-6a4e8d5e350a"
        ],
        "illustration_id": "e57158d1-c2c4-432e-8a21-0eac273f8d0b",
        "border_color": "black",
        "frame": "2015",
        "frame_effects": [
          "legendary"
        ],
        "security_stamp": "triangle",
        "full_art": false,
        "textless": false,
        "booster": false,
        "story_spotlight": false,
        "promo_types": [
          "ffxiv",
          "surgefoil",
          "universesbeyond"
        ],
        "edhrec_rank": 3510,
        "prices": {
          "usd": "0.29",
          "usd_foil": null,
          "usd_etched": null,
          "eur": "0.43",
          "eur_foil": null,
          "tix": "1.96"
        },
        "related_uris": {
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DAlisaie%2BLeveilleur",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DAlisaie%2BLeveilleur",
          "edhrec": "https://edhrec.com/route/?cc=Alisaie+Leveilleur"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F631095%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=824497&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/140009?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "alora merry thief (::en)": {
        "object": "card",
        "id": "1c3c779b-d1d8-4b1e-bb06-ed7071a5ec0b",
        "oracle_id": "a26432ff-ae60-454d-a6de-fec3feafa669",
        "multiverse_ids": [
          562938
        ],
        "mtgo_id": 100108,
        "tcgplayer_id": 272652,
        "cardmarket_id": 658455,
        "name": "Alora, Merry Thief",
        "lang": "en",
        "released_at": "2022-06-10",
        "uri": "https://api.scryfall.com/cards/1c3c779b-d1d8-4b1e-bb06-ed7071a5ec0b",
        "scryfall_uri": "https://scryfall.com/card/clb/55/alora-merry-thief?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T06:06:35Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/1/c/1c3c779b-d1d8-4b1e-bb06-ed7071a5ec0b.jpg?1783922795",
          "normal": "https://cards.scryfall.io/normal/front/1/c/1c3c779b-d1d8-4b1e-bb06-ed7071a5ec0b.jpg?1783922795",
          "large": "https://cards.scryfall.io/large/front/1/c/1c3c779b-d1d8-4b1e-bb06-ed7071a5ec0b.jpg?1783922795",
          "png": "https://cards.scryfall.io/png/front/1/c/1c3c779b-d1d8-4b1e-bb06-ed7071a5ec0b.png?1783922795",
          "art_crop": "https://cards.scryfall.io/art_crop/front/1/c/1c3c779b-d1d8-4b1e-bb06-ed7071a5ec0b.jpg?1783922795",
          "border_crop": "https://cards.scryfall.io/border_crop/front/1/c/1c3c779b-d1d8-4b1e-bb06-ed7071a5ec0b.jpg?1783922795",
          "thumb": "https://cards.scryfall.io/thumb/front/1/c/1c3c779b-d1d8-4b1e-bb06-ed7071a5ec0b.webp?1783922795",
          "grid": "https://cards.scryfall.io/grid/front/1/c/1c3c779b-d1d8-4b1e-bb06-ed7071a5ec0b.webp?1783922795",
          "display": "https://cards.scryfall.io/display/front/1/c/1c3c779b-d1d8-4b1e-bb06-ed7071a5ec0b.webp?1783922795",
          "art": "https://cards.scryfall.io/art/front/1/c/1c3c779b-d1d8-4b1e-bb06-ed7071a5ec0b.webp?1783922795",
          "crop": "https://cards.scryfall.io/crop/front/1/c/1c3c779b-d1d8-4b1e-bb06-ed7071a5ec0b.webp?1783922795",
          "jpeg": "https://cards.scryfall.io/normal/front/1/c/1c3c779b-d1d8-4b1e-bb06-ed7071a5ec0b.jpg?1783922795"
        },
        "mana_cost": "{2}{U}",
        "cmc": 3,
        "type_line": "Legendary Creature \u2014 Halfling Rogue",
        "oracle_text": "Whenever you attack, up to one target attacking creature can't be blocked this turn. Return that creature to its owner's hand at the beginning of the next end step.\nChoose a Background (You can have a Background as a second commander.)",
        "power": "3",
        "toughness": "2",
        "colors": [
          "U"
        ],
        "color_identity": [
          "U"
        ],
        "keywords": [
          "Choose a background"
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "not_legal",
          "timeless": "not_legal",
          "gladiator": "not_legal",
          "pioneer": "not_legal",
          "modern": "not_legal",
          "legacy": "legal",
          "pauper": "not_legal",
          "vintage": "legal",
          "penny": "not_legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "not_legal",
          "brawl": "not_legal",
          "competitivebrawl": "not_legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "legal"
        },
        "games": [
          "paper",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": false,
        "variation": false,
        "set_id": "5e4c3fe8-fd57-4b20-ad56-c03790a16cea",
        "set": "clb",
        "set_name": "Commander Legends: Battle for Baldur's Gate",
        "set_type": "draft_innovation",
        "set_uri": "https://api.scryfall.com/sets/5e4c3fe8-fd57-4b20-ad56-c03790a16cea",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Aclb&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/clb?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/1c3c779b-d1d8-4b1e-bb06-ed7071a5ec0b/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3Aa26432ff-ae60-454d-a6de-fec3feafa669&unique=prints",
        "collector_number": "55",
        "digital": false,
        "rarity": "uncommon",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Aaron Miller",
        "artist_ids": [
          "fc021f3d-773a-4706-bbe7-f602324f511f"
        ],
        "illustration_id": "276e4d1b-f903-43f5-aa18-607a56e1bf28",
        "border_color": "black",
        "frame": "2015",
        "frame_effects": [
          "legendary"
        ],
        "full_art": false,
        "textless": false,
        "booster": true,
        "story_spotlight": false,
        "edhrec_rank": 10869,
        "preview": {
          "source": "EDHREC",
          "source_uri": "https://www.youtube.com/watch?v=YV74ZCBsrNM",
          "previewed_at": "2022-05-17"
        },
        "prices": {
          "usd": "0.18",
          "usd_foil": "0.11",
          "usd_etched": null,
          "eur": "0.12",
          "eur_foil": "0.22",
          "tix": "2.57"
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=562938&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DAlora%252C%2BMerry%2BThief",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DAlora%252C%2BMerry%2BThief",
          "edhrec": "https://edhrec.com/route/?cc=Alora%2C+Merry+Thief"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F272652%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=658455&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/100108?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "alphinaud leveilleur (::en)": {
        "object": "card",
        "id": "65331e86-1ff3-45e4-b789-7afec4ca9bd5",
        "oracle_id": "d16783a4-9980-451b-9af0-33866980bc8d",
        "multiverse_ids": [],
        "resource_id": "8ED5BFC2E24578C275464C74C6D39D730857B6FAF8992BDB2DC1859B71F967C9",
        "mtgo_id": 140057,
        "tcgplayer_id": 631140,
        "cardmarket_id": 824552,
        "name": "Alphinaud Leveilleur",
        "lang": "en",
        "released_at": "2025-06-13",
        "uri": "https://api.scryfall.com/cards/65331e86-1ff3-45e4-b789-7afec4ca9bd5",
        "scryfall_uri": "https://scryfall.com/card/fic/33/alphinaud-leveilleur?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T01:32:43Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/6/5/65331e86-1ff3-45e4-b789-7afec4ca9bd5.jpg?1783906363",
          "normal": "https://cards.scryfall.io/normal/front/6/5/65331e86-1ff3-45e4-b789-7afec4ca9bd5.jpg?1783906363",
          "large": "https://cards.scryfall.io/large/front/6/5/65331e86-1ff3-45e4-b789-7afec4ca9bd5.jpg?1783906363",
          "png": "https://cards.scryfall.io/png/front/6/5/65331e86-1ff3-45e4-b789-7afec4ca9bd5.png?1783906363",
          "art_crop": "https://cards.scryfall.io/art_crop/front/6/5/65331e86-1ff3-45e4-b789-7afec4ca9bd5.jpg?1783906363",
          "border_crop": "https://cards.scryfall.io/border_crop/front/6/5/65331e86-1ff3-45e4-b789-7afec4ca9bd5.jpg?1783906363",
          "thumb": "https://cards.scryfall.io/thumb/front/6/5/65331e86-1ff3-45e4-b789-7afec4ca9bd5.webp?1783906363",
          "grid": "https://cards.scryfall.io/grid/front/6/5/65331e86-1ff3-45e4-b789-7afec4ca9bd5.webp?1783906363",
          "display": "https://cards.scryfall.io/display/front/6/5/65331e86-1ff3-45e4-b789-7afec4ca9bd5.webp?1783906363",
          "art": "https://cards.scryfall.io/art/front/6/5/65331e86-1ff3-45e4-b789-7afec4ca9bd5.webp?1783906363",
          "crop": "https://cards.scryfall.io/crop/front/6/5/65331e86-1ff3-45e4-b789-7afec4ca9bd5.webp?1783906363",
          "jpeg": "https://cards.scryfall.io/normal/front/6/5/65331e86-1ff3-45e4-b789-7afec4ca9bd5.jpg?1783906363"
        },
        "mana_cost": "{3}{U}",
        "cmc": 4,
        "type_line": "Legendary Creature \u2014 Elf Wizard",
        "oracle_text": "Partner with Alisaie Leveilleur (When this creature enters, target player may put Alisaie Leveilleur into their hand from their library, then shuffle.)\nVigilance\nEukrasia \u2014 Whenever you cast your second spell each turn, draw a card.",
        "power": "2",
        "toughness": "4",
        "colors": [
          "U"
        ],
        "color_identity": [
          "U"
        ],
        "keywords": [
          "Partner with",
          "Vigilance",
          "Eukrasia",
          "Partner"
        ],
        "all_parts": [
          {
            "object": "related_card",
            "id": "de9e594c-fe46-4c24-8e64-a5929472453d",
            "component": "combo_piece",
            "name": "Alisaie Leveilleur",
            "type_line": "Legendary Creature \u2014 Elf Wizard",
            "uri": "https://api.scryfall.com/cards/de9e594c-fe46-4c24-8e64-a5929472453d"
          },
          {
            "object": "related_card",
            "id": "37e4ab61-bf18-4f9f-ba78-3e08a21aaf4d",
            "component": "combo_piece",
            "name": "Alphinaud Leveilleur",
            "type_line": "Legendary Creature \u2014 Elf Wizard",
            "uri": "https://api.scryfall.com/cards/37e4ab61-bf18-4f9f-ba78-3e08a21aaf4d"
          }
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "not_legal",
          "timeless": "not_legal",
          "gladiator": "not_legal",
          "pioneer": "not_legal",
          "modern": "not_legal",
          "legacy": "legal",
          "pauper": "not_legal",
          "vintage": "legal",
          "penny": "not_legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "not_legal",
          "brawl": "not_legal",
          "competitivebrawl": "not_legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "not_legal"
        },
        "games": [
          "paper",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": false,
        "variation": false,
        "set_id": "30659956-4558-4cbf-a65f-34cd00c89579",
        "set": "fic",
        "set_name": "Final Fantasy Commander",
        "set_type": "commander",
        "set_uri": "https://api.scryfall.com/sets/30659956-4558-4cbf-a65f-34cd00c89579",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Afic&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/fic?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/65331e86-1ff3-45e4-b789-7afec4ca9bd5/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3Ad16783a4-9980-451b-9af0-33866980bc8d&unique=prints",
        "collector_number": "33",
        "digital": false,
        "rarity": "rare",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Justyna Dura",
        "artist_ids": [
          "d2340aef-8ca9-4e0d-864c-6a4e8d5e350a"
        ],
        "illustration_id": "75f4d091-1b2c-46a6-a305-370e1ba491d7",
        "border_color": "black",
        "frame": "2015",
        "frame_effects": [
          "legendary"
        ],
        "security_stamp": "triangle",
        "full_art": false,
        "textless": false,
        "booster": false,
        "story_spotlight": false,
        "promo_types": [
          "ffxiv",
          "surgefoil",
          "universesbeyond"
        ],
        "edhrec_rank": 4054,
        "prices": {
          "usd": "0.32",
          "usd_foil": null,
          "usd_etched": null,
          "eur": "0.43",
          "eur_foil": null,
          "tix": "1.16"
        },
        "related_uris": {
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DAlphinaud%2BLeveilleur",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DAlphinaud%2BLeveilleur",
          "edhrec": "https://edhrec.com/route/?cc=Alphinaud+Leveilleur"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F631140%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=824552&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/140057?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "amy pond (::en)": {
        "object": "card",
        "id": "e50a2faa-91e3-4e89-ba8d-2cbf7ac005c0",
        "oracle_id": "aa7d3e99-fc14-4f62-bf00-c0428c11e4f2",
        "multiverse_ids": [
          634770
        ],
        "tcgplayer_id": 518913,
        "cardmarket_id": 738619,
        "name": "Amy Pond",
        "lang": "en",
        "released_at": "2023-10-13",
        "uri": "https://api.scryfall.com/cards/e50a2faa-91e3-4e89-ba8d-2cbf7ac005c0",
        "scryfall_uri": "https://scryfall.com/card/who/75/amy-pond?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T03:50:55Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/e/5/e50a2faa-91e3-4e89-ba8d-2cbf7ac005c0.jpg?1783914655",
          "normal": "https://cards.scryfall.io/normal/front/e/5/e50a2faa-91e3-4e89-ba8d-2cbf7ac005c0.jpg?1783914655",
          "large": "https://cards.scryfall.io/large/front/e/5/e50a2faa-91e3-4e89-ba8d-2cbf7ac005c0.jpg?1783914655",
          "png": "https://cards.scryfall.io/png/front/e/5/e50a2faa-91e3-4e89-ba8d-2cbf7ac005c0.png?1783914655",
          "art_crop": "https://cards.scryfall.io/art_crop/front/e/5/e50a2faa-91e3-4e89-ba8d-2cbf7ac005c0.jpg?1783914655",
          "border_crop": "https://cards.scryfall.io/border_crop/front/e/5/e50a2faa-91e3-4e89-ba8d-2cbf7ac005c0.jpg?1783914655",
          "thumb": "https://cards.scryfall.io/thumb/front/e/5/e50a2faa-91e3-4e89-ba8d-2cbf7ac005c0.webp?1783914655",
          "grid": "https://cards.scryfall.io/grid/front/e/5/e50a2faa-91e3-4e89-ba8d-2cbf7ac005c0.webp?1783914655",
          "display": "https://cards.scryfall.io/display/front/e/5/e50a2faa-91e3-4e89-ba8d-2cbf7ac005c0.webp?1783914655",
          "art": "https://cards.scryfall.io/art/front/e/5/e50a2faa-91e3-4e89-ba8d-2cbf7ac005c0.webp?1783914655",
          "crop": "https://cards.scryfall.io/crop/front/e/5/e50a2faa-91e3-4e89-ba8d-2cbf7ac005c0.webp?1783914655",
          "jpeg": "https://cards.scryfall.io/normal/front/e/5/e50a2faa-91e3-4e89-ba8d-2cbf7ac005c0.jpg?1783914655"
        },
        "mana_cost": "{2}{R}",
        "cmc": 3,
        "type_line": "Legendary Creature \u2014 Human",
        "oracle_text": "Partner with Rory Williams (When this creature enters, target player may put Rory into their hand from their library, then shuffle.)\nWhenever Amy Pond deals combat damage to a player, choose a suspended card you own and remove that many time counters from it.\nDoctor's companion (You can have two commanders if the other is the Doctor.)",
        "power": "2",
        "toughness": "2",
        "colors": [
          "R"
        ],
        "color_identity": [
          "R"
        ],
        "keywords": [
          "Partner with",
          "Partner",
          "Doctor's companion"
        ],
        "all_parts": [
          {
            "object": "related_card",
            "id": "48dc2162-3350-4fd4-995a-b2080f8fb94e",
            "component": "combo_piece",
            "name": "Rory Williams",
            "type_line": "Legendary Creature \u2014 Human Soldier",
            "uri": "https://api.scryfall.com/cards/48dc2162-3350-4fd4-995a-b2080f8fb94e"
          },
          {
            "object": "related_card",
            "id": "dafb9f82-bccd-4444-8439-b6c872a17589",
            "component": "combo_piece",
            "name": "Amy Pond",
            "type_line": "Legendary Creature \u2014 Human",
            "uri": "https://api.scryfall.com/cards/dafb9f82-bccd-4444-8439-b6c872a17589"
          }
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "not_legal",
          "timeless": "not_legal",
          "gladiator": "not_legal",
          "pioneer": "not_legal",
          "modern": "not_legal",
          "legacy": "legal",
          "pauper": "not_legal",
          "vintage": "legal",
          "penny": "not_legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "not_legal",
          "brawl": "not_legal",
          "competitivebrawl": "not_legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "legal"
        },
        "games": [
          "paper"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": false,
        "variation": false,
        "set_id": "efdfdd99-cee7-4c11-a5e9-03d60f88bdd6",
        "set": "who",
        "set_name": "Doctor Who",
        "set_type": "commander",
        "set_uri": "https://api.scryfall.com/sets/efdfdd99-cee7-4c11-a5e9-03d60f88bdd6",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Awho&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/who?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/e50a2faa-91e3-4e89-ba8d-2cbf7ac005c0/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3Aaa7d3e99-fc14-4f62-bf00-c0428c11e4f2&unique=prints",
        "collector_number": "75",
        "digital": false,
        "rarity": "rare",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Greg Staples",
        "artist_ids": [
          "93d65564-bf00-447b-8406-e2031f03b6b1"
        ],
        "illustration_id": "80aa9b37-49c1-4c67-8002-270a7e4383a0",
        "border_color": "black",
        "frame": "2015",
        "frame_effects": [
          "legendary"
        ],
        "security_stamp": "triangle",
        "full_art": false,
        "textless": false,
        "booster": false,
        "story_spotlight": false,
        "promo_types": [
          "universesbeyond"
        ],
        "edhrec_rank": 13806,
        "preview": {
          "source": "Wizards of the Coast",
          "source_uri": "",
          "previewed_at": "2023-10-03"
        },
        "prices": {
          "usd": "0.33",
          "usd_foil": "0.40",
          "usd_etched": null,
          "eur": "0.19",
          "eur_foil": "0.72",
          "tix": null
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=634770&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DAmy%2BPond",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DAmy%2BPond",
          "edhrec": "https://edhrec.com/route/?cc=Amy+Pond"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F518913%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=738619&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards?affiliate_id=scryfall&data%5Bsearch%5D=Amy+Pond&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "anara wolvid familiar (::en)": {
        "object": "card",
        "id": "9a67cfaa-990c-4dcb-97a9-9c5d7316cabe",
        "oracle_id": "a59ff932-f758-476e-ba31-0623bd748231",
        "multiverse_ids": [
          497734
        ],
        "mtgo_id": 85210,
        "tcgplayer_id": 226943,
        "cardmarket_id": 512035,
        "name": "Anara, Wolvid Familiar",
        "lang": "en",
        "released_at": "2020-11-20",
        "uri": "https://api.scryfall.com/cards/9a67cfaa-990c-4dcb-97a9-9c5d7316cabe",
        "scryfall_uri": "https://scryfall.com/card/cmr/214/anara-wolvid-familiar?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T07:46:41Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/9/a/9a67cfaa-990c-4dcb-97a9-9c5d7316cabe.jpg?1783928801",
          "normal": "https://cards.scryfall.io/normal/front/9/a/9a67cfaa-990c-4dcb-97a9-9c5d7316cabe.jpg?1783928801",
          "large": "https://cards.scryfall.io/large/front/9/a/9a67cfaa-990c-4dcb-97a9-9c5d7316cabe.jpg?1783928801",
          "png": "https://cards.scryfall.io/png/front/9/a/9a67cfaa-990c-4dcb-97a9-9c5d7316cabe.png?1783928801",
          "art_crop": "https://cards.scryfall.io/art_crop/front/9/a/9a67cfaa-990c-4dcb-97a9-9c5d7316cabe.jpg?1783928801",
          "border_crop": "https://cards.scryfall.io/border_crop/front/9/a/9a67cfaa-990c-4dcb-97a9-9c5d7316cabe.jpg?1783928801",
          "thumb": "https://cards.scryfall.io/thumb/front/9/a/9a67cfaa-990c-4dcb-97a9-9c5d7316cabe.webp?1783928801",
          "grid": "https://cards.scryfall.io/grid/front/9/a/9a67cfaa-990c-4dcb-97a9-9c5d7316cabe.webp?1783928801",
          "display": "https://cards.scryfall.io/display/front/9/a/9a67cfaa-990c-4dcb-97a9-9c5d7316cabe.webp?1783928801",
          "art": "https://cards.scryfall.io/art/front/9/a/9a67cfaa-990c-4dcb-97a9-9c5d7316cabe.webp?1783928801",
          "crop": "https://cards.scryfall.io/crop/front/9/a/9a67cfaa-990c-4dcb-97a9-9c5d7316cabe.webp?1783928801",
          "jpeg": "https://cards.scryfall.io/normal/front/9/a/9a67cfaa-990c-4dcb-97a9-9c5d7316cabe.jpg?1783928801"
        },
        "mana_cost": "{3}{G}",
        "cmc": 4,
        "type_line": "Legendary Creature \u2014 Wolf Beast",
        "oracle_text": `During your turn, commanders you control have indestructible. (Effects that say "destroy" don't destroy them. A creature with indestructible can't be destroyed by damage.)
Partner (You can have two commanders if both have partner.)`,
        "power": "4",
        "toughness": "4",
        "colors": [
          "G"
        ],
        "color_identity": [
          "G"
        ],
        "keywords": [
          "Partner"
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "not_legal",
          "timeless": "not_legal",
          "gladiator": "not_legal",
          "pioneer": "not_legal",
          "modern": "not_legal",
          "legacy": "legal",
          "pauper": "not_legal",
          "vintage": "legal",
          "penny": "not_legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "not_legal",
          "brawl": "not_legal",
          "competitivebrawl": "not_legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "not_legal"
        },
        "games": [
          "paper",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": false,
        "variation": false,
        "set_id": "39de6fbf-1f11-48d0-8f04-f0407f6a0732",
        "set": "cmr",
        "set_name": "Commander Legends",
        "set_type": "draft_innovation",
        "set_uri": "https://api.scryfall.com/sets/39de6fbf-1f11-48d0-8f04-f0407f6a0732",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Acmr&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/cmr?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/9a67cfaa-990c-4dcb-97a9-9c5d7316cabe/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3Aa59ff932-f758-476e-ba31-0623bd748231&unique=prints",
        "collector_number": "214",
        "digital": false,
        "rarity": "uncommon",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Jesper Ejsing",
        "artist_ids": [
          "a5f8354a-8b51-4e59-96b2-0e3aeae4fa1d"
        ],
        "illustration_id": "46f96b03-2e40-4af5-97bb-b3a85ee4eee0",
        "border_color": "black",
        "frame": "2015",
        "frame_effects": [
          "legendary"
        ],
        "full_art": false,
        "textless": false,
        "booster": true,
        "story_spotlight": false,
        "edhrec_rank": 4058,
        "preview": {
          "source": "Landfall TV",
          "source_uri": "https://www.youtube.com/watch?v=_hKve80Z2dM",
          "previewed_at": "2020-10-31"
        },
        "prices": {
          "usd": "0.67",
          "usd_foil": "0.77",
          "usd_etched": null,
          "eur": "0.43",
          "eur_foil": "0.60",
          "tix": "0.04"
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=497734&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DAnara%252C%2BWolvid%2BFamiliar",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DAnara%252C%2BWolvid%2BFamiliar",
          "edhrec": "https://edhrec.com/route/?cc=Anara%2C+Wolvid+Familiar"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F226943%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=512035&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/85210?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "angelic captain (::en)": {
        "object": "card",
        "id": "ef0baf56-816a-4e0a-beb3-73b51487ff00",
        "oracle_id": "ffc56a2e-f3bd-493b-9b7b-5f04fad69382",
        "multiverse_ids": [
          401811
        ],
        "mtgo_id": 58575,
        "mtgo_foil_id": 58576,
        "tcgplayer_id": 105365,
        "cardmarket_id": 284751,
        "name": "Angelic Captain",
        "lang": "en",
        "released_at": "2015-10-02",
        "uri": "https://api.scryfall.com/cards/ef0baf56-816a-4e0a-beb3-73b51487ff00",
        "scryfall_uri": "https://scryfall.com/card/bfz/208/angelic-captain?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T10:23:01Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/e/f/ef0baf56-816a-4e0a-beb3-73b51487ff00.jpg?1783938181",
          "normal": "https://cards.scryfall.io/normal/front/e/f/ef0baf56-816a-4e0a-beb3-73b51487ff00.jpg?1783938181",
          "large": "https://cards.scryfall.io/large/front/e/f/ef0baf56-816a-4e0a-beb3-73b51487ff00.jpg?1783938181",
          "png": "https://cards.scryfall.io/png/front/e/f/ef0baf56-816a-4e0a-beb3-73b51487ff00.png?1783938181",
          "art_crop": "https://cards.scryfall.io/art_crop/front/e/f/ef0baf56-816a-4e0a-beb3-73b51487ff00.jpg?1783938181",
          "border_crop": "https://cards.scryfall.io/border_crop/front/e/f/ef0baf56-816a-4e0a-beb3-73b51487ff00.jpg?1783938181",
          "thumb": "https://cards.scryfall.io/thumb/front/e/f/ef0baf56-816a-4e0a-beb3-73b51487ff00.webp?1783938181",
          "grid": "https://cards.scryfall.io/grid/front/e/f/ef0baf56-816a-4e0a-beb3-73b51487ff00.webp?1783938181",
          "display": "https://cards.scryfall.io/display/front/e/f/ef0baf56-816a-4e0a-beb3-73b51487ff00.webp?1783938181",
          "art": "https://cards.scryfall.io/art/front/e/f/ef0baf56-816a-4e0a-beb3-73b51487ff00.webp?1783938181",
          "crop": "https://cards.scryfall.io/crop/front/e/f/ef0baf56-816a-4e0a-beb3-73b51487ff00.webp?1783938181",
          "jpeg": "https://cards.scryfall.io/normal/front/e/f/ef0baf56-816a-4e0a-beb3-73b51487ff00.jpg?1783938181"
        },
        "mana_cost": "{3}{R}{W}",
        "cmc": 5,
        "type_line": "Creature \u2014 Angel Ally",
        "oracle_text": "Flying\nWhenever this creature attacks, it gets +1/+1 until end of turn for each other attacking Ally.",
        "power": "4",
        "toughness": "3",
        "colors": [
          "R",
          "W"
        ],
        "color_identity": [
          "R",
          "W"
        ],
        "keywords": [
          "Flying"
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "not_legal",
          "timeless": "not_legal",
          "gladiator": "not_legal",
          "pioneer": "legal",
          "modern": "legal",
          "legacy": "legal",
          "pauper": "not_legal",
          "vintage": "legal",
          "penny": "legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "not_legal",
          "brawl": "not_legal",
          "competitivebrawl": "not_legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "not_legal"
        },
        "games": [
          "paper",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": false,
        "variation": false,
        "set_id": "91719374-7ac5-4afa-ada8-5da964dcf1d4",
        "set": "bfz",
        "set_name": "Battle for Zendikar",
        "set_type": "expansion",
        "set_uri": "https://api.scryfall.com/sets/91719374-7ac5-4afa-ada8-5da964dcf1d4",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Abfz&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/bfz?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/ef0baf56-816a-4e0a-beb3-73b51487ff00/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3Affc56a2e-f3bd-493b-9b7b-5f04fad69382&unique=prints",
        "collector_number": "208",
        "digital": false,
        "rarity": "rare",
        "flavor_text": "As the soldiers beneath her raised their voices, the angel spread her wings, their span seeming to cover the sky.",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Volkan Ba\u01F5a",
        "artist_ids": [
          "93bec3c0-0260-4d31-8064-5d01efb4153f"
        ],
        "illustration_id": "5ebe6b51-0a58-438c-88ba-8e83c16bea47",
        "border_color": "black",
        "frame": "2015",
        "security_stamp": "oval",
        "full_art": false,
        "textless": false,
        "booster": true,
        "story_spotlight": false,
        "edhrec_rank": 20322,
        "penny_rank": 14691,
        "prices": {
          "usd": "0.29",
          "usd_foil": "0.50",
          "usd_etched": null,
          "eur": "0.16",
          "eur_foil": "0.40",
          "tix": "0.02"
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=401811&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DAngelic%2BCaptain",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DAngelic%2BCaptain",
          "edhrec": "https://edhrec.com/route/?cc=Angelic+Captain"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F105365%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=284751&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/58575?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "arcane signet (::en)": {
        "object": "card",
        "id": "c6b6117c-faab-4bbb-b851-07bd8061ef03",
        "oracle_id": "0bc7f093-bef0-4f1a-852c-4b75ebf54838",
        "multiverse_ids": [],
        "resource_id": "D2DFCEAA62342B3FBC38AD97E940D069C600B9136E5C3A8F7754E79422C49B0D",
        "mtgo_id": 156436,
        "tcgplayer_id": 717785,
        "cardmarket_id": 909813,
        "name": "Arcane Signet",
        "lang": "en",
        "released_at": "2026-10-02",
        "uri": "https://api.scryfall.com/cards/c6b6117c-faab-4bbb-b851-07bd8061ef03",
        "scryfall_uri": "https://scryfall.com/card/frc/20/arcane-signet?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-09-17T11:27:15Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/c/6/c6b6117c-faab-4bbb-b851-07bd8061ef03.jpg?1789644435",
          "normal": "https://cards.scryfall.io/normal/front/c/6/c6b6117c-faab-4bbb-b851-07bd8061ef03.jpg?1789644435",
          "large": "https://cards.scryfall.io/large/front/c/6/c6b6117c-faab-4bbb-b851-07bd8061ef03.jpg?1789644435",
          "png": "https://cards.scryfall.io/png/front/c/6/c6b6117c-faab-4bbb-b851-07bd8061ef03.png?1789644435",
          "art_crop": "https://cards.scryfall.io/art_crop/front/c/6/c6b6117c-faab-4bbb-b851-07bd8061ef03.jpg?1789644435",
          "border_crop": "https://cards.scryfall.io/border_crop/front/c/6/c6b6117c-faab-4bbb-b851-07bd8061ef03.jpg?1789644435",
          "thumb": "https://cards.scryfall.io/thumb/front/c/6/c6b6117c-faab-4bbb-b851-07bd8061ef03.webp?1789644435",
          "grid": "https://cards.scryfall.io/grid/front/c/6/c6b6117c-faab-4bbb-b851-07bd8061ef03.webp?1789644435",
          "display": "https://cards.scryfall.io/display/front/c/6/c6b6117c-faab-4bbb-b851-07bd8061ef03.webp?1789644435",
          "art": "https://cards.scryfall.io/art/front/c/6/c6b6117c-faab-4bbb-b851-07bd8061ef03.webp?1789644435",
          "crop": "https://cards.scryfall.io/crop/front/c/6/c6b6117c-faab-4bbb-b851-07bd8061ef03.webp?1789644435",
          "jpeg": "https://cards.scryfall.io/normal/front/c/6/c6b6117c-faab-4bbb-b851-07bd8061ef03.jpg?1789644435"
        },
        "mana_cost": "{2}",
        "cmc": 2,
        "type_line": "Artifact",
        "oracle_text": "{T}: Add one mana of any color in your commander's color identity.",
        "colors": [],
        "color_identity": [],
        "keywords": [],
        "produced_mana": [
          "B",
          "G",
          "R",
          "U",
          "W"
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "legal",
          "timeless": "legal",
          "gladiator": "legal",
          "pioneer": "legal",
          "modern": "legal",
          "legacy": "legal",
          "pauper": "legal",
          "vintage": "legal",
          "penny": "not_legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "legal",
          "brawl": "legal",
          "competitivebrawl": "legal",
          "alchemy": "legal",
          "paupercommander": "legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "legal"
        },
        "games": [
          "paper",
          "mtgo",
          "arena"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": false,
        "nonfoil": true,
        "finishes": [
          "nonfoil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": true,
        "variation": false,
        "set_id": "cfd10490-7397-4143-bda7-d388b877636f",
        "set": "frc",
        "set_name": "Reality Fracture Commander",
        "set_type": "commander",
        "set_uri": "https://api.scryfall.com/sets/cfd10490-7397-4143-bda7-d388b877636f",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Afrc&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/frc?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/c6b6117c-faab-4bbb-b851-07bd8061ef03/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A0bc7f093-bef0-4f1a-852c-4b75ebf54838&unique=prints",
        "collector_number": "20",
        "digital": false,
        "rarity": "uncommon",
        "flavor_text": '"Everything is in progress . . . just like us. May we always know exactly who we are."\n\u2014Jace, to Tam',
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Josu Solano",
        "artist_ids": [
          "fb7b61a8-13c5-4813-a749-9d3396801906"
        ],
        "illustration_id": "da0f848c-8240-437d-984f-fc8209f91639",
        "border_color": "black",
        "frame": "2015",
        "full_art": false,
        "textless": false,
        "booster": false,
        "story_spotlight": false,
        "edhrec_rank": 3,
        "preview": {
          "source": "Wizards of the Coast",
          "source_uri": "https://youtu.be/mvTyHbTbfBo",
          "previewed_at": "2026-09-16"
        },
        "prices": {
          "usd": "0.85",
          "usd_foil": null,
          "usd_etched": null,
          "eur": "0.41",
          "eur_foil": null,
          "tix": "0.02"
        },
        "related_uris": {
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DArcane%2BSignet",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DArcane%2BSignet",
          "edhrec": "https://edhrec.com/route/?cc=Arcane+Signet"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F717785%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=909813&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/156436?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "armix filigree thrasher (::en)": {
        "object": "card",
        "id": "d5f69e24-6b5c-4a9a-af5b-1ce88efdc0aa",
        "oracle_id": "a1464164-fbda-43b5-988e-6e1da9bd9eef",
        "multiverse_ids": [
          497628
        ],
        "mtgo_id": 84998,
        "tcgplayer_id": 226857,
        "cardmarket_id": 511100,
        "name": "Armix, Filigree Thrasher",
        "lang": "en",
        "released_at": "2020-11-20",
        "uri": "https://api.scryfall.com/cards/d5f69e24-6b5c-4a9a-af5b-1ce88efdc0aa",
        "scryfall_uri": "https://scryfall.com/card/cmr/108/armix-filigree-thrasher?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T07:47:25Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/d/5/d5f69e24-6b5c-4a9a-af5b-1ce88efdc0aa.jpg?1783928845",
          "normal": "https://cards.scryfall.io/normal/front/d/5/d5f69e24-6b5c-4a9a-af5b-1ce88efdc0aa.jpg?1783928845",
          "large": "https://cards.scryfall.io/large/front/d/5/d5f69e24-6b5c-4a9a-af5b-1ce88efdc0aa.jpg?1783928845",
          "png": "https://cards.scryfall.io/png/front/d/5/d5f69e24-6b5c-4a9a-af5b-1ce88efdc0aa.png?1783928845",
          "art_crop": "https://cards.scryfall.io/art_crop/front/d/5/d5f69e24-6b5c-4a9a-af5b-1ce88efdc0aa.jpg?1783928845",
          "border_crop": "https://cards.scryfall.io/border_crop/front/d/5/d5f69e24-6b5c-4a9a-af5b-1ce88efdc0aa.jpg?1783928845",
          "thumb": "https://cards.scryfall.io/thumb/front/d/5/d5f69e24-6b5c-4a9a-af5b-1ce88efdc0aa.webp?1783928845",
          "grid": "https://cards.scryfall.io/grid/front/d/5/d5f69e24-6b5c-4a9a-af5b-1ce88efdc0aa.webp?1783928845",
          "display": "https://cards.scryfall.io/display/front/d/5/d5f69e24-6b5c-4a9a-af5b-1ce88efdc0aa.webp?1783928845",
          "art": "https://cards.scryfall.io/art/front/d/5/d5f69e24-6b5c-4a9a-af5b-1ce88efdc0aa.webp?1783928845",
          "crop": "https://cards.scryfall.io/crop/front/d/5/d5f69e24-6b5c-4a9a-af5b-1ce88efdc0aa.webp?1783928845",
          "jpeg": "https://cards.scryfall.io/normal/front/d/5/d5f69e24-6b5c-4a9a-af5b-1ce88efdc0aa.jpg?1783928845"
        },
        "mana_cost": "{2}{B}",
        "cmc": 3,
        "type_line": "Legendary Artifact Creature \u2014 Golem",
        "oracle_text": "Whenever Armix attacks, you may discard a card. When you do, target creature defending player controls gets -X/-X until end of turn, where X is the number of artifacts you control plus the number of artifact cards in your graveyard.\nPartner (You can have two commanders if both have partner.)",
        "power": "3",
        "toughness": "2",
        "colors": [
          "B"
        ],
        "color_identity": [
          "B"
        ],
        "keywords": [
          "Partner"
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "not_legal",
          "timeless": "not_legal",
          "gladiator": "not_legal",
          "pioneer": "not_legal",
          "modern": "not_legal",
          "legacy": "legal",
          "pauper": "not_legal",
          "vintage": "legal",
          "penny": "not_legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "not_legal",
          "brawl": "not_legal",
          "competitivebrawl": "not_legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "legal"
        },
        "games": [
          "paper",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": false,
        "variation": false,
        "set_id": "39de6fbf-1f11-48d0-8f04-f0407f6a0732",
        "set": "cmr",
        "set_name": "Commander Legends",
        "set_type": "draft_innovation",
        "set_uri": "https://api.scryfall.com/sets/39de6fbf-1f11-48d0-8f04-f0407f6a0732",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Acmr&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/cmr?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/d5f69e24-6b5c-4a9a-af5b-1ce88efdc0aa/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3Aa1464164-fbda-43b5-988e-6e1da9bd9eef&unique=prints",
        "collector_number": "108",
        "digital": false,
        "rarity": "uncommon",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Daniel Ljunggren",
        "artist_ids": [
          "0fbd4798-76eb-46d5-a5d4-1e3a25870e34"
        ],
        "illustration_id": "6ee19a22-bbc2-4d96-a550-39cb2362b0e3",
        "border_color": "black",
        "frame": "2015",
        "frame_effects": [
          "legendary"
        ],
        "full_art": false,
        "textless": false,
        "booster": true,
        "story_spotlight": false,
        "edhrec_rank": 6230,
        "preview": {
          "source": "CMDR Ninety Nine",
          "source_uri": "https://twitter.com/CMDRNinetyNine/status/1322463754605547520",
          "previewed_at": "2020-10-31"
        },
        "prices": {
          "usd": "0.33",
          "usd_foil": "0.27",
          "usd_etched": null,
          "eur": "0.20",
          "eur_foil": "0.33",
          "tix": "0.04"
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=497628&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DArmix%252C%2BFiligree%2BThrasher",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DArmix%252C%2BFiligree%2BThrasher",
          "edhrec": "https://edhrec.com/route/?cc=Armix%2C+Filigree+Thrasher"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F226857%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=511100&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/84998?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "atraxa praetors voice (::en)": {
        "object": "card",
        "id": "d0d33d52-3d28-4635-b985-51e126289259",
        "oracle_id": "7e6b9b59-cd68-4e3c-827b-38833c92d6eb",
        "multiverse_ids": [
          489863
        ],
        "mtgo_id": 82414,
        "tcgplayer_id": 214833,
        "cardmarket_id": 462559,
        "name": "Atraxa, Praetors' Voice",
        "lang": "en",
        "released_at": "2020-08-07",
        "uri": "https://api.scryfall.com/cards/d0d33d52-3d28-4635-b985-51e126289259",
        "scryfall_uri": "https://scryfall.com/card/2xm/190/atraxa-praetors-voice?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T08:08:56Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/d/0/d0d33d52-3d28-4635-b985-51e126289259.jpg?1783930136",
          "normal": "https://cards.scryfall.io/normal/front/d/0/d0d33d52-3d28-4635-b985-51e126289259.jpg?1783930136",
          "large": "https://cards.scryfall.io/large/front/d/0/d0d33d52-3d28-4635-b985-51e126289259.jpg?1783930136",
          "png": "https://cards.scryfall.io/png/front/d/0/d0d33d52-3d28-4635-b985-51e126289259.png?1783930136",
          "art_crop": "https://cards.scryfall.io/art_crop/front/d/0/d0d33d52-3d28-4635-b985-51e126289259.jpg?1783930136",
          "border_crop": "https://cards.scryfall.io/border_crop/front/d/0/d0d33d52-3d28-4635-b985-51e126289259.jpg?1783930136",
          "thumb": "https://cards.scryfall.io/thumb/front/d/0/d0d33d52-3d28-4635-b985-51e126289259.webp?1783930136",
          "grid": "https://cards.scryfall.io/grid/front/d/0/d0d33d52-3d28-4635-b985-51e126289259.webp?1783930136",
          "display": "https://cards.scryfall.io/display/front/d/0/d0d33d52-3d28-4635-b985-51e126289259.webp?1783930136",
          "art": "https://cards.scryfall.io/art/front/d/0/d0d33d52-3d28-4635-b985-51e126289259.webp?1783930136",
          "crop": "https://cards.scryfall.io/crop/front/d/0/d0d33d52-3d28-4635-b985-51e126289259.webp?1783930136",
          "jpeg": "https://cards.scryfall.io/normal/front/d/0/d0d33d52-3d28-4635-b985-51e126289259.jpg?1783930136"
        },
        "mana_cost": "{G}{W}{U}{B}",
        "cmc": 4,
        "type_line": "Legendary Creature \u2014 Phyrexian Angel Horror",
        "oracle_text": "Flying, vigilance, deathtouch, lifelink\nAt the beginning of your end step, proliferate. (Choose any number of permanents and/or players, then give each another counter of each kind already there.)",
        "power": "4",
        "toughness": "4",
        "colors": [
          "B",
          "G",
          "U",
          "W"
        ],
        "color_identity": [
          "B",
          "G",
          "U",
          "W"
        ],
        "keywords": [
          "Deathtouch",
          "Flying",
          "Lifelink",
          "Vigilance",
          "Proliferate"
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "legal",
          "timeless": "legal",
          "gladiator": "legal",
          "pioneer": "not_legal",
          "modern": "not_legal",
          "legacy": "legal",
          "pauper": "not_legal",
          "vintage": "legal",
          "penny": "legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "not_legal",
          "brawl": "legal",
          "competitivebrawl": "legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "not_legal"
        },
        "games": [
          "paper",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": true,
        "variation": false,
        "set_id": "372dafe8-b5d1-4b81-998f-3ae96b59498a",
        "set": "2xm",
        "set_name": "Double Masters",
        "set_type": "masters",
        "set_uri": "https://api.scryfall.com/sets/372dafe8-b5d1-4b81-998f-3ae96b59498a",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3A2xm&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/2xm?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/d0d33d52-3d28-4635-b985-51e126289259/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A7e6b9b59-cd68-4e3c-827b-38833c92d6eb&unique=prints",
        "collector_number": "190",
        "digital": false,
        "rarity": "mythic",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Victor Adame Minguez",
        "artist_ids": [
          "bd8f7368-5b10-4554-b6b8-d052c6aca89f"
        ],
        "illustration_id": "aa6efe75-3fa3-42cd-800e-23320b431646",
        "border_color": "black",
        "frame": "2015",
        "frame_effects": [
          "legendary"
        ],
        "security_stamp": "oval",
        "full_art": false,
        "textless": false,
        "booster": true,
        "story_spotlight": false,
        "edhrec_rank": 2360,
        "penny_rank": 5804,
        "preview": {
          "source": "Wizards of the Coast",
          "source_uri": "https://magic.wizards.com/ru/articles/archive/news/dopolnitelnoe-obyavlenie-o-vyhode-double-masters-2020-05-21",
          "previewed_at": "2020-05-21"
        },
        "prices": {
          "usd": "27.84",
          "usd_foil": "33.43",
          "usd_etched": null,
          "eur": "23.05",
          "eur_foil": "25.51",
          "tix": "0.91"
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=489863&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DAtraxa%252C%2BPraetors%2527%2BVoice",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DAtraxa%252C%2BPraetors%2527%2BVoice",
          "edhrec": "https://edhrec.com/route/?cc=Atraxa%2C+Praetors%27+Voice"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F214833%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=462559&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/82414?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "balamb garden seed academy (::en)": {
        "object": "card",
        "id": "001e9f20-5b15-41cb-bf82-46172decc235",
        "oracle_id": "8b84fec5-617c-4088-8250-2ba1f1f9479a",
        "multiverse_ids": [],
        "resource_id": "C92C4E13E3340F3594F515DE39A78D2D448AC0DFBC530AEADCE4B192DEB258CC",
        "mtgo_id": 141511,
        "arena_id": 96150,
        "tcgplayer_id": 634012,
        "cardmarket_id": 827001,
        "name": "Balamb Garden, SeeD Academy // Balamb Garden, Airborne",
        "lang": "en",
        "released_at": "2025-06-13",
        "uri": "https://api.scryfall.com/cards/001e9f20-5b15-41cb-bf82-46172decc235",
        "scryfall_uri": "https://scryfall.com/card/fin/272/balamb-garden-seed-academy-balamb-garden-airborne?utm_source=api",
        "layout": "transform",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T01:35:58Z",
        "cmc": 0,
        "type_line": "Land \u2014 Town // Legendary Artifact \u2014 Vehicle",
        "color_identity": [
          "G",
          "U"
        ],
        "keywords": [
          "Flying",
          "Transform",
          "Crew"
        ],
        "produced_mana": [
          "G",
          "U"
        ],
        "card_faces": [
          {
            "object": "card_face",
            "name": "Balamb Garden, SeeD Academy",
            "mana_cost": "",
            "type_line": "Land \u2014 Town",
            "oracle_text": "This land enters tapped.\n{T}: Add {G} or {U}.\n{5}{G}{U}, {T}: Transform this land. This ability costs {1} less to activate for each other Town you control.",
            "colors": [],
            "artist": "Jonas De Ro",
            "artist_id": "561ebf9e-8d93-4b57-8156-8826d0c19601",
            "illustration_id": "83559f92-ec25-4f3e-8f67-a66970c1e01e",
            "image_uris": {
              "small": "https://cards.scryfall.io/small/front/0/0/001e9f20-5b15-41cb-bf82-46172decc235.jpg?1783906558",
              "normal": "https://cards.scryfall.io/normal/front/0/0/001e9f20-5b15-41cb-bf82-46172decc235.jpg?1783906558",
              "large": "https://cards.scryfall.io/large/front/0/0/001e9f20-5b15-41cb-bf82-46172decc235.jpg?1783906558",
              "png": "https://cards.scryfall.io/png/front/0/0/001e9f20-5b15-41cb-bf82-46172decc235.png?1783906558",
              "art_crop": "https://cards.scryfall.io/art_crop/front/0/0/001e9f20-5b15-41cb-bf82-46172decc235.jpg?1783906558",
              "border_crop": "https://cards.scryfall.io/border_crop/front/0/0/001e9f20-5b15-41cb-bf82-46172decc235.jpg?1783906558",
              "thumb": "https://cards.scryfall.io/thumb/front/0/0/001e9f20-5b15-41cb-bf82-46172decc235.webp?1783906558",
              "grid": "https://cards.scryfall.io/grid/front/0/0/001e9f20-5b15-41cb-bf82-46172decc235.webp?1783906558",
              "display": "https://cards.scryfall.io/display/front/0/0/001e9f20-5b15-41cb-bf82-46172decc235.webp?1783906558",
              "art": "https://cards.scryfall.io/art/front/0/0/001e9f20-5b15-41cb-bf82-46172decc235.webp?1783906558",
              "crop": "https://cards.scryfall.io/crop/front/0/0/001e9f20-5b15-41cb-bf82-46172decc235.webp?1783906558",
              "jpeg": "https://cards.scryfall.io/normal/front/0/0/001e9f20-5b15-41cb-bf82-46172decc235.jpg?1783906558"
            }
          },
          {
            "object": "card_face",
            "name": "Balamb Garden, Airborne",
            "mana_cost": "",
            "type_line": "Legendary Artifact \u2014 Vehicle",
            "oracle_text": "Flying\nWhenever Balamb Garden attacks, draw a card.\nCrew 1 (Tap any number of creatures you control with total power 1 or more: This Vehicle becomes an artifact creature until end of turn.)",
            "colors": [],
            "power": "5",
            "toughness": "4",
            "artist": "Jonas De Ro",
            "artist_id": "561ebf9e-8d93-4b57-8156-8826d0c19601",
            "illustration_id": "dd3fc1d7-6e7c-4b10-a4b5-8dc0804061e1",
            "image_uris": {
              "small": "https://cards.scryfall.io/small/back/0/0/001e9f20-5b15-41cb-bf82-46172decc235.jpg?1783906558",
              "normal": "https://cards.scryfall.io/normal/back/0/0/001e9f20-5b15-41cb-bf82-46172decc235.jpg?1783906558",
              "large": "https://cards.scryfall.io/large/back/0/0/001e9f20-5b15-41cb-bf82-46172decc235.jpg?1783906558",
              "png": "https://cards.scryfall.io/png/back/0/0/001e9f20-5b15-41cb-bf82-46172decc235.png?1783906558",
              "art_crop": "https://cards.scryfall.io/art_crop/back/0/0/001e9f20-5b15-41cb-bf82-46172decc235.jpg?1783906558",
              "border_crop": "https://cards.scryfall.io/border_crop/back/0/0/001e9f20-5b15-41cb-bf82-46172decc235.jpg?1783906558",
              "thumb": "https://cards.scryfall.io/thumb/back/0/0/001e9f20-5b15-41cb-bf82-46172decc235.webp?1783906558",
              "grid": "https://cards.scryfall.io/grid/back/0/0/001e9f20-5b15-41cb-bf82-46172decc235.webp?1783906558",
              "display": "https://cards.scryfall.io/display/back/0/0/001e9f20-5b15-41cb-bf82-46172decc235.webp?1783906558",
              "art": "https://cards.scryfall.io/art/back/0/0/001e9f20-5b15-41cb-bf82-46172decc235.webp?1783906558",
              "crop": "https://cards.scryfall.io/crop/back/0/0/001e9f20-5b15-41cb-bf82-46172decc235.webp?1783906558",
              "jpeg": "https://cards.scryfall.io/normal/back/0/0/001e9f20-5b15-41cb-bf82-46172decc235.jpg?1783906558"
            }
          }
        ],
        "legalities": {
          "standard": "legal",
          "future": "legal",
          "historic": "legal",
          "timeless": "legal",
          "gladiator": "legal",
          "pioneer": "legal",
          "modern": "legal",
          "legacy": "legal",
          "pauper": "not_legal",
          "vintage": "legal",
          "penny": "legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "legal",
          "brawl": "legal",
          "competitivebrawl": "legal",
          "alchemy": "legal",
          "paupercommander": "not_legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "legal"
        },
        "games": [
          "paper",
          "arena",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": false,
        "variation": false,
        "set_id": "d7beb4b7-e1ff-4d35-ab07-5700f17ea1ea",
        "set": "fin",
        "set_name": "Final Fantasy",
        "set_type": "expansion",
        "set_uri": "https://api.scryfall.com/sets/d7beb4b7-e1ff-4d35-ab07-5700f17ea1ea",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Afin&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/fin?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/001e9f20-5b15-41cb-bf82-46172decc235/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A8b84fec5-617c-4088-8250-2ba1f1f9479a&unique=prints",
        "collector_number": "272",
        "digital": false,
        "rarity": "rare",
        "artist": "Jonas De Ro",
        "artist_ids": [
          "561ebf9e-8d93-4b57-8156-8826d0c19601"
        ],
        "border_color": "black",
        "frame": "2015",
        "frame_effects": [
          "legendary"
        ],
        "security_stamp": "triangle",
        "full_art": false,
        "textless": false,
        "booster": true,
        "story_spotlight": false,
        "promo_types": [
          "universesbeyond",
          "ffviii"
        ],
        "edhrec_rank": 6280,
        "penny_rank": 10298,
        "preview": {
          "source": "CGMagazine",
          "source_uri": "https://www.cgmagonline.com/articles/previews/mtg-final-fantasy-homebases/",
          "previewed_at": "2025-05-23"
        },
        "prices": {
          "usd": "0.33",
          "usd_foil": "0.48",
          "usd_etched": null,
          "eur": "0.30",
          "eur_foil": "0.65",
          "tix": "0.02"
        },
        "related_uris": {
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DBalamb%2BGarden%252C%2BSeeD%2BAcademy%2B%252F%252F%2BBalamb%2BGarden%252C%2BAirborne",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DBalamb%2BGarden%252C%2BSeeD%2BAcademy%2B%252F%252F%2BBalamb%2BGarden%252C%2BAirborne",
          "edhrec": "https://edhrec.com/route/?cc=Balamb+Garden%2C+SeeD+Academy"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F634012%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=827001&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/141511?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "bant (::en)": {
        "object": "card",
        "id": "434a2d09-5776-4168-b863-f3b0a736d19b",
        "oracle_id": "82e67c57-6d7a-44cc-ba63-77ce887ab075",
        "multiverse_ids": [
          423596
        ],
        "tcgplayer_id": 125575,
        "cardmarket_id": 294410,
        "name": "Bant",
        "lang": "en",
        "released_at": "2016-11-25",
        "uri": "https://api.scryfall.com/cards/434a2d09-5776-4168-b863-f3b0a736d19b",
        "scryfall_uri": "https://scryfall.com/card/opca/15/bant?utm_source=api",
        "layout": "planar",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T10:02:01Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/4/3/434a2d09-5776-4168-b863-f3b0a736d19b.jpg?1783936921",
          "normal": "https://cards.scryfall.io/normal/front/4/3/434a2d09-5776-4168-b863-f3b0a736d19b.jpg?1783936921",
          "large": "https://cards.scryfall.io/large/front/4/3/434a2d09-5776-4168-b863-f3b0a736d19b.jpg?1783936921",
          "png": "https://cards.scryfall.io/png/front/4/3/434a2d09-5776-4168-b863-f3b0a736d19b.png?1783936921",
          "art_crop": "https://cards.scryfall.io/art_crop/front/4/3/434a2d09-5776-4168-b863-f3b0a736d19b.jpg?1783936921",
          "border_crop": "https://cards.scryfall.io/border_crop/front/4/3/434a2d09-5776-4168-b863-f3b0a736d19b.jpg?1783936921",
          "thumb": "https://cards.scryfall.io/thumb/front/4/3/434a2d09-5776-4168-b863-f3b0a736d19b.webp?1783936921",
          "grid": "https://cards.scryfall.io/grid/front/4/3/434a2d09-5776-4168-b863-f3b0a736d19b.webp?1783936921",
          "display": "https://cards.scryfall.io/display/front/4/3/434a2d09-5776-4168-b863-f3b0a736d19b.webp?1783936921",
          "art": "https://cards.scryfall.io/art/front/4/3/434a2d09-5776-4168-b863-f3b0a736d19b.webp?1783936921",
          "crop": "https://cards.scryfall.io/crop/front/4/3/434a2d09-5776-4168-b863-f3b0a736d19b.webp?1783936921",
          "jpeg": "https://cards.scryfall.io/normal/front/4/3/434a2d09-5776-4168-b863-f3b0a736d19b.jpg?1783936921"
        },
        "mana_cost": "",
        "cmc": 0,
        "type_line": "Plane \u2014 Alara",
        "oracle_text": "All creatures have exalted. (Whenever a creature attacks alone, it gets +1/+1 until end of turn for each instance of exalted among permanents its controller controls.)\nWhenever chaos ensues, put a divinity counter on target green, white, or blue creature. That creature has indestructible for as long as it has a divinity counter on it.",
        "colors": [],
        "color_identity": [],
        "keywords": [],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "not_legal",
          "timeless": "not_legal",
          "gladiator": "not_legal",
          "pioneer": "not_legal",
          "modern": "not_legal",
          "legacy": "not_legal",
          "pauper": "not_legal",
          "vintage": "not_legal",
          "penny": "not_legal",
          "commander": "not_legal",
          "oathbreaker": "not_legal",
          "standardbrawl": "not_legal",
          "brawl": "not_legal",
          "competitivebrawl": "not_legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "not_legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "not_legal"
        },
        "games": [
          "paper"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": false,
        "nonfoil": true,
        "finishes": [
          "nonfoil"
        ],
        "oversized": true,
        "promo": false,
        "reprint": true,
        "variation": false,
        "set_id": "ada3345c-d416-49bc-92e0-73363ddee5c8",
        "set": "opca",
        "set_name": "Planechase Anthology Planes",
        "set_type": "planechase",
        "set_uri": "https://api.scryfall.com/sets/ada3345c-d416-49bc-92e0-73363ddee5c8",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Aopca&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/opca?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/434a2d09-5776-4168-b863-f3b0a736d19b/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A82e67c57-6d7a-44cc-ba63-77ce887ab075&unique=prints",
        "collector_number": "15",
        "digital": false,
        "rarity": "common",
        "card_back_id": "7840c131-f96b-4700-9347-2215c43156e6",
        "artist": "Michael Komarck",
        "artist_ids": [
          "96a53b95-fe5f-4fbb-9411-ccf4ee150aca"
        ],
        "illustration_id": "37d62f5a-f174-48ca-9678-9e1ec7002686",
        "border_color": "black",
        "frame": "2015",
        "full_art": false,
        "textless": false,
        "booster": false,
        "story_spotlight": false,
        "prices": {
          "usd": "8.33",
          "usd_foil": null,
          "usd_etched": null,
          "eur": "2.58",
          "eur_foil": null,
          "tix": null
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=423596&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DBant",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DBant",
          "edhrec": "https://edhrec.com/route/?cc=Bant"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F125575%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=294410&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards?affiliate_id=scryfall&data%5Bsearch%5D=Bant&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "beacon bolt (::en)": {
        "object": "card",
        "id": "39c9e4b5-364b-4c0b-bb47-266563a6abf2",
        "oracle_id": "884686dd-515c-4484-a324-e7d126903a42",
        "multiverse_ids": [
          452904
        ],
        "mtgo_id": 69681,
        "arena_id": 68615,
        "tcgplayer_id": 176857,
        "cardmarket_id": 364198,
        "name": "Beacon Bolt",
        "lang": "en",
        "released_at": "2018-10-05",
        "uri": "https://api.scryfall.com/cards/39c9e4b5-364b-4c0b-bb47-266563a6abf2",
        "scryfall_uri": "https://scryfall.com/card/grn/154/beacon-bolt?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T09:15:42Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/3/9/39c9e4b5-364b-4c0b-bb47-266563a6abf2.jpg?1783934142",
          "normal": "https://cards.scryfall.io/normal/front/3/9/39c9e4b5-364b-4c0b-bb47-266563a6abf2.jpg?1783934142",
          "large": "https://cards.scryfall.io/large/front/3/9/39c9e4b5-364b-4c0b-bb47-266563a6abf2.jpg?1783934142",
          "png": "https://cards.scryfall.io/png/front/3/9/39c9e4b5-364b-4c0b-bb47-266563a6abf2.png?1783934142",
          "art_crop": "https://cards.scryfall.io/art_crop/front/3/9/39c9e4b5-364b-4c0b-bb47-266563a6abf2.jpg?1783934142",
          "border_crop": "https://cards.scryfall.io/border_crop/front/3/9/39c9e4b5-364b-4c0b-bb47-266563a6abf2.jpg?1783934142",
          "thumb": "https://cards.scryfall.io/thumb/front/3/9/39c9e4b5-364b-4c0b-bb47-266563a6abf2.webp?1783934142",
          "grid": "https://cards.scryfall.io/grid/front/3/9/39c9e4b5-364b-4c0b-bb47-266563a6abf2.webp?1783934142",
          "display": "https://cards.scryfall.io/display/front/3/9/39c9e4b5-364b-4c0b-bb47-266563a6abf2.webp?1783934142",
          "art": "https://cards.scryfall.io/art/front/3/9/39c9e4b5-364b-4c0b-bb47-266563a6abf2.webp?1783934142",
          "crop": "https://cards.scryfall.io/crop/front/3/9/39c9e4b5-364b-4c0b-bb47-266563a6abf2.webp?1783934142",
          "jpeg": "https://cards.scryfall.io/normal/front/3/9/39c9e4b5-364b-4c0b-bb47-266563a6abf2.jpg?1783934142"
        },
        "mana_cost": "{1}{U}{R}",
        "cmc": 3,
        "type_line": "Sorcery",
        "oracle_text": "Beacon Bolt deals damage to target creature equal to the total number of instant and sorcery cards you own in exile and in your graveyard.\nJump-start (You may cast this card from your graveyard by discarding a card in addition to paying its other costs. Then exile this card.)",
        "colors": [
          "R",
          "U"
        ],
        "color_identity": [
          "R",
          "U"
        ],
        "keywords": [
          "Jump",
          "Jump-start"
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "legal",
          "timeless": "legal",
          "gladiator": "legal",
          "pioneer": "legal",
          "modern": "legal",
          "legacy": "legal",
          "pauper": "not_legal",
          "vintage": "legal",
          "penny": "not_legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "not_legal",
          "brawl": "legal",
          "competitivebrawl": "legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "legal"
        },
        "games": [
          "arena",
          "paper",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": false,
        "variation": false,
        "set_id": "597c6d4a-8212-4903-a6af-12c4ae9e13f0",
        "set": "grn",
        "set_name": "Guilds of Ravnica",
        "set_type": "expansion",
        "set_uri": "https://api.scryfall.com/sets/597c6d4a-8212-4903-a6af-12c4ae9e13f0",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Agrn&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/grn?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/39c9e4b5-364b-4c0b-bb47-266563a6abf2/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A884686dd-515c-4484-a324-e7d126903a42&unique=prints",
        "collector_number": "154",
        "digital": false,
        "rarity": "uncommon",
        "watermark": "izzet",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Titus Lunter",
        "artist_ids": [
          "b11e6b3a-f4ca-4cf1-8fd7-475696de5f5c"
        ],
        "illustration_id": "c2ce83a1-ddba-429c-9f7b-7e02585ea99d",
        "border_color": "black",
        "frame": "2015",
        "full_art": false,
        "textless": false,
        "booster": true,
        "story_spotlight": false,
        "edhrec_rank": 12429,
        "penny_rank": 2295,
        "prices": {
          "usd": "0.22",
          "usd_foil": "0.32",
          "usd_etched": null,
          "eur": "0.11",
          "eur_foil": "0.43",
          "tix": "0.03"
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=452904&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DBeacon%2BBolt",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DBeacon%2BBolt",
          "edhrec": "https://edhrec.com/route/?cc=Beacon+Bolt"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F176857%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=364198&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/69681?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "bebop skull crossbones (::en)": {
        "object": "card",
        "id": "af2a1494-9c0d-4590-999b-2c52725dc5d0",
        "oracle_id": "59a405d7-2f28-41b8-a5bb-011f45a5fdf2",
        "multiverse_ids": [],
        "resource_id": "286D194A84B425AFC79465EEAF545C3F21388C114355D07C713A88EAD2E3D4F1",
        "mtgo_id": 147359,
        "arena_id": 100697,
        "tcgplayer_id": 679582,
        "cardmarket_id": 873492,
        "name": "Bebop, Skull & Crossbones",
        "lang": "en",
        "released_at": "2026-03-06",
        "uri": "https://api.scryfall.com/cards/af2a1494-9c0d-4590-999b-2c52725dc5d0",
        "scryfall_uri": "https://scryfall.com/card/tmc/15/bebop-skull-&-crossbones?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T00:56:11Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/a/f/af2a1494-9c0d-4590-999b-2c52725dc5d0.jpg?1783904171",
          "normal": "https://cards.scryfall.io/normal/front/a/f/af2a1494-9c0d-4590-999b-2c52725dc5d0.jpg?1783904171",
          "large": "https://cards.scryfall.io/large/front/a/f/af2a1494-9c0d-4590-999b-2c52725dc5d0.jpg?1783904171",
          "png": "https://cards.scryfall.io/png/front/a/f/af2a1494-9c0d-4590-999b-2c52725dc5d0.png?1783904171",
          "art_crop": "https://cards.scryfall.io/art_crop/front/a/f/af2a1494-9c0d-4590-999b-2c52725dc5d0.jpg?1783904171",
          "border_crop": "https://cards.scryfall.io/border_crop/front/a/f/af2a1494-9c0d-4590-999b-2c52725dc5d0.jpg?1783904171",
          "thumb": "https://cards.scryfall.io/thumb/front/a/f/af2a1494-9c0d-4590-999b-2c52725dc5d0.webp?1783904171",
          "grid": "https://cards.scryfall.io/grid/front/a/f/af2a1494-9c0d-4590-999b-2c52725dc5d0.webp?1783904171",
          "display": "https://cards.scryfall.io/display/front/a/f/af2a1494-9c0d-4590-999b-2c52725dc5d0.webp?1783904171",
          "art": "https://cards.scryfall.io/art/front/a/f/af2a1494-9c0d-4590-999b-2c52725dc5d0.webp?1783904171",
          "crop": "https://cards.scryfall.io/crop/front/a/f/af2a1494-9c0d-4590-999b-2c52725dc5d0.webp?1783904171",
          "jpeg": "https://cards.scryfall.io/normal/front/a/f/af2a1494-9c0d-4590-999b-2c52725dc5d0.jpg?1783904171"
        },
        "mana_cost": "{1}{B}",
        "cmc": 2,
        "type_line": "Legendary Creature \u2014 Boar Mutant",
        "oracle_text": "Partner with Rocksteady, Mutant Marauder (When this creature enters, target player may put Rocksteady into their hand from their library, then shuffle.)\nDeathtouch\nWhenever Bebop deals combat damage to a player, you may draw X cards, where X is the number of counters on Bebop. If you do, you lose X life.",
        "power": "2",
        "toughness": "1",
        "colors": [
          "B"
        ],
        "color_identity": [
          "B"
        ],
        "keywords": [
          "Partner with",
          "Partner",
          "Deathtouch"
        ],
        "all_parts": [
          {
            "object": "related_card",
            "id": "4f40a1d3-eb94-455d-a1f3-fcfd91fd888b",
            "component": "combo_piece",
            "name": "Rocksteady, Mutant Marauder",
            "type_line": "Legendary Creature \u2014 Rhino Mutant",
            "uri": "https://api.scryfall.com/cards/4f40a1d3-eb94-455d-a1f3-fcfd91fd888b"
          },
          {
            "object": "related_card",
            "id": "d7ed8569-7b6b-4924-aedd-4210930e3bfc",
            "component": "combo_piece",
            "name": "Bebop, Skull & Crossbones",
            "type_line": "Legendary Creature \u2014 Boar Mutant",
            "uri": "https://api.scryfall.com/cards/d7ed8569-7b6b-4924-aedd-4210930e3bfc"
          }
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "legal",
          "timeless": "legal",
          "gladiator": "legal",
          "pioneer": "not_legal",
          "modern": "not_legal",
          "legacy": "legal",
          "pauper": "not_legal",
          "vintage": "legal",
          "penny": "not_legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "not_legal",
          "brawl": "legal",
          "competitivebrawl": "legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "legal"
        },
        "games": [
          "paper",
          "arena",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": false,
        "variation": false,
        "set_id": "178a07bb-cd54-4443-8b62-675e0c52cfe3",
        "set": "tmc",
        "set_name": "Teenage Mutant Ninja Turtles Eternal",
        "set_type": "eternal",
        "set_uri": "https://api.scryfall.com/sets/178a07bb-cd54-4443-8b62-675e0c52cfe3",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Atmc&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/tmc?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/af2a1494-9c0d-4590-999b-2c52725dc5d0/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A59a405d7-2f28-41b8-a5bb-011f45a5fdf2&unique=prints",
        "collector_number": "15",
        "digital": false,
        "rarity": "rare",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Benjamin Ee",
        "artist_ids": [
          "7bb27cca-e4ee-43b9-be92-a181c9164204"
        ],
        "illustration_id": "d7a14005-2597-4e42-bf9f-8568a64a577c",
        "border_color": "black",
        "frame": "2015",
        "frame_effects": [
          "legendary"
        ],
        "security_stamp": "oval",
        "full_art": false,
        "textless": false,
        "booster": false,
        "story_spotlight": false,
        "promo_types": [
          "surgefoil",
          "universesbeyond"
        ],
        "edhrec_rank": 10049,
        "prices": {
          "usd": "0.27",
          "usd_foil": null,
          "usd_etched": null,
          "eur": "0.20",
          "eur_foil": "1.52",
          "tix": "0.58"
        },
        "related_uris": {
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DBebop%252C%2BSkull%2B%2526%2BCrossbones",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DBebop%252C%2BSkull%2B%2526%2BCrossbones",
          "edhrec": "https://edhrec.com/route/?cc=Bebop%2C+Skull+%26+Crossbones"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F679582%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=873492&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/147359?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "birds of paradise (::en)": {
        "object": "card",
        "id": "492c2f9a-51e7-4e0f-9899-23bf43ea988b",
        "oracle_id": "d3a0b660-358c-41bd-9cd2-41fbf3491b1a",
        "multiverse_ids": [],
        "resource_id": "03497AB30469815E10E1F0E0F9CDA09D242D1A54ED52B4D1F14C4F8C8F8E4E8B",
        "mtgo_id": 150809,
        "tcgplayer_id": 698193,
        "cardmarket_id": 892700,
        "name": "Birds of Paradise",
        "lang": "en",
        "released_at": "2026-06-26",
        "uri": "https://api.scryfall.com/cards/492c2f9a-51e7-4e0f-9899-23bf43ea988b",
        "scryfall_uri": "https://scryfall.com/card/msc/170/birds-of-paradise?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T00:40:30Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/4/9/492c2f9a-51e7-4e0f-9899-23bf43ea988b.jpg?1783903230",
          "normal": "https://cards.scryfall.io/normal/front/4/9/492c2f9a-51e7-4e0f-9899-23bf43ea988b.jpg?1783903230",
          "large": "https://cards.scryfall.io/large/front/4/9/492c2f9a-51e7-4e0f-9899-23bf43ea988b.jpg?1783903230",
          "png": "https://cards.scryfall.io/png/front/4/9/492c2f9a-51e7-4e0f-9899-23bf43ea988b.png?1783903230",
          "art_crop": "https://cards.scryfall.io/art_crop/front/4/9/492c2f9a-51e7-4e0f-9899-23bf43ea988b.jpg?1783903230",
          "border_crop": "https://cards.scryfall.io/border_crop/front/4/9/492c2f9a-51e7-4e0f-9899-23bf43ea988b.jpg?1783903230",
          "thumb": "https://cards.scryfall.io/thumb/front/4/9/492c2f9a-51e7-4e0f-9899-23bf43ea988b.webp?1783903230",
          "grid": "https://cards.scryfall.io/grid/front/4/9/492c2f9a-51e7-4e0f-9899-23bf43ea988b.webp?1783903230",
          "display": "https://cards.scryfall.io/display/front/4/9/492c2f9a-51e7-4e0f-9899-23bf43ea988b.webp?1783903230",
          "art": "https://cards.scryfall.io/art/front/4/9/492c2f9a-51e7-4e0f-9899-23bf43ea988b.webp?1783903230",
          "crop": "https://cards.scryfall.io/crop/front/4/9/492c2f9a-51e7-4e0f-9899-23bf43ea988b.webp?1783903230",
          "jpeg": "https://cards.scryfall.io/normal/front/4/9/492c2f9a-51e7-4e0f-9899-23bf43ea988b.jpg?1783903230"
        },
        "mana_cost": "{G}",
        "cmc": 1,
        "type_line": "Creature \u2014 Bird",
        "oracle_text": "Flying\n{T}: Add one mana of any color.",
        "power": "0",
        "toughness": "1",
        "colors": [
          "G"
        ],
        "color_identity": [
          "G"
        ],
        "keywords": [
          "Flying"
        ],
        "produced_mana": [
          "B",
          "G",
          "R",
          "U",
          "W"
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "legal",
          "timeless": "legal",
          "gladiator": "legal",
          "pioneer": "not_legal",
          "modern": "legal",
          "legacy": "legal",
          "pauper": "not_legal",
          "vintage": "legal",
          "penny": "legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "not_legal",
          "brawl": "legal",
          "competitivebrawl": "legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "legal",
          "predh": "legal",
          "tlr": "legal"
        },
        "games": [
          "paper",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": true,
        "variation": false,
        "set_id": "9d739461-c5ac-43a1-af41-3d5a585b5c8d",
        "set": "msc",
        "set_name": "Marvel Super Heroes Commander",
        "set_type": "commander",
        "set_uri": "https://api.scryfall.com/sets/9d739461-c5ac-43a1-af41-3d5a585b5c8d",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Amsc&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/msc?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/492c2f9a-51e7-4e0f-9899-23bf43ea988b/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3Ad3a0b660-358c-41bd-9cd2-41fbf3491b1a&unique=prints",
        "collector_number": "170",
        "digital": false,
        "rarity": "rare",
        "flavor_text": "The migration of the cranes is believed to be a portent of coming abundance in Wakanda.",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Kevin Sidharta",
        "artist_ids": [
          "e0bcff21-4a2b-4151-86a2-a462da7b5aaa"
        ],
        "illustration_id": "2415fae1-9658-4501-aaec-4991e7f70ea6",
        "border_color": "black",
        "frame": "2015",
        "security_stamp": "oval",
        "full_art": false,
        "textless": false,
        "booster": false,
        "story_spotlight": false,
        "promo_types": [
          "surgefoil",
          "universesbeyond"
        ],
        "edhrec_rank": 35,
        "penny_rank": 69,
        "prices": {
          "usd": "7.76",
          "usd_foil": null,
          "usd_etched": null,
          "eur": "8.22",
          "eur_foil": null,
          "tix": "0.56"
        },
        "related_uris": {
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DBirds%2Bof%2BParadise",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DBirds%2Bof%2BParadise",
          "edhrec": "https://edhrec.com/route/?cc=Birds+of+Paradise"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F698193%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=892700&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/150809?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "black lotus (::en)": {
        "object": "card",
        "id": "bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd",
        "oracle_id": "5089ec1a-f881-4d55-af14-5d996171203b",
        "multiverse_ids": [
          382866
        ],
        "mtgo_id": 53155,
        "mtgo_foil_id": 53156,
        "name": "Black Lotus",
        "lang": "en",
        "released_at": "2014-06-16",
        "uri": "https://api.scryfall.com/cards/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd",
        "scryfall_uri": "https://scryfall.com/card/vma/4/black-lotus?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T10:42:12Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.jpg?1783939332",
          "normal": "https://cards.scryfall.io/normal/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.jpg?1783939332",
          "large": "https://cards.scryfall.io/large/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.jpg?1783939332",
          "png": "https://cards.scryfall.io/png/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.png?1783939332",
          "art_crop": "https://cards.scryfall.io/art_crop/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.jpg?1783939332",
          "border_crop": "https://cards.scryfall.io/border_crop/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.jpg?1783939332",
          "thumb": "https://cards.scryfall.io/thumb/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.webp?1783939332",
          "grid": "https://cards.scryfall.io/grid/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.webp?1783939332",
          "display": "https://cards.scryfall.io/display/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.webp?1783939332",
          "art": "https://cards.scryfall.io/art/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.webp?1783939332",
          "crop": "https://cards.scryfall.io/crop/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.webp?1783939332",
          "jpeg": "https://cards.scryfall.io/normal/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.jpg?1783939332"
        },
        "mana_cost": "{0}",
        "cmc": 0,
        "type_line": "Artifact",
        "oracle_text": "{T}, Sacrifice this artifact: Add three mana of any one color.",
        "colors": [],
        "color_identity": [],
        "keywords": [],
        "produced_mana": [
          "B",
          "G",
          "R",
          "U",
          "W"
        ],
        "all_parts": [
          {
            "object": "related_card",
            "id": "bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd",
            "component": "combo_piece",
            "name": "Black Lotus",
            "type_line": "Artifact",
            "uri": "https://api.scryfall.com/cards/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd"
          },
          {
            "object": "related_card",
            "id": "85f81500-1b1b-47e7-93a1-db5f6de95e87",
            "component": "combo_piece",
            "name": "Arzakon",
            "type_line": "Legendary Planeswalker \u2014 Arzakon",
            "uri": "https://api.scryfall.com/cards/85f81500-1b1b-47e7-93a1-db5f6de95e87"
          }
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "not_legal",
          "timeless": "not_legal",
          "gladiator": "not_legal",
          "pioneer": "not_legal",
          "modern": "not_legal",
          "legacy": "banned",
          "pauper": "not_legal",
          "vintage": "restricted",
          "penny": "not_legal",
          "commander": "banned",
          "oathbreaker": "banned",
          "standardbrawl": "not_legal",
          "brawl": "not_legal",
          "competitivebrawl": "not_legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "banned",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "banned",
          "tlr": "banned"
        },
        "games": [
          "mtgo"
        ],
        "reserved": true,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": true,
        "variation": false,
        "set_id": "a944551a-73fa-41cd-9159-e8d0e4674403",
        "set": "vma",
        "set_name": "Vintage Masters",
        "set_type": "masters",
        "set_uri": "https://api.scryfall.com/sets/a944551a-73fa-41cd-9159-e8d0e4674403",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Avma&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/vma?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A5089ec1a-f881-4d55-af14-5d996171203b&unique=prints",
        "collector_number": "4",
        "digital": true,
        "rarity": "bonus",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Chris Rahn",
        "artist_ids": [
          "7742047e-0f80-4c0f-a530-d07460165e86"
        ],
        "illustration_id": "da62ded1-bedd-44c6-8950-ca56e691a899",
        "border_color": "black",
        "frame": "2015",
        "security_stamp": "oval",
        "full_art": false,
        "textless": false,
        "booster": true,
        "story_spotlight": false,
        "prices": {
          "usd": null,
          "usd_foil": null,
          "usd_etched": null,
          "eur": null,
          "eur_foil": null,
          "tix": "48.43"
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=382866&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DBlack%2BLotus",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DBlack%2BLotus",
          "edhrec": "https://edhrec.com/route/?cc=Black+Lotus"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fmagic%2Fproduct%3FproductLineName%3Dmagic%26q%3DBlack%2BLotus%26view%3Dgrid",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products/Search?referrer=scryfall&searchString=Black+Lotus&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/53155?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "borborygmos (::en)": {
        "object": "card",
        "id": "7c4a08e9-06c7-43e9-a855-4f507a35ae8b",
        "oracle_id": "9ab0820b-4f5f-47b3-8fa9-43f802aed275",
        "multiverse_ids": [
          97229
        ],
        "mtgo_id": 23859,
        "mtgo_foil_id": 23860,
        "tcgplayer_id": 13661,
        "cardmarket_id": 13143,
        "name": "Borborygmos",
        "lang": "en",
        "released_at": "2006-02-03",
        "uri": "https://api.scryfall.com/cards/7c4a08e9-06c7-43e9-a855-4f507a35ae8b",
        "scryfall_uri": "https://scryfall.com/card/gpt/103/borborygmos?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T11:51:28Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/7/c/7c4a08e9-06c7-43e9-a855-4f507a35ae8b.jpg?1783943488",
          "normal": "https://cards.scryfall.io/normal/front/7/c/7c4a08e9-06c7-43e9-a855-4f507a35ae8b.jpg?1783943488",
          "large": "https://cards.scryfall.io/large/front/7/c/7c4a08e9-06c7-43e9-a855-4f507a35ae8b.jpg?1783943488",
          "png": "https://cards.scryfall.io/png/front/7/c/7c4a08e9-06c7-43e9-a855-4f507a35ae8b.png?1783943488",
          "art_crop": "https://cards.scryfall.io/art_crop/front/7/c/7c4a08e9-06c7-43e9-a855-4f507a35ae8b.jpg?1783943488",
          "border_crop": "https://cards.scryfall.io/border_crop/front/7/c/7c4a08e9-06c7-43e9-a855-4f507a35ae8b.jpg?1783943488",
          "thumb": "https://cards.scryfall.io/thumb/front/7/c/7c4a08e9-06c7-43e9-a855-4f507a35ae8b.webp?1783943488",
          "grid": "https://cards.scryfall.io/grid/front/7/c/7c4a08e9-06c7-43e9-a855-4f507a35ae8b.webp?1783943488",
          "display": "https://cards.scryfall.io/display/front/7/c/7c4a08e9-06c7-43e9-a855-4f507a35ae8b.webp?1783943488",
          "art": "https://cards.scryfall.io/art/front/7/c/7c4a08e9-06c7-43e9-a855-4f507a35ae8b.webp?1783943488",
          "crop": "https://cards.scryfall.io/crop/front/7/c/7c4a08e9-06c7-43e9-a855-4f507a35ae8b.webp?1783943488",
          "jpeg": "https://cards.scryfall.io/normal/front/7/c/7c4a08e9-06c7-43e9-a855-4f507a35ae8b.jpg?1783943488"
        },
        "mana_cost": "{3}{R}{R}{G}{G}",
        "cmc": 7,
        "type_line": "Legendary Creature \u2014 Cyclops",
        "oracle_text": "Trample\nWhenever Borborygmos deals combat damage to a player, put a +1/+1 counter on each creature you control.",
        "power": "6",
        "toughness": "7",
        "colors": [
          "G",
          "R"
        ],
        "color_identity": [
          "G",
          "R"
        ],
        "keywords": [
          "Trample"
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "not_legal",
          "timeless": "not_legal",
          "gladiator": "not_legal",
          "pioneer": "not_legal",
          "modern": "legal",
          "legacy": "legal",
          "pauper": "not_legal",
          "vintage": "legal",
          "penny": "legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "not_legal",
          "brawl": "not_legal",
          "competitivebrawl": "not_legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "legal",
          "tlr": "not_legal"
        },
        "games": [
          "paper",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": false,
        "variation": false,
        "set_id": "594b4d09-8ce1-494d-bdb2-842c124bd087",
        "set": "gpt",
        "set_name": "Guildpact",
        "set_type": "expansion",
        "set_uri": "https://api.scryfall.com/sets/594b4d09-8ce1-494d-bdb2-842c124bd087",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Agpt&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/gpt?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/7c4a08e9-06c7-43e9-a855-4f507a35ae8b/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A9ab0820b-4f5f-47b3-8fa9-43f802aed275&unique=prints",
        "collector_number": "103",
        "digital": false,
        "rarity": "rare",
        "watermark": "gruul",
        "flavor_text": `"It's easy to see why those Gruul dirtbags follow him\u2014the only orders he gives are 'Crush them!' and 'We eat!'"
\u2014Teysa`,
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Todd Lockwood",
        "artist_ids": [
          "d0b9f3cc-13fb-42b6-bc43-b034728e5c7b"
        ],
        "illustration_id": "4f874d7d-6d3f-472d-8bdf-0d2ab9d2c08f",
        "border_color": "black",
        "frame": "2003",
        "full_art": false,
        "textless": false,
        "booster": true,
        "story_spotlight": false,
        "edhrec_rank": 17313,
        "penny_rank": 15599,
        "prices": {
          "usd": "0.38",
          "usd_foil": "2.00",
          "usd_etched": null,
          "eur": "0.20",
          "eur_foil": "2.75",
          "tix": "0.02"
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=97229&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DBorborygmos",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DBorborygmos",
          "edhrec": "https://edhrec.com/route/?cc=Borborygmos"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F13661%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=13143&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/23859?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "breya etherium shaper (::en)": {
        "object": "card",
        "id": "8bf3929c-957f-4ea2-a27d-7d53979844af",
        "oracle_id": "d460a9e2-5a7d-4562-880e-45174be19a9d",
        "multiverse_ids": [
          664068
        ],
        "mtgo_id": 125989,
        "arena_id": 91115,
        "tcgplayer_id": 552299,
        "cardmarket_id": 771212,
        "name": "Breya, Etherium Shaper",
        "lang": "en",
        "released_at": "2024-06-14",
        "uri": "https://api.scryfall.com/cards/8bf3929c-957f-4ea2-a27d-7d53979844af",
        "scryfall_uri": "https://scryfall.com/card/mh3/289/breya-etherium-shaper?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T02:53:31Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/8/b/8bf3929c-957f-4ea2-a27d-7d53979844af.jpg?1783911211",
          "normal": "https://cards.scryfall.io/normal/front/8/b/8bf3929c-957f-4ea2-a27d-7d53979844af.jpg?1783911211",
          "large": "https://cards.scryfall.io/large/front/8/b/8bf3929c-957f-4ea2-a27d-7d53979844af.jpg?1783911211",
          "png": "https://cards.scryfall.io/png/front/8/b/8bf3929c-957f-4ea2-a27d-7d53979844af.png?1783911211",
          "art_crop": "https://cards.scryfall.io/art_crop/front/8/b/8bf3929c-957f-4ea2-a27d-7d53979844af.jpg?1783911211",
          "border_crop": "https://cards.scryfall.io/border_crop/front/8/b/8bf3929c-957f-4ea2-a27d-7d53979844af.jpg?1783911211",
          "thumb": "https://cards.scryfall.io/thumb/front/8/b/8bf3929c-957f-4ea2-a27d-7d53979844af.webp?1783911211",
          "grid": "https://cards.scryfall.io/grid/front/8/b/8bf3929c-957f-4ea2-a27d-7d53979844af.webp?1783911211",
          "display": "https://cards.scryfall.io/display/front/8/b/8bf3929c-957f-4ea2-a27d-7d53979844af.webp?1783911211",
          "art": "https://cards.scryfall.io/art/front/8/b/8bf3929c-957f-4ea2-a27d-7d53979844af.webp?1783911211",
          "crop": "https://cards.scryfall.io/crop/front/8/b/8bf3929c-957f-4ea2-a27d-7d53979844af.webp?1783911211",
          "jpeg": "https://cards.scryfall.io/normal/front/8/b/8bf3929c-957f-4ea2-a27d-7d53979844af.jpg?1783911211"
        },
        "mana_cost": "{W}{U}{B}{R}",
        "cmc": 4,
        "type_line": "Legendary Artifact Creature \u2014 Human",
        "oracle_text": "When Breya enters, create two 1/1 blue Thopter artifact creature tokens with flying.\n{2}, Sacrifice two artifacts: Choose one \u2014\n\u2022 Breya deals 3 damage to target player or planeswalker.\n\u2022 Target creature gets -4/-4 until end of turn.\n\u2022 You gain 5 life.",
        "power": "4",
        "toughness": "4",
        "colors": [
          "B",
          "R",
          "U",
          "W"
        ],
        "color_identity": [
          "B",
          "R",
          "U",
          "W"
        ],
        "keywords": [],
        "all_parts": [
          {
            "object": "related_card",
            "id": "61061110-a8f4-41ac-a89e-93359050919d",
            "component": "combo_piece",
            "name": "Breya, Etherium Shaper",
            "type_line": "Legendary Artifact Creature \u2014 Human",
            "uri": "https://api.scryfall.com/cards/61061110-a8f4-41ac-a89e-93359050919d"
          },
          {
            "object": "related_card",
            "id": "e0a7adb3-8e66-4e63-95f2-1a5f5827b676",
            "component": "token",
            "name": "Thopter",
            "type_line": "Token Artifact Creature \u2014 Thopter",
            "uri": "https://api.scryfall.com/cards/e0a7adb3-8e66-4e63-95f2-1a5f5827b676"
          }
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "legal",
          "timeless": "legal",
          "gladiator": "legal",
          "pioneer": "not_legal",
          "modern": "legal",
          "legacy": "legal",
          "pauper": "not_legal",
          "vintage": "legal",
          "penny": "legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "not_legal",
          "brawl": "legal",
          "competitivebrawl": "legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "not_legal"
        },
        "games": [
          "paper",
          "mtgo",
          "arena"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": true,
        "variation": false,
        "set_id": "3ed80bb6-77e8-4aa7-8262-95377a38aba1",
        "set": "mh3",
        "set_name": "Modern Horizons 3",
        "set_type": "draft_innovation",
        "set_uri": "https://api.scryfall.com/sets/3ed80bb6-77e8-4aa7-8262-95377a38aba1",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Amh3&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/mh3?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/8bf3929c-957f-4ea2-a27d-7d53979844af/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3Ad460a9e2-5a7d-4562-880e-45174be19a9d&unique=prints",
        "collector_number": "289",
        "digital": false,
        "rarity": "mythic",
        "watermark": "set",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Tiffany Turrill",
        "artist_ids": [
          "0dce6651-c590-46aa-a28c-6bdeb2114f5d"
        ],
        "illustration_id": "07ef8663-c388-4c49-9c35-5c6b3b4ac82b",
        "border_color": "black",
        "frame": "2015",
        "frame_effects": [
          "legendary"
        ],
        "security_stamp": "oval",
        "full_art": false,
        "textless": false,
        "booster": true,
        "story_spotlight": false,
        "edhrec_rank": 5845,
        "penny_rank": 8263,
        "prices": {
          "usd": "0.44",
          "usd_foil": "0.51",
          "usd_etched": null,
          "eur": "0.45",
          "eur_foil": "1.04",
          "tix": "0.02"
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=664068&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DBreya%252C%2BEtherium%2BShaper",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DBreya%252C%2BEtherium%2BShaper",
          "edhrec": "https://edhrec.com/route/?cc=Breya%2C+Etherium+Shaper"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F552299%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=771212&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/125989?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "buried in the garden (::en)": {
        "object": "card",
        "id": "7e144609-e1f6-4bdc-8d14-b735ef4140d3",
        "oracle_id": "f1f0eab3-681b-4c2d-b590-555951920880",
        "multiverse_ids": [
          646747
        ],
        "mtgo_id": 121856,
        "arena_id": 89104,
        "tcgplayer_id": 533385,
        "cardmarket_id": 751364,
        "name": "Buried in the Garden",
        "lang": "en",
        "released_at": "2024-02-09",
        "uri": "https://api.scryfall.com/cards/7e144609-e1f6-4bdc-8d14-b735ef4140d3",
        "scryfall_uri": "https://scryfall.com/card/mkm/191/buried-in-the-garden?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T03:20:54Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/7/e/7e144609-e1f6-4bdc-8d14-b735ef4140d3.jpg?1783912854",
          "normal": "https://cards.scryfall.io/normal/front/7/e/7e144609-e1f6-4bdc-8d14-b735ef4140d3.jpg?1783912854",
          "large": "https://cards.scryfall.io/large/front/7/e/7e144609-e1f6-4bdc-8d14-b735ef4140d3.jpg?1783912854",
          "png": "https://cards.scryfall.io/png/front/7/e/7e144609-e1f6-4bdc-8d14-b735ef4140d3.png?1783912854",
          "art_crop": "https://cards.scryfall.io/art_crop/front/7/e/7e144609-e1f6-4bdc-8d14-b735ef4140d3.jpg?1783912854",
          "border_crop": "https://cards.scryfall.io/border_crop/front/7/e/7e144609-e1f6-4bdc-8d14-b735ef4140d3.jpg?1783912854",
          "thumb": "https://cards.scryfall.io/thumb/front/7/e/7e144609-e1f6-4bdc-8d14-b735ef4140d3.webp?1783912854",
          "grid": "https://cards.scryfall.io/grid/front/7/e/7e144609-e1f6-4bdc-8d14-b735ef4140d3.webp?1783912854",
          "display": "https://cards.scryfall.io/display/front/7/e/7e144609-e1f6-4bdc-8d14-b735ef4140d3.webp?1783912854",
          "art": "https://cards.scryfall.io/art/front/7/e/7e144609-e1f6-4bdc-8d14-b735ef4140d3.webp?1783912854",
          "crop": "https://cards.scryfall.io/crop/front/7/e/7e144609-e1f6-4bdc-8d14-b735ef4140d3.webp?1783912854",
          "jpeg": "https://cards.scryfall.io/normal/front/7/e/7e144609-e1f6-4bdc-8d14-b735ef4140d3.jpg?1783912854"
        },
        "mana_cost": "{2}{G}{W}",
        "cmc": 4,
        "type_line": "Enchantment \u2014 Aura",
        "oracle_text": "Enchant land\nWhen this Aura enters, exile target nonland permanent you don't control until this Aura leaves the battlefield.\nWhenever enchanted land is tapped for mana, its controller adds an additional one mana of any color.",
        "colors": [
          "G",
          "W"
        ],
        "color_identity": [
          "G",
          "W"
        ],
        "keywords": [
          "Enchant"
        ],
        "produced_mana": [
          "B",
          "G",
          "R",
          "U",
          "W"
        ],
        "legalities": {
          "standard": "legal",
          "future": "legal",
          "historic": "legal",
          "timeless": "legal",
          "gladiator": "legal",
          "pioneer": "legal",
          "modern": "legal",
          "legacy": "legal",
          "pauper": "not_legal",
          "vintage": "legal",
          "penny": "not_legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "legal",
          "brawl": "legal",
          "competitivebrawl": "legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "not_legal"
        },
        "games": [
          "paper",
          "arena",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": false,
        "variation": false,
        "set_id": "2b17794b-15c3-4796-ad6f-0887a0eceeca",
        "set": "mkm",
        "set_name": "Murders at Karlov Manor",
        "set_type": "expansion",
        "set_uri": "https://api.scryfall.com/sets/2b17794b-15c3-4796-ad6f-0887a0eceeca",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Amkm&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/mkm?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/7e144609-e1f6-4bdc-8d14-b735ef4140d3/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3Af1f0eab3-681b-4c2d-b590-555951920880&unique=prints",
        "collector_number": "191",
        "digital": false,
        "rarity": "uncommon",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Tom Babbey",
        "artist_ids": [
          "622ba04b-9e3a-4039-8f12-354bf56bfb0f"
        ],
        "illustration_id": "4efed341-9517-4f1a-956d-2d3f9e3056d7",
        "border_color": "black",
        "frame": "2015",
        "full_art": false,
        "textless": false,
        "booster": true,
        "story_spotlight": false,
        "edhrec_rank": 7054,
        "penny_rank": 6016,
        "preview": {
          "source": "NGA",
          "source_uri": "https://bbs.nga.cn/read.php?tid=39020588&rand=899",
          "previewed_at": "2024-01-17"
        },
        "prices": {
          "usd": "0.30",
          "usd_foil": "0.24",
          "usd_etched": null,
          "eur": "0.15",
          "eur_foil": "0.21",
          "tix": "0.03"
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=646747&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DBuried%2Bin%2Bthe%2BGarden",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DBuried%2Bin%2Bthe%2BGarden",
          "edhrec": "https://edhrec.com/route/?cc=Buried+in+the+Garden"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F533385%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=751364&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/121856?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "changeling outcast (::en)": {
        "object": "card",
        "id": "ab499df5-ed76-43ad-81b3-70afd0487ccd",
        "oracle_id": "a61ef0cc-1da9-49f9-b0dc-01cf9f6205be",
        "multiverse_ids": [
          658572
        ],
        "mtgo_id": 124715,
        "tcgplayer_id": 545343,
        "cardmarket_id": 764835,
        "name": "Changeling Outcast",
        "lang": "en",
        "released_at": "2024-04-19",
        "uri": "https://api.scryfall.com/cards/ab499df5-ed76-43ad-81b3-70afd0487ccd",
        "scryfall_uri": "https://scryfall.com/card/otc/128/changeling-outcast?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T03:05:32Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/a/b/ab499df5-ed76-43ad-81b3-70afd0487ccd.jpg?1783911932",
          "normal": "https://cards.scryfall.io/normal/front/a/b/ab499df5-ed76-43ad-81b3-70afd0487ccd.jpg?1783911932",
          "large": "https://cards.scryfall.io/large/front/a/b/ab499df5-ed76-43ad-81b3-70afd0487ccd.jpg?1783911932",
          "png": "https://cards.scryfall.io/png/front/a/b/ab499df5-ed76-43ad-81b3-70afd0487ccd.png?1783911932",
          "art_crop": "https://cards.scryfall.io/art_crop/front/a/b/ab499df5-ed76-43ad-81b3-70afd0487ccd.jpg?1783911932",
          "border_crop": "https://cards.scryfall.io/border_crop/front/a/b/ab499df5-ed76-43ad-81b3-70afd0487ccd.jpg?1783911932",
          "thumb": "https://cards.scryfall.io/thumb/front/a/b/ab499df5-ed76-43ad-81b3-70afd0487ccd.webp?1783911932",
          "grid": "https://cards.scryfall.io/grid/front/a/b/ab499df5-ed76-43ad-81b3-70afd0487ccd.webp?1783911932",
          "display": "https://cards.scryfall.io/display/front/a/b/ab499df5-ed76-43ad-81b3-70afd0487ccd.webp?1783911932",
          "art": "https://cards.scryfall.io/art/front/a/b/ab499df5-ed76-43ad-81b3-70afd0487ccd.webp?1783911932",
          "crop": "https://cards.scryfall.io/crop/front/a/b/ab499df5-ed76-43ad-81b3-70afd0487ccd.webp?1783911932",
          "jpeg": "https://cards.scryfall.io/normal/front/a/b/ab499df5-ed76-43ad-81b3-70afd0487ccd.jpg?1783911932"
        },
        "mana_cost": "{B}",
        "cmc": 1,
        "type_line": "Creature \u2014 Shapeshifter",
        "oracle_text": "Changeling (This card is every creature type.)\nThis creature can't block and can't be blocked.",
        "power": "1",
        "toughness": "1",
        "colors": [
          "B"
        ],
        "color_identity": [
          "B"
        ],
        "keywords": [
          "Changeling"
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "legal",
          "timeless": "legal",
          "gladiator": "legal",
          "pioneer": "not_legal",
          "modern": "legal",
          "legacy": "legal",
          "pauper": "legal",
          "vintage": "legal",
          "penny": "not_legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "not_legal",
          "brawl": "legal",
          "competitivebrawl": "legal",
          "alchemy": "not_legal",
          "paupercommander": "legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "legal"
        },
        "games": [
          "paper",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": false,
        "nonfoil": true,
        "finishes": [
          "nonfoil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": true,
        "variation": false,
        "set_id": "d6548798-0c10-4509-b71a-2d8b1d14665a",
        "set": "otc",
        "set_name": "Outlaws of Thunder Junction Commander",
        "set_type": "commander",
        "set_uri": "https://api.scryfall.com/sets/d6548798-0c10-4509-b71a-2d8b1d14665a",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Aotc&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/otc?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/ab499df5-ed76-43ad-81b3-70afd0487ccd/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3Aa61ef0cc-1da9-49f9-b0dc-01cf9f6205be&unique=prints",
        "collector_number": "128",
        "digital": false,
        "rarity": "common",
        "flavor_text": "A mercurial face sows distrust. Distrust reaps a lonely life.",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Micah Epstein",
        "artist_ids": [
          "957ec398-9a5e-4f54-9090-37a06d57b96c"
        ],
        "illustration_id": "190423f8-4771-4e7b-9d0a-144b6ae06658",
        "border_color": "black",
        "frame": "2015",
        "full_art": false,
        "textless": false,
        "booster": false,
        "story_spotlight": false,
        "edhrec_rank": 689,
        "penny_rank": 1709,
        "prices": {
          "usd": "2.62",
          "usd_foil": null,
          "usd_etched": null,
          "eur": "1.50",
          "eur_foil": null,
          "tix": "0.06"
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=658572&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DChangeling%2BOutcast",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DChangeling%2BOutcast",
          "edhrec": "https://edhrec.com/route/?cc=Changeling+Outcast"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F545343%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=764835&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/124715?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "chaotic aether (::en)": {
        "object": "card",
        "id": "e6632cd1-aa23-46d0-8e72-0850de4873e1",
        "oracle_id": "6dc67a65-31bf-4535-9e02-8f6d6ecefde5",
        "multiverse_ids": [
          615132
        ],
        "mtgo_id": 110596,
        "tcgplayer_id": 491260,
        "cardmarket_id": 705530,
        "name": "Chaotic Aether",
        "lang": "en",
        "released_at": "2023-04-21",
        "uri": "https://api.scryfall.com/cards/e6632cd1-aa23-46d0-8e72-0850de4873e1",
        "scryfall_uri": "https://scryfall.com/card/moc/141/chaotic-aether?utm_source=api",
        "layout": "planar",
        "highres_image": false,
        "image_status": "lowres",
        "image_updated_at": "2026-07-13T04:33:46Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/e/6/e6632cd1-aa23-46d0-8e72-0850de4873e1.jpg?1783917226",
          "normal": "https://cards.scryfall.io/normal/front/e/6/e6632cd1-aa23-46d0-8e72-0850de4873e1.jpg?1783917226",
          "large": "https://cards.scryfall.io/large/front/e/6/e6632cd1-aa23-46d0-8e72-0850de4873e1.jpg?1783917226",
          "png": "https://cards.scryfall.io/png/front/e/6/e6632cd1-aa23-46d0-8e72-0850de4873e1.png?1783917226",
          "art_crop": "https://cards.scryfall.io/art_crop/front/e/6/e6632cd1-aa23-46d0-8e72-0850de4873e1.jpg?1783917226",
          "border_crop": "https://cards.scryfall.io/border_crop/front/e/6/e6632cd1-aa23-46d0-8e72-0850de4873e1.jpg?1783917226",
          "thumb": "https://cards.scryfall.io/thumb/front/e/6/e6632cd1-aa23-46d0-8e72-0850de4873e1.webp?1783917226",
          "grid": "https://cards.scryfall.io/grid/front/e/6/e6632cd1-aa23-46d0-8e72-0850de4873e1.webp?1783917226",
          "display": "https://cards.scryfall.io/display/front/e/6/e6632cd1-aa23-46d0-8e72-0850de4873e1.webp?1783917226",
          "art": "https://cards.scryfall.io/art/front/e/6/e6632cd1-aa23-46d0-8e72-0850de4873e1.webp?1783917226",
          "crop": "https://cards.scryfall.io/crop/front/e/6/e6632cd1-aa23-46d0-8e72-0850de4873e1.webp?1783917226",
          "jpeg": "https://cards.scryfall.io/normal/front/e/6/e6632cd1-aa23-46d0-8e72-0850de4873e1.jpg?1783917226"
        },
        "mana_cost": "",
        "cmc": 0,
        "type_line": "Phenomenon",
        "oracle_text": "When you encounter Chaotic Aether, each blank roll of the planar die is a {CHAOS} roll until a player planeswalks away from a plane. (Then planeswalk away from this phenomenon.)",
        "colors": [],
        "color_identity": [],
        "keywords": [],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "not_legal",
          "timeless": "not_legal",
          "gladiator": "not_legal",
          "pioneer": "not_legal",
          "modern": "not_legal",
          "legacy": "not_legal",
          "pauper": "not_legal",
          "vintage": "not_legal",
          "penny": "not_legal",
          "commander": "not_legal",
          "oathbreaker": "not_legal",
          "standardbrawl": "not_legal",
          "brawl": "not_legal",
          "competitivebrawl": "not_legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "not_legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "not_legal"
        },
        "games": [
          "paper",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": false,
        "nonfoil": true,
        "finishes": [
          "nonfoil"
        ],
        "oversized": true,
        "promo": false,
        "reprint": true,
        "variation": false,
        "set_id": "6bba5de9-5afb-42af-a7eb-24ac854bf671",
        "set": "moc",
        "set_name": "March of the Machine Commander",
        "set_type": "commander",
        "set_uri": "https://api.scryfall.com/sets/6bba5de9-5afb-42af-a7eb-24ac854bf671",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Amoc&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/moc?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/e6632cd1-aa23-46d0-8e72-0850de4873e1/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A6dc67a65-31bf-4535-9e02-8f6d6ecefde5&unique=prints",
        "collector_number": "141",
        "digital": false,
        "rarity": "common",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Dan Murayama Scott",
        "artist_ids": [
          "f852fa13-137e-40f2-bbc1-0f01df09c0e0"
        ],
        "illustration_id": "375c30bc-2186-433f-a201-759ac76388ba",
        "border_color": "black",
        "frame": "2015",
        "full_art": false,
        "textless": false,
        "booster": false,
        "story_spotlight": false,
        "prices": {
          "usd": "0.37",
          "usd_foil": null,
          "usd_etched": null,
          "eur": "0.28",
          "eur_foil": null,
          "tix": "0.01"
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=615132&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DChaotic%2BAether",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DChaotic%2BAether",
          "edhrec": "https://edhrec.com/route/?cc=Chaotic+Aether"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F491260%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=705530&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/110596?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "collision colossus (::en)": {
        "object": "card",
        "id": "9bd15da6-2b86-4dba-951d-318c7d9a5dde",
        "oracle_id": "197ce21b-3387-4e76-a49c-04b9c371c031",
        "multiverse_ids": [
          457367
        ],
        "mtgo_id": 71458,
        "arena_id": 69355,
        "tcgplayer_id": 183327,
        "cardmarket_id": 368423,
        "name": "Collision // Colossus",
        "lang": "en",
        "released_at": "2019-01-25",
        "uri": "https://api.scryfall.com/cards/9bd15da6-2b86-4dba-951d-318c7d9a5dde",
        "scryfall_uri": "https://scryfall.com/card/rna/223/collision-colossus?utm_source=api",
        "layout": "split",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T09:07:08Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/9/b/9bd15da6-2b86-4dba-951d-318c7d9a5dde.jpg?1783933628",
          "normal": "https://cards.scryfall.io/normal/front/9/b/9bd15da6-2b86-4dba-951d-318c7d9a5dde.jpg?1783933628",
          "large": "https://cards.scryfall.io/large/front/9/b/9bd15da6-2b86-4dba-951d-318c7d9a5dde.jpg?1783933628",
          "png": "https://cards.scryfall.io/png/front/9/b/9bd15da6-2b86-4dba-951d-318c7d9a5dde.png?1783933628",
          "art_crop": "https://cards.scryfall.io/art_crop/front/9/b/9bd15da6-2b86-4dba-951d-318c7d9a5dde.jpg?1783933628",
          "border_crop": "https://cards.scryfall.io/border_crop/front/9/b/9bd15da6-2b86-4dba-951d-318c7d9a5dde.jpg?1783933628",
          "thumb": "https://cards.scryfall.io/thumb/front/9/b/9bd15da6-2b86-4dba-951d-318c7d9a5dde.webp?1783933628",
          "grid": "https://cards.scryfall.io/grid/front/9/b/9bd15da6-2b86-4dba-951d-318c7d9a5dde.webp?1783933628",
          "display": "https://cards.scryfall.io/display/front/9/b/9bd15da6-2b86-4dba-951d-318c7d9a5dde.webp?1783933628",
          "art": "https://cards.scryfall.io/art/front/9/b/9bd15da6-2b86-4dba-951d-318c7d9a5dde.webp?1783933628",
          "crop": "https://cards.scryfall.io/crop/front/9/b/9bd15da6-2b86-4dba-951d-318c7d9a5dde.webp?1783933628",
          "jpeg": "https://cards.scryfall.io/normal/front/9/b/9bd15da6-2b86-4dba-951d-318c7d9a5dde.jpg?1783933628"
        },
        "mana_cost": "{1}{R/G} // {R}{G}",
        "cmc": 4,
        "type_line": "Instant // Instant",
        "colors": [
          "G",
          "R"
        ],
        "color_identity": [
          "G",
          "R"
        ],
        "keywords": [],
        "card_faces": [
          {
            "object": "card_face",
            "name": "Collision",
            "mana_cost": "{1}{R/G}",
            "type_line": "Instant",
            "oracle_text": "Collision deals 6 damage to target creature with flying.",
            "watermark": "gruul",
            "artist": "Jason Rainville",
            "artist_id": "6ed7e669-579b-443d-b223-e5cbcb2a7483",
            "illustration_id": "6ea66509-b127-40a6-a7c2-a8382a7a1cb4"
          },
          {
            "object": "card_face",
            "name": "Colossus",
            "mana_cost": "{R}{G}",
            "type_line": "Instant",
            "oracle_text": "Target creature gets +4/+2 and gains trample until end of turn.",
            "watermark": "gruul",
            "artist": "Jason Rainville",
            "artist_id": "6ed7e669-579b-443d-b223-e5cbcb2a7483"
          }
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "legal",
          "timeless": "legal",
          "gladiator": "legal",
          "pioneer": "legal",
          "modern": "legal",
          "legacy": "legal",
          "pauper": "not_legal",
          "vintage": "legal",
          "penny": "not_legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "not_legal",
          "brawl": "legal",
          "competitivebrawl": "legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "legal"
        },
        "games": [
          "arena",
          "paper",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": false,
        "variation": false,
        "set_id": "97a7fd84-8d89-45a3-b48b-c951f6a3f9f1",
        "set": "rna",
        "set_name": "Ravnica Allegiance",
        "set_type": "expansion",
        "set_uri": "https://api.scryfall.com/sets/97a7fd84-8d89-45a3-b48b-c951f6a3f9f1",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Arna&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/rna?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/9bd15da6-2b86-4dba-951d-318c7d9a5dde/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A197ce21b-3387-4e76-a49c-04b9c371c031&unique=prints",
        "collector_number": "223",
        "digital": false,
        "rarity": "uncommon",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Jason Rainville",
        "artist_ids": [
          "6ed7e669-579b-443d-b223-e5cbcb2a7483"
        ],
        "illustration_id": "6ea66509-b127-40a6-a7c2-a8382a7a1cb4",
        "border_color": "black",
        "frame": "2015",
        "full_art": false,
        "textless": false,
        "booster": true,
        "story_spotlight": false,
        "edhrec_rank": 15789,
        "penny_rank": 6794,
        "prices": {
          "usd": "0.26",
          "usd_foil": "0.39",
          "usd_etched": null,
          "eur": "0.26",
          "eur_foil": "0.52",
          "tix": "0.03"
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=457367&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DCollision%2B%252F%252F%2BColossus",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DCollision%2B%252F%252F%2BColossus",
          "edhrec": "https://edhrec.com/route/?cc=Collision+%2F%2F+Colossus"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F183327%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=368423&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/71458?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "cultivate (::en)": {
        "object": "card",
        "id": "e60deb92-f7dd-4f4e-9036-e47dd586f985",
        "oracle_id": "8b755881-a72d-4e21-a369-d2924eb4585a",
        "multiverse_ids": [],
        "resource_id": "6B51D13A44879A90CAF1682D6434FE2B033F22C806C83B2031ECFA6C73845EBC",
        "mtgo_id": 150813,
        "tcgplayer_id": 697586,
        "cardmarket_id": 891839,
        "name": "Cultivate",
        "lang": "en",
        "released_at": "2026-06-26",
        "uri": "https://api.scryfall.com/cards/e60deb92-f7dd-4f4e-9036-e47dd586f985",
        "scryfall_uri": "https://scryfall.com/card/msc/172/cultivate?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T00:40:29Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/e/6/e60deb92-f7dd-4f4e-9036-e47dd586f985.jpg?1783903229",
          "normal": "https://cards.scryfall.io/normal/front/e/6/e60deb92-f7dd-4f4e-9036-e47dd586f985.jpg?1783903229",
          "large": "https://cards.scryfall.io/large/front/e/6/e60deb92-f7dd-4f4e-9036-e47dd586f985.jpg?1783903229",
          "png": "https://cards.scryfall.io/png/front/e/6/e60deb92-f7dd-4f4e-9036-e47dd586f985.png?1783903229",
          "art_crop": "https://cards.scryfall.io/art_crop/front/e/6/e60deb92-f7dd-4f4e-9036-e47dd586f985.jpg?1783903229",
          "border_crop": "https://cards.scryfall.io/border_crop/front/e/6/e60deb92-f7dd-4f4e-9036-e47dd586f985.jpg?1783903229",
          "thumb": "https://cards.scryfall.io/thumb/front/e/6/e60deb92-f7dd-4f4e-9036-e47dd586f985.webp?1783903229",
          "grid": "https://cards.scryfall.io/grid/front/e/6/e60deb92-f7dd-4f4e-9036-e47dd586f985.webp?1783903229",
          "display": "https://cards.scryfall.io/display/front/e/6/e60deb92-f7dd-4f4e-9036-e47dd586f985.webp?1783903229",
          "art": "https://cards.scryfall.io/art/front/e/6/e60deb92-f7dd-4f4e-9036-e47dd586f985.webp?1783903229",
          "crop": "https://cards.scryfall.io/crop/front/e/6/e60deb92-f7dd-4f4e-9036-e47dd586f985.webp?1783903229",
          "jpeg": "https://cards.scryfall.io/normal/front/e/6/e60deb92-f7dd-4f4e-9036-e47dd586f985.jpg?1783903229"
        },
        "mana_cost": "{2}{G}",
        "cmc": 3,
        "type_line": "Sorcery",
        "oracle_text": "Search your library for up to two basic land cards, reveal those cards, put one onto the battlefield tapped and the other into your hand, then shuffle.",
        "colors": [
          "G"
        ],
        "color_identity": [
          "G"
        ],
        "keywords": [],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "legal",
          "timeless": "legal",
          "gladiator": "legal",
          "pioneer": "legal",
          "modern": "legal",
          "legacy": "legal",
          "pauper": "legal",
          "vintage": "legal",
          "penny": "legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "not_legal",
          "brawl": "legal",
          "competitivebrawl": "legal",
          "alchemy": "not_legal",
          "paupercommander": "legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "legal",
          "tlr": "legal"
        },
        "games": [
          "paper",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": true,
        "variation": false,
        "set_id": "9d739461-c5ac-43a1-af41-3d5a585b5c8d",
        "set": "msc",
        "set_name": "Marvel Super Heroes Commander",
        "set_type": "commander",
        "set_uri": "https://api.scryfall.com/sets/9d739461-c5ac-43a1-af41-3d5a585b5c8d",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Amsc&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/msc?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/e60deb92-f7dd-4f4e-9036-e47dd586f985/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A8b755881-a72d-4e21-a369-d2924eb4585a&unique=prints",
        "collector_number": "172",
        "digital": false,
        "rarity": "common",
        "flavor_text": `"Don't get so caught up in the science that you forget to embrace the wonder in front of you."
\u2014Reed Richards, to Valeria Richards`,
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Darius Zablockis",
        "artist_ids": [
          "602daf30-797a-4071-991e-42d35f8969d1"
        ],
        "illustration_id": "4912d703-de4a-4884-981e-60678b7f507a",
        "border_color": "black",
        "frame": "2015",
        "full_art": false,
        "textless": false,
        "booster": false,
        "story_spotlight": false,
        "promo_types": [
          "surgefoil",
          "universesbeyond"
        ],
        "edhrec_rank": 20,
        "penny_rank": 1464,
        "prices": {
          "usd": "0.51",
          "usd_foil": null,
          "usd_etched": null,
          "eur": "0.47",
          "eur_foil": null,
          "tix": "0.04"
        },
        "related_uris": {
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DCultivate",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DCultivate",
          "edhrec": "https://edhrec.com/route/?cc=Cultivate"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F697586%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=891839&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/150813?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "domri rade (::en)": {
        "object": "card",
        "id": "9a7a5bbc-9d5a-461b-a5d7-a3f2e9b383be",
        "oracle_id": "0c4a2c42-0874-40b4-8d12-47eeadc3e976",
        "multiverse_ids": [
          643186
        ],
        "mtgo_id": 120885,
        "tcgplayer_id": 531009,
        "cardmarket_id": 748532,
        "name": "Domri Rade",
        "lang": "en",
        "released_at": "2024-01-12",
        "uri": "https://api.scryfall.com/cards/9a7a5bbc-9d5a-461b-a5d7-a3f2e9b383be",
        "scryfall_uri": "https://scryfall.com/card/rvr/179/domri-rade?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T03:28:11Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/9/a/9a7a5bbc-9d5a-461b-a5d7-a3f2e9b383be.jpg?1783913291",
          "normal": "https://cards.scryfall.io/normal/front/9/a/9a7a5bbc-9d5a-461b-a5d7-a3f2e9b383be.jpg?1783913291",
          "large": "https://cards.scryfall.io/large/front/9/a/9a7a5bbc-9d5a-461b-a5d7-a3f2e9b383be.jpg?1783913291",
          "png": "https://cards.scryfall.io/png/front/9/a/9a7a5bbc-9d5a-461b-a5d7-a3f2e9b383be.png?1783913291",
          "art_crop": "https://cards.scryfall.io/art_crop/front/9/a/9a7a5bbc-9d5a-461b-a5d7-a3f2e9b383be.jpg?1783913291",
          "border_crop": "https://cards.scryfall.io/border_crop/front/9/a/9a7a5bbc-9d5a-461b-a5d7-a3f2e9b383be.jpg?1783913291",
          "thumb": "https://cards.scryfall.io/thumb/front/9/a/9a7a5bbc-9d5a-461b-a5d7-a3f2e9b383be.webp?1783913291",
          "grid": "https://cards.scryfall.io/grid/front/9/a/9a7a5bbc-9d5a-461b-a5d7-a3f2e9b383be.webp?1783913291",
          "display": "https://cards.scryfall.io/display/front/9/a/9a7a5bbc-9d5a-461b-a5d7-a3f2e9b383be.webp?1783913291",
          "art": "https://cards.scryfall.io/art/front/9/a/9a7a5bbc-9d5a-461b-a5d7-a3f2e9b383be.webp?1783913291",
          "crop": "https://cards.scryfall.io/crop/front/9/a/9a7a5bbc-9d5a-461b-a5d7-a3f2e9b383be.webp?1783913291",
          "jpeg": "https://cards.scryfall.io/normal/front/9/a/9a7a5bbc-9d5a-461b-a5d7-a3f2e9b383be.jpg?1783913291"
        },
        "mana_cost": "{1}{R}{G}",
        "cmc": 3,
        "type_line": "Legendary Planeswalker \u2014 Domri",
        "oracle_text": `+1: Look at the top card of your library. If it's a creature card, you may reveal it and put it into your hand.
\u22122: Target creature you control fights another target creature.
\u22127: You get an emblem with "Creatures you control have double strike, trample, hexproof, and haste."`,
        "loyalty": "3",
        "colors": [
          "G",
          "R"
        ],
        "color_identity": [
          "G",
          "R"
        ],
        "keywords": [
          "Fight"
        ],
        "all_parts": [
          {
            "object": "related_card",
            "id": "36a56ad2-ca21-4ab4-a819-a20642d3fadd",
            "component": "combo_piece",
            "name": "Domri Rade",
            "type_line": "Legendary Planeswalker \u2014 Domri",
            "uri": "https://api.scryfall.com/cards/36a56ad2-ca21-4ab4-a819-a20642d3fadd"
          },
          {
            "object": "related_card",
            "id": "b9e8b1fe-7a73-4a04-84fa-f0e4696c9121",
            "component": "combo_piece",
            "name": "Domri Rade Emblem",
            "type_line": "Emblem \u2014 Domri",
            "uri": "https://api.scryfall.com/cards/b9e8b1fe-7a73-4a04-84fa-f0e4696c9121"
          }
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "legal",
          "timeless": "legal",
          "gladiator": "legal",
          "pioneer": "legal",
          "modern": "legal",
          "legacy": "legal",
          "pauper": "not_legal",
          "vintage": "legal",
          "penny": "legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "not_legal",
          "brawl": "legal",
          "competitivebrawl": "legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "legal"
        },
        "games": [
          "paper",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": true,
        "variation": false,
        "set_id": "fed2c8cd-ab92-44f6-808a-41e7809bcfe2",
        "set": "rvr",
        "set_name": "Ravnica Remastered",
        "set_type": "masters",
        "set_uri": "https://api.scryfall.com/sets/fed2c8cd-ab92-44f6-808a-41e7809bcfe2",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Arvr&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/rvr?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/9a7a5bbc-9d5a-461b-a5d7-a3f2e9b383be/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A0c4a2c42-0874-40b4-8d12-47eeadc3e976&unique=prints",
        "collector_number": "179",
        "digital": false,
        "rarity": "mythic",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Tyler Jacobson",
        "artist_ids": [
          "522af130-8db4-4b4b-950c-6e2b246339cf"
        ],
        "illustration_id": "e1ac23ac-2698-45c8-aeb2-c4ddf08ebc94",
        "border_color": "black",
        "frame": "2015",
        "security_stamp": "oval",
        "full_art": false,
        "textless": false,
        "booster": true,
        "story_spotlight": false,
        "edhrec_rank": 10551,
        "penny_rank": 3387,
        "prices": {
          "usd": "1.02",
          "usd_foil": "1.02",
          "usd_etched": null,
          "eur": "0.74",
          "eur_foil": "0.97",
          "tix": "0.03"
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=643186&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DDomri%2BRade",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DDomri%2BRade",
          "edhrec": "https://edhrec.com/route/?cc=Domri+Rade"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F531009%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=748532&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/120885?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "eomer king of rohan (::en)": {
        "object": "card",
        "id": "5f48930a-d7bd-410b-995a-4e2837aabb25",
        "oracle_id": "4f8191e6-a6aa-4426-9014-eff4e0efee9e",
        "multiverse_ids": [
          620738
        ],
        "mtgo_id": 113136,
        "tcgplayer_id": 499771,
        "cardmarket_id": 717441,
        "name": "\xC9omer, King of Rohan",
        "lang": "en",
        "released_at": "2023-06-23",
        "uri": "https://api.scryfall.com/cards/5f48930a-d7bd-410b-995a-4e2837aabb25",
        "scryfall_uri": "https://scryfall.com/card/ltc/52/%C3%A9omer-king-of-rohan?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T04:13:41Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/5/f/5f48930a-d7bd-410b-995a-4e2837aabb25.jpg?1783916021",
          "normal": "https://cards.scryfall.io/normal/front/5/f/5f48930a-d7bd-410b-995a-4e2837aabb25.jpg?1783916021",
          "large": "https://cards.scryfall.io/large/front/5/f/5f48930a-d7bd-410b-995a-4e2837aabb25.jpg?1783916021",
          "png": "https://cards.scryfall.io/png/front/5/f/5f48930a-d7bd-410b-995a-4e2837aabb25.png?1783916021",
          "art_crop": "https://cards.scryfall.io/art_crop/front/5/f/5f48930a-d7bd-410b-995a-4e2837aabb25.jpg?1783916021",
          "border_crop": "https://cards.scryfall.io/border_crop/front/5/f/5f48930a-d7bd-410b-995a-4e2837aabb25.jpg?1783916021",
          "thumb": "https://cards.scryfall.io/thumb/front/5/f/5f48930a-d7bd-410b-995a-4e2837aabb25.webp?1783916021",
          "grid": "https://cards.scryfall.io/grid/front/5/f/5f48930a-d7bd-410b-995a-4e2837aabb25.webp?1783916021",
          "display": "https://cards.scryfall.io/display/front/5/f/5f48930a-d7bd-410b-995a-4e2837aabb25.webp?1783916021",
          "art": "https://cards.scryfall.io/art/front/5/f/5f48930a-d7bd-410b-995a-4e2837aabb25.webp?1783916021",
          "crop": "https://cards.scryfall.io/crop/front/5/f/5f48930a-d7bd-410b-995a-4e2837aabb25.webp?1783916021",
          "jpeg": "https://cards.scryfall.io/normal/front/5/f/5f48930a-d7bd-410b-995a-4e2837aabb25.jpg?1783916021"
        },
        "mana_cost": "{3}{R}{W}",
        "cmc": 5,
        "type_line": "Legendary Creature \u2014 Human Noble",
        "oracle_text": "Double strike\n\xC9omer enters with a +1/+1 counter on it for each other Human you control.\nWhen \xC9omer enters, target player becomes the monarch. \xC9omer deals damage equal to its power to any target.",
        "power": "2",
        "toughness": "2",
        "colors": [
          "R",
          "W"
        ],
        "color_identity": [
          "R",
          "W"
        ],
        "keywords": [
          "Double strike"
        ],
        "all_parts": [
          {
            "object": "related_card",
            "id": "a60fd036-8df3-49b8-8413-acc6af12106d",
            "component": "combo_piece",
            "name": "\xC9omer, King of Rohan",
            "type_line": "Legendary Creature \u2014 Human Noble",
            "uri": "https://api.scryfall.com/cards/a60fd036-8df3-49b8-8413-acc6af12106d"
          },
          {
            "object": "related_card",
            "id": "63455c28-3e53-45b1-8d0b-a5045dab1fb9",
            "component": "combo_piece",
            "name": "The Monarch",
            "type_line": "Card",
            "uri": "https://api.scryfall.com/cards/63455c28-3e53-45b1-8d0b-a5045dab1fb9"
          }
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "not_legal",
          "timeless": "not_legal",
          "gladiator": "not_legal",
          "pioneer": "not_legal",
          "modern": "not_legal",
          "legacy": "legal",
          "pauper": "not_legal",
          "vintage": "legal",
          "penny": "not_legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "not_legal",
          "brawl": "not_legal",
          "competitivebrawl": "not_legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "not_legal"
        },
        "games": [
          "paper",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": false,
        "nonfoil": true,
        "finishes": [
          "nonfoil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": false,
        "variation": false,
        "set_id": "e567c19c-0fe4-446e-a7bf-fce8a150cd2e",
        "set": "ltc",
        "set_name": "Tales of Middle-earth Commander",
        "set_type": "commander",
        "set_uri": "https://api.scryfall.com/sets/e567c19c-0fe4-446e-a7bf-fce8a150cd2e",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Altc&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/ltc?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/5f48930a-d7bd-410b-995a-4e2837aabb25/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A4f8191e6-a6aa-4426-9014-eff4e0efee9e&unique=prints",
        "collector_number": "52",
        "digital": false,
        "rarity": "rare",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Leonardo Borazio",
        "artist_ids": [
          "608e3b85-cdd3-4d1a-8a3a-7f1ed8856f6b"
        ],
        "illustration_id": "30e6739c-f61d-4ded-b628-1c086ce87095",
        "border_color": "black",
        "frame": "2015",
        "frame_effects": [
          "legendary"
        ],
        "security_stamp": "triangle",
        "full_art": false,
        "textless": false,
        "booster": false,
        "story_spotlight": false,
        "promo_types": [
          "universesbeyond"
        ],
        "edhrec_rank": 4835,
        "prices": {
          "usd": "0.36",
          "usd_foil": null,
          "usd_etched": null,
          "eur": "0.56",
          "eur_foil": null,
          "tix": "0.91"
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=620738&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3D%25C3%2589omer%252C%2BKing%2Bof%2BRohan",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3D%25C3%2589omer%252C%2BKing%2Bof%2BRohan",
          "edhrec": "https://edhrec.com/route/?cc=%C3%89omer%2C+King+of+Rohan"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F499771%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=717441&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/113136?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "esper (::en)": {
        "object": "card",
        "id": "ffdf27d3-80b4-4aa1-b943-d247e502d32c",
        "oracle_id": "4eebfaf3-18da-4661-b6a5-d874585e170a",
        "multiverse_ids": [
          614932
        ],
        "mtgo_id": 110646,
        "tcgplayer_id": 490482,
        "cardmarket_id": 705488,
        "name": "Esper",
        "lang": "en",
        "released_at": "2023-04-21",
        "uri": "https://api.scryfall.com/cards/ffdf27d3-80b4-4aa1-b943-d247e502d32c",
        "scryfall_uri": "https://scryfall.com/card/moc/49/esper?utm_source=api",
        "layout": "planar",
        "highres_image": false,
        "image_status": "lowres",
        "image_updated_at": "2026-07-13T04:34:43Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/f/f/ffdf27d3-80b4-4aa1-b943-d247e502d32c.jpg?1783917283",
          "normal": "https://cards.scryfall.io/normal/front/f/f/ffdf27d3-80b4-4aa1-b943-d247e502d32c.jpg?1783917283",
          "large": "https://cards.scryfall.io/large/front/f/f/ffdf27d3-80b4-4aa1-b943-d247e502d32c.jpg?1783917283",
          "png": "https://cards.scryfall.io/png/front/f/f/ffdf27d3-80b4-4aa1-b943-d247e502d32c.png?1783917283",
          "art_crop": "https://cards.scryfall.io/art_crop/front/f/f/ffdf27d3-80b4-4aa1-b943-d247e502d32c.jpg?1783917283",
          "border_crop": "https://cards.scryfall.io/border_crop/front/f/f/ffdf27d3-80b4-4aa1-b943-d247e502d32c.jpg?1783917283",
          "thumb": "https://cards.scryfall.io/thumb/front/f/f/ffdf27d3-80b4-4aa1-b943-d247e502d32c.webp?1783917283",
          "grid": "https://cards.scryfall.io/grid/front/f/f/ffdf27d3-80b4-4aa1-b943-d247e502d32c.webp?1783917283",
          "display": "https://cards.scryfall.io/display/front/f/f/ffdf27d3-80b4-4aa1-b943-d247e502d32c.webp?1783917283",
          "art": "https://cards.scryfall.io/art/front/f/f/ffdf27d3-80b4-4aa1-b943-d247e502d32c.webp?1783917283",
          "crop": "https://cards.scryfall.io/crop/front/f/f/ffdf27d3-80b4-4aa1-b943-d247e502d32c.webp?1783917283",
          "jpeg": "https://cards.scryfall.io/normal/front/f/f/ffdf27d3-80b4-4aa1-b943-d247e502d32c.jpg?1783917283"
        },
        "mana_cost": "",
        "cmc": 0,
        "type_line": "Plane \u2014 Alara",
        "oracle_text": "Artifact spells cost {1} less to cast.\nWhenever chaos ensues, creatures you control that are white, blue, and/or black become artifacts in addition to their other types until end of turn. Then each artifact creature you control gains vigilance, menace, and lifelink until end of turn.",
        "colors": [],
        "color_identity": [],
        "keywords": [],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "not_legal",
          "timeless": "not_legal",
          "gladiator": "not_legal",
          "pioneer": "not_legal",
          "modern": "not_legal",
          "legacy": "not_legal",
          "pauper": "not_legal",
          "vintage": "not_legal",
          "penny": "not_legal",
          "commander": "not_legal",
          "oathbreaker": "not_legal",
          "standardbrawl": "not_legal",
          "brawl": "not_legal",
          "competitivebrawl": "not_legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "not_legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "not_legal"
        },
        "games": [
          "paper",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": false,
        "nonfoil": true,
        "finishes": [
          "nonfoil"
        ],
        "oversized": true,
        "promo": false,
        "reprint": false,
        "variation": false,
        "set_id": "6bba5de9-5afb-42af-a7eb-24ac854bf671",
        "set": "moc",
        "set_name": "March of the Machine Commander",
        "set_type": "commander",
        "set_uri": "https://api.scryfall.com/sets/6bba5de9-5afb-42af-a7eb-24ac854bf671",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Amoc&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/moc?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/ffdf27d3-80b4-4aa1-b943-d247e502d32c/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A4eebfaf3-18da-4661-b6a5-d874585e170a&unique=prints",
        "collector_number": "49",
        "digital": false,
        "rarity": "common",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Bruce Brenneise",
        "artist_ids": [
          "91d65465-e8a6-4a4e-8b0e-0e07466cfa0f"
        ],
        "illustration_id": "b6689314-0f56-4483-a214-e744fd0d55e5",
        "border_color": "black",
        "frame": "2015",
        "full_art": false,
        "textless": false,
        "booster": false,
        "story_spotlight": false,
        "preview": {
          "source": "Wizards of the Coast",
          "source_uri": "https://magic.wizards.com/en/news/card-image-gallery/march-of-the-machine-planechase",
          "previewed_at": "2023-03-29"
        },
        "prices": {
          "usd": "7.14",
          "usd_foil": null,
          "usd_etched": null,
          "eur": "0.87",
          "eur_foil": null,
          "tix": "0.01"
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=614932&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DEsper",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DEsper",
          "edhrec": "https://edhrec.com/route/?cc=Esper"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F490482%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=705488&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/110646?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "etali primal conqueror (::en)": {
        "object": "card",
        "id": "95c14c4d-6c16-4826-8d93-d89ad04aee09",
        "oracle_id": "7514e401-7aa1-405d-9f7a-312b4e630cc2",
        "multiverse_ids": [
          607175,
          607176
        ],
        "mtgo_id": 110122,
        "arena_id": 84411,
        "tcgplayer_id": 490390,
        "cardmarket_id": 703459,
        "name": "Etali, Primal Conqueror // Etali, Primal Sickness",
        "lang": "en",
        "released_at": "2023-04-21",
        "uri": "https://api.scryfall.com/cards/95c14c4d-6c16-4826-8d93-d89ad04aee09",
        "scryfall_uri": "https://scryfall.com/card/mom/137/etali-primal-conqueror-etali-primal-sickness?utm_source=api",
        "layout": "transform",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T04:29:57Z",
        "cmc": 7,
        "type_line": "Legendary Creature \u2014 Elder Dinosaur // Legendary Creature \u2014 Phyrexian Elder Dinosaur",
        "color_identity": [
          "G",
          "R"
        ],
        "keywords": [
          "Indestructible",
          "Transform",
          "Trample"
        ],
        "card_faces": [
          {
            "object": "card_face",
            "name": "Etali, Primal Conqueror",
            "mana_cost": "{5}{R}{R}",
            "type_line": "Legendary Creature \u2014 Elder Dinosaur",
            "oracle_text": "Trample\nWhen Etali enters, each player exiles cards from the top of their library until they exile a nonland card. You may cast any number of spells from among the nonland cards exiled this way without paying their mana costs.\n{9}{G/P}: Transform Etali. Activate only as a sorcery.",
            "colors": [
              "R"
            ],
            "power": "7",
            "toughness": "7",
            "artist": "Ryan Pancoast",
            "artist_id": "89cc9475-dda2-4d13-bf88-54b92867a25c",
            "illustration_id": "47b780f9-e4ae-4d5c-92a2-05984328b350",
            "image_uris": {
              "small": "https://cards.scryfall.io/small/front/9/5/95c14c4d-6c16-4826-8d93-d89ad04aee09.jpg?1783916997",
              "normal": "https://cards.scryfall.io/normal/front/9/5/95c14c4d-6c16-4826-8d93-d89ad04aee09.jpg?1783916997",
              "large": "https://cards.scryfall.io/large/front/9/5/95c14c4d-6c16-4826-8d93-d89ad04aee09.jpg?1783916997",
              "png": "https://cards.scryfall.io/png/front/9/5/95c14c4d-6c16-4826-8d93-d89ad04aee09.png?1783916997",
              "art_crop": "https://cards.scryfall.io/art_crop/front/9/5/95c14c4d-6c16-4826-8d93-d89ad04aee09.jpg?1783916997",
              "border_crop": "https://cards.scryfall.io/border_crop/front/9/5/95c14c4d-6c16-4826-8d93-d89ad04aee09.jpg?1783916997",
              "thumb": "https://cards.scryfall.io/thumb/front/9/5/95c14c4d-6c16-4826-8d93-d89ad04aee09.webp?1783916997",
              "grid": "https://cards.scryfall.io/grid/front/9/5/95c14c4d-6c16-4826-8d93-d89ad04aee09.webp?1783916997",
              "display": "https://cards.scryfall.io/display/front/9/5/95c14c4d-6c16-4826-8d93-d89ad04aee09.webp?1783916997",
              "art": "https://cards.scryfall.io/art/front/9/5/95c14c4d-6c16-4826-8d93-d89ad04aee09.webp?1783916997",
              "crop": "https://cards.scryfall.io/crop/front/9/5/95c14c4d-6c16-4826-8d93-d89ad04aee09.webp?1783916997",
              "jpeg": "https://cards.scryfall.io/normal/front/9/5/95c14c4d-6c16-4826-8d93-d89ad04aee09.jpg?1783916997"
            }
          },
          {
            "object": "card_face",
            "name": "Etali, Primal Sickness",
            "mana_cost": "",
            "type_line": "Legendary Creature \u2014 Phyrexian Elder Dinosaur",
            "oracle_text": "Trample, indestructible\nWhenever Etali deals combat damage to a player, they get that many poison counters. (A player with ten or more poison counters loses the game.)",
            "colors": [
              "G",
              "R"
            ],
            "color_indicator": [
              "G",
              "R"
            ],
            "power": "11",
            "toughness": "11",
            "flavor_text": "The contagion spreads and the Multiverse quakes.",
            "artist": "Ryan Pancoast",
            "artist_id": "89cc9475-dda2-4d13-bf88-54b92867a25c",
            "illustration_id": "03b404c9-fc26-4b29-af13-441083006065",
            "image_uris": {
              "small": "https://cards.scryfall.io/small/back/9/5/95c14c4d-6c16-4826-8d93-d89ad04aee09.jpg?1783916997",
              "normal": "https://cards.scryfall.io/normal/back/9/5/95c14c4d-6c16-4826-8d93-d89ad04aee09.jpg?1783916997",
              "large": "https://cards.scryfall.io/large/back/9/5/95c14c4d-6c16-4826-8d93-d89ad04aee09.jpg?1783916997",
              "png": "https://cards.scryfall.io/png/back/9/5/95c14c4d-6c16-4826-8d93-d89ad04aee09.png?1783916997",
              "art_crop": "https://cards.scryfall.io/art_crop/back/9/5/95c14c4d-6c16-4826-8d93-d89ad04aee09.jpg?1783916997",
              "border_crop": "https://cards.scryfall.io/border_crop/back/9/5/95c14c4d-6c16-4826-8d93-d89ad04aee09.jpg?1783916997",
              "thumb": "https://cards.scryfall.io/thumb/back/9/5/95c14c4d-6c16-4826-8d93-d89ad04aee09.webp?1783916997",
              "grid": "https://cards.scryfall.io/grid/back/9/5/95c14c4d-6c16-4826-8d93-d89ad04aee09.webp?1783916997",
              "display": "https://cards.scryfall.io/display/back/9/5/95c14c4d-6c16-4826-8d93-d89ad04aee09.webp?1783916997",
              "art": "https://cards.scryfall.io/art/back/9/5/95c14c4d-6c16-4826-8d93-d89ad04aee09.webp?1783916997",
              "crop": "https://cards.scryfall.io/crop/back/9/5/95c14c4d-6c16-4826-8d93-d89ad04aee09.webp?1783916997",
              "jpeg": "https://cards.scryfall.io/normal/back/9/5/95c14c4d-6c16-4826-8d93-d89ad04aee09.jpg?1783916997"
            }
          }
        ],
        "all_parts": [
          {
            "object": "related_card",
            "id": "8a9cb417-8709-4336-be36-2fb0cea31fe1",
            "component": "combo_piece",
            "name": "Poison Counter",
            "type_line": "Card",
            "uri": "https://api.scryfall.com/cards/8a9cb417-8709-4336-be36-2fb0cea31fe1"
          },
          {
            "object": "related_card",
            "id": "3e97c609-3932-4428-96d4-1c97e61f0abb",
            "component": "combo_piece",
            "name": "Etali, Primal Conqueror // Etali, Primal Sickness",
            "type_line": "Legendary Creature \u2014 Elder Dinosaur // Legendary Creature \u2014 Phyrexian Elder Dinosaur",
            "uri": "https://api.scryfall.com/cards/3e97c609-3932-4428-96d4-1c97e61f0abb"
          }
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "legal",
          "timeless": "legal",
          "gladiator": "legal",
          "pioneer": "legal",
          "modern": "legal",
          "legacy": "legal",
          "pauper": "not_legal",
          "vintage": "legal",
          "penny": "legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "not_legal",
          "brawl": "legal",
          "competitivebrawl": "legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "not_legal"
        },
        "games": [
          "paper",
          "mtgo",
          "arena"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": false,
        "variation": false,
        "set_id": "392f7315-dc53-40a3-a2cc-5482dbd498b3",
        "set": "mom",
        "set_name": "March of the Machine",
        "set_type": "expansion",
        "set_uri": "https://api.scryfall.com/sets/392f7315-dc53-40a3-a2cc-5482dbd498b3",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Amom&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/mom?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/95c14c4d-6c16-4826-8d93-d89ad04aee09/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A7514e401-7aa1-405d-9f7a-312b4e630cc2&unique=prints",
        "collector_number": "137",
        "digital": false,
        "rarity": "rare",
        "artist": "Ryan Pancoast",
        "artist_ids": [
          "89cc9475-dda2-4d13-bf88-54b92867a25c"
        ],
        "border_color": "black",
        "frame": "2015",
        "frame_effects": [
          "legendary"
        ],
        "security_stamp": "oval",
        "full_art": false,
        "textless": false,
        "booster": true,
        "story_spotlight": false,
        "edhrec_rank": 812,
        "penny_rank": 2331,
        "preview": {
          "source": "Wizards of the Coast",
          "source_uri": "https://youtu.be/U6jjgTUsTBY?t=77",
          "previewed_at": "2023-03-29"
        },
        "prices": {
          "usd": "26.13",
          "usd_foil": "32.61",
          "usd_etched": null,
          "eur": "23.09",
          "eur_foil": "27.52",
          "tix": "0.02"
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=607175&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DEtali%252C%2BPrimal%2BConqueror%2B%252F%252F%2BEtali%252C%2BPrimal%2BSickness",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DEtali%252C%2BPrimal%2BConqueror%2B%252F%252F%2BEtali%252C%2BPrimal%2BSickness",
          "edhrec": "https://edhrec.com/route/?cc=Etali%2C+Primal+Conqueror"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F490390%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=703459&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/110122?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "fire ice (::en)": {
        "object": "card",
        "id": "18303862-4726-4136-814f-157aa7006579",
        "oracle_id": "ae92942b-919c-4ea9-b693-85fcef765d5a",
        "multiverse_ids": [
          599089
        ],
        "mtgo_id": 107951,
        "tcgplayer_id": 457193,
        "cardmarket_id": 688401,
        "name": "Fire // Ice",
        "lang": "en",
        "released_at": "2023-01-13",
        "uri": "https://api.scryfall.com/cards/18303862-4726-4136-814f-157aa7006579",
        "scryfall_uri": "https://scryfall.com/card/dmr/215/fire-ice?utm_source=api",
        "layout": "split",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T04:53:40Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/1/8/18303862-4726-4136-814f-157aa7006579.jpg?1783918420",
          "normal": "https://cards.scryfall.io/normal/front/1/8/18303862-4726-4136-814f-157aa7006579.jpg?1783918420",
          "large": "https://cards.scryfall.io/large/front/1/8/18303862-4726-4136-814f-157aa7006579.jpg?1783918420",
          "png": "https://cards.scryfall.io/png/front/1/8/18303862-4726-4136-814f-157aa7006579.png?1783918420",
          "art_crop": "https://cards.scryfall.io/art_crop/front/1/8/18303862-4726-4136-814f-157aa7006579.jpg?1783918420",
          "border_crop": "https://cards.scryfall.io/border_crop/front/1/8/18303862-4726-4136-814f-157aa7006579.jpg?1783918420",
          "thumb": "https://cards.scryfall.io/thumb/front/1/8/18303862-4726-4136-814f-157aa7006579.webp?1783918420",
          "grid": "https://cards.scryfall.io/grid/front/1/8/18303862-4726-4136-814f-157aa7006579.webp?1783918420",
          "display": "https://cards.scryfall.io/display/front/1/8/18303862-4726-4136-814f-157aa7006579.webp?1783918420",
          "art": "https://cards.scryfall.io/art/front/1/8/18303862-4726-4136-814f-157aa7006579.webp?1783918420",
          "crop": "https://cards.scryfall.io/crop/front/1/8/18303862-4726-4136-814f-157aa7006579.webp?1783918420",
          "jpeg": "https://cards.scryfall.io/normal/front/1/8/18303862-4726-4136-814f-157aa7006579.jpg?1783918420"
        },
        "mana_cost": "{1}{R} // {1}{U}",
        "cmc": 4,
        "type_line": "Instant // Instant",
        "colors": [
          "R",
          "U"
        ],
        "color_identity": [
          "R",
          "U"
        ],
        "keywords": [],
        "card_faces": [
          {
            "object": "card_face",
            "name": "Fire",
            "mana_cost": "{1}{R}",
            "type_line": "Instant",
            "oracle_text": "Fire deals 2 damage divided as you choose among one or two targets.",
            "artist": "David Martin",
            "artist_id": "996ad764-4ae0-4952-8bb5-5a75c9d68275",
            "illustration_id": "c890cb20-7e04-4ad0-96a6-8854cd409c14"
          },
          {
            "object": "card_face",
            "name": "Ice",
            "mana_cost": "{1}{U}",
            "type_line": "Instant",
            "oracle_text": "Tap target permanent.\nDraw a card.",
            "artist": "Franz Vohwinkel",
            "artist_id": "3a243c17-3baa-4b53-9599-645311cd7d3d"
          }
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "not_legal",
          "timeless": "not_legal",
          "gladiator": "not_legal",
          "pioneer": "not_legal",
          "modern": "legal",
          "legacy": "legal",
          "pauper": "legal",
          "vintage": "legal",
          "penny": "not_legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "not_legal",
          "brawl": "not_legal",
          "competitivebrawl": "not_legal",
          "alchemy": "not_legal",
          "paupercommander": "legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "legal",
          "predh": "legal",
          "tlr": "legal"
        },
        "games": [
          "paper",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": true,
        "variation": false,
        "set_id": "ca4c2884-e539-4b7f-980d-5d6a50220f2a",
        "set": "dmr",
        "set_name": "Dominaria Remastered",
        "set_type": "masters",
        "set_uri": "https://api.scryfall.com/sets/ca4c2884-e539-4b7f-980d-5d6a50220f2a",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Admr&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/dmr?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/18303862-4726-4136-814f-157aa7006579/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3Aae92942b-919c-4ea9-b693-85fcef765d5a&unique=prints",
        "collector_number": "215",
        "digital": false,
        "rarity": "uncommon",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "David Martin & Franz Vohwinkel",
        "artist_ids": [
          "996ad764-4ae0-4952-8bb5-5a75c9d68275",
          "3a243c17-3baa-4b53-9599-645311cd7d3d"
        ],
        "illustration_id": "c890cb20-7e04-4ad0-96a6-8854cd409c14",
        "border_color": "black",
        "frame": "2015",
        "full_art": false,
        "textless": false,
        "booster": true,
        "story_spotlight": false,
        "edhrec_rank": 13212,
        "penny_rank": 401,
        "prices": {
          "usd": "0.19",
          "usd_foil": "0.33",
          "usd_etched": null,
          "eur": "0.22",
          "eur_foil": "0.50",
          "tix": "0.52"
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=599089&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DFire%2B%252F%252F%2BIce",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DFire%2B%252F%252F%2BIce",
          "edhrec": "https://edhrec.com/route/?cc=Fire+%2F%2F+Ice"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F457193%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=688401&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/107951?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "folk hero (::en)": {
        "object": "card",
        "id": "85bf7c95-4534-435b-bb25-f39340ecf9be",
        "oracle_id": "c5126d6e-969c-4034-98e3-f8653163346f",
        "multiverse_ids": [],
        "resource_id": "67D1631E5A0DB1E634AF4E8954BCC2132ED73ABF663D5F9A4565BEDEBCB5A773",
        "mtgo_id": 150733,
        "tcgplayer_id": 697106,
        "cardmarket_id": 891657,
        "name": "Folk Hero",
        "lang": "en",
        "released_at": "2026-06-26",
        "uri": "https://api.scryfall.com/cards/85bf7c95-4534-435b-bb25-f39340ecf9be",
        "scryfall_uri": "https://scryfall.com/card/msc/132/folk-hero?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T00:40:47Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/8/5/85bf7c95-4534-435b-bb25-f39340ecf9be.jpg?1783903247",
          "normal": "https://cards.scryfall.io/normal/front/8/5/85bf7c95-4534-435b-bb25-f39340ecf9be.jpg?1783903247",
          "large": "https://cards.scryfall.io/large/front/8/5/85bf7c95-4534-435b-bb25-f39340ecf9be.jpg?1783903247",
          "png": "https://cards.scryfall.io/png/front/8/5/85bf7c95-4534-435b-bb25-f39340ecf9be.png?1783903247",
          "art_crop": "https://cards.scryfall.io/art_crop/front/8/5/85bf7c95-4534-435b-bb25-f39340ecf9be.jpg?1783903247",
          "border_crop": "https://cards.scryfall.io/border_crop/front/8/5/85bf7c95-4534-435b-bb25-f39340ecf9be.jpg?1783903247",
          "thumb": "https://cards.scryfall.io/thumb/front/8/5/85bf7c95-4534-435b-bb25-f39340ecf9be.webp?1783903247",
          "grid": "https://cards.scryfall.io/grid/front/8/5/85bf7c95-4534-435b-bb25-f39340ecf9be.webp?1783903247",
          "display": "https://cards.scryfall.io/display/front/8/5/85bf7c95-4534-435b-bb25-f39340ecf9be.webp?1783903247",
          "art": "https://cards.scryfall.io/art/front/8/5/85bf7c95-4534-435b-bb25-f39340ecf9be.webp?1783903247",
          "crop": "https://cards.scryfall.io/crop/front/8/5/85bf7c95-4534-435b-bb25-f39340ecf9be.webp?1783903247",
          "jpeg": "https://cards.scryfall.io/normal/front/8/5/85bf7c95-4534-435b-bb25-f39340ecf9be.jpg?1783903247"
        },
        "mana_cost": "{1}{W}",
        "cmc": 2,
        "type_line": "Legendary Enchantment \u2014 Background",
        "oracle_text": 'Commander creatures you own have "Whenever you cast a spell that shares a creature type with this creature, draw a card. This ability triggers only once each turn."',
        "colors": [
          "W"
        ],
        "color_identity": [
          "W"
        ],
        "keywords": [],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "not_legal",
          "timeless": "not_legal",
          "gladiator": "not_legal",
          "pioneer": "not_legal",
          "modern": "not_legal",
          "legacy": "legal",
          "pauper": "not_legal",
          "vintage": "legal",
          "penny": "not_legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "not_legal",
          "brawl": "not_legal",
          "competitivebrawl": "not_legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "legal"
        },
        "games": [
          "paper",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": true,
        "variation": false,
        "set_id": "9d739461-c5ac-43a1-af41-3d5a585b5c8d",
        "set": "msc",
        "set_name": "Marvel Super Heroes Commander",
        "set_type": "commander",
        "set_uri": "https://api.scryfall.com/sets/9d739461-c5ac-43a1-af41-3d5a585b5c8d",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Amsc&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/msc?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/85bf7c95-4534-435b-bb25-f39340ecf9be/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3Ac5126d6e-969c-4034-98e3-f8653163346f&unique=prints",
        "collector_number": "132",
        "digital": false,
        "rarity": "mythic",
        "flavor_text": "When evil arises, heroes are born.",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "John Tyler Christopher",
        "artist_ids": [
          "b029218f-baba-45aa-8f5a-24353077dcc9"
        ],
        "illustration_id": "5e5826d0-a08c-4012-a962-cbef466b060a",
        "border_color": "black",
        "frame": "2015",
        "frame_effects": [
          "enchantment",
          "legendary"
        ],
        "security_stamp": "oval",
        "full_art": false,
        "textless": false,
        "booster": false,
        "story_spotlight": false,
        "promo_types": [
          "surgefoil",
          "universesbeyond"
        ],
        "edhrec_rank": 3735,
        "prices": {
          "usd": "0.79",
          "usd_foil": null,
          "usd_etched": null,
          "eur": "0.88",
          "eur_foil": null,
          "tix": "0.57"
        },
        "related_uris": {
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DFolk%2BHero",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DFolk%2BHero",
          "edhrec": "https://edhrec.com/route/?cc=Folk+Hero"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F697106%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=891657&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/150733?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "forest (::en)": {
        "object": "card",
        "id": "2e781bfd-f8cb-4d20-b977-4359f3a21311",
        "oracle_id": "b34bb2dc-c1af-4d77-b0b3-a0fb342a5fc6",
        "multiverse_ids": [],
        "tcgplayer_id": 723327,
        "name": "Forest",
        "lang": "en",
        "released_at": "2027-04-09",
        "uri": "https://api.scryfall.com/cards/2e781bfd-f8cb-4d20-b977-4359f3a21311",
        "scryfall_uri": "https://scryfall.com/card/mdd/301/forest?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-10-09T20:38:37Z",
        "image_uris": {
          "small": "https://cards.scryfall/.io/small/front/2/e/2e781bfd-f8cb-4d20-b977-4359f3a21311.jpg?1791578317",
          "normal": "https://cards.scryfall.io/normal/front/2/e/2e781bfd-f8cb-4d20-b977-4359f3a21311.jpg?1791578317",
          "large": "https://cards.scryfall.io/large/front/2/e/2e781bfd-f8cb-4d20-b977-4359f3a21311.jpg?1791578317",
          "png": "https://cards.scryfall.io/png/front/2/e/2e781bfd-f8cb-4d20-b977-4359f3a21311.png?1791578317",
          "art_crop": "https://cards.scryfall.io/art_crop/front/2/e/2e781bfd-f8cb-4d20-b977-4359f3a21311.jpg?1791578317",
          "border_crop": "https://cards.scryfall.io/border_crop/front/2/e/2e781bfd-f8cb-4d20-b977-4359f3a21311.jpg?1791578317",
          "thumb": "https://cards.scryfall.io/thumb/front/2/e/2e781bfd-f8cb-4d20-b977-4359f3a21311.webp?1791578317",
          "grid": "https://cards.scryfall.io/grid/front/2/e/2e781bfd-f8cb-4d20-b977-4359f3a21311.webp?1791578317",
          "display": "https://cards.scryfall.io/display/front/2/e/2e781bfd-f8cb-4d20-b977-4359f3a21311.webp?1791578317",
          "art": "https://cards.scryfall.io/art/front/2/e/2e781bfd-f8cb-4d20-b977-4359f3a21311.webp?1791578317",
          "crop": "https://cards.scryfall.io/crop/front/2/e/2e781bfd-f8cb-4d20-b977-4359f3a21311.webp?1791578317",
          "jpeg": "https://cards.scryfall.io/normal/front/2/e/2e781bfd-f8cb-4d20-b977-4359f3a21311.jpg?1791578317"
        },
        "mana_cost": "",
        "cmc": 0,
        "type_line": "Basic Land \u2014 Forest",
        "oracle_text": "({T}: Add {G}.)",
        "colors": [],
        "color_identity": [
          "G"
        ],
        "keywords": [],
        "produced_mana": [
          "G"
        ],
        "all_parts": [
          {
            "object": "related_card",
            "id": "2e781bfd-f8cb-4d20-b977-4359f3a21311",
            "component": "combo_piece",
            "name": "Forest",
            "type_line": "Basic Land \u2014 Forest",
            "uri": "https://api.scryfall.com/cards/2e781bfd-f8cb-4d20-b977-4359f3a21311"
          },
          {
            "object": "related_card",
            "id": "aed8ae06-ae54-4a16-8830-6547164ce6ae",
            "component": "combo_piece",
            "name": "Gilt-Leaf Alchemist",
            "type_line": "Creature \u2014 Elf Druid",
            "uri": "https://api.scryfall.com/cards/aed8ae06-ae54-4a16-8830-6547164ce6ae"
          }
        ],
        "legalities": {
          "standard": "legal",
          "future": "legal",
          "historic": "legal",
          "timeless": "legal",
          "gladiator": "legal",
          "pioneer": "legal",
          "modern": "legal",
          "legacy": "legal",
          "pauper": "legal",
          "vintage": "legal",
          "penny": "legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "legal",
          "brawl": "legal",
          "competitivebrawl": "legal",
          "alchemy": "legal",
          "paupercommander": "legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "legal",
          "predh": "legal",
          "tlr": "legal"
        },
        "games": [
          "paper",
          "mtgo",
          "arena"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": true,
        "variation": false,
        "set_id": "1c75c20b-221e-47c5-83be-f3be4c15087d",
        "set": "mdd",
        "set_name": "Marvel: Darkhold Destiny",
        "set_type": "expansion",
        "set_uri": "https://api.scryfall.com/sets/1c75c20b-221e-47c5-83be-f3be4c15087d",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Amdd&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/mdd?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/2e781bfd-f8cb-4d20-b977-4359f3a21311/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3Ab34bb2dc-c1af-4d77-b0b3-a0fb342a5fc6&unique=prints",
        "collector_number": "301",
        "digital": false,
        "rarity": "common",
        "flavor_text": `"You have only one mission, minions: protect me with your lives. In order to do this, you need to wear down Captain Britain's psyche. In order to do *that*, you need to burn down her precious lands. Am I understood?"
\u2014Morgan Le Fay`,
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Samuele Bandini",
        "artist_ids": [
          "f16f5903-990f-4ffe-88fb-fd54d0d8752b"
        ],
        "illustration_id": "8257a642-c33f-4926-b2b1-0617a2ef48c2",
        "border_color": "black",
        "frame": "2015",
        "full_art": false,
        "textless": false,
        "booster": false,
        "story_spotlight": false,
        "preview": {
          "source": "TheGamer",
          "source_uri": "https://www.thegamer.com/mtg-marvel-darkhold-destiny-universes-beyond-reveal/",
          "previewed_at": "2026-10-09"
        },
        "prices": {
          "usd": null,
          "usd_foil": null,
          "usd_etched": null,
          "eur": null,
          "eur_foil": null,
          "tix": null
        },
        "related_uris": {
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DForest",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DForest",
          "edhrec": "https://edhrec.com/route/?cc=Forest"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F723327%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products/Search?referrer=scryfall&searchString=Forest&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards?affiliate_id=scryfall&data%5Bsearch%5D=Forest&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "forest (::fr)": {
        "object": "card",
        "id": "f522fe8b-155d-4eff-8593-8920d6a35f0c",
        "oracle_id": "b34bb2dc-c1af-4d77-b0b3-a0fb342a5fc6",
        "multiverse_ids": [],
        "resource_id": "2A0541E887BC873242345CA7EF9C00EFE7CA2DF4B6A97B998382068FC135408F",
        "name": "Forest",
        "printed_name": "For\xEAt",
        "lang": "fr",
        "released_at": "2026-10-02",
        "uri": "https://api.scryfall.com/cards/f522fe8b-155d-4eff-8593-8920d6a35f0c",
        "scryfall_uri": "https://scryfall.com/card/fra/289/fr/for%C3%AAt-(forest)?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-09-29T13:37:53Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/f/5/f522fe8b-155d-4eff-8593-8920d6a35f0c.jpg?1790689073",
          "normal": "https://cards.scryfall.io/normal/front/f/5/f522fe8b-155d-4eff-8593-8920d6a35f0c.jpg?1790689073",
          "large": "https://cards.scryfall.io/large/front/f/5/f522fe8b-155d-4eff-8593-8920d6a35f0c.jpg?1790689073",
          "png": "https://cards.scryfall.io/png/front/f/5/f522fe8b-155d-4eff-8593-8920d6a35f0c.png?1790689073",
          "art_crop": "https://cards.scryfall.io/art_crop/front/f/5/f522fe8b-155d-4eff-8593-8920d6a35f0c.jpg?1790689073",
          "border_crop": "https://cards.scryfall.io/border_crop/front/f/5/f522fe8b-155d-4eff-8593-8920d6a35f0c.jpg?1790689073",
          "thumb": "https://cards.scryfall.io/thumb/front/f/5/f522fe8b-155d-4eff-8593-8920d6a35f0c.webp?1790689073",
          "grid": "https://cards.scryfall.io/grid/front/f/5/f522fe8b-155d-4eff-8593-8920d6a35f0c.webp?1790689073",
          "display": "https://cards.scryfall.io/display/front/f/5/f522fe8b-155d-4eff-8593-8920d6a35f0c.webp?1790689073",
          "art": "https://cards.scryfall.io/art/front/f/5/f522fe8b-155d-4eff-8593-8920d6a35f0c.webp?1790689073",
          "crop": "https://cards.scryfall.io/crop/front/f/5/f522fe8b-155d-4eff-8593-8920d6a35f0c.webp?1790689073",
          "jpeg": "https://cards.scryfall.io/normal/front/f/5/f522fe8b-155d-4eff-8593-8920d6a35f0c.jpg?1790689073"
        },
        "mana_cost": "",
        "cmc": 0,
        "type_line": "Basic Land \u2014 Forest",
        "oracle_text": "({T}: Add {G}.)",
        "colors": [],
        "color_identity": [
          "G"
        ],
        "keywords": [],
        "produced_mana": [
          "G"
        ],
        "legalities": {
          "standard": "legal",
          "future": "legal",
          "historic": "legal",
          "timeless": "legal",
          "gladiator": "legal",
          "pioneer": "legal",
          "modern": "legal",
          "legacy": "legal",
          "pauper": "legal",
          "vintage": "legal",
          "penny": "legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "legal",
          "brawl": "legal",
          "competitivebrawl": "legal",
          "alchemy": "legal",
          "paupercommander": "legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "legal",
          "predh": "legal",
          "tlr": "legal"
        },
        "games": [
          "paper",
          "mtgo",
          "arena"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": true,
        "variation": false,
        "set_id": "6595985e-39cf-4ca3-b43d-dd3e64749fdc",
        "set": "fra",
        "set_name": "Reality Fracture",
        "set_type": "expansion",
        "set_uri": "https://api.scryfall.com/sets/6595985e-39cf-4ca3-b43d-dd3e64749fdc",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Afra&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/fra?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/f522fe8b-155d-4eff-8593-8920d6a35f0c/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3Ab34bb2dc-c1af-4d77-b0b3-a0fb342a5fc6&unique=prints",
        "collector_number": "289",
        "digital": false,
        "rarity": "common",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Randy Gallegos",
        "artist_ids": [
          "a5048cc7-438a-4378-98e4-da99b78e1db0"
        ],
        "illustration_id": "bc8336e8-449b-4df3-b17e-2de94989f58a",
        "border_color": "black",
        "frame": "2015",
        "full_art": false,
        "textless": false,
        "booster": false,
        "story_spotlight": false,
        "prices": {
          "usd": null,
          "usd_foil": null,
          "usd_etched": null,
          "eur": null,
          "eur_foil": null,
          "tix": null
        },
        "related_uris": {
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DForest",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DForest",
          "edhrec": "https://edhrec.com/route/?cc=Forest"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fmagic%2Fproduct%3FproductLineName%3Dmagic%26q%3DForest%26view%3Dgrid",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products/Search?referrer=scryfall&searchString=Forest&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards?affiliate_id=scryfall&data%5Bsearch%5D=Forest&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "forest (KTK::en)": {
        "object": "card",
        "id": "3e5342f9-3f91-48e4-bfd1-49fbf9ca89cf",
        "oracle_id": "b34bb2dc-c1af-4d77-b0b3-a0fb342a5fc6",
        "multiverse_ids": [
          386542
        ],
        "mtgo_id": 54240,
        "mtgo_foil_id": 54241,
        "tcgplayer_id": 93067,
        "cardmarket_id": 269176,
        "name": "Forest",
        "lang": "en",
        "released_at": "2014-09-26",
        "uri": "https://api.scryfall.com/cards/3e5342f9-3f91-48e4-bfd1-49fbf9ca89cf",
        "scryfall_uri": "https://scryfall.com/card/ktk/266/forest?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T10:37:18Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/3/e/3e5342f9-3f91-48e4-bfd1-49fbf9ca89cf.jpg?1783939038",
          "normal": "https://cards.scryfall.io/normal/front/3/e/3e5342f9-3f91-48e4-bfd1-49fbf9ca89cf.jpg?1783939038",
          "large": "https://cards.scryfall.io/large/front/3/e/3e5342f9-3f91-48e4-bfd1-49fbf9ca89cf.jpg?1783939038",
          "png": "https://cards.scryfall.io/png/front/3/e/3e5342f9-3f91-48e4-bfd1-49fbf9ca89cf.png?1783939038",
          "art_crop": "https://cards.scryfall.io/art_crop/front/3/e/3e5342f9-3f91-48e4-bfd1-49fbf9ca89cf.jpg?1783939038",
          "border_crop": "https://cards.scryfall.io/border_crop/front/3/e/3e5342f9-3f91-48e4-bfd1-49fbf9ca89cf.jpg?1783939038",
          "thumb": "https://cards.scryfall.io/thumb/front/3/e/3e5342f9-3f91-48e4-bfd1-49fbf9ca89cf.webp?1783939038",
          "grid": "https://cards.scryfall.io/grid/front/3/e/3e5342f9-3f91-48e4-bfd1-49fbf9ca89cf.webp?1783939038",
          "display": "https://cards.scryfall.io/display/front/3/e/3e5342f9-3f91-48e4-bfd1-49fbf9ca89cf.webp?1783939038",
          "art": "https://cards.scryfall.io/art/front/3/e/3e5342f9-3f91-48e4-bfd1-49fbf9ca89cf.webp?1783939038",
          "crop": "https://cards.scryfall.io/crop/front/3/e/3e5342f9-3f91-48e4-bfd1-49fbf9ca89cf.webp?1783939038",
          "jpeg": "https://cards.scryfall.io/normal/front/3/e/3e5342f9-3f91-48e4-bfd1-49fbf9ca89cf.jpg?1783939038"
        },
        "mana_cost": "",
        "cmc": 0,
        "type_line": "Basic Land \u2014 Forest",
        "oracle_text": "({T}: Add {G}.)",
        "colors": [],
        "color_identity": [
          "G"
        ],
        "keywords": [],
        "produced_mana": [
          "G"
        ],
        "all_parts": [
          {
            "object": "related_card",
            "id": "b742ffa7-915f-45ce-b3f2-8391723bb34c",
            "component": "combo_piece",
            "name": "Forest",
            "type_line": "Basic Land \u2014 Forest",
            "uri": "https://api.scryfall.com/cards/b742ffa7-915f-45ce-b3f2-8391723bb34c"
          },
          {
            "object": "related_card",
            "id": "aed8ae06-ae54-4a16-8830-6547164ce6ae",
            "component": "combo_piece",
            "name": "Gilt-Leaf Alchemist",
            "type_line": "Creature \u2014 Elf Druid",
            "uri": "https://api.scryfall.com/cards/aed8ae06-ae54-4a16-8830-6547164ce6ae"
          }
        ],
        "legalities": {
          "standard": "legal",
          "future": "legal",
          "historic": "legal",
          "timeless": "legal",
          "gladiator": "legal",
          "pioneer": "legal",
          "modern": "legal",
          "legacy": "legal",
          "pauper": "legal",
          "vintage": "legal",
          "penny": "legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "legal",
          "brawl": "legal",
          "competitivebrawl": "legal",
          "alchemy": "legal",
          "paupercommander": "legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "legal",
          "predh": "legal",
          "tlr": "legal"
        },
        "games": [
          "paper",
          "mtgo",
          "arena"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": true,
        "variation": false,
        "set_id": "6c7a715c-ded9-449e-89b0-c665773e9c3c",
        "set": "ktk",
        "set_name": "Khans of Tarkir",
        "set_type": "expansion",
        "set_uri": "https://api.scryfall.com/sets/6c7a715c-ded9-449e-89b0-c665773e9c3c",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Aktk&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/ktk?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/3e5342f9-3f91-48e4-bfd1-49fbf9ca89cf/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3Ab34bb2dc-c1af-4d77-b0b3-a0fb342a5fc6&unique=prints",
        "collector_number": "266",
        "digital": false,
        "rarity": "common",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Sam Burley",
        "artist_ids": [
          "f89f4b78-cefb-41f7-b7cb-4f4d28de0c4f"
        ],
        "illustration_id": "14209661-14c7-4ba0-97d8-bd595df3b9b5",
        "border_color": "black",
        "frame": "2015",
        "full_art": false,
        "textless": false,
        "booster": true,
        "story_spotlight": false,
        "prices": {
          "usd": "0.15",
          "usd_foil": "0.89",
          "usd_etched": null,
          "eur": "0.08",
          "eur_foil": "0.26",
          "tix": "0.03"
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=386542&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DForest",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DForest",
          "edhrec": "https://edhrec.com/route/?cc=Forest"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F93067%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=269176&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/54240?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "forest (KTK::fr)": {
        "object": "card",
        "id": "b539bdb6-5403-4e08-8e1f-578f06b96d3e",
        "oracle_id": "b34bb2dc-c1af-4d77-b0b3-a0fb342a5fc6",
        "multiverse_ids": [
          387618
        ],
        "name": "Forest",
        "printed_name": "For\xEAt",
        "lang": "fr",
        "released_at": "2014-09-26",
        "uri": "https://api.scryfall.com/cards/b539bdb6-5403-4e08-8e1f-578f06b96d3e",
        "scryfall_uri": "https://scryfall.com/card/ktk/266/fr/for%C3%AAt-(forest)?utm_source=api",
        "layout": "normal",
        "highres_image": false,
        "image_status": "lowres",
        "image_updated_at": "2026-07-02T04:36:00Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/b/5/b539bdb6-5403-4e08-8e1f-578f06b96d3e.jpg?1782966960",
          "normal": "https://cards.scryfall.io/normal/front/b/5/b539bdb6-5403-4e08-8e1f-578f06b96d3e.jpg?1782966960",
          "large": "https://cards.scryfall.io/large/front/b/5/b539bdb6-5403-4e08-8e1f-578f06b96d3e.jpg?1782966960",
          "png": "https://cards.scryfall.io/png/front/b/5/b539bdb6-5403-4e08-8e1f-578f06b96d3e.png?1782966960",
          "art_crop": "https://cards.scryfall.io/art_crop/front/b/5/b539bdb6-5403-4e08-8e1f-578f06b96d3e.jpg?1782966960",
          "border_crop": "https://cards.scryfall.io/border_crop/front/b/5/b539bdb6-5403-4e08-8e1f-578f06b96d3e.jpg?1782966960",
          "thumb": "https://cards.scryfall.io/thumb/front/b/5/b539bdb6-5403-4e08-8e1f-578f06b96d3e.webp?1782966960",
          "grid": "https://cards.scryfall.io/grid/front/b/5/b539bdb6-5403-4e08-8e1f-578f06b96d3e.webp?1782966960",
          "display": "https://cards.scryfall.io/display/front/b/5/b539bdb6-5403-4e08-8e1f-578f06b96d3e.webp?1782966960",
          "art": "https://cards.scryfall.io/art/front/b/5/b539bdb6-5403-4e08-8e1f-578f06b96d3e.webp?1782966960",
          "crop": "https://cards.scryfall.io/crop/front/b/5/b539bdb6-5403-4e08-8e1f-578f06b96d3e.webp?1782966960",
          "jpeg": "https://cards.scryfall.io/normal/front/b/5/b539bdb6-5403-4e08-8e1f-578f06b96d3e.jpg?1782966960"
        },
        "mana_cost": "",
        "cmc": 0,
        "type_line": "Basic Land \u2014 Forest",
        "printed_type_line": "Terrain de base : for\xEAt",
        "oracle_text": "({T}: Add {G}.)",
        "colors": [],
        "color_identity": [
          "G"
        ],
        "keywords": [],
        "produced_mana": [
          "G"
        ],
        "legalities": {
          "standard": "legal",
          "future": "legal",
          "historic": "legal",
          "timeless": "legal",
          "gladiator": "legal",
          "pioneer": "legal",
          "modern": "legal",
          "legacy": "legal",
          "pauper": "legal",
          "vintage": "legal",
          "penny": "legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "legal",
          "brawl": "legal",
          "competitivebrawl": "legal",
          "alchemy": "legal",
          "paupercommander": "legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "legal",
          "predh": "legal",
          "tlr": "legal"
        },
        "games": [
          "paper",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": true,
        "variation": false,
        "set_id": "6c7a715c-ded9-449e-89b0-c665773e9c3c",
        "set": "ktk",
        "set_name": "Khans of Tarkir",
        "set_type": "expansion",
        "set_uri": "https://api.scryfall.com/sets/6c7a715c-ded9-449e-89b0-c665773e9c3c",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Aktk&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/ktk?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/b539bdb6-5403-4e08-8e1f-578f06b96d3e/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3Ab34bb2dc-c1af-4d77-b0b3-a0fb342a5fc6&unique=prints",
        "collector_number": "266",
        "digital": false,
        "rarity": "common",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Sam Burley",
        "artist_ids": [
          "f89f4b78-cefb-41f7-b7cb-4f4d28de0c4f"
        ],
        "illustration_id": "14209661-14c7-4ba0-97d8-bd595df3b9b5",
        "border_color": "black",
        "frame": "2015",
        "full_art": false,
        "textless": false,
        "booster": true,
        "story_spotlight": false,
        "prices": {
          "usd": null,
          "usd_foil": null,
          "usd_etched": null,
          "eur": null,
          "eur_foil": null,
          "tix": null
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=387618&printed=true",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DForest",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DForest",
          "edhrec": "https://edhrec.com/route/?cc=Forest"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fmagic%2Fproduct%3FproductLineName%3Dmagic%26q%3DForest%26view%3Dgrid",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products/Search?referrer=scryfall&searchString=Forest&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards?affiliate_id=scryfall&data%5Bsearch%5D=Forest&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "gavony (::en)": {
        "object": "card",
        "id": "cb03f60c-d317-4b4c-9747-380abf5fa7ef",
        "oracle_id": "2387edac-765b-4502-bd3d-88be8ba7d0a4",
        "multiverse_ids": [
          615133
        ],
        "mtgo_id": 110598,
        "tcgplayer_id": 491559,
        "cardmarket_id": 705531,
        "name": "Gavony",
        "lang": "en",
        "released_at": "2023-04-21",
        "uri": "https://api.scryfall.com/cards/cb03f60c-d317-4b4c-9747-380abf5fa7ef",
        "scryfall_uri": "https://scryfall.com/card/moc/142/gavony?utm_source=api",
        "layout": "planar",
        "highres_image": false,
        "image_status": "lowres",
        "image_updated_at": "2026-07-13T04:33:45Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/c/b/cb03f60c-d317-4b4c-9747-380abf5fa7ef.jpg?1783917225",
          "normal": "https://cards.scryfall.io/normal/front/c/b/cb03f60c-d317-4b4c-9747-380abf5fa7ef.jpg?1783917225",
          "large": "https://cards.scryfall.io/large/front/c/b/cb03f60c-d317-4b4c-9747-380abf5fa7ef.jpg?1783917225",
          "png": "https://cards.scryfall.io/png/front/c/b/cb03f60c-d317-4b4c-9747-380abf5fa7ef.png?1783917225",
          "art_crop": "https://cards.scryfall.io/art_crop/front/c/b/cb03f60c-d317-4b4c-9747-380abf5fa7ef.jpg?1783917225",
          "border_crop": "https://cards.scryfall.io/border_crop/front/c/b/cb03f60c-d317-4b4c-9747-380abf5fa7ef.jpg?1783917225",
          "thumb": "https://cards.scryfall.io/thumb/front/c/b/cb03f60c-d317-4b4c-9747-380abf5fa7ef.webp?1783917225",
          "grid": "https://cards.scryfall.io/grid/front/c/b/cb03f60c-d317-4b4c-9747-380abf5fa7ef.webp?1783917225",
          "display": "https://cards.scryfall.io/display/front/c/b/cb03f60c-d317-4b4c-9747-380abf5fa7ef.webp?1783917225",
          "art": "https://cards.scryfall.io/art/front/c/b/cb03f60c-d317-4b4c-9747-380abf5fa7ef.webp?1783917225",
          "crop": "https://cards.scryfall.io/crop/front/c/b/cb03f60c-d317-4b4c-9747-380abf5fa7ef.webp?1783917225",
          "jpeg": "https://cards.scryfall.io/normal/front/c/b/cb03f60c-d317-4b4c-9747-380abf5fa7ef.jpg?1783917225"
        },
        "mana_cost": "",
        "cmc": 0,
        "type_line": "Plane \u2014 Innistrad",
        "oracle_text": "All creatures have vigilance.\nWhenever chaos ensues, creatures you control gain indestructible until end of turn.",
        "colors": [],
        "color_identity": [],
        "keywords": [],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "not_legal",
          "timeless": "not_legal",
          "gladiator": "not_legal",
          "pioneer": "not_legal",
          "modern": "not_legal",
          "legacy": "not_legal",
          "pauper": "not_legal",
          "vintage": "not_legal",
          "penny": "not_legal",
          "commander": "not_legal",
          "oathbreaker": "not_legal",
          "standardbrawl": "not_legal",
          "brawl": "not_legal",
          "competitivebrawl": "not_legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "not_legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "not_legal"
        },
        "games": [
          "paper",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": false,
        "nonfoil": true,
        "finishes": [
          "nonfoil"
        ],
        "oversized": true,
        "promo": false,
        "reprint": true,
        "variation": false,
        "set_id": "6bba5de9-5afb-42af-a7eb-24ac854bf671",
        "set": "moc",
        "set_name": "March of the Machine Commander",
        "set_type": "commander",
        "set_uri": "https://api.scryfall.com/sets/6bba5de9-5afb-42af-a7eb-24ac854bf671",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Amoc&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/moc?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/cb03f60c-d317-4b4c-9747-380abf5fa7ef/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A2387edac-765b-4502-bd3d-88be8ba7d0a4&unique=prints",
        "collector_number": "142",
        "digital": false,
        "rarity": "common",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Dave Kendall",
        "artist_ids": [
          "8a5540a8-18c9-4fa9-802c-59d6866114d5"
        ],
        "illustration_id": "ed837fcc-884d-425a-95c4-0b4ee74bb613",
        "border_color": "black",
        "frame": "2015",
        "full_art": false,
        "textless": false,
        "booster": false,
        "story_spotlight": false,
        "prices": {
          "usd": "0.28",
          "usd_foil": null,
          "usd_etched": null,
          "eur": "0.26",
          "eur_foil": null,
          "tix": "0.01"
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=615133&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DGavony",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DGavony",
          "edhrec": "https://edhrec.com/route/?cc=Gavony"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F491559%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=705531&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/110598?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "grixis (::en)": {
        "object": "card",
        "id": "ecbe3339-2cd1-45e2-bac1-8ea995238c30",
        "oracle_id": "1aaa60e4-47a8-4255-8a09-5f00922ccf6d",
        "multiverse_ids": [
          423614
        ],
        "tcgplayer_id": 125591,
        "cardmarket_id": 294428,
        "name": "Grixis",
        "lang": "en",
        "released_at": "2016-11-25",
        "uri": "https://api.scryfall.com/cards/ecbe3339-2cd1-45e2-bac1-8ea995238c30",
        "scryfall_uri": "https://scryfall.com/card/opca/33/grixis?utm_source=api",
        "layout": "planar",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T10:01:42Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/e/c/ecbe3339-2cd1-45e2-bac1-8ea995238c30.jpg?1783936902",
          "normal": "https://cards.scryfall.io/normal/front/e/c/ecbe3339-2cd1-45e2-bac1-8ea995238c30.jpg?1783936902",
          "large": "https://cards.scryfall.io/large/front/e/c/ecbe3339-2cd1-45e2-bac1-8ea995238c30.jpg?1783936902",
          "png": "https://cards.scryfall.io/png/front/e/c/ecbe3339-2cd1-45e2-bac1-8ea995238c30.png?1783936902",
          "art_crop": "https://cards.scryfall.io/art_crop/front/e/c/ecbe3339-2cd1-45e2-bac1-8ea995238c30.jpg?1783936902",
          "border_crop": "https://cards.scryfall.io/border_crop/front/e/c/ecbe3339-2cd1-45e2-bac1-8ea995238c30.jpg?1783936902",
          "thumb": "https://cards.scryfall.io/thumb/front/e/c/ecbe3339-2cd1-45e2-bac1-8ea995238c30.webp?1783936902",
          "grid": "https://cards.scryfall.io/grid/front/e/c/ecbe3339-2cd1-45e2-bac1-8ea995238c30.webp?1783936902",
          "display": "https://cards.scryfall.io/display/front/e/c/ecbe3339-2cd1-45e2-bac1-8ea995238c30.webp?1783936902",
          "art": "https://cards.scryfall.io/art/front/e/c/ecbe3339-2cd1-45e2-bac1-8ea995238c30.webp?1783936902",
          "crop": "https://cards.scryfall.io/crop/front/e/c/ecbe3339-2cd1-45e2-bac1-8ea995238c30.webp?1783936902",
          "jpeg": "https://cards.scryfall.io/normal/front/e/c/ecbe3339-2cd1-45e2-bac1-8ea995238c30.jpg?1783936902"
        },
        "mana_cost": "",
        "cmc": 0,
        "type_line": "Plane \u2014 Alara",
        "oracle_text": "Blue, black, and/or red creature cards in your graveyard have unearth. The unearth cost is equal to the card's mana cost. (Pay the card's mana cost: Return it to the battlefield. The creature gains haste. Exile it at the beginning of the next end step or if it would leave the battlefield. Unearth only as a sorcery.)\nWhenever chaos ensues, put target creature card from a graveyard onto the battlefield under your control.",
        "colors": [],
        "color_identity": [],
        "keywords": [],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "not_legal",
          "timeless": "not_legal",
          "gladiator": "not_legal",
          "pioneer": "not_legal",
          "modern": "not_legal",
          "legacy": "not_legal",
          "pauper": "not_legal",
          "vintage": "not_legal",
          "penny": "not_legal",
          "commander": "not_legal",
          "oathbreaker": "not_legal",
          "standardbrawl": "not_legal",
          "brawl": "not_legal",
          "competitivebrawl": "not_legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "not_legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "not_legal"
        },
        "games": [
          "paper"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": false,
        "nonfoil": true,
        "finishes": [
          "nonfoil"
        ],
        "oversized": true,
        "promo": false,
        "reprint": true,
        "variation": false,
        "set_id": "ada3345c-d416-49bc-92e0-73363ddee5c8",
        "set": "opca",
        "set_name": "Planechase Anthology Planes",
        "set_type": "planechase",
        "set_uri": "https://api.scryfall.com/sets/ada3345c-d416-49bc-92e0-73363ddee5c8",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Aopca&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/opca?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/ecbe3339-2cd1-45e2-bac1-8ea995238c30/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A1aaa60e4-47a8-4255-8a09-5f00922ccf6d&unique=prints",
        "collector_number": "33",
        "digital": false,
        "rarity": "common",
        "card_back_id": "7840c131-f96b-4700-9347-2215c43156e6",
        "artist": "Nils Hamm",
        "artist_ids": [
          "c540d1fc-1500-457f-93cf-d6069ee66546"
        ],
        "illustration_id": "ba050b27-e034-412b-934a-9d0ce27ad515",
        "border_color": "black",
        "frame": "2015",
        "full_art": false,
        "textless": false,
        "booster": false,
        "story_spotlight": false,
        "prices": {
          "usd": "5.60",
          "usd_foil": null,
          "usd_etched": null,
          "eur": "5.06",
          "eur_foil": null,
          "tix": null
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=423614&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DGrixis",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DGrixis",
          "edhrec": "https://edhrec.com/route/?cc=Grixis"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F125591%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=294428&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards?affiliate_id=scryfall&data%5Bsearch%5D=Grixis&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "grizzlegom hurloon hero (::en)": {
        "object": "card",
        "id": "9aa1869b-4a5a-4f95-8a45-7a671be1c127",
        "oracle_id": "3f5db55a-8bae-4e97-86bd-f2a2dacf07a4",
        "multiverse_ids": [],
        "tcgplayer_id": 709799,
        "name": "Grizzlegom, Hurloon Hero",
        "lang": "en",
        "released_at": "2026-10-19",
        "uri": "https://api.scryfall.com/cards/9aa1869b-4a5a-4f95-8a45-7a671be1c127",
        "scryfall_uri": "https://scryfall.com/card/mbc/39/grizzlegom-hurloon-hero?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-08-03T12:10:20Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/9/a/9aa1869b-4a5a-4f95-8a45-7a671be1c127.jpg?1785759020",
          "normal": "https://cards.scryfall.io/normal/front/9/a/9aa1869b-4a5a-4f95-8a45-7a671be1c127.jpg?1785759020",
          "large": "https://cards.scryfall.io/large/front/9/a/9aa1869b-4a5a-4f95-8a45-7a671be1c127.jpg?1785759020",
          "png": "https://cards.scryfall.io/png/front/9/a/9aa1869b-4a5a-4f95-8a45-7a671be1c127.png?1785759020",
          "art_crop": "https://cards.scryfall.io/art_crop/front/9/a/9aa1869b-4a5a-4f95-8a45-7a671be1c127.jpg?1785759020",
          "border_crop": "https://cards.scryfall.io/border_crop/front/9/a/9aa1869b-4a5a-4f95-8a45-7a671be1c127.jpg?1785759020",
          "thumb": "https://cards.scryfall.io/thumb/front/9/a/9aa1869b-4a5a-4f95-8a45-7a671be1c127.webp?1785759020",
          "grid": "https://cards.scryfall.io/grid/front/9/a/9aa1869b-4a5a-4f95-8a45-7a671be1c127.webp?1785759020",
          "display": "https://cards.scryfall.io/display/front/9/a/9aa1869b-4a5a-4f95-8a45-7a671be1c127.webp?1785759020",
          "art": "https://cards.scryfall.io/art/front/9/a/9aa1869b-4a5a-4f95-8a45-7a671be1c127.webp?1785759020",
          "crop": "https://cards.scryfall.io/crop/front/9/a/9aa1869b-4a5a-4f95-8a45-7a671be1c127.webp?1785759020",
          "jpeg": "https://cards.scryfall.io/normal/front/9/a/9aa1869b-4a5a-4f95-8a45-7a671be1c127.jpg?1785759020"
        },
        "mana_cost": "{5}{R}{G}",
        "cmc": 7,
        "type_line": "Legendary Creature \u2014 Minotaur Warrior",
        "oracle_text": "Rulebreaker \u2014 A deck with this commander can have any land cards.\nWhenever Grizzlegom attacks, create a 1/1 white Soldier creature token for each Plains you control. Draw a card for each Island you control. Each opponent loses 1 life for each Swamp you control. Put a +1/+1 counter on Grizzlegom for each Mountain you control. You gain 1 life for each Forest you control.",
        "power": "4",
        "toughness": "4",
        "colors": [
          "G",
          "R"
        ],
        "color_identity": [
          "G",
          "R"
        ],
        "keywords": [
          "Rulebreaker"
        ],
        "all_parts": [
          {
            "object": "related_card",
            "id": "9aa1869b-4a5a-4f95-8a45-7a671be1c127",
            "component": "combo_piece",
            "name": "Grizzlegom, Hurloon Hero",
            "type_line": "Legendary Creature \u2014 Minotaur Warrior",
            "uri": "https://api.scryfall.com/cards/9aa1869b-4a5a-4f95-8a45-7a671be1c127"
          },
          {
            "object": "related_card",
            "id": "a58c2fc3-c07f-4f06-a9d5-1d0fe3dbde1f",
            "component": "token",
            "name": "Soldier",
            "type_line": "Token Creature \u2014 Soldier",
            "uri": "https://api.scryfall.com/cards/a58c2fc3-c07f-4f06-a9d5-1d0fe3dbde1f"
          }
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "not_legal",
          "timeless": "not_legal",
          "gladiator": "not_legal",
          "pioneer": "not_legal",
          "modern": "not_legal",
          "legacy": "not_legal",
          "pauper": "not_legal",
          "vintage": "not_legal",
          "penny": "not_legal",
          "commander": "not_legal",
          "oathbreaker": "not_legal",
          "standardbrawl": "not_legal",
          "brawl": "not_legal",
          "competitivebrawl": "not_legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "not_legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "not_legal"
        },
        "games": [
          "paper"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": false,
        "variation": false,
        "set_id": "a4135564-9f37-4aaf-963a-90666f843e0d",
        "set": "mbc",
        "set_name": "Mystery Booster Commander Edition",
        "set_type": "draft_innovation",
        "set_uri": "https://api.scryfall.com/sets/a4135564-9f37-4aaf-963a-90666f843e0d",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Ambc&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/mbc?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/9aa1869b-4a5a-4f95-8a45-7a671be1c127/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A3f5db55a-8bae-4e97-86bd-f2a2dacf07a4&unique=prints",
        "collector_number": "39",
        "digital": false,
        "rarity": "rare",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Mark Zug",
        "artist_ids": [
          "48e2b98c-5467-4671-bd42-4c3746115117"
        ],
        "illustration_id": "c4b4e19c-9ece-4586-8044-6eaaf079fb44",
        "border_color": "black",
        "frame": "2015",
        "frame_effects": [
          "legendary"
        ],
        "security_stamp": "oval",
        "full_art": false,
        "textless": false,
        "booster": false,
        "story_spotlight": false,
        "edhrec_rank": 20970,
        "prices": {
          "usd": null,
          "usd_foil": null,
          "usd_etched": null,
          "eur": null,
          "eur_foil": null,
          "tix": null
        },
        "related_uris": {
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DGrizzlegom%252C%2BHurloon%2BHero",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DGrizzlegom%252C%2BHurloon%2BHero",
          "edhrec": "https://edhrec.com/route/?cc=Grizzlegom%2C+Hurloon+Hero"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F709799%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products/Search?referrer=scryfall&searchString=Grizzlegom%2C+Hurloon+Hero&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards?affiliate_id=scryfall&data%5Bsearch%5D=Grizzlegom%2C+Hurloon+Hero&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "gyruda doom of depths (::en)": {
        "object": "card",
        "id": "97eb1804-6fd8-4917-af36-87fdfce39d3a",
        "oracle_id": "25eaa977-ca85-4f8d-8be5-9297a3edb14f",
        "multiverse_ids": [
          479741
        ],
        "mtgo_id": 80451,
        "arena_id": 71288,
        "tcgplayer_id": 212020,
        "cardmarket_id": 451073,
        "name": "Gyruda, Doom of Depths",
        "lang": "en",
        "released_at": "2020-04-24",
        "uri": "https://api.scryfall.com/cards/97eb1804-6fd8-4917-af36-87fdfce39d3a",
        "scryfall_uri": "https://scryfall.com/card/iko/221/gyruda-doom-of-depths?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T08:23:32Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/9/7/97eb1804-6fd8-4917-af36-87fdfce39d3a.jpg?1783931012",
          "normal": "https://cards.scryfall.io/normal/front/9/7/97eb1804-6fd8-4917-af36-87fdfce39d3a.jpg?1783931012",
          "large": "https://cards.scryfall.io/large/front/9/7/97eb1804-6fd8-4917-af36-87fdfce39d3a.jpg?1783931012",
          "png": "https://cards.scryfall.io/png/front/9/7/97eb1804-6fd8-4917-af36-87fdfce39d3a.png?1783931012",
          "art_crop": "https://cards.scryfall.io/art_crop/front/9/7/97eb1804-6fd8-4917-af36-87fdfce39d3a.jpg?1783931012",
          "border_crop": "https://cards.scryfall.io/border_crop/front/9/7/97eb1804-6fd8-4917-af36-87fdfce39d3a.jpg?1783931012",
          "thumb": "https://cards.scryfall.io/thumb/front/9/7/97eb1804-6fd8-4917-af36-87fdfce39d3a.webp?1783931012",
          "grid": "https://cards.scryfall.io/grid/front/9/7/97eb1804-6fd8-4917-af36-87fdfce39d3a.webp?1783931012",
          "display": "https://cards.scryfall.io/display/front/9/7/97eb1804-6fd8-4917-af36-87fdfce39d3a.webp?1783931012",
          "art": "https://cards.scryfall.io/art/front/9/7/97eb1804-6fd8-4917-af36-87fdfce39d3a.webp?1783931012",
          "crop": "https://cards.scryfall.io/crop/front/9/7/97eb1804-6fd8-4917-af36-87fdfce39d3a.webp?1783931012",
          "jpeg": "https://cards.scryfall.io/normal/front/9/7/97eb1804-6fd8-4917-af36-87fdfce39d3a.jpg?1783931012"
        },
        "mana_cost": "{4}{U/B}{U/B}",
        "cmc": 6,
        "type_line": "Legendary Creature \u2014 Demon Kraken",
        "oracle_text": "Companion \u2014 Your starting deck contains only cards with even mana values. (If this card is your chosen companion, you may put it into your hand from outside the game for {3} as a sorcery.)\nWhen Gyruda enters, each player mills four cards. Put a creature card with an even mana value from among the milled cards onto the battlefield under your control.",
        "power": "6",
        "toughness": "6",
        "colors": [
          "B",
          "U"
        ],
        "color_identity": [
          "B",
          "U"
        ],
        "keywords": [
          "Companion",
          "Mill"
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "legal",
          "timeless": "legal",
          "gladiator": "legal",
          "pioneer": "legal",
          "modern": "legal",
          "legacy": "legal",
          "pauper": "not_legal",
          "vintage": "legal",
          "penny": "legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "not_legal",
          "brawl": "legal",
          "competitivebrawl": "legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "not_legal"
        },
        "games": [
          "arena",
          "paper",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": false,
        "variation": false,
        "set_id": "19feda43-15ab-427e-a0e4-148a4bf2b03a",
        "set": "iko",
        "set_name": "Ikoria: Lair of Behemoths",
        "set_type": "expansion",
        "set_uri": "https://api.scryfall.com/sets/19feda43-15ab-427e-a0e4-148a4bf2b03a",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Aiko&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/iko?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/97eb1804-6fd8-4917-af36-87fdfce39d3a/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A25eaa977-ca85-4f8d-8be5-9297a3edb14f&unique=prints",
        "collector_number": "221",
        "digital": false,
        "rarity": "rare",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Tyler Jacobson",
        "artist_ids": [
          "522af130-8db4-4b4b-950c-6e2b246339cf"
        ],
        "illustration_id": "d258b6a9-b886-4a6e-ac6b-77465f3d7cf5",
        "border_color": "black",
        "frame": "2015",
        "frame_effects": [
          "companion",
          "legendary"
        ],
        "security_stamp": "oval",
        "full_art": false,
        "textless": false,
        "booster": true,
        "story_spotlight": false,
        "edhrec_rank": 4506,
        "penny_rank": 1923,
        "preview": {
          "source": "Wizards of the Coast",
          "source_uri": "https://twitter.com/wizards_magicES/status/1245718238790586370",
          "previewed_at": "2020-04-02"
        },
        "prices": {
          "usd": "0.69",
          "usd_foil": "0.49",
          "usd_etched": null,
          "eur": "0.41",
          "eur_foil": "0.54",
          "tix": "0.02"
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=479741&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DGyruda%252C%2BDoom%2Bof%2BDepths",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DGyruda%252C%2BDoom%2Bof%2BDepths",
          "edhrec": "https://edhrec.com/route/?cc=Gyruda%2C+Doom+of+Depths"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F212020%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=451073&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/80451?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "island (::en)": {
        "object": "card",
        "id": "1335d293-3dd2-4f13-bd2c-22181f4528ee",
        "oracle_id": "b2c6aa39-2d2a-459c-a555-fb48ba993373",
        "multiverse_ids": [],
        "tcgplayer_id": 723324,
        "name": "Island",
        "lang": "en",
        "released_at": "2027-04-09",
        "uri": "https://api.scryfall.com/cards/1335d293-3dd2-4f13-bd2c-22181f4528ee",
        "scryfall_uri": "https://scryfall.com/card/mdd/294/island?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-10-09T20:40:24Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/1/3/1335d293-3dd2-4f13-bd2c-22181f4528ee.jpg?1791578424",
          "normal": "https://cards.scryfall.io/normal/front/1/3/1335d293-3dd2-4f13-bd2c-22181f4528ee.jpg?1791578424",
          "large": "https://cards.scryfall.io/large/front/1/3/1335d293-3dd2-4f13-bd2c-22181f4528ee.jpg?1791578424",
          "png": "https://cards.scryfall.io/png/front/1/3/1335d293-3dd2-4f13-bd2c-22181f4528ee.png?1791578424",
          "art_crop": "https://cards.scryfall.io/art_crop/front/1/3/1335d293-3dd2-4f13-bd2c-22181f4528ee.jpg?1791578424",
          "border_crop": "https://cards.scryfall.io/border_crop/front/1/3/1335d293-3dd2-4f13-bd2c-22181f4528ee.jpg?1791578424",
          "thumb": "https://cards.scryfall.io/thumb/front/1/3/1335d293-3dd2-4f13-bd2c-22181f4528ee.webp?1791578424",
          "grid": "https://cards.scryfall.io/grid/front/1/3/1335d293-3dd2-4f13-bd2c-22181f4528ee.webp?1791578424",
          "display": "https://cards.scryfall.io/display/front/1/3/1335d293-3dd2-4f13-bd2c-22181f4528ee.webp?1791578424",
          "art": "https://cards.scryfall.io/art/front/1/3/1335d293-3dd2-4f13-bd2c-22181f4528ee.webp?1791578424",
          "crop": "https://cards.scryfall.io/crop/front/1/3/1335d293-3dd2-4f13-bd2c-22181f4528ee.webp?1791578424",
          "jpeg": "https://cards.scryfall.io/normal/front/1/3/1335d293-3dd2-4f13-bd2c-22181f4528ee.jpg?1791578424"
        },
        "mana_cost": "",
        "cmc": 0,
        "type_line": "Basic Land \u2014 Island",
        "oracle_text": "({T}: Add {U}.)",
        "colors": [],
        "color_identity": [
          "U"
        ],
        "keywords": [],
        "produced_mana": [
          "U"
        ],
        "legalities": {
          "standard": "legal",
          "future": "legal",
          "historic": "legal",
          "timeless": "legal",
          "gladiator": "legal",
          "pioneer": "legal",
          "modern": "legal",
          "legacy": "legal",
          "pauper": "legal",
          "vintage": "legal",
          "penny": "legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "legal",
          "brawl": "legal",
          "competitivebrawl": "legal",
          "alchemy": "legal",
          "paupercommander": "legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "legal",
          "predh": "legal",
          "tlr": "legal"
        },
        "games": [
          "paper",
          "mtgo",
          "arena"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": true,
        "variation": false,
        "set_id": "1c75c20b-221e-47c5-83be-f3be4c15087d",
        "set": "mdd",
        "set_name": "Marvel: Darkhold Destiny",
        "set_type": "expansion",
        "set_uri": "https://api.scryfall.com/sets/1c75c20b-221e-47c5-83be-f3be4c15087d",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Amdd&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/mdd?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/1335d293-3dd2-4f13-bd2c-22181f4528ee/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3Ab2c6aa39-2d2a-459c-a555-fb48ba993373&unique=prints",
        "collector_number": "294",
        "digital": false,
        "rarity": "common",
        "flavor_text": `"The Dream Dimension. A benevolent fountain of ideals, the source of humanity's collective inspiration, and the home of the muses themselves. Its wonder never ceases to amaze me."
\u2014Doctor Strange`,
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Eren Arik",
        "artist_ids": [
          "c37cc97a-271c-410d-92c3-8ed8107ae0b9"
        ],
        "illustration_id": "d21e40be-ed1b-44d8-9cb9-fd2ad4f1d66e",
        "border_color": "black",
        "frame": "2015",
        "full_art": false,
        "textless": false,
        "booster": false,
        "story_spotlight": false,
        "preview": {
          "source": "TheGamer",
          "source_uri": "https://www.thegamer.com/mtg-marvel-darkhold-destiny-universes-beyond-reveal/",
          "previewed_at": "2026-10-09"
        },
        "prices": {
          "usd": null,
          "usd_foil": null,
          "usd_etched": null,
          "eur": null,
          "eur_foil": null,
          "tix": null
        },
        "related_uris": {
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DIsland",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DIsland",
          "edhrec": "https://edhrec.com/route/?cc=Island"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F723324%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products/Search?referrer=scryfall&searchString=Island&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards?affiliate_id=scryfall&data%5Bsearch%5D=Island&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "jegantha the wellspring (::en)": {
        "object": "card",
        "id": "79ec30d9-daf7-4f1d-ac16-4d11e8160d97",
        "oracle_id": "f0587c55-06c1-4930-a62e-668f37464ce9",
        "multiverse_ids": [],
        "resource_id": "E9D72C985C4F67CE8F3AF47CA290C770B4A30B7B3C9C228201A359D141376E2E",
        "mtgo_id": 146185,
        "tcgplayer_id": 671270,
        "cardmarket_id": 865057,
        "name": "Jegantha, the Wellspring",
        "lang": "en",
        "released_at": "2026-01-23",
        "uri": "https://api.scryfall.com/cards/79ec30d9-daf7-4f1d-ac16-4d11e8160d97",
        "scryfall_uri": "https://scryfall.com/card/ecc/125/jegantha-the-wellspring?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T01:02:18Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/7/9/79ec30d9-daf7-4f1d-ac16-4d11e8160d97.jpg?1783904538",
          "normal": "https://cards.scryfall.io/normal/front/7/9/79ec30d9-daf7-4f1d-ac16-4d11e8160d97.jpg?1783904538",
          "large": "https://cards.scryfall.io/large/front/7/9/79ec30d9-daf7-4f1d-ac16-4d11e8160d97.jpg?1783904538",
          "png": "https://cards.scryfall.io/png/front/7/9/79ec30d9-daf7-4f1d-ac16-4d11e8160d97.png?1783904538",
          "art_crop": "https://cards.scryfall.io/art_crop/front/7/9/79ec30d9-daf7-4f1d-ac16-4d11e8160d97.jpg?1783904538",
          "border_crop": "https://cards.scryfall.io/border_crop/front/7/9/79ec30d9-daf7-4f1d-ac16-4d11e8160d97.jpg?1783904538",
          "thumb": "https://cards.scryfall.io/thumb/front/7/9/79ec30d9-daf7-4f1d-ac16-4d11e8160d97.webp?1783904538",
          "grid": "https://cards.scryfall.io/grid/front/7/9/79ec30d9-daf7-4f1d-ac16-4d11e8160d97.webp?1783904538",
          "display": "https://cards.scryfall.io/display/front/7/9/79ec30d9-daf7-4f1d-ac16-4d11e8160d97.webp?1783904538",
          "art": "https://cards.scryfall.io/art/front/7/9/79ec30d9-daf7-4f1d-ac16-4d11e8160d97.webp?1783904538",
          "crop": "https://cards.scryfall.io/crop/front/7/9/79ec30d9-daf7-4f1d-ac16-4d11e8160d97.webp?1783904538",
          "jpeg": "https://cards.scryfall.io/normal/front/7/9/79ec30d9-daf7-4f1d-ac16-4d11e8160d97.jpg?1783904538"
        },
        "mana_cost": "{4}{R/G}",
        "cmc": 5,
        "type_line": "Legendary Creature \u2014 Elemental Elk",
        "oracle_text": "Companion \u2014 No card in your starting deck has more than one of the same mana symbol in its mana cost. (If this card is your chosen companion, you may put it into your hand from outside the game for {3} as a sorcery.)\n{T}: Add {W}{U}{B}{R}{G}. This mana can't be spent to pay generic mana costs.",
        "power": "5",
        "toughness": "5",
        "colors": [
          "G",
          "R"
        ],
        "color_identity": [
          "B",
          "G",
          "R",
          "U",
          "W"
        ],
        "keywords": [
          "Companion"
        ],
        "produced_mana": [
          "B",
          "G",
          "R",
          "U",
          "W"
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "legal",
          "timeless": "legal",
          "gladiator": "legal",
          "pioneer": "banned",
          "modern": "banned",
          "legacy": "legal",
          "pauper": "not_legal",
          "vintage": "legal",
          "penny": "legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "not_legal",
          "brawl": "legal",
          "competitivebrawl": "legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "not_legal"
        },
        "games": [
          "paper",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": false,
        "nonfoil": true,
        "finishes": [
          "nonfoil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": true,
        "variation": false,
        "set_id": "805b5a0c-f8bb-4555-86ea-eb9ec36a011a",
        "set": "ecc",
        "set_name": "Lorwyn Eclipsed Commander",
        "set_type": "commander",
        "set_uri": "https://api.scryfall.com/sets/805b5a0c-f8bb-4555-86ea-eb9ec36a011a",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Aecc&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/ecc?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/79ec30d9-daf7-4f1d-ac16-4d11e8160d97/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3Af0587c55-06c1-4930-a62e-668f37464ce9&unique=prints",
        "collector_number": "125",
        "digital": false,
        "rarity": "rare",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Chris Rahn",
        "artist_ids": [
          "7742047e-0f80-4c0f-a530-d07460165e86"
        ],
        "illustration_id": "effc3e76-9122-4e1d-956b-360909f2f5d8",
        "border_color": "black",
        "frame": "2015",
        "frame_effects": [
          "legendary"
        ],
        "security_stamp": "oval",
        "full_art": false,
        "textless": false,
        "booster": false,
        "story_spotlight": false,
        "edhrec_rank": 3839,
        "penny_rank": 1792,
        "prices": {
          "usd": "0.30",
          "usd_foil": null,
          "usd_etched": null,
          "eur": "0.22",
          "eur_foil": null,
          "tix": "0.08"
        },
        "related_uris": {
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DJegantha%252C%2Bthe%2BWellspring",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DJegantha%252C%2Bthe%2BWellspring",
          "edhrec": "https://edhrec.com/route/?cc=Jegantha%2C+the+Wellspring"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F671270%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=865057&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/146185?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "jund (::en)": {
        "object": "card",
        "id": "585fde63-4cb5-4235-8c95-2a7a511e7c3f",
        "oracle_id": "9aa94de8-b114-4479-a771-c7bc0297be58",
        "multiverse_ids": [
          615139
        ],
        "mtgo_id": 110610,
        "tcgplayer_id": 490483,
        "cardmarket_id": 705537,
        "name": "Jund",
        "lang": "en",
        "released_at": "2023-04-21",
        "uri": "https://api.scryfall.com/cards/585fde63-4cb5-4235-8c95-2a7a511e7c3f",
        "scryfall_uri": "https://scryfall.com/card/moc/148/jund?utm_source=api",
        "layout": "planar",
        "highres_image": false,
        "image_status": "lowres",
        "image_updated_at": "2026-07-13T04:33:35Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/5/8/585fde63-4cb5-4235-8c95-2a7a511e7c3f.jpg?1783917215",
          "normal": "https://cards.scryfall.io/normal/front/5/8/585fde63-4cb5-4235-8c95-2a7a511e7c3f.jpg?1783917215",
          "large": "https://cards.scryfall.io/large/front/5/8/585fde63-4cb5-4235-8c95-2a7a511e7c3f.jpg?1783917215",
          "png": "https://cards.scryfall.io/png/front/5/8/585fde63-4cb5-4235-8c95-2a7a511e7c3f.png?1783917215",
          "art_crop": "https://cards.scryfall.io/art_crop/front/5/8/585fde63-4cb5-4235-8c95-2a7a511e7c3f.jpg?1783917215",
          "border_crop": "https://cards.scryfall.io/border_crop/front/5/8/585fde63-4cb5-4235-8c95-2a7a511e7c3f.jpg?1783917215",
          "thumb": "https://cards.scryfall.io/thumb/front/5/8/585fde63-4cb5-4235-8c95-2a7a511e7c3f.webp?1783917215",
          "grid": "https://cards.scryfall.io/grid/front/5/8/585fde63-4cb5-4235-8c95-2a7a511e7c3f.webp?1783917215",
          "display": "https://cards.scryfall.io/display/front/5/8/585fde63-4cb5-4235-8c95-2a7a511e7c3f.webp?1783917215",
          "art": "https://cards.scryfall.io/art/front/5/8/585fde63-4cb5-4235-8c95-2a7a511e7c3f.webp?1783917215",
          "crop": "https://cards.scryfall.io/crop/front/5/8/585fde63-4cb5-4235-8c95-2a7a511e7c3f.webp?1783917215",
          "jpeg": "https://cards.scryfall.io/normal/front/5/8/585fde63-4cb5-4235-8c95-2a7a511e7c3f.jpg?1783917215"
        },
        "mana_cost": "",
        "cmc": 0,
        "type_line": "Plane \u2014 Alara",
        "oracle_text": "Whenever a player casts a creature spell that's black, red, or green, it gains devour 5. (As that creature enters, you may sacrifice any number of creatures. It enters with five times that many +1/+1 counters on it.)\nWhenever chaos ensues, create two 1/1 red Goblin creature tokens.",
        "colors": [],
        "color_identity": [],
        "keywords": [],
        "all_parts": [
          {
            "object": "related_card",
            "id": "9cb4069a-0ec9-415d-8a2c-82f4a9f3ea2b",
            "component": "token",
            "name": "Goblin",
            "type_line": "Token Creature \u2014 Goblin",
            "uri": "https://api.scryfall.com/cards/9cb4069a-0ec9-415d-8a2c-82f4a9f3ea2b"
          },
          {
            "object": "related_card",
            "id": "585fde63-4cb5-4235-8c95-2a7a511e7c3f",
            "component": "combo_piece",
            "name": "Jund",
            "type_line": "Plane \u2014 Alara",
            "uri": "https://api.scryfall.com/cards/585fde63-4cb5-4235-8c95-2a7a511e7c3f"
          }
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "not_legal",
          "timeless": "not_legal",
          "gladiator": "not_legal",
          "pioneer": "not_legal",
          "modern": "not_legal",
          "legacy": "not_legal",
          "pauper": "not_legal",
          "vintage": "not_legal",
          "penny": "not_legal",
          "commander": "not_legal",
          "oathbreaker": "not_legal",
          "standardbrawl": "not_legal",
          "brawl": "not_legal",
          "competitivebrawl": "not_legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "not_legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "not_legal"
        },
        "games": [
          "paper",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": false,
        "nonfoil": true,
        "finishes": [
          "nonfoil"
        ],
        "oversized": true,
        "promo": false,
        "reprint": true,
        "variation": false,
        "set_id": "6bba5de9-5afb-42af-a7eb-24ac854bf671",
        "set": "moc",
        "set_name": "March of the Machine Commander",
        "set_type": "commander",
        "set_uri": "https://api.scryfall.com/sets/6bba5de9-5afb-42af-a7eb-24ac854bf671",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Amoc&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/moc?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/585fde63-4cb5-4235-8c95-2a7a511e7c3f/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A9aa94de8-b114-4479-a771-c7bc0297be58&unique=prints",
        "collector_number": "148",
        "digital": false,
        "rarity": "common",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Aleksi Briclot",
        "artist_ids": [
          "5e470014-31cb-41b0-b054-e23374484449"
        ],
        "illustration_id": "d41510f3-0943-42c3-ae08-23f42c2428aa",
        "border_color": "black",
        "frame": "2015",
        "full_art": false,
        "textless": false,
        "booster": false,
        "story_spotlight": false,
        "prices": {
          "usd": "0.28",
          "usd_foil": null,
          "usd_etched": null,
          "eur": "0.17",
          "eur_foil": null,
          "tix": "0.01"
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=615139&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DJund",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DJund",
          "edhrec": "https://edhrec.com/route/?cc=Jund"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F490483%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=705537&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/110610?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "kaheera the orphanguard (::en)": {
        "object": "card",
        "id": "d4ebed0b-8060-4a7b-a060-5cfcd2172b16",
        "oracle_id": "35428c77-9731-4d4d-8f75-e939a491cf86",
        "multiverse_ids": [
          479744
        ],
        "mtgo_id": 80457,
        "arena_id": 71291,
        "tcgplayer_id": 212596,
        "cardmarket_id": 454848,
        "name": "Kaheera, the Orphanguard",
        "lang": "en",
        "released_at": "2020-04-24",
        "uri": "https://api.scryfall.com/cards/d4ebed0b-8060-4a7b-a060-5cfcd2172b16",
        "scryfall_uri": "https://scryfall.com/card/iko/224/kaheera-the-orphanguard?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T08:23:33Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/d/4/d4ebed0b-8060-4a7b-a060-5cfcd2172b16.jpg?1783931013",
          "normal": "https://cards.scryfall.io/normal/front/d/4/d4ebed0b-8060-4a7b-a060-5cfcd2172b16.jpg?1783931013",
          "large": "https://cards.scryfall.io/large/front/d/4/d4ebed0b-8060-4a7b-a060-5cfcd2172b16.jpg?1783931013",
          "png": "https://cards.scryfall.io/png/front/d/4/d4ebed0b-8060-4a7b-a060-5cfcd2172b16.png?1783931013",
          "art_crop": "https://cards.scryfall.io/art_crop/front/d/4/d4ebed0b-8060-4a7b-a060-5cfcd2172b16.jpg?1783931013",
          "border_crop": "https://cards.scryfall.io/border_crop/front/d/4/d4ebed0b-8060-4a7b-a060-5cfcd2172b16.jpg?1783931013",
          "thumb": "https://cards.scryfall.io/thumb/front/d/4/d4ebed0b-8060-4a7b-a060-5cfcd2172b16.webp?1783931013",
          "grid": "https://cards.scryfall.io/grid/front/d/4/d4ebed0b-8060-4a7b-a060-5cfcd2172b16.webp?1783931013",
          "display": "https://cards.scryfall.io/display/front/d/4/d4ebed0b-8060-4a7b-a060-5cfcd2172b16.webp?1783931013",
          "art": "https://cards.scryfall.io/art/front/d/4/d4ebed0b-8060-4a7b-a060-5cfcd2172b16.webp?1783931013",
          "crop": "https://cards.scryfall.io/crop/front/d/4/d4ebed0b-8060-4a7b-a060-5cfcd2172b16.webp?1783931013",
          "jpeg": "https://cards.scryfall.io/normal/front/d/4/d4ebed0b-8060-4a7b-a060-5cfcd2172b16.jpg?1783931013"
        },
        "mana_cost": "{1}{G/W}{G/W}",
        "cmc": 3,
        "type_line": "Legendary Creature \u2014 Cat Beast",
        "oracle_text": "Companion \u2014 Each creature card in your starting deck is a Cat, Elemental, Nightmare, Dinosaur, or Beast card. (If this card is your chosen companion, you may put it into your hand from outside the game for {3} as a sorcery.)\nVigilance\nEach other creature you control that's a Cat, Elemental, Nightmare, Dinosaur, or Beast gets +1/+1 and has vigilance.",
        "power": "3",
        "toughness": "2",
        "colors": [
          "G",
          "W"
        ],
        "color_identity": [
          "G",
          "W"
        ],
        "keywords": [
          "Vigilance",
          "Companion"
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "legal",
          "timeless": "legal",
          "gladiator": "legal",
          "pioneer": "legal",
          "modern": "legal",
          "legacy": "legal",
          "pauper": "not_legal",
          "vintage": "legal",
          "penny": "legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "not_legal",
          "brawl": "legal",
          "competitivebrawl": "legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "legal"
        },
        "games": [
          "arena",
          "paper",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": false,
        "variation": false,
        "set_id": "19feda43-15ab-427e-a0e4-148a4bf2b03a",
        "set": "iko",
        "set_name": "Ikoria: Lair of Behemoths",
        "set_type": "expansion",
        "set_uri": "https://api.scryfall.com/sets/19feda43-15ab-427e-a0e4-148a4bf2b03a",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Aiko&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/iko?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/d4ebed0b-8060-4a7b-a060-5cfcd2172b16/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A35428c77-9731-4d4d-8f75-e939a491cf86&unique=prints",
        "collector_number": "224",
        "digital": false,
        "rarity": "rare",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Ryan Pancoast",
        "artist_ids": [
          "89cc9475-dda2-4d13-bf88-54b92867a25c"
        ],
        "illustration_id": "b32e2fec-6e28-4c3a-8124-1a492ed93530",
        "border_color": "black",
        "frame": "2015",
        "frame_effects": [
          "companion",
          "legendary"
        ],
        "security_stamp": "oval",
        "full_art": false,
        "textless": false,
        "booster": true,
        "story_spotlight": false,
        "edhrec_rank": 6203,
        "penny_rank": 3311,
        "preview": {
          "source": "ChannelFireball",
          "source_uri": "https://twitter.com/ChannelFireball/status/1247902399861161985",
          "previewed_at": "2020-04-08"
        },
        "prices": {
          "usd": "0.91",
          "usd_foil": "0.65",
          "usd_etched": null,
          "eur": "0.77",
          "eur_foil": "1.35",
          "tix": "0.02"
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=479744&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DKaheera%252C%2Bthe%2BOrphanguard",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DKaheera%252C%2Bthe%2BOrphanguard",
          "edhrec": "https://edhrec.com/route/?cc=Kaheera%2C+the+Orphanguard"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F212596%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=454848&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/80457?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "keruga the macrosage (::en)": {
        "object": "card",
        "id": "a90ee952-de7a-420f-993c-a38db89bc8ac",
        "oracle_id": "ca5121b2-e6d9-40bc-a2d2-05852c4efbe8",
        "multiverse_ids": [
          479745
        ],
        "mtgo_id": 80459,
        "arena_id": 71292,
        "tcgplayer_id": 212006,
        "cardmarket_id": 450968,
        "name": "Keruga, the Macrosage",
        "lang": "en",
        "released_at": "2020-04-24",
        "uri": "https://api.scryfall.com/cards/a90ee952-de7a-420f-993c-a38db89bc8ac",
        "scryfall_uri": "https://scryfall.com/card/iko/225/keruga-the-macrosage?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T08:23:31Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/a/9/a90ee952-de7a-420f-993c-a38db89bc8ac.jpg?1783931011",
          "normal": "https://cards.scryfall.io/normal/front/a/9/a90ee952-de7a-420f-993c-a38db89bc8ac.jpg?1783931011",
          "large": "https://cards.scryfall.io/large/front/a/9/a90ee952-de7a-420f-993c-a38db89bc8ac.jpg?1783931011",
          "png": "https://cards.scryfall.io/png/front/a/9/a90ee952-de7a-420f-993c-a38db89bc8ac.png?1783931011",
          "art_crop": "https://cards.scryfall.io/art_crop/front/a/9/a90ee952-de7a-420f-993c-a38db89bc8ac.jpg?1783931011",
          "border_crop": "https://cards.scryfall.io/border_crop/front/a/9/a90ee952-de7a-420f-993c-a38db89bc8ac.jpg?1783931011",
          "thumb": "https://cards.scryfall.io/thumb/front/a/9/a90ee952-de7a-420f-993c-a38db89bc8ac.webp?1783931011",
          "grid": "https://cards.scryfall.io/grid/front/a/9/a90ee952-de7a-420f-993c-a38db89bc8ac.webp?1783931011",
          "display": "https://cards.scryfall.io/display/front/a/9/a90ee952-de7a-420f-993c-a38db89bc8ac.webp?1783931011",
          "art": "https://cards.scryfall.io/art/front/a/9/a90ee952-de7a-420f-993c-a38db89bc8ac.webp?1783931011",
          "crop": "https://cards.scryfall.io/crop/front/a/9/a90ee952-de7a-420f-993c-a38db89bc8ac.webp?1783931011",
          "jpeg": "https://cards.scryfall.io/normal/front/a/9/a90ee952-de7a-420f-993c-a38db89bc8ac.jpg?1783931011"
        },
        "mana_cost": "{3}{G/U}{G/U}",
        "cmc": 5,
        "type_line": "Legendary Creature \u2014 Dinosaur Hippo",
        "oracle_text": "Companion \u2014 Your starting deck contains only cards with mana value 3 or greater and land cards. (If this card is your chosen companion, you may put it into your hand from outside the game for {3} as a sorcery.)\nWhen Keruga enters, draw a card for each other permanent you control with mana value 3 or greater.",
        "power": "5",
        "toughness": "4",
        "colors": [
          "G",
          "U"
        ],
        "color_identity": [
          "G",
          "U"
        ],
        "keywords": [
          "Companion"
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "legal",
          "timeless": "legal",
          "gladiator": "legal",
          "pioneer": "legal",
          "modern": "legal",
          "legacy": "legal",
          "pauper": "not_legal",
          "vintage": "legal",
          "penny": "legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "not_legal",
          "brawl": "legal",
          "competitivebrawl": "legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "not_legal"
        },
        "games": [
          "arena",
          "paper",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": false,
        "variation": false,
        "set_id": "19feda43-15ab-427e-a0e4-148a4bf2b03a",
        "set": "iko",
        "set_name": "Ikoria: Lair of Behemoths",
        "set_type": "expansion",
        "set_uri": "https://api.scryfall.com/sets/19feda43-15ab-427e-a0e4-148a4bf2b03a",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Aiko&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/iko?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/a90ee952-de7a-420f-993c-a38db89bc8ac/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3Aca5121b2-e6d9-40bc-a2d2-05852c4efbe8&unique=prints",
        "collector_number": "225",
        "digital": false,
        "rarity": "rare",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Dan Murayama Scott",
        "artist_ids": [
          "f852fa13-137e-40f2-bbc1-0f01df09c0e0"
        ],
        "illustration_id": "46ccf317-6596-40cf-b54f-3bbe7234beec",
        "border_color": "black",
        "frame": "2015",
        "frame_effects": [
          "companion",
          "legendary"
        ],
        "security_stamp": "oval",
        "full_art": false,
        "textless": false,
        "booster": true,
        "story_spotlight": false,
        "edhrec_rank": 8871,
        "penny_rank": 4188,
        "preview": {
          "source": "Wizards of the Coast",
          "source_uri": "https://magic.wizards.com/en/articles/archive/feature/ikoria-lair-behemoths-mechanics-2020-04-02?efe",
          "previewed_at": "2020-04-02"
        },
        "prices": {
          "usd": "0.30",
          "usd_foil": "0.30",
          "usd_etched": null,
          "eur": "0.17",
          "eur_foil": "0.53",
          "tix": "0.02"
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=479745&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DKeruga%252C%2Bthe%2BMacrosage",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DKeruga%252C%2Bthe%2BMacrosage",
          "edhrec": "https://edhrec.com/route/?cc=Keruga%2C+the+Macrosage"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F212006%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=450968&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/80459?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "lightning bolt (::en)": {
        "object": "card",
        "id": "7673784e-db4b-43a1-8d55-1bb9fc1e284f",
        "oracle_id": "4457ed35-7c10-48c8-9776-456485fdf070",
        "multiverse_ids": [],
        "resource_id": "A59396A4D646C69A1DD41F9906BE9A9CDECE83F18DC5C53501DD7BAE50511DBB",
        "mtgo_id": 152037,
        "arena_id": 105816,
        "tcgplayer_id": 697344,
        "cardmarket_id": 892161,
        "name": "Lightning Bolt",
        "lang": "en",
        "released_at": "2026-06-26",
        "uri": "https://api.scryfall.com/cards/7673784e-db4b-43a1-8d55-1bb9fc1e284f",
        "scryfall_uri": "https://scryfall.com/card/msc/806/lightning-bolt?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T00:36:48Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/7/6/7673784e-db4b-43a1-8d55-1bb9fc1e284f.jpg?1783903008",
          "normal": "https://cards.scryfall.io/normal/front/7/6/7673784e-db4b-43a1-8d55-1bb9fc1e284f.jpg?1783903008",
          "large": "https://cards.scryfall.io/large/front/7/6/7673784e-db4b-43a1-8d55-1bb9fc1e284f.jpg?1783903008",
          "png": "https://cards.scryfall.io/png/front/7/6/7673784e-db4b-43a1-8d55-1bb9fc1e284f.png?1783903008",
          "art_crop": "https://cards.scryfall.io/art_crop/front/7/6/7673784e-db4b-43a1-8d55-1bb9fc1e284f.jpg?1783903008",
          "border_crop": "https://cards.scryfall.io/border_crop/front/7/6/7673784e-db4b-43a1-8d55-1bb9fc1e284f.jpg?1783903008",
          "thumb": "https://cards.scryfall.io/thumb/front/7/6/7673784e-db4b-43a1-8d55-1bb9fc1e284f.webp?1783903008",
          "grid": "https://cards.scryfall.io/grid/front/7/6/7673784e-db4b-43a1-8d55-1bb9fc1e284f.webp?1783903008",
          "display": "https://cards.scryfall.io/display/front/7/6/7673784e-db4b-43a1-8d55-1bb9fc1e284f.webp?1783903008",
          "art": "https://cards.scryfall.io/art/front/7/6/7673784e-db4b-43a1-8d55-1bb9fc1e284f.webp?1783903008",
          "crop": "https://cards.scryfall.io/crop/front/7/6/7673784e-db4b-43a1-8d55-1bb9fc1e284f.webp?1783903008",
          "jpeg": "https://cards.scryfall.io/normal/front/7/6/7673784e-db4b-43a1-8d55-1bb9fc1e284f.jpg?1783903008"
        },
        "mana_cost": "{R}",
        "cmc": 1,
        "type_line": "Instant",
        "oracle_text": "Lightning Bolt deals 3 damage to any target.",
        "colors": [
          "R"
        ],
        "color_identity": [
          "R"
        ],
        "keywords": [],
        "all_parts": [
          {
            "object": "related_card",
            "id": "7673784e-db4b-43a1-8d55-1bb9fc1e284f",
            "component": "combo_piece",
            "name": "Lightning Bolt",
            "type_line": "Instant",
            "uri": "https://api.scryfall.com/cards/7673784e-db4b-43a1-8d55-1bb9fc1e284f"
          },
          {
            "object": "related_card",
            "id": "4f095067-cf24-4061-8626-dc68a66a0b36",
            "component": "combo_piece",
            "name": "Toralf's Disciple",
            "type_line": "Creature \u2014 Human Warrior",
            "uri": "https://api.scryfall.com/cards/4f095067-cf24-4061-8626-dc68a66a0b36"
          },
          {
            "object": "related_card",
            "id": "69b51576-532b-450e-a8bf-0482cac04618",
            "component": "combo_piece",
            "name": "Thayan Evokers",
            "type_line": "Creature \u2014 Human Wizard",
            "uri": "https://api.scryfall.com/cards/69b51576-532b-450e-a8bf-0482cac04618"
          },
          {
            "object": "related_card",
            "id": "618806ea-7ea8-4cfb-a8c1-c3defa34e7dd",
            "component": "combo_piece",
            "name": "Indris, the Hydrostatic Surge",
            "type_line": "Legendary Creature \u2014 Otter Incarnation",
            "uri": "https://api.scryfall.com/cards/618806ea-7ea8-4cfb-a8c1-c3defa34e7dd"
          }
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "banned",
          "timeless": "legal",
          "gladiator": "legal",
          "pioneer": "not_legal",
          "modern": "legal",
          "legacy": "legal",
          "pauper": "legal",
          "vintage": "legal",
          "penny": "not_legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "not_legal",
          "brawl": "legal",
          "competitivebrawl": "legal",
          "alchemy": "not_legal",
          "paupercommander": "legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "legal",
          "predh": "legal",
          "tlr": "legal"
        },
        "games": [
          "paper",
          "mtgo",
          "arena"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": true,
        "variation": false,
        "set_id": "9d739461-c5ac-43a1-af41-3d5a585b5c8d",
        "set": "msc",
        "set_name": "Marvel Super Heroes Commander",
        "set_type": "commander",
        "set_uri": "https://api.scryfall.com/sets/9d739461-c5ac-43a1-af41-3d5a585b5c8d",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Amsc&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/msc?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/7673784e-db4b-43a1-8d55-1bb9fc1e284f/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A4457ed35-7c10-48c8-9776-456485fdf070&unique=prints",
        "collector_number": "806",
        "digital": false,
        "rarity": "uncommon",
        "flavor_text": '"I am the god of thunder, the lord of the savage lightning, and the very skies must tremble when speaks The Mighty Thor!"',
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Milivoj \u0106eran",
        "artist_ids": [
          "1eced451-4da5-42bc-b49d-70c41246581f"
        ],
        "illustration_id": "58884d99-ed2d-4efd-b192-b1eb6f87c39f",
        "border_color": "black",
        "frame": "2015",
        "full_art": false,
        "textless": false,
        "booster": false,
        "story_spotlight": false,
        "promo_types": [
          "universesbeyond"
        ],
        "edhrec_rank": 157,
        "prices": {
          "usd": "0.87",
          "usd_foil": "2.59",
          "usd_etched": null,
          "eur": "1.84",
          "eur_foil": "2.47",
          "tix": "0.02"
        },
        "related_uris": {
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DLightning%2BBolt",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DLightning%2BBolt",
          "edhrec": "https://edhrec.com/route/?cc=Lightning+Bolt"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F697344%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=892161&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/152037?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "lurrus of the dreamden (::en)": {
        "object": "card",
        "id": "5ad36fb2-c44e-4085-ba0d-54277841ad3a",
        "oracle_id": "3bc757c1-3adb-4321-8832-8e1cc9e687f7",
        "multiverse_ids": [
          479746
        ],
        "mtgo_id": 80461,
        "arena_id": 71293,
        "tcgplayer_id": 212282,
        "cardmarket_id": 453203,
        "name": "Lurrus of the Dream-Den",
        "lang": "en",
        "released_at": "2020-04-24",
        "uri": "https://api.scryfall.com/cards/5ad36fb2-c44e-4085-ba0d-54277841ad3a",
        "scryfall_uri": "https://scryfall.com/card/iko/226/lurrus-of-the-dream-den?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T08:23:30Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/5/a/5ad36fb2-c44e-4085-ba0d-54277841ad3a.jpg?1783931010",
          "normal": "https://cards.scryfall.io/normal/front/5/a/5ad36fb2-c44e-4085-ba0d-54277841ad3a.jpg?1783931010",
          "large": "https://cards.scryfall.io/large/front/5/a/5ad36fb2-c44e-4085-ba0d-54277841ad3a.jpg?1783931010",
          "png": "https://cards.scryfall.io/png/front/5/a/5ad36fb2-c44e-4085-ba0d-54277841ad3a.png?1783931010",
          "art_crop": "https://cards.scryfall.io/art_crop/front/5/a/5ad36fb2-c44e-4085-ba0d-54277841ad3a.jpg?1783931010",
          "border_crop": "https://cards.scryfall.io/border_crop/front/5/a/5ad36fb2-c44e-4085-ba0d-54277841ad3a.jpg?1783931010",
          "thumb": "https://cards.scryfall.io/thumb/front/5/a/5ad36fb2-c44e-4085-ba0d-54277841ad3a.webp?1783931010",
          "grid": "https://cards.scryfall.io/grid/front/5/a/5ad36fb2-c44e-4085-ba0d-54277841ad3a.webp?1783931010",
          "display": "https://cards.scryfall.io/display/front/5/a/5ad36fb2-c44e-4085-ba0d-54277841ad3a.webp?1783931010",
          "art": "https://cards.scryfall.io/art/front/5/a/5ad36fb2-c44e-4085-ba0d-54277841ad3a.webp?1783931010",
          "crop": "https://cards.scryfall.io/crop/front/5/a/5ad36fb2-c44e-4085-ba0d-54277841ad3a.webp?1783931010",
          "jpeg": "https://cards.scryfall.io/normal/front/5/a/5ad36fb2-c44e-4085-ba0d-54277841ad3a.jpg?1783931010"
        },
        "mana_cost": "{1}{W/B}{W/B}",
        "cmc": 3,
        "type_line": "Legendary Creature \u2014 Cat Nightmare",
        "oracle_text": "Companion \u2014 Each permanent card in your starting deck has mana value 2 or less. (If this card is your chosen companion, you may put it into your hand from outside the game for {3} as a sorcery.)\nLifelink\nOnce during each of your turns, you may cast a permanent spell with mana value 2 or less from your graveyard.",
        "power": "3",
        "toughness": "2",
        "colors": [
          "B",
          "W"
        ],
        "color_identity": [
          "B",
          "W"
        ],
        "keywords": [
          "Lifelink",
          "Companion"
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "legal",
          "timeless": "legal",
          "gladiator": "legal",
          "pioneer": "banned",
          "modern": "banned",
          "legacy": "banned",
          "pauper": "not_legal",
          "vintage": "legal",
          "penny": "legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "not_legal",
          "brawl": "legal",
          "competitivebrawl": "legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "legal"
        },
        "games": [
          "arena",
          "paper",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": false,
        "variation": false,
        "set_id": "19feda43-15ab-427e-a0e4-148a4bf2b03a",
        "set": "iko",
        "set_name": "Ikoria: Lair of Behemoths",
        "set_type": "expansion",
        "set_uri": "https://api.scryfall.com/sets/19feda43-15ab-427e-a0e4-148a4bf2b03a",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Aiko&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/iko?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/5ad36fb2-c44e-4085-ba0d-54277841ad3a/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A3bc757c1-3adb-4321-8832-8e1cc9e687f7&unique=prints",
        "collector_number": "226",
        "digital": false,
        "rarity": "rare",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Slawomir Maniak",
        "artist_ids": [
          "d887bc66-2779-416c-a1ff-d8720242063e"
        ],
        "illustration_id": "f715763e-13f5-4f16-87b6-466bf5dbffba",
        "border_color": "black",
        "frame": "2015",
        "frame_effects": [
          "companion",
          "legendary"
        ],
        "security_stamp": "oval",
        "full_art": false,
        "textless": false,
        "booster": true,
        "story_spotlight": false,
        "edhrec_rank": 2865,
        "penny_rank": 311,
        "preview": {
          "source": "Kripparrian",
          "source_uri": "https://twitter.com/Kripparrian/status/1247269442398101510",
          "previewed_at": "2020-04-06"
        },
        "prices": {
          "usd": "1.91",
          "usd_foil": "3.32",
          "usd_etched": null,
          "eur": "1.69",
          "eur_foil": "2.37",
          "tix": "0.02"
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=479746&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DLurrus%2Bof%2Bthe%2BDream-Den",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DLurrus%2Bof%2Bthe%2BDream-Den",
          "edhrec": "https://edhrec.com/route/?cc=Lurrus+of+the+Dream-Den"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F212282%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=453203&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/80461?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "lutri the spellchaser (::en)": {
        "object": "card",
        "id": "fb1189c9-7842-466e-8238-1e02677d8494",
        "oracle_id": "158a6225-a246-4fd6-aa57-0df8067b4383",
        "multiverse_ids": [
          479747
        ],
        "mtgo_id": 80463,
        "arena_id": 71294,
        "tcgplayer_id": 212017,
        "cardmarket_id": 450978,
        "name": "Lutri, the Spellchaser",
        "lang": "en",
        "released_at": "2020-04-24",
        "uri": "https://api.scryfall.com/cards/fb1189c9-7842-466e-8238-1e02677d8494",
        "scryfall_uri": "https://scryfall.com/card/iko/227/lutri-the-spellchaser?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T08:23:30Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/f/b/fb1189c9-7842-466e-8238-1e02677d8494.jpg?1783931010",
          "normal": "https://cards.scryfall.io/normal/front/f/b/fb1189c9-7842-466e-8238-1e02677d8494.jpg?1783931010",
          "large": "https://cards.scryfall.io/large/front/f/b/fb1189c9-7842-466e-8238-1e02677d8494.jpg?1783931010",
          "png": "https://cards.scryfall.io/png/front/f/b/fb1189c9-7842-466e-8238-1e02677d8494.png?1783931010",
          "art_crop": "https://cards.scryfall.io/art_crop/front/f/b/fb1189c9-7842-466e-8238-1e02677d8494.jpg?1783931010",
          "border_crop": "https://cards.scryfall.io/border_crop/front/f/b/fb1189c9-7842-466e-8238-1e02677d8494.jpg?1783931010",
          "thumb": "https://cards.scryfall.io/thumb/front/f/b/fb1189c9-7842-466e-8238-1e02677d8494.webp?1783931010",
          "grid": "https://cards.scryfall.io/grid/front/f/b/fb1189c9-7842-466e-8238-1e02677d8494.webp?1783931010",
          "display": "https://cards.scryfall.io/display/front/f/b/fb1189c9-7842-466e-8238-1e02677d8494.webp?1783931010",
          "art": "https://cards.scryfall.io/art/front/f/b/fb1189c9-7842-466e-8238-1e02677d8494.webp?1783931010",
          "crop": "https://cards.scryfall.io/crop/front/f/b/fb1189c9-7842-466e-8238-1e02677d8494.webp?1783931010",
          "jpeg": "https://cards.scryfall.io/normal/front/f/b/fb1189c9-7842-466e-8238-1e02677d8494.jpg?1783931010"
        },
        "mana_cost": "{1}{U/R}{U/R}",
        "cmc": 3,
        "type_line": "Legendary Creature \u2014 Elemental Otter",
        "oracle_text": "Companion \u2014 Each nonland card in your starting deck has a different name. (If this card is your chosen companion, you may put it into your hand from outside the game for {3} as a sorcery.)\nFlash\nWhen Lutri enters, if you cast it, copy target instant or sorcery spell you control. You may choose new targets for the copy.",
        "power": "3",
        "toughness": "2",
        "colors": [
          "R",
          "U"
        ],
        "color_identity": [
          "R",
          "U"
        ],
        "keywords": [
          "Companion",
          "Flash"
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "legal",
          "timeless": "legal",
          "gladiator": "legal",
          "pioneer": "legal",
          "modern": "legal",
          "legacy": "legal",
          "pauper": "not_legal",
          "vintage": "legal",
          "penny": "legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "not_legal",
          "brawl": "banned",
          "competitivebrawl": "banned",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "legal"
        },
        "games": [
          "arena",
          "paper",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": false,
        "variation": false,
        "set_id": "19feda43-15ab-427e-a0e4-148a4bf2b03a",
        "set": "iko",
        "set_name": "Ikoria: Lair of Behemoths",
        "set_type": "expansion",
        "set_uri": "https://api.scryfall.com/sets/19feda43-15ab-427e-a0e4-148a4bf2b03a",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Aiko&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/iko?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/fb1189c9-7842-466e-8238-1e02677d8494/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A158a6225-a246-4fd6-aa57-0df8067b4383&unique=prints",
        "collector_number": "227",
        "digital": false,
        "rarity": "rare",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Lie Setiawan",
        "artist_ids": [
          "6f771d3f-310e-4aa4-841f-5ba4ba9f025a"
        ],
        "illustration_id": "a710eb78-b119-49eb-8274-6bc76edffbbd",
        "border_color": "black",
        "frame": "2015",
        "frame_effects": [
          "companion",
          "legendary"
        ],
        "security_stamp": "oval",
        "full_art": false,
        "textless": false,
        "booster": true,
        "story_spotlight": false,
        "edhrec_rank": 12338,
        "penny_rank": 4808,
        "preview": {
          "source": "Wizards of the Coast",
          "source_uri": "https://www.twitch.tv/videos/581433985",
          "previewed_at": "2020-04-02"
        },
        "prices": {
          "usd": "0.67",
          "usd_foil": "3.03",
          "usd_etched": null,
          "eur": "0.74",
          "eur_foil": "2.04",
          "tix": "0.02"
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=479747&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DLutri%252C%2Bthe%2BSpellchaser",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DLutri%252C%2Bthe%2BSpellchaser",
          "edhrec": "https://edhrec.com/route/?cc=Lutri%2C+the+Spellchaser"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F212017%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=450978&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/80463?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "mage slayer (::en)": {
        "object": "card",
        "id": "e3226808-493e-4df2-9446-cb7cb47aaf2c",
        "oracle_id": "db444262-c40f-4c80-9d14-265c32f77cf1",
        "multiverse_ids": [
          554222
        ],
        "tcgplayer_id": 263023,
        "cardmarket_id": 608954,
        "name": "Mage Slayer",
        "lang": "en",
        "released_at": "2022-02-18",
        "uri": "https://api.scryfall.com/cards/e3226808-493e-4df2-9446-cb7cb47aaf2c",
        "scryfall_uri": "https://scryfall.com/card/nec/140/mage-slayer?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T06:25:44Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/e/3/e3226808-493e-4df2-9446-cb7cb47aaf2c.jpg?1783923944",
          "normal": "https://cards.scryfall.io/normal/front/e/3/e3226808-493e-4df2-9446-cb7cb47aaf2c.jpg?1783923944",
          "large": "https://cards.scryfall.io/large/front/e/3/e3226808-493e-4df2-9446-cb7cb47aaf2c.jpg?1783923944",
          "png": "https://cards.scryfall.io/png/front/e/3/e3226808-493e-4df2-9446-cb7cb47aaf2c.png?1783923944",
          "art_crop": "https://cards.scryfall.io/art_crop/front/e/3/e3226808-493e-4df2-9446-cb7cb47aaf2c.jpg?1783923944",
          "border_crop": "https://cards.scryfall.io/border_crop/front/e/3/e3226808-493e-4df2-9446-cb7cb47aaf2c.jpg?1783923944",
          "thumb": "https://cards.scryfall.io/thumb/front/e/3/e3226808-493e-4df2-9446-cb7cb47aaf2c.webp?1783923944",
          "grid": "https://cards.scryfall.io/grid/front/e/3/e3226808-493e-4df2-9446-cb7cb47aaf2c.webp?1783923944",
          "display": "https://cards.scryfall.io/display/front/e/3/e3226808-493e-4df2-9446-cb7cb47aaf2c.webp?1783923944",
          "art": "https://cards.scryfall.io/art/front/e/3/e3226808-493e-4df2-9446-cb7cb47aaf2c.webp?1783923944",
          "crop": "https://cards.scryfall.io/crop/front/e/3/e3226808-493e-4df2-9446-cb7cb47aaf2c.webp?1783923944",
          "jpeg": "https://cards.scryfall.io/normal/front/e/3/e3226808-493e-4df2-9446-cb7cb47aaf2c.jpg?1783923944"
        },
        "mana_cost": "{1}{R}{G}",
        "cmc": 3,
        "type_line": "Artifact \u2014 Equipment",
        "oracle_text": "Whenever equipped creature attacks, it deals damage equal to its power to the player or planeswalker it's attacking.\nEquip {3}",
        "colors": [
          "G",
          "R"
        ],
        "color_identity": [
          "G",
          "R"
        ],
        "keywords": [
          "Equip"
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "not_legal",
          "timeless": "not_legal",
          "gladiator": "not_legal",
          "pioneer": "not_legal",
          "modern": "legal",
          "legacy": "legal",
          "pauper": "not_legal",
          "vintage": "legal",
          "penny": "legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "not_legal",
          "brawl": "not_legal",
          "competitivebrawl": "not_legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "legal",
          "tlr": "legal"
        },
        "games": [
          "paper"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": false,
        "nonfoil": true,
        "finishes": [
          "nonfoil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": true,
        "variation": false,
        "set_id": "5b4d929d-bdf9-4bbf-858e-e248f53325ad",
        "set": "nec",
        "set_name": "Neon Dynasty Commander",
        "set_type": "commander",
        "set_uri": "https://api.scryfall.com/sets/5b4d929d-bdf9-4bbf-858e-e248f53325ad",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Anec&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/nec?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/e3226808-493e-4df2-9446-cb7cb47aaf2c/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3Adb444262-c40f-4c80-9d14-265c32f77cf1&unique=prints",
        "collector_number": "140",
        "digital": false,
        "rarity": "uncommon",
        "flavor_text": '"When the wielder is strong enough, any sword will do."\n\u2014Kresh the Bloodbraided',
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Lars Grant-West",
        "artist_ids": [
          "21ed6499-c4d3-4965-ab02-6c7228275bec"
        ],
        "illustration_id": "42a5492c-89ed-43e6-804d-216255f66c70",
        "border_color": "black",
        "frame": "2015",
        "full_art": false,
        "textless": false,
        "booster": false,
        "story_spotlight": false,
        "edhrec_rank": 4411,
        "penny_rank": 16052,
        "prices": {
          "usd": "1.54",
          "usd_foil": null,
          "usd_etched": null,
          "eur": "1.01",
          "eur_foil": null,
          "tix": null
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=554222&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DMage%2BSlayer",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DMage%2BSlayer",
          "edhrec": "https://edhrec.com/route/?cc=Mage+Slayer"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F263023%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=608954&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards?affiliate_id=scryfall&data%5Bsearch%5D=Mage+Slayer&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "maular the next evolution (::en)": {
        "object": "card",
        "id": "ac8d307f-5340-4419-95b4-b0ca09f9fd89",
        "oracle_id": "214f4e0a-eba7-4a08-86b2-d490d6ae1048",
        "multiverse_ids": [],
        "tcgplayer_id": 709790,
        "name": "Maular, the Next Evolution",
        "lang": "en",
        "released_at": "2026-10-19",
        "uri": "https://api.scryfall.com/cards/ac8d307f-5340-4419-95b4-b0ca09f9fd89",
        "scryfall_uri": "https://scryfall.com/card/mbc/31/maular-the-next-evolution?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-08-18T15:04:10Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/a/c/ac8d307f-5340-4419-95b4-b0ca09f9fd89.jpg?1787065450",
          "normal": "https://cards.scryfall.io/normal/front/a/c/ac8d307f-5340-4419-95b4-b0ca09f9fd89.jpg?1787065450",
          "large": "https://cards.scryfall.io/large/front/a/c/ac8d307f-5340-4419-95b4-b0ca09f9fd89.jpg?1787065450",
          "png": "https://cards.scryfall.io/png/front/a/c/ac8d307f-5340-4419-95b4-b0ca09f9fd89.png?1787065450",
          "art_crop": "https://cards.scryfall.io/art_crop/front/a/c/ac8d307f-5340-4419-95b4-b0ca09f9fd89.jpg?1787065450",
          "border_crop": "https://cards.scryfall.io/border_crop/front/a/c/ac8d307f-5340-4419-95b4-b0ca09f9fd89.jpg?1787065450",
          "thumb": "https://cards.scryfall.io/thumb/front/a/c/ac8d307f-5340-4419-95b4-b0ca09f9fd89.webp?1787065450",
          "grid": "https://cards.scryfall.io/grid/front/a/c/ac8d307f-5340-4419-95b4-b0ca09f9fd89.webp?1787065450",
          "display": "https://cards.scryfall.io/display/front/a/c/ac8d307f-5340-4419-95b4-b0ca09f9fd89.webp?1787065450",
          "art": "https://cards.scryfall.io/art/front/a/c/ac8d307f-5340-4419-95b4-b0ca09f9fd89.webp?1787065450",
          "crop": "https://cards.scryfall.io/crop/front/a/c/ac8d307f-5340-4419-95b4-b0ca09f9fd89.webp?1787065450",
          "jpeg": "https://cards.scryfall.io/normal/front/a/c/ac8d307f-5340-4419-95b4-b0ca09f9fd89.jpg?1787065450"
        },
        "mana_cost": "{5}{G}{G}",
        "cmc": 7,
        "type_line": "Legendary Creature \u2014 Dinosaur Mutant",
        "oracle_text": "Rulebreaker \u2014 A deck with this commander can have creature cards with mana value 7 or greater of any color identity and any basic land cards.\nWhenever a creature you control with mana value 7 or greater attacks, double its power and toughness until end of turn.",
        "power": "10",
        "toughness": "10",
        "colors": [
          "G"
        ],
        "color_identity": [
          "G"
        ],
        "keywords": [
          "Rulebreaker",
          "Double"
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "not_legal",
          "timeless": "not_legal",
          "gladiator": "not_legal",
          "pioneer": "not_legal",
          "modern": "not_legal",
          "legacy": "not_legal",
          "pauper": "not_legal",
          "vintage": "not_legal",
          "penny": "not_legal",
          "commander": "not_legal",
          "oathbreaker": "not_legal",
          "standardbrawl": "not_legal",
          "brawl": "not_legal",
          "competitivebrawl": "not_legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "not_legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "not_legal"
        },
        "games": [
          "paper"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": false,
        "variation": false,
        "set_id": "a4135564-9f37-4aaf-963a-90666f843e0d",
        "set": "mbc",
        "set_name": "Mystery Booster Commander Edition",
        "set_type": "draft_innovation",
        "set_uri": "https://api.scryfall.com/sets/a4135564-9f37-4aaf-963a-90666f843e0d",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Ambc&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/mbc?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/ac8d307f-5340-4419-95b4-b0ca09f9fd89/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A214f4e0a-eba7-4a08-86b2-d490d6ae1048&unique=prints",
        "collector_number": "31",
        "digital": false,
        "rarity": "rare",
        "flavor_text": "An unnatural ruler for the natural world.",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Jesper Ejsing",
        "artist_ids": [
          "a5f8354a-8b51-4e59-96b2-0e3aeae4fa1d"
        ],
        "illustration_id": "df14f3da-774a-4a9f-b5d9-f04b54383ba9",
        "border_color": "black",
        "frame": "2015",
        "frame_effects": [
          "legendary"
        ],
        "security_stamp": "oval",
        "full_art": false,
        "textless": false,
        "booster": false,
        "story_spotlight": false,
        "edhrec_rank": 19627,
        "prices": {
          "usd": null,
          "usd_foil": null,
          "usd_etched": null,
          "eur": null,
          "eur_foil": null,
          "tix": null
        },
        "related_uris": {
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DMaular%252C%2Bthe%2BNext%2BEvolution",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DMaular%252C%2Bthe%2BNext%2BEvolution",
          "edhrec": "https://edhrec.com/route/?cc=Maular%2C+the+Next+Evolution"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F709790%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products/Search?referrer=scryfall&searchString=Maular%2C+the+Next+Evolution&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards?affiliate_id=scryfall&data%5Bsearch%5D=Maular%2C+the+Next+Evolution&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "morphic tide (::en)": {
        "object": "card",
        "id": "54327aa2-319d-4430-a266-03cadeed6146",
        "oracle_id": "302e4ac2-522b-4a0a-850a-d856639ea2a4",
        "multiverse_ids": [
          423584
        ],
        "tcgplayer_id": 125605,
        "cardmarket_id": 294398,
        "name": "Morphic Tide",
        "lang": "en",
        "released_at": "2016-11-25",
        "uri": "https://api.scryfall.com/cards/54327aa2-319d-4430-a266-03cadeed6146",
        "scryfall_uri": "https://scryfall.com/card/opca/3/morphic-tide?utm_source=api",
        "layout": "planar",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T10:02:09Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/5/4/54327aa2-319d-4430-a266-03cadeed6146.jpg?1783936929",
          "normal": "https://cards.scryfall.io/normal/front/5/4/54327aa2-319d-4430-a266-03cadeed6146.jpg?1783936929",
          "large": "https://cards.scryfall.io/large/front/5/4/54327aa2-319d-4430-a266-03cadeed6146.jpg?1783936929",
          "png": "https://cards.scryfall.io/png/front/5/4/54327aa2-319d-4430-a266-03cadeed6146.png?1783936929",
          "art_crop": "https://cards.scryfall.io/art_crop/front/5/4/54327aa2-319d-4430-a266-03cadeed6146.jpg?1783936929",
          "border_crop": "https://cards.scryfall.io/border_crop/front/5/4/54327aa2-319d-4430-a266-03cadeed6146.jpg?1783936929",
          "thumb": "https://cards.scryfall.io/thumb/front/5/4/54327aa2-319d-4430-a266-03cadeed6146.webp?1783936929",
          "grid": "https://cards.scryfall.io/grid/front/5/4/54327aa2-319d-4430-a266-03cadeed6146.webp?1783936929",
          "display": "https://cards.scryfall.io/display/front/5/4/54327aa2-319d-4430-a266-03cadeed6146.webp?1783936929",
          "art": "https://cards.scryfall.io/art/front/5/4/54327aa2-319d-4430-a266-03cadeed6146.webp?1783936929",
          "crop": "https://cards.scryfall.io/crop/front/5/4/54327aa2-319d-4430-a266-03cadeed6146.webp?1783936929",
          "jpeg": "https://cards.scryfall.io/normal/front/5/4/54327aa2-319d-4430-a266-03cadeed6146.jpg?1783936929"
        },
        "mana_cost": "",
        "cmc": 0,
        "type_line": "Phenomenon",
        "oracle_text": "When you encounter Morphic Tide, each player shuffles all permanents they own into their library, then reveals that many cards from the top of their library. Each player puts all artifact, creature, land, and planeswalker cards revealed this way onto the battlefield, then does the same for enchantment cards, then puts all cards revealed this way that weren't put onto the battlefield on the bottom of their library in any order. (Then planeswalk away from this phenomenon.)",
        "colors": [],
        "color_identity": [],
        "keywords": [],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "not_legal",
          "timeless": "not_legal",
          "gladiator": "not_legal",
          "pioneer": "not_legal",
          "modern": "not_legal",
          "legacy": "not_legal",
          "pauper": "not_legal",
          "vintage": "not_legal",
          "penny": "not_legal",
          "commander": "not_legal",
          "oathbreaker": "not_legal",
          "standardbrawl": "not_legal",
          "brawl": "not_legal",
          "competitivebrawl": "not_legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "not_legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "not_legal"
        },
        "games": [
          "paper"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": false,
        "nonfoil": true,
        "finishes": [
          "nonfoil"
        ],
        "oversized": true,
        "promo": false,
        "reprint": true,
        "variation": false,
        "set_id": "ada3345c-d416-49bc-92e0-73363ddee5c8",
        "set": "opca",
        "set_name": "Planechase Anthology Planes",
        "set_type": "planechase",
        "set_uri": "https://api.scryfall.com/sets/ada3345c-d416-49bc-92e0-73363ddee5c8",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Aopca&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/opca?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/54327aa2-319d-4430-a266-03cadeed6146/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A302e4ac2-522b-4a0a-850a-d856639ea2a4&unique=prints",
        "collector_number": "3",
        "digital": false,
        "rarity": "common",
        "card_back_id": "7840c131-f96b-4700-9347-2215c43156e6",
        "artist": "Brandon Kitkouski",
        "artist_ids": [
          "0330b5e8-2cf0-4ecb-8fd7-e20a18bdeb20"
        ],
        "illustration_id": "4fa395ac-c03a-414e-999d-331594553dd2",
        "border_color": "black",
        "frame": "2015",
        "full_art": false,
        "textless": false,
        "booster": false,
        "story_spotlight": false,
        "prices": {
          "usd": "4.03",
          "usd_foil": null,
          "usd_etched": null,
          "eur": "1.78",
          "eur_foil": null,
          "tix": null
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=423584&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DMorphic%2BTide",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DMorphic%2BTide",
          "edhrec": "https://edhrec.com/route/?cc=Morphic+Tide"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F125605%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=294398&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards?affiliate_id=scryfall&data%5Bsearch%5D=Morphic+Tide&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "mountain (::en)": {
        "object": "card",
        "id": "85177bd7-6c50-48da-b692-ae5fe7bd357c",
        "oracle_id": "a3fb7228-e76b-4e96-a40e-20b5fed75685",
        "multiverse_ids": [],
        "tcgplayer_id": 723326,
        "name": "Mountain",
        "lang": "en",
        "released_at": "2027-04-09",
        "uri": "https://api.scryfall.com/cards/85177bd7-6c50-48da-b692-ae5fe7bd357c",
        "scryfall_uri": "https://scryfall.com/card/mdd/298/mountain?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-10-09T20:40:39Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/8/5/85177bd7-6c50-48da-b692-ae5fe7bd357c.jpg?1791578439",
          "normal": "https://cards.scryfall.io/normal/front/8/5/85177bd7-6c50-48da-b692-ae5fe7bd357c.jpg?1791578439",
          "large": "https://cards.scryfall.io/large/front/8/5/85177bd7-6c50-48da-b692-ae5fe7bd357c.jpg?1791578439",
          "png": "https://cards.scryfall.io/png/front/8/5/85177bd7-6c50-48da-b692-ae5fe7bd357c.png?1791578439",
          "art_crop": "https://cards.scryfall.io/art_crop/front/8/5/85177bd7-6c50-48da-b692-ae5fe7bd357c.jpg?1791578439",
          "border_crop": "https://cards.scryfall.io/border_crop/front/8/5/85177bd7-6c50-48da-b692-ae5fe7bd357c.jpg?1791578439",
          "thumb": "https://cards.scryfall.io/thumb/front/8/5/85177bd7-6c50-48da-b692-ae5fe7bd357c.webp?1791578439",
          "grid": "https://cards.scryfall.io/grid/front/8/5/85177bd7-6c50-48da-b692-ae5fe7bd357c.webp?1791578439",
          "display": "https://cards.scryfall.io/display/front/8/5/85177bd7-6c50-48da-b692-ae5fe7bd357c.webp?1791578439",
          "art": "https://cards.scryfall.io/art/front/8/5/85177bd7-6c50-48da-b692-ae5fe7bd357c.webp?1791578439",
          "crop": "https://cards.scryfall.io/crop/front/8/5/85177bd7-6c50-48da-b692-ae5fe7bd357c.webp?1791578439",
          "jpeg": "https://cards.scryfall.io/normal/front/8/5/85177bd7-6c50-48da-b692-ae5fe7bd357c.jpg?1791578439"
        },
        "mana_cost": "",
        "cmc": 0,
        "type_line": "Basic Land \u2014 Mountain",
        "oracle_text": "({T}: Add {R}.)",
        "colors": [],
        "color_identity": [
          "R"
        ],
        "keywords": [],
        "produced_mana": [
          "R"
        ],
        "legalities": {
          "standard": "legal",
          "future": "legal",
          "historic": "legal",
          "timeless": "legal",
          "gladiator": "legal",
          "pioneer": "legal",
          "modern": "legal",
          "legacy": "legal",
          "pauper": "legal",
          "vintage": "legal",
          "penny": "legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "legal",
          "brawl": "legal",
          "competitivebrawl": "legal",
          "alchemy": "legal",
          "paupercommander": "legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "legal",
          "predh": "legal",
          "tlr": "legal"
        },
        "games": [
          "paper",
          "mtgo",
          "arena"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": true,
        "variation": false,
        "set_id": "1c75c20b-221e-47c5-83be-f3be4c15087d",
        "set": "mdd",
        "set_name": "Marvel: Darkhold Destiny",
        "set_type": "expansion",
        "set_uri": "https://api.scryfall.com/sets/1c75c20b-221e-47c5-83be-f3be4c15087d",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Amdd&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/mdd?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/85177bd7-6c50-48da-b692-ae5fe7bd357c/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3Aa3fb7228-e76b-4e96-a40e-20b5fed75685&unique=prints",
        "collector_number": "298",
        "digital": false,
        "rarity": "common",
        "flavor_text": `"No matter how hard I try, I always seem to return to this wicked world of Limbo. But this time will be different. This time, Belasco's soul will be mine to sunder. Come, my friends, for we have a battle to win."
\u2014Magik, Illyana Rasputin`,
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "VEN",
        "artist_ids": [
          "87ee4a37-16cf-4022-a8b1-1396183f1877"
        ],
        "illustration_id": "a3bc65d4-3879-407f-ad25-fdc15c1a4e3c",
        "border_color": "black",
        "frame": "2015",
        "full_art": false,
        "textless": false,
        "booster": false,
        "story_spotlight": false,
        "preview": {
          "source": "TheGamer",
          "source_uri": "https://www.thegamer.com/mtg-marvel-darkhold-destiny-universes-beyond-reveal/",
          "previewed_at": "2026-10-09"
        },
        "prices": {
          "usd": null,
          "usd_foil": null,
          "usd_etched": null,
          "eur": null,
          "eur_foil": null,
          "tix": null
        },
        "related_uris": {
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DMountain",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DMountain",
          "edhrec": "https://edhrec.com/route/?cc=Mountain"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F723326%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products/Search?referrer=scryfall&searchString=Mountain&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards?affiliate_id=scryfall&data%5Bsearch%5D=Mountain&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "naya (::en)": {
        "object": "card",
        "id": "15611e29-6f96-4c5c-a919-c8fe590581b0",
        "oracle_id": "5ed6be01-af06-4f3d-8b43-ef8993c52c97",
        "multiverse_ids": [
          423636
        ],
        "tcgplayer_id": 125610,
        "cardmarket_id": 294450,
        "name": "Naya",
        "lang": "en",
        "released_at": "2016-11-25",
        "uri": "https://api.scryfall.com/cards/15611e29-6f96-4c5c-a919-c8fe590581b0",
        "scryfall_uri": "https://scryfall.com/card/opca/55/naya?utm_source=api",
        "layout": "planar",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T10:01:26Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/1/5/15611e29-6f96-4c5c-a919-c8fe590581b0.jpg?1783936886",
          "normal": "https://cards.scryfall.io/normal/front/1/5/15611e29-6f96-4c5c-a919-c8fe590581b0.jpg?1783936886",
          "large": "https://cards.scryfall.io/large/front/1/5/15611e29-6f96-4c5c-a919-c8fe590581b0.jpg?1783936886",
          "png": "https://cards.scryfall.io/png/front/1/5/15611e29-6f96-4c5c-a919-c8fe590581b0.png?1783936886",
          "art_crop": "https://cards.scryfall.io/art_crop/front/1/5/15611e29-6f96-4c5c-a919-c8fe590581b0.jpg?1783936886",
          "border_crop": "https://cards.scryfall.io/border_crop/front/1/5/15611e29-6f96-4c5c-a919-c8fe590581b0.jpg?1783936886",
          "thumb": "https://cards.scryfall.io/thumb/front/1/5/15611e29-6f96-4c5c-a919-c8fe590581b0.webp?1783936886",
          "grid": "https://cards.scryfall.io/grid/front/1/5/15611e29-6f96-4c5c-a919-c8fe590581b0.webp?1783936886",
          "display": "https://cards.scryfall.io/display/front/1/5/15611e29-6f96-4c5c-a919-c8fe590581b0.webp?1783936886",
          "art": "https://cards.scryfall.io/art/front/1/5/15611e29-6f96-4c5c-a919-c8fe590581b0.webp?1783936886",
          "crop": "https://cards.scryfall.io/crop/front/1/5/15611e29-6f96-4c5c-a919-c8fe590581b0.webp?1783936886",
          "jpeg": "https://cards.scryfall.io/normal/front/1/5/15611e29-6f96-4c5c-a919-c8fe590581b0.jpg?1783936886"
        },
        "mana_cost": "",
        "cmc": 0,
        "type_line": "Plane \u2014 Alara",
        "oracle_text": "You may play any number of lands on each of your turns.\nWhenever chaos ensues, target red, green, or white creature you control gets +1/+1 until end of turn for each land you control.",
        "colors": [],
        "color_identity": [],
        "keywords": [],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "not_legal",
          "timeless": "not_legal",
          "gladiator": "not_legal",
          "pioneer": "not_legal",
          "modern": "not_legal",
          "legacy": "not_legal",
          "pauper": "not_legal",
          "vintage": "not_legal",
          "penny": "not_legal",
          "commander": "not_legal",
          "oathbreaker": "not_legal",
          "standardbrawl": "not_legal",
          "brawl": "not_legal",
          "competitivebrawl": "not_legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "not_legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "not_legal"
        },
        "games": [
          "paper"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": false,
        "nonfoil": true,
        "finishes": [
          "nonfoil"
        ],
        "oversized": true,
        "promo": false,
        "reprint": true,
        "variation": false,
        "set_id": "ada3345c-d416-49bc-92e0-73363ddee5c8",
        "set": "opca",
        "set_name": "Planechase Anthology Planes",
        "set_type": "planechase",
        "set_uri": "https://api.scryfall.com/sets/ada3345c-d416-49bc-92e0-73363ddee5c8",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Aopca&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/opca?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/15611e29-6f96-4c5c-a919-c8fe590581b0/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A5ed6be01-af06-4f3d-8b43-ef8993c52c97&unique=prints",
        "collector_number": "55",
        "digital": false,
        "rarity": "common",
        "card_back_id": "7840c131-f96b-4700-9347-2215c43156e6",
        "artist": "Zoltan Boros & Gabor Szikszai",
        "artist_ids": [
          "1885e6cb-c827-4896-994e-3d0a027d602f",
          "44c3877f-8771-43dc-9e40-f4c765f59d2e"
        ],
        "illustration_id": "b20bc437-5f07-4cc9-a170-2c9b4752a1ea",
        "border_color": "black",
        "frame": "2015",
        "full_art": false,
        "textless": false,
        "booster": false,
        "story_spotlight": false,
        "prices": {
          "usd": "5.82",
          "usd_foil": null,
          "usd_etched": null,
          "eur": "3.03",
          "eur_foil": null,
          "tix": null
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=423636&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DNaya",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DNaya",
          "edhrec": "https://edhrec.com/route/?cc=Naya"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F125610%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=294450&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards?affiliate_id=scryfall&data%5Bsearch%5D=Naya&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "nearby planet (::en)": {
        "object": "card",
        "id": "da785d1b-6b90-4b65-9efb-d7f329405318",
        "oracle_id": "19d34126-8266-4da1-b7ef-67ecfa2dbbee",
        "multiverse_ids": [
          580824
        ],
        "tcgplayer_id": 286840,
        "cardmarket_id": 676031,
        "name": "Nearby Planet",
        "lang": "en",
        "released_at": "2022-10-07",
        "uri": "https://api.scryfall.com/cards/da785d1b-6b90-4b65-9efb-d7f329405318",
        "scryfall_uri": "https://scryfall.com/card/unf/198/nearby-planet?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T05:28:48Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/d/a/da785d1b-6b90-4b65-9efb-d7f329405318.jpg?1783920528",
          "normal": "https://cards.scryfall.io/normal/front/d/a/da785d1b-6b90-4b65-9efb-d7f329405318.jpg?1783920528",
          "large": "https://cards.scryfall.io/large/front/d/a/da785d1b-6b90-4b65-9efb-d7f329405318.jpg?1783920528",
          "png": "https://cards.scryfall.io/png/front/d/a/da785d1b-6b90-4b65-9efb-d7f329405318.png?1783920528",
          "art_crop": "https://cards.scryfall.io/art_crop/front/d/a/da785d1b-6b90-4b65-9efb-d7f329405318.jpg?1783920528",
          "border_crop": "https://cards.scryfall.io/border_crop/front/d/a/da785d1b-6b90-4b65-9efb-d7f329405318.jpg?1783920528",
          "thumb": "https://cards.scryfall.io/thumb/front/d/a/da785d1b-6b90-4b65-9efb-d7f329405318.webp?1783920528",
          "grid": "https://cards.scryfall.io/grid/front/d/a/da785d1b-6b90-4b65-9efb-d7f329405318.webp?1783920528",
          "display": "https://cards.scryfall.io/display/front/d/a/da785d1b-6b90-4b65-9efb-d7f329405318.webp?1783920528",
          "art": "https://cards.scryfall.io/art/front/d/a/da785d1b-6b90-4b65-9efb-d7f329405318.webp?1783920528",
          "crop": "https://cards.scryfall.io/crop/front/d/a/da785d1b-6b90-4b65-9efb-d7f329405318.webp?1783920528",
          "jpeg": "https://cards.scryfall.io/normal/front/d/a/da785d1b-6b90-4b65-9efb-d7f329405318.jpg?1783920528"
        },
        "mana_cost": "",
        "cmc": 0,
        "type_line": "Land",
        "oracle_text": "Rangeling (This card is every land type, including Plains, Island, Swamp, Mountain, Forest, Desert, Gate, Lair, Locus, and all those Urza's ones.)\nThis land enters tapped.\nWhen this land enters, sacrifice it unless you pay {1}.",
        "colors": [],
        "color_identity": [
          "B",
          "G",
          "R",
          "U",
          "W"
        ],
        "keywords": [],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "not_legal",
          "timeless": "not_legal",
          "gladiator": "not_legal",
          "pioneer": "not_legal",
          "modern": "not_legal",
          "legacy": "not_legal",
          "pauper": "not_legal",
          "vintage": "not_legal",
          "penny": "not_legal",
          "commander": "not_legal",
          "oathbreaker": "not_legal",
          "standardbrawl": "not_legal",
          "brawl": "not_legal",
          "competitivebrawl": "not_legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "not_legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "not_legal"
        },
        "games": [
          "paper"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": false,
        "variation": false,
        "set_id": "b314f553-8f07-4ba9-96c8-16be7784eff3",
        "set": "unf",
        "set_name": "Unfinity",
        "set_type": "funny",
        "set_uri": "https://api.scryfall.com/sets/b314f553-8f07-4ba9-96c8-16be7784eff3",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Aunf&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/unf?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/da785d1b-6b90-4b65-9efb-d7f329405318/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A19d34126-8266-4da1-b7ef-67ecfa2dbbee&unique=prints",
        "collector_number": "198",
        "digital": false,
        "rarity": "common",
        "flavor_text": `"Here's a nice place we haven't hit yet."
\u2014Captain Rex Nebula`,
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Bruce Brenneise",
        "artist_ids": [
          "91d65465-e8a6-4a4e-8b0e-0e07466cfa0f"
        ],
        "illustration_id": "e2457fa9-7068-4679-ab39-cb09922af3cf",
        "border_color": "black",
        "frame": "2015",
        "security_stamp": "acorn",
        "full_art": false,
        "textless": false,
        "booster": true,
        "story_spotlight": false,
        "edhrec_rank": 30166,
        "preview": {
          "source": "Wizards of the Coast",
          "source_uri": "https://www.twitch.tv/videos/1596322656",
          "previewed_at": "2022-09-20"
        },
        "prices": {
          "usd": "0.13",
          "usd_foil": "0.36",
          "usd_etched": null,
          "eur": "0.18",
          "eur_foil": "0.23",
          "tix": null
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=580824&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DNearby%2BPlanet",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DNearby%2BPlanet",
          "edhrec": "https://edhrec.com/route/?cc=Nearby+Planet"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F286840%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=676031&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards?affiliate_id=scryfall&data%5Bsearch%5D=Nearby+Planet&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "obosh the preypiercer (::en)": {
        "object": "card",
        "id": "451507de-9c42-43ee-b9ba-1f69e9aa29d2",
        "oracle_id": "6985c8a9-9299-461b-8bef-bd2b2c739c11",
        "multiverse_ids": [
          479748
        ],
        "mtgo_id": 80465,
        "arena_id": 71295,
        "tcgplayer_id": 212637,
        "cardmarket_id": 453533,
        "name": "Obosh, the Preypiercer",
        "lang": "en",
        "released_at": "2020-04-24",
        "uri": "https://api.scryfall.com/cards/451507de-9c42-43ee-b9ba-1f69e9aa29d2",
        "scryfall_uri": "https://scryfall.com/card/iko/228/obosh-the-preypiercer?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T08:23:29Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/4/5/451507de-9c42-43ee-b9ba-1f69e9aa29d2.jpg?1783931009",
          "normal": "https://cards.scryfall.io/normal/front/4/5/451507de-9c42-43ee-b9ba-1f69e9aa29d2.jpg?1783931009",
          "large": "https://cards.scryfall.io/large/front/4/5/451507de-9c42-43ee-b9ba-1f69e9aa29d2.jpg?1783931009",
          "png": "https://cards.scryfall.io/png/front/4/5/451507de-9c42-43ee-b9ba-1f69e9aa29d2.png?1783931009",
          "art_crop": "https://cards.scryfall.io/art_crop/front/4/5/451507de-9c42-43ee-b9ba-1f69e9aa29d2.jpg?1783931009",
          "border_crop": "https://cards.scryfall.io/border_crop/front/4/5/451507de-9c42-43ee-b9ba-1f69e9aa29d2.jpg?1783931009",
          "thumb": "https://cards.scryfall.io/thumb/front/4/5/451507de-9c42-43ee-b9ba-1f69e9aa29d2.webp?1783931009",
          "grid": "https://cards.scryfall.io/grid/front/4/5/451507de-9c42-43ee-b9ba-1f69e9aa29d2.webp?1783931009",
          "display": "https://cards.scryfall.io/display/front/4/5/451507de-9c42-43ee-b9ba-1f69e9aa29d2.webp?1783931009",
          "art": "https://cards.scryfall.io/art/front/4/5/451507de-9c42-43ee-b9ba-1f69e9aa29d2.webp?1783931009",
          "crop": "https://cards.scryfall.io/crop/front/4/5/451507de-9c42-43ee-b9ba-1f69e9aa29d2.webp?1783931009",
          "jpeg": "https://cards.scryfall.io/normal/front/4/5/451507de-9c42-43ee-b9ba-1f69e9aa29d2.jpg?1783931009"
        },
        "mana_cost": "{3}{B/R}{B/R}",
        "cmc": 5,
        "type_line": "Legendary Creature \u2014 Hellion Horror",
        "oracle_text": "Companion \u2014 Your starting deck contains only cards with odd mana values and land cards. (If this card is your chosen companion, you may put it into your hand from outside the game for {3} as a sorcery.)\nIf a source you control with an odd mana value would deal damage to a permanent or player, it deals double that damage to that permanent or player instead.",
        "power": "3",
        "toughness": "5",
        "colors": [
          "B",
          "R"
        ],
        "color_identity": [
          "B",
          "R"
        ],
        "keywords": [
          "Companion",
          "Double"
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "legal",
          "timeless": "legal",
          "gladiator": "legal",
          "pioneer": "legal",
          "modern": "legal",
          "legacy": "legal",
          "pauper": "not_legal",
          "vintage": "legal",
          "penny": "legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "not_legal",
          "brawl": "legal",
          "competitivebrawl": "legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "not_legal"
        },
        "games": [
          "arena",
          "paper",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": false,
        "variation": false,
        "set_id": "19feda43-15ab-427e-a0e4-148a4bf2b03a",
        "set": "iko",
        "set_name": "Ikoria: Lair of Behemoths",
        "set_type": "expansion",
        "set_uri": "https://api.scryfall.com/sets/19feda43-15ab-427e-a0e4-148a4bf2b03a",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Aiko&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/iko?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/451507de-9c42-43ee-b9ba-1f69e9aa29d2/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A6985c8a9-9299-461b-8bef-bd2b2c739c11&unique=prints",
        "collector_number": "228",
        "digital": false,
        "rarity": "rare",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Daarken",
        "artist_ids": [
          "e607a0d4-fc12-4c01-9e3f-501f5269b9cb"
        ],
        "illustration_id": "c8c91aec-3f6e-4808-a939-1793c7aadcf0",
        "border_color": "black",
        "frame": "2015",
        "frame_effects": [
          "companion",
          "legendary"
        ],
        "security_stamp": "oval",
        "full_art": false,
        "textless": false,
        "booster": true,
        "story_spotlight": false,
        "edhrec_rank": 10397,
        "penny_rank": 7799,
        "preview": {
          "source": "Wizards of the Coast",
          "source_uri": "https://www.youtube.com/watch?v=Uh61r8ccgFU",
          "previewed_at": "2020-04-03"
        },
        "prices": {
          "usd": "0.27",
          "usd_foil": "0.39",
          "usd_etched": null,
          "eur": "0.32",
          "eur_foil": "0.35",
          "tix": "0.02"
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=479748&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DObosh%252C%2Bthe%2BPreypiercer",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DObosh%252C%2Bthe%2BPreypiercer",
          "edhrec": "https://edhrec.com/route/?cc=Obosh%2C+the+Preypiercer"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F212637%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=453533&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/80465?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "plains (::en)": {
        "object": "card",
        "id": "09ac862f-0a51-44dd-b86f-9412b8218b13",
        "oracle_id": "bc71ebf6-2056-41f7-be35-b2e5c34afa99",
        "multiverse_ids": [],
        "tcgplayer_id": 723323,
        "name": "Plains",
        "lang": "en",
        "released_at": "2027-04-09",
        "uri": "https://api.scryfall.com/cards/09ac862f-0a51-44dd-b86f-9412b8218b13",
        "scryfall_uri": "https://scryfall.com/card/mdd/292/plains?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-10-09T20:40:23Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/0/9/09ac862f-0a51-44dd-b86f-9412b8218b13.jpg?1791578423",
          "normal": "https://cards.scryfall.io/normal/front/0/9/09ac862f-0a51-44dd-b86f-9412b8218b13.jpg?1791578423",
          "large": "https://cards.scryfall.io/large/front/0/9/09ac862f-0a51-44dd-b86f-9412b8218b13.jpg?1791578423",
          "png": "https://cards.scryfall.io/png/front/0/9/09ac862f-0a51-44dd-b86f-9412b8218b13.png?1791578423",
          "art_crop": "https://cards.scryfall.io/art_crop/front/0/9/09ac862f-0a51-44dd-b86f-9412b8218b13.jpg?1791578423",
          "border_crop": "https://cards.scryfall.io/border_crop/front/0/9/09ac862f-0a51-44dd-b86f-9412b8218b13.jpg?1791578423",
          "thumb": "https://cards.scryfall.io/thumb/front/0/9/09ac862f-0a51-44dd-b86f-9412b8218b13.webp?1791578423",
          "grid": "https://cards.scryfall.io/grid/front/0/9/09ac862f-0a51-44dd-b86f-9412b8218b13.webp?1791578423",
          "display": "https://cards.scryfall.io/display/front/0/9/09ac862f-0a51-44dd-b86f-9412b8218b13.webp?1791578423",
          "art": "https://cards.scryfall.io/art/front/0/9/09ac862f-0a51-44dd-b86f-9412b8218b13.webp?1791578423",
          "crop": "https://cards.scryfall.io/crop/front/0/9/09ac862f-0a51-44dd-b86f-9412b8218b13.webp?1791578423",
          "jpeg": "https://cards.scryfall.io/normal/front/0/9/09ac862f-0a51-44dd-b86f-9412b8218b13.jpg?1791578423"
        },
        "mana_cost": "",
        "cmc": 0,
        "type_line": "Basic Land \u2014 Plains",
        "oracle_text": "({T}: Add {W}.)",
        "colors": [],
        "color_identity": [
          "W"
        ],
        "keywords": [],
        "produced_mana": [
          "W"
        ],
        "legalities": {
          "standard": "legal",
          "future": "legal",
          "historic": "legal",
          "timeless": "legal",
          "gladiator": "legal",
          "pioneer": "legal",
          "modern": "legal",
          "legacy": "legal",
          "pauper": "legal",
          "vintage": "legal",
          "penny": "legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "legal",
          "brawl": "legal",
          "competitivebrawl": "legal",
          "alchemy": "legal",
          "paupercommander": "legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "legal",
          "predh": "legal",
          "tlr": "legal"
        },
        "games": [
          "paper",
          "mtgo",
          "arena"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": true,
        "variation": false,
        "set_id": "1c75c20b-221e-47c5-83be-f3be4c15087d",
        "set": "mdd",
        "set_name": "Marvel: Darkhold Destiny",
        "set_type": "expansion",
        "set_uri": "https://api.scryfall.com/sets/1c75c20b-221e-47c5-83be-f3be4c15087d",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Amdd&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/mdd?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/09ac862f-0a51-44dd-b86f-9412b8218b13/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3Abc71ebf6-2056-41f7-be35-b2e5c34afa99&unique=prints",
        "collector_number": "292",
        "digital": false,
        "rarity": "common",
        "flavor_text": '"Asgard is my home, my kingdom, and my pride. Its splendor, like the gods, shall be everlasting."\n\u2014Thor',
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Shahab Alizadeh",
        "artist_ids": [
          "0bab3964-6224-4a02-acb3-f46d92dfc45d"
        ],
        "illustration_id": "812f9e2a-007e-4973-bd79-48e3217dc9d9",
        "border_color": "black",
        "frame": "2015",
        "full_art": false,
        "textless": false,
        "booster": false,
        "story_spotlight": false,
        "preview": {
          "source": "TheGamer",
          "source_uri": "https://www.thegamer.com/mtg-marvel-darkhold-destiny-universes-beyond-reveal/",
          "previewed_at": "2026-10-09"
        },
        "prices": {
          "usd": null,
          "usd_foil": null,
          "usd_etched": null,
          "eur": null,
          "eur_foil": null,
          "tix": null
        },
        "related_uris": {
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DPlains",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DPlains",
          "edhrec": "https://edhrec.com/route/?cc=Plains"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F723323%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products/Search?referrer=scryfall&searchString=Plains&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards?affiliate_id=scryfall&data%5Bsearch%5D=Plains&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "planewide disaster (::en)": {
        "object": "card",
        "id": "0518b7a0-3bbb-4802-9faf-3f4256671e9e",
        "oracle_id": "a34b272b-084b-4ff1-8b02-d95116ccfeab",
        "multiverse_ids": [
          615145
        ],
        "mtgo_id": 110622,
        "tcgplayer_id": 491551,
        "cardmarket_id": 705543,
        "name": "Planewide Disaster",
        "lang": "en",
        "released_at": "2023-04-21",
        "uri": "https://api.scryfall.com/cards/0518b7a0-3bbb-4802-9faf-3f4256671e9e",
        "scryfall_uri": "https://scryfall.com/card/moc/154/planewide-disaster?utm_source=api",
        "layout": "planar",
        "highres_image": false,
        "image_status": "lowres",
        "image_updated_at": "2026-07-13T04:33:30Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/0/5/0518b7a0-3bbb-4802-9faf-3f4256671e9e.jpg?1783917210",
          "normal": "https://cards.scryfall.io/normal/front/0/5/0518b7a0-3bbb-4802-9faf-3f4256671e9e.jpg?1783917210",
          "large": "https://cards.scryfall.io/large/front/0/5/0518b7a0-3bbb-4802-9faf-3f4256671e9e.jpg?1783917210",
          "png": "https://cards.scryfall.io/png/front/0/5/0518b7a0-3bbb-4802-9faf-3f4256671e9e.png?1783917210",
          "art_crop": "https://cards.scryfall.io/art_crop/front/0/5/0518b7a0-3bbb-4802-9faf-3f4256671e9e.jpg?1783917210",
          "border_crop": "https://cards.scryfall.io/border_crop/front/0/5/0518b7a0-3bbb-4802-9faf-3f4256671e9e.jpg?1783917210",
          "thumb": "https://cards.scryfall.io/thumb/front/0/5/0518b7a0-3bbb-4802-9faf-3f4256671e9e.webp?1783917210",
          "grid": "https://cards.scryfall.io/grid/front/0/5/0518b7a0-3bbb-4802-9faf-3f4256671e9e.webp?1783917210",
          "display": "https://cards.scryfall.io/display/front/0/5/0518b7a0-3bbb-4802-9faf-3f4256671e9e.webp?1783917210",
          "art": "https://cards.scryfall.io/art/front/0/5/0518b7a0-3bbb-4802-9faf-3f4256671e9e.webp?1783917210",
          "crop": "https://cards.scryfall.io/crop/front/0/5/0518b7a0-3bbb-4802-9faf-3f4256671e9e.webp?1783917210",
          "jpeg": "https://cards.scryfall.io/normal/front/0/5/0518b7a0-3bbb-4802-9faf-3f4256671e9e.jpg?1783917210"
        },
        "mana_cost": "",
        "cmc": 0,
        "type_line": "Phenomenon",
        "oracle_text": "When you encounter Planewide Disaster, destroy all creatures. (Then planeswalk away from this phenomenon.)",
        "colors": [],
        "color_identity": [],
        "keywords": [],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "not_legal",
          "timeless": "not_legal",
          "gladiator": "not_legal",
          "pioneer": "not_legal",
          "modern": "not_legal",
          "legacy": "not_legal",
          "pauper": "not_legal",
          "vintage": "not_legal",
          "penny": "not_legal",
          "commander": "not_legal",
          "oathbreaker": "not_legal",
          "standardbrawl": "not_legal",
          "brawl": "not_legal",
          "competitivebrawl": "not_legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "not_legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "not_legal"
        },
        "games": [
          "paper",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": false,
        "nonfoil": true,
        "finishes": [
          "nonfoil"
        ],
        "oversized": true,
        "promo": false,
        "reprint": true,
        "variation": false,
        "set_id": "6bba5de9-5afb-42af-a7eb-24ac854bf671",
        "set": "moc",
        "set_name": "March of the Machine Commander",
        "set_type": "commander",
        "set_uri": "https://api.scryfall.com/sets/6bba5de9-5afb-42af-a7eb-24ac854bf671",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Amoc&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/moc?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/0518b7a0-3bbb-4802-9faf-3f4256671e9e/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3Aa34b272b-084b-4ff1-8b02-d95116ccfeab&unique=prints",
        "collector_number": "154",
        "digital": false,
        "rarity": "common",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Dave Kendall",
        "artist_ids": [
          "8a5540a8-18c9-4fa9-802c-59d6866114d5"
        ],
        "illustration_id": "7fc2b2af-3ed4-4cc4-958b-61750abced59",
        "border_color": "black",
        "frame": "2015",
        "full_art": false,
        "textless": false,
        "booster": false,
        "story_spotlight": false,
        "prices": {
          "usd": "0.33",
          "usd_foil": null,
          "usd_etched": null,
          "eur": "0.41",
          "eur_foil": null,
          "tix": "0.01"
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=615145&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DPlanewide%2BDisaster",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DPlanewide%2BDisaster",
          "edhrec": "https://edhrec.com/route/?cc=Planewide+Disaster"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F491551%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=705543&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/110622?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "prismatic piper (::en)": {
        "object": "card",
        "id": "c78c2713-39e7-4a6e-a132-027099a89665",
        "oracle_id": "b2aeee90-7b8d-47a6-9167-cc21f7fbfd43",
        "multiverse_ids": [
          629305
        ],
        "mtgo_id": 114631,
        "tcgplayer_id": 503412,
        "cardmarket_id": 721739,
        "name": "The Prismatic Piper",
        "lang": "en",
        "released_at": "2023-08-04",
        "uri": "https://api.scryfall.com/cards/c78c2713-39e7-4a6e-a132-027099a89665",
        "scryfall_uri": "https://scryfall.com/card/cmm/1/the-prismatic-piper?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T04:08:51Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/c/7/c78c2713-39e7-4a6e-a132-027099a89665.jpg?1783915731",
          "normal": "https://cards.scryfall.io/normal/front/c/7/c78c2713-39e7-4a6e-a132-027099a89665.jpg?1783915731",
          "large": "https://cards.scryfall.io/large/front/c/7/c78c2713-39e7-4a6e-a132-027099a89665.jpg?1783915731",
          "png": "https://cards.scryfall.io/png/front/c/7/c78c2713-39e7-4a6e-a132-027099a89665.png?1783915731",
          "art_crop": "https://cards.scryfall.io/art_crop/front/c/7/c78c2713-39e7-4a6e-a132-027099a89665.jpg?1783915731",
          "border_crop": "https://cards.scryfall.io/border_crop/front/c/7/c78c2713-39e7-4a6e-a132-027099a89665.jpg?1783915731",
          "thumb": "https://cards.scryfall.io/thumb/front/c/7/c78c2713-39e7-4a6e-a132-027099a89665.webp?1783915731",
          "grid": "https://cards.scryfall.io/grid/front/c/7/c78c2713-39e7-4a6e-a132-027099a89665.webp?1783915731",
          "display": "https://cards.scryfall.io/display/front/c/7/c78c2713-39e7-4a6e-a132-027099a89665.webp?1783915731",
          "art": "https://cards.scryfall.io/art/front/c/7/c78c2713-39e7-4a6e-a132-027099a89665.webp?1783915731",
          "crop": "https://cards.scryfall.io/crop/front/c/7/c78c2713-39e7-4a6e-a132-027099a89665.webp?1783915731",
          "jpeg": "https://cards.scryfall.io/normal/front/c/7/c78c2713-39e7-4a6e-a132-027099a89665.jpg?1783915731"
        },
        "mana_cost": "{5}",
        "cmc": 5,
        "type_line": "Legendary Creature \u2014 Shapeshifter",
        "oracle_text": "If The Prismatic Piper is your commander, choose a color before the game begins. The Prismatic Piper is the chosen color.\nPartner (You can have two commanders if both have partner.)",
        "power": "3",
        "toughness": "3",
        "colors": [],
        "color_identity": [],
        "keywords": [
          "Partner"
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "not_legal",
          "timeless": "not_legal",
          "gladiator": "not_legal",
          "pioneer": "not_legal",
          "modern": "not_legal",
          "legacy": "legal",
          "pauper": "not_legal",
          "vintage": "legal",
          "penny": "not_legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "not_legal",
          "brawl": "not_legal",
          "competitivebrawl": "not_legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "not_legal"
        },
        "games": [
          "paper",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": false,
        "nonfoil": true,
        "finishes": [
          "nonfoil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": true,
        "variation": false,
        "set_id": "cd05036f-2698-43e6-a48e-5c8d82f0a551",
        "set": "cmm",
        "set_name": "Commander Masters",
        "set_type": "masters",
        "set_uri": "https://api.scryfall.com/sets/cd05036f-2698-43e6-a48e-5c8d82f0a551",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Acmm&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/cmm?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/c78c2713-39e7-4a6e-a132-027099a89665/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3Ab2aeee90-7b8d-47a6-9167-cc21f7fbfd43&unique=prints",
        "collector_number": "1",
        "digital": false,
        "rarity": "special",
        "flavor_text": "It is everything and nothing.",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Seb McKinnon",
        "artist_ids": [
          "ad4caca0-8d89-44ce-a1a6-d5ca905bd6fb"
        ],
        "illustration_id": "2c5e6f58-2fb7-4e04-940c-08443748c060",
        "border_color": "black",
        "frame": "2015",
        "frame_effects": [
          "legendary"
        ],
        "full_art": false,
        "textless": false,
        "booster": true,
        "story_spotlight": false,
        "edhrec_rank": 28443,
        "prices": {
          "usd": "0.20",
          "usd_foil": null,
          "usd_etched": null,
          "eur": "0.04",
          "eur_foil": null,
          "tix": "0.30"
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=629305&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DThe%2BPrismatic%2BPiper",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DThe%2BPrismatic%2BPiper",
          "edhrec": "https://edhrec.com/route/?cc=The+Prismatic+Piper"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F503412%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=721739&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/114631?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "progenitus (::en)": {
        "object": "card",
        "id": "e77fbc87-d78e-4602-baa0-da9b0d464dfb",
        "oracle_id": "2d7e00b6-12f0-4b03-82a6-50e3d1b5395e",
        "multiverse_ids": [
          679986
        ],
        "resource_id": "B01277618E270B6B7C18478E31E310D0C2F14222F07587D5DEC800058A3F7329",
        "mtgo_id": 133514,
        "arena_id": 93957,
        "tcgplayer_id": 589457,
        "cardmarket_id": 795134,
        "name": "Progenitus",
        "lang": "en",
        "released_at": "2024-11-15",
        "uri": "https://api.scryfall.com/cards/e77fbc87-d78e-4602-baa0-da9b0d464dfb",
        "scryfall_uri": "https://scryfall.com/card/fdn/244/progenitus?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T02:17:31Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/e/7/e77fbc87-d78e-4602-baa0-da9b0d464dfb.jpg?1783909051",
          "normal": "https://cards.scryfall.io/normal/front/e/7/e77fbc87-d78e-4602-baa0-da9b0d464dfb.jpg?1783909051",
          "large": "https://cards.scryfall.io/large/front/e/7/e77fbc87-d78e-4602-baa0-da9b0d464dfb.jpg?1783909051",
          "png": "https://cards.scryfall.io/png/front/e/7/e77fbc87-d78e-4602-baa0-da9b0d464dfb.png?1783909051",
          "art_crop": "https://cards.scryfall.io/art_crop/front/e/7/e77fbc87-d78e-4602-baa0-da9b0d464dfb.jpg?1783909051",
          "border_crop": "https://cards.scryfall.io/border_crop/front/e/7/e77fbc87-d78e-4602-baa0-da9b0d464dfb.jpg?1783909051",
          "thumb": "https://cards.scryfall.io/thumb/front/e/7/e77fbc87-d78e-4602-baa0-da9b0d464dfb.webp?1783909051",
          "grid": "https://cards.scryfall.io/grid/front/e/7/e77fbc87-d78e-4602-baa0-da9b0d464dfb.webp?1783909051",
          "display": "https://cards.scryfall.io/display/front/e/7/e77fbc87-d78e-4602-baa0-da9b0d464dfb.webp?1783909051",
          "art": "https://cards.scryfall.io/art/front/e/7/e77fbc87-d78e-4602-baa0-da9b0d464dfb.webp?1783909051",
          "crop": "https://cards.scryfall.io/crop/front/e/7/e77fbc87-d78e-4602-baa0-da9b0d464dfb.webp?1783909051",
          "jpeg": "https://cards.scryfall.io/normal/front/e/7/e77fbc87-d78e-4602-baa0-da9b0d464dfb.jpg?1783909051"
        },
        "mana_cost": "{W}{W}{U}{U}{B}{B}{R}{R}{G}{G}",
        "cmc": 10,
        "type_line": "Legendary Creature \u2014 Hydra Avatar",
        "oracle_text": "Protection from everything\nIf Progenitus would be put into a graveyard from anywhere, reveal Progenitus and shuffle it into its owner's library instead.",
        "power": "10",
        "toughness": "10",
        "colors": [
          "B",
          "G",
          "R",
          "U",
          "W"
        ],
        "color_identity": [
          "B",
          "G",
          "R",
          "U",
          "W"
        ],
        "keywords": [
          "Protection"
        ],
        "legalities": {
          "standard": "legal",
          "future": "legal",
          "historic": "legal",
          "timeless": "legal",
          "gladiator": "legal",
          "pioneer": "legal",
          "modern": "legal",
          "legacy": "legal",
          "pauper": "not_legal",
          "vintage": "legal",
          "penny": "legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "legal",
          "brawl": "legal",
          "competitivebrawl": "legal",
          "alchemy": "legal",
          "paupercommander": "not_legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "legal",
          "tlr": "not_legal"
        },
        "games": [
          "paper",
          "arena",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": true,
        "variation": false,
        "set_id": "a7ecb771-d1b6-4dec-8cf5-8d45179f21e0",
        "set": "fdn",
        "set_name": "Foundations",
        "set_type": "core",
        "set_uri": "https://api.scryfall.com/sets/a7ecb771-d1b6-4dec-8cf5-8d45179f21e0",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Afdn&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/fdn?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/e77fbc87-d78e-4602-baa0-da9b0d464dfb/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A2d7e00b6-12f0-4b03-82a6-50e3d1b5395e&unique=prints",
        "collector_number": "244",
        "digital": false,
        "rarity": "mythic",
        "flavor_text": "The Soul of the World has returned.",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Jaime Jones",
        "artist_ids": [
          "92f6c2c1-fa57-4b52-99c4-0fd866c13dc9"
        ],
        "illustration_id": "1fde14ba-e26e-4619-87c3-a2703e38d475",
        "border_color": "black",
        "frame": "2015",
        "frame_effects": [
          "legendary"
        ],
        "security_stamp": "oval",
        "full_art": false,
        "textless": false,
        "booster": true,
        "story_spotlight": false,
        "edhrec_rank": 6643,
        "penny_rank": 2282,
        "prices": {
          "usd": "0.91",
          "usd_foil": "1.37",
          "usd_etched": null,
          "eur": "0.84",
          "eur_foil": "1.21",
          "tix": "0.02"
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=679986&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DProgenitus",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DProgenitus",
          "edhrec": "https://edhrec.com/route/?cc=Progenitus"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F589457%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=795134&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/133514?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "rampant growth (::en)": {
        "object": "card",
        "id": "b7c47024-5e08-4b17-b41a-7647f8b814b9",
        "oracle_id": "8539f295-5d58-4436-a73a-b9277c4c7795",
        "multiverse_ids": [
          696421
        ],
        "mtgo_id": 138467,
        "tcgplayer_id": 624461,
        "cardmarket_id": 818845,
        "name": "Rampant Growth",
        "lang": "en",
        "released_at": "2025-04-11",
        "uri": "https://api.scryfall.com/cards/b7c47024-5e08-4b17-b41a-7647f8b814b9",
        "scryfall_uri": "https://scryfall.com/card/tdc/265/rampant-growth?utm_source=api",
        "layout": "normal",
        "highres_image": false,
        "image_status": "lowres",
        "image_updated_at": "2026-07-13T01:44:02Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/b/7/b7c47024-5e08-4b17-b41a-7647f8b814b9.jpg?1783907042",
          "normal": "https://cards.scryfall.io/normal/front/b/7/b7c47024-5e08-4b17-b41a-7647f8b814b9.jpg?1783907042",
          "large": "https://cards.scryfall.io/large/front/b/7/b7c47024-5e08-4b17-b41a-7647f8b814b9.jpg?1783907042",
          "png": "https://cards.scryfall.io/png/front/b/7/b7c47024-5e08-4b17-b41a-7647f8b814b9.png?1783907042",
          "art_crop": "https://cards.scryfall.io/art_crop/front/b/7/b7c47024-5e08-4b17-b41a-7647f8b814b9.jpg?1783907042",
          "border_crop": "https://cards.scryfall.io/border_crop/front/b/7/b7c47024-5e08-4b17-b41a-7647f8b814b9.jpg?1783907042",
          "thumb": "https://cards.scryfall.io/thumb/front/b/7/b7c47024-5e08-4b17-b41a-7647f8b814b9.webp?1783907042",
          "grid": "https://cards.scryfall.io/grid/front/b/7/b7c47024-5e08-4b17-b41a-7647f8b814b9.webp?1783907042",
          "display": "https://cards.scryfall.io/display/front/b/7/b7c47024-5e08-4b17-b41a-7647f8b814b9.webp?1783907042",
          "art": "https://cards.scryfall.io/art/front/b/7/b7c47024-5e08-4b17-b41a-7647f8b814b9.webp?1783907042",
          "crop": "https://cards.scryfall.io/crop/front/b/7/b7c47024-5e08-4b17-b41a-7647f8b814b9.webp?1783907042",
          "jpeg": "https://cards.scryfall.io/normal/front/b/7/b7c47024-5e08-4b17-b41a-7647f8b814b9.jpg?1783907042"
        },
        "mana_cost": "{1}{G}",
        "cmc": 2,
        "type_line": "Sorcery",
        "oracle_text": "Search your library for a basic land card, put that card onto the battlefield tapped, then shuffle.",
        "colors": [
          "G"
        ],
        "color_identity": [
          "G"
        ],
        "keywords": [],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "legal",
          "timeless": "legal",
          "gladiator": "legal",
          "pioneer": "not_legal",
          "modern": "legal",
          "legacy": "legal",
          "pauper": "legal",
          "vintage": "legal",
          "penny": "not_legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "not_legal",
          "brawl": "legal",
          "competitivebrawl": "legal",
          "alchemy": "not_legal",
          "paupercommander": "legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "legal",
          "predh": "legal",
          "tlr": "legal"
        },
        "games": [
          "paper",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": false,
        "nonfoil": true,
        "finishes": [
          "nonfoil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": true,
        "variation": false,
        "set_id": "bca9779c-0a0b-4ac1-8794-f3fc25549cf4",
        "set": "tdc",
        "set_name": "Tarkir: Dragonstorm Commander",
        "set_type": "commander",
        "set_uri": "https://api.scryfall.com/sets/bca9779c-0a0b-4ac1-8794-f3fc25549cf4",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Atdc&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/tdc?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/b7c47024-5e08-4b17-b41a-7647f8b814b9/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A8539f295-5d58-4436-a73a-b9277c4c7795&unique=prints",
        "collector_number": "265",
        "digital": false,
        "rarity": "common",
        "flavor_text": "Nature grows solutions to its problems.",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Steven Belledin",
        "artist_ids": [
          "f07d73b9-52a0-4fe5-858b-61f7b42174a5"
        ],
        "illustration_id": "6069651f-1834-4396-8740-37e7b4a57176",
        "border_color": "black",
        "frame": "2015",
        "full_art": false,
        "textless": false,
        "booster": false,
        "story_spotlight": false,
        "edhrec_rank": 27,
        "penny_rank": 685,
        "prices": {
          "usd": "1.25",
          "usd_foil": null,
          "usd_etched": null,
          "eur": "0.51",
          "eur_foil": null,
          "tix": "0.28"
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=696421&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DRampant%2BGrowth",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DRampant%2BGrowth",
          "edhrec": "https://edhrec.com/route/?cc=Rampant+Growth"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F624461%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=818845&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/138467?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "realmwalker (::en)": {
        "object": "card",
        "id": "52733829-27b7-40ec-a897-cabab35b3729",
        "oracle_id": "b81eaa2f-0554-41c6-bdf6-d1cb73b8f56f",
        "multiverse_ids": [],
        "resource_id": "E8DEF752CAA13CFBDBE3C42872BFAB8FB5267DD4D1D8873CB4BA5973C0F2C4F9",
        "mtgo_id": 146163,
        "tcgplayer_id": 671236,
        "cardmarket_id": 865046,
        "name": "Realmwalker",
        "lang": "en",
        "released_at": "2026-01-23",
        "uri": "https://api.scryfall.com/cards/52733829-27b7-40ec-a897-cabab35b3729",
        "scryfall_uri": "https://scryfall.com/card/ecc/114/realmwalker?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T01:02:21Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/5/2/52733829-27b7-40ec-a897-cabab35b3729.jpg?1783904541",
          "normal": "https://cards.scryfall.io/normal/front/5/2/52733829-27b7-40ec-a897-cabab35b3729.jpg?1783904541",
          "large": "https://cards.scryfall.io/large/front/5/2/52733829-27b7-40ec-a897-cabab35b3729.jpg?1783904541",
          "png": "https://cards.scryfall.io/png/front/5/2/52733829-27b7-40ec-a897-cabab35b3729.png?1783904541",
          "art_crop": "https://cards.scryfall.io/art_crop/front/5/2/52733829-27b7-40ec-a897-cabab35b3729.jpg?1783904541",
          "border_crop": "https://cards.scryfall.io/border_crop/front/5/2/52733829-27b7-40ec-a897-cabab35b3729.jpg?1783904541",
          "thumb": "https://cards.scryfall.io/thumb/front/5/2/52733829-27b7-40ec-a897-cabab35b3729.webp?1783904541",
          "grid": "https://cards.scryfall.io/grid/front/5/2/52733829-27b7-40ec-a897-cabab35b3729.webp?1783904541",
          "display": "https://cards.scryfall.io/display/front/5/2/52733829-27b7-40ec-a897-cabab35b3729.webp?1783904541",
          "art": "https://cards.scryfall.io/art/front/5/2/52733829-27b7-40ec-a897-cabab35b3729.webp?1783904541",
          "crop": "https://cards.scryfall.io/crop/front/5/2/52733829-27b7-40ec-a897-cabab35b3729.webp?1783904541",
          "jpeg": "https://cards.scryfall.io/normal/front/5/2/52733829-27b7-40ec-a897-cabab35b3729.jpg?1783904541"
        },
        "mana_cost": "{2}{G}",
        "cmc": 3,
        "type_line": "Creature \u2014 Shapeshifter",
        "oracle_text": "Changeling (This card is every creature type.)\nAs this creature enters, choose a creature type.\nYou may look at the top card of your library any time.\nYou may cast creature spells of the chosen type from the top of your library.",
        "power": "2",
        "toughness": "3",
        "colors": [
          "G"
        ],
        "color_identity": [
          "G"
        ],
        "keywords": [
          "Changeling"
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "legal",
          "timeless": "legal",
          "gladiator": "legal",
          "pioneer": "legal",
          "modern": "legal",
          "legacy": "legal",
          "pauper": "not_legal",
          "vintage": "legal",
          "penny": "legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "not_legal",
          "brawl": "legal",
          "competitivebrawl": "legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "legal"
        },
        "games": [
          "paper",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": false,
        "nonfoil": true,
        "finishes": [
          "nonfoil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": true,
        "variation": false,
        "set_id": "805b5a0c-f8bb-4555-86ea-eb9ec36a011a",
        "set": "ecc",
        "set_name": "Lorwyn Eclipsed Commander",
        "set_type": "commander",
        "set_uri": "https://api.scryfall.com/sets/805b5a0c-f8bb-4555-86ea-eb9ec36a011a",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Aecc&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/ecc?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/52733829-27b7-40ec-a897-cabab35b3729/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3Ab81eaa2f-0554-41c6-bdf6-d1cb73b8f56f&unique=prints",
        "collector_number": "114",
        "digital": false,
        "rarity": "rare",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Zack Stella",
        "artist_ids": [
          "17bc7f55-958b-43f4-bb40-09746d05b3f9"
        ],
        "illustration_id": "3c3713dd-e54c-463a-86cc-10241bb1c7ba",
        "border_color": "black",
        "frame": "2015",
        "security_stamp": "oval",
        "full_art": false,
        "textless": false,
        "booster": false,
        "story_spotlight": false,
        "edhrec_rank": 612,
        "penny_rank": 5626,
        "prices": {
          "usd": "2.64",
          "usd_foil": null,
          "usd_etched": null,
          "eur": "1.73",
          "eur_foil": null,
          "tix": "0.21"
        },
        "related_uris": {
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DRealmwalker",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DRealmwalker",
          "edhrec": "https://edhrec.com/route/?cc=Realmwalker"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F671236%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=865046&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/146163?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "reflections of littjara (::en)": {
        "object": "card",
        "id": "578a1846-8c1a-4013-b669-1d3f4ddbbaa3",
        "oracle_id": "c3fdfb94-2d10-4743-864c-a59fdd57d8b7",
        "multiverse_ids": [
          696320
        ],
        "mtgo_id": 138265,
        "tcgplayer_id": 624921,
        "cardmarket_id": 819290,
        "name": "Reflections of Littjara",
        "lang": "en",
        "released_at": "2025-04-11",
        "uri": "https://api.scryfall.com/cards/578a1846-8c1a-4013-b669-1d3f4ddbbaa3",
        "scryfall_uri": "https://scryfall.com/card/tdc/164/reflections-of-littjara?utm_source=api",
        "layout": "normal",
        "highres_image": false,
        "image_status": "lowres",
        "image_updated_at": "2026-07-13T01:44:58Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/5/7/578a1846-8c1a-4013-b669-1d3f4ddbbaa3.jpg?1783907098",
          "normal": "https://cards.scryfall.io/normal/front/5/7/578a1846-8c1a-4013-b669-1d3f4ddbbaa3.jpg?1783907098",
          "large": "https://cards.scryfall.io/large/front/5/7/578a1846-8c1a-4013-b669-1d3f4ddbbaa3.jpg?1783907098",
          "png": "https://cards.scryfall.io/png/front/5/7/578a1846-8c1a-4013-b669-1d3f4ddbbaa3.png?1783907098",
          "art_crop": "https://cards.scryfall.io/art_crop/front/5/7/578a1846-8c1a-4013-b669-1d3f4ddbbaa3.jpg?1783907098",
          "border_crop": "https://cards.scryfall.io/border_crop/front/5/7/578a1846-8c1a-4013-b669-1d3f4ddbbaa3.jpg?1783907098",
          "thumb": "https://cards.scryfall.io/thumb/front/5/7/578a1846-8c1a-4013-b669-1d3f4ddbbaa3.webp?1783907098",
          "grid": "https://cards.scryfall.io/grid/front/5/7/578a1846-8c1a-4013-b669-1d3f4ddbbaa3.webp?1783907098",
          "display": "https://cards.scryfall.io/display/front/5/7/578a1846-8c1a-4013-b669-1d3f4ddbbaa3.webp?1783907098",
          "art": "https://cards.scryfall.io/art/front/5/7/578a1846-8c1a-4013-b669-1d3f4ddbbaa3.webp?1783907098",
          "crop": "https://cards.scryfall.io/crop/front/5/7/578a1846-8c1a-4013-b669-1d3f4ddbbaa3.webp?1783907098",
          "jpeg": "https://cards.scryfall.io/normal/front/5/7/578a1846-8c1a-4013-b669-1d3f4ddbbaa3.jpg?1783907098"
        },
        "mana_cost": "{4}{U}",
        "cmc": 5,
        "type_line": "Enchantment",
        "oracle_text": "As this enchantment enters, choose a creature type.\nWhenever you cast a spell of the chosen type, copy that spell. (A copy of a permanent spell becomes a token.)",
        "colors": [
          "U"
        ],
        "color_identity": [
          "U"
        ],
        "keywords": [],
        "all_parts": [
          {
            "object": "related_card",
            "id": "45364163-62b7-4641-b2c9-c2e46d61335c",
            "component": "token",
            "name": "Copy",
            "type_line": "Token",
            "uri": "https://api.scryfall.com/cards/45364163-62b7-4641-b2c9-c2e46d61335c"
          },
          {
            "object": "related_card",
            "id": "578a1846-8c1a-4013-b669-1d3f4ddbbaa3",
            "component": "combo_piece",
            "name": "Reflections of Littjara",
            "type_line": "Enchantment",
            "uri": "https://api.scryfall.com/cards/578a1846-8c1a-4013-b669-1d3f4ddbbaa3"
          }
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "legal",
          "timeless": "legal",
          "gladiator": "legal",
          "pioneer": "legal",
          "modern": "legal",
          "legacy": "legal",
          "pauper": "not_legal",
          "vintage": "legal",
          "penny": "legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "not_legal",
          "brawl": "legal",
          "competitivebrawl": "legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "not_legal"
        },
        "games": [
          "paper",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": false,
        "nonfoil": true,
        "finishes": [
          "nonfoil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": true,
        "variation": false,
        "set_id": "bca9779c-0a0b-4ac1-8794-f3fc25549cf4",
        "set": "tdc",
        "set_name": "Tarkir: Dragonstorm Commander",
        "set_type": "commander",
        "set_uri": "https://api.scryfall.com/sets/bca9779c-0a0b-4ac1-8794-f3fc25549cf4",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Atdc&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/tdc?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/578a1846-8c1a-4013-b669-1d3f4ddbbaa3/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3Ac3fdfb94-2d10-4743-864c-a59fdd57d8b7&unique=prints",
        "collector_number": "164",
        "digital": false,
        "rarity": "rare",
        "flavor_text": "The masks float downstream toward the Mirrorlake, where faces arise to wear them.",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Aaron Miller",
        "artist_ids": [
          "fc021f3d-773a-4706-bbe7-f602324f511f"
        ],
        "illustration_id": "fc9e3dfb-df6d-4fad-8f30-e84f34693856",
        "border_color": "black",
        "frame": "2015",
        "frame_effects": [
          "enchantment"
        ],
        "security_stamp": "oval",
        "full_art": false,
        "textless": false,
        "booster": false,
        "story_spotlight": false,
        "edhrec_rank": 694,
        "penny_rank": 10755,
        "prices": {
          "usd": "2.80",
          "usd_foil": null,
          "usd_etched": null,
          "eur": "1.57",
          "eur_foil": null,
          "tix": "0.12"
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=696320&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DReflections%2Bof%2BLittjara",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DReflections%2Bof%2BLittjara",
          "edhrec": "https://edhrec.com/route/?cc=Reflections+of+Littjara"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F624921%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=819290&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/138265?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "rhystic study (::en)": {
        "object": "card",
        "id": "9f37c5b6-a59c-45cd-9a99-e9357fe9ea1b",
        "oracle_id": "53236dd7-845a-444c-96d5-f41ed7325d8f",
        "multiverse_ids": [
          597496
        ],
        "mtgo_id": 137818,
        "tcgplayer_id": 454994,
        "cardmarket_id": 686810,
        "name": "Rhystic Study",
        "lang": "en",
        "released_at": "2022-12-02",
        "uri": "https://api.scryfall.com/cards/9f37c5b6-a59c-45cd-9a99-e9357fe9ea1b",
        "scryfall_uri": "https://scryfall.com/card/j22/114/rhystic-study?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T05:05:46Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/9/f/9f37c5b6-a59c-45cd-9a99-e9357fe9ea1b.jpg?1783919146",
          "normal": "https://cards.scryfall.io/normal/front/9/f/9f37c5b6-a59c-45cd-9a99-e9357fe9ea1b.jpg?1783919146",
          "large": "https://cards.scryfall.io/large/front/9/f/9f37c5b6-a59c-45cd-9a99-e9357fe9ea1b.jpg?1783919146",
          "png": "https://cards.scryfall.io/png/front/9/f/9f37c5b6-a59c-45cd-9a99-e9357fe9ea1b.png?1783919146",
          "art_crop": "https://cards.scryfall.io/art_crop/front/9/f/9f37c5b6-a59c-45cd-9a99-e9357fe9ea1b.jpg?1783919146",
          "border_crop": "https://cards.scryfall.io/border_crop/front/9/f/9f37c5b6-a59c-45cd-9a99-e9357fe9ea1b.jpg?1783919146",
          "thumb": "https://cards.scryfall.io/thumb/front/9/f/9f37c5b6-a59c-45cd-9a99-e9357fe9ea1b.webp?1783919146",
          "grid": "https://cards.scryfall.io/grid/front/9/f/9f37c5b6-a59c-45cd-9a99-e9357fe9ea1b.webp?1783919146",
          "display": "https://cards.scryfall.io/display/front/9/f/9f37c5b6-a59c-45cd-9a99-e9357fe9ea1b.webp?1783919146",
          "art": "https://cards.scryfall.io/art/front/9/f/9f37c5b6-a59c-45cd-9a99-e9357fe9ea1b.webp?1783919146",
          "crop": "https://cards.scryfall.io/crop/front/9/f/9f37c5b6-a59c-45cd-9a99-e9357fe9ea1b.webp?1783919146",
          "jpeg": "https://cards.scryfall.io/normal/front/9/f/9f37c5b6-a59c-45cd-9a99-e9357fe9ea1b.jpg?1783919146"
        },
        "mana_cost": "{2}{U}",
        "cmc": 3,
        "type_line": "Enchantment",
        "oracle_text": "Whenever an opponent casts a spell, you may draw a card unless that player pays {1}.",
        "colors": [
          "U"
        ],
        "color_identity": [
          "U"
        ],
        "keywords": [],
        "all_parts": [
          {
            "object": "related_card",
            "id": "9f37c5b6-a59c-45cd-9a99-e9357fe9ea1b",
            "component": "combo_piece",
            "name": "Rhystic Study",
            "type_line": "Enchantment",
            "uri": "https://api.scryfall.com/cards/9f37c5b6-a59c-45cd-9a99-e9357fe9ea1b"
          },
          {
            "object": "related_card",
            "id": "76fca761-fc3a-41a1-a5f9-c2a35f3eacf1",
            "component": "combo_piece",
            "name": "Archival Whorl",
            "type_line": "Sorcery",
            "uri": "https://api.scryfall.com/cards/76fca761-fc3a-41a1-a5f9-c2a35f3eacf1"
          }
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "legal",
          "timeless": "legal",
          "gladiator": "legal",
          "pioneer": "not_legal",
          "modern": "not_legal",
          "legacy": "legal",
          "pauper": "legal",
          "vintage": "legal",
          "penny": "not_legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "not_legal",
          "brawl": "legal",
          "competitivebrawl": "legal",
          "alchemy": "not_legal",
          "paupercommander": "banned",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "legal",
          "predh": "legal",
          "tlr": "legal"
        },
        "games": [
          "paper",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": true,
        "foil": false,
        "nonfoil": true,
        "finishes": [
          "nonfoil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": true,
        "variation": false,
        "set_id": "247df475-e4ce-4e5e-9317-11892d2211e0",
        "set": "j22",
        "set_name": "Jumpstart 2022",
        "set_type": "draft_innovation",
        "set_uri": "https://api.scryfall.com/sets/247df475-e4ce-4e5e-9317-11892d2211e0",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Aj22&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/j22?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/9f37c5b6-a59c-45cd-9a99-e9357fe9ea1b/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A53236dd7-845a-444c-96d5-f41ed7325d8f&unique=prints",
        "collector_number": "114",
        "digital": false,
        "rarity": "rare",
        "flavor_text": `"I'll teach you the leyline paratrigonometrics, no problem. But you need to show me how to make that fiery swirly thing."
\u2014Zimone, to Rootha`,
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Tatiana Kirgetova",
        "artist_ids": [
          "e06c9ef7-2d68-4329-8949-009106ca5990"
        ],
        "illustration_id": "b89cdb0a-f1ab-49ef-923e-1c9c3c68555f",
        "border_color": "black",
        "frame": "2015",
        "security_stamp": "oval",
        "full_art": false,
        "textless": false,
        "booster": true,
        "story_spotlight": false,
        "edhrec_rank": 46,
        "prices": {
          "usd": "67.29",
          "usd_foil": null,
          "usd_etched": null,
          "eur": "42.61",
          "eur_foil": null,
          "tix": "0.04"
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=597496&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DRhystic%2BStudy",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DRhystic%2BStudy",
          "edhrec": "https://edhrec.com/route/?cc=Rhystic+Study"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F454994%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=686810&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/137818?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "rhythm of the wild (::en)": {
        "object": "card",
        "id": "c2a6453e-a373-44ec-807a-15c0c8b1af57",
        "oracle_id": "acfa77fd-3610-4f12-9c3c-bd860ce91700",
        "multiverse_ids": [
          643224
        ],
        "mtgo_id": 120961,
        "tcgplayer_id": 530865,
        "cardmarket_id": 748570,
        "name": "Rhythm of the Wild",
        "lang": "en",
        "released_at": "2024-01-12",
        "uri": "https://api.scryfall.com/cards/c2a6453e-a373-44ec-807a-15c0c8b1af57",
        "scryfall_uri": "https://scryfall.com/card/rvr/217/rhythm-of-the-wild?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T03:27:57Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/c/2/c2a6453e-a373-44ec-807a-15c0c8b1af57.jpg?1783913277",
          "normal": "https://cards.scryfall.io/normal/front/c/2/c2a6453e-a373-44ec-807a-15c0c8b1af57.jpg?1783913277",
          "large": "https://cards.scryfall.io/large/front/c/2/c2a6453e-a373-44ec-807a-15c0c8b1af57.jpg?1783913277",
          "png": "https://cards.scryfall.io/png/front/c/2/c2a6453e-a373-44ec-807a-15c0c8b1af57.png?1783913277",
          "art_crop": "https://cards.scryfall.io/art_crop/front/c/2/c2a6453e-a373-44ec-807a-15c0c8b1af57.jpg?1783913277",
          "border_crop": "https://cards.scryfall.io/border_crop/front/c/2/c2a6453e-a373-44ec-807a-15c0c8b1af57.jpg?1783913277",
          "thumb": "https://cards.scryfall.io/thumb/front/c/2/c2a6453e-a373-44ec-807a-15c0c8b1af57.webp?1783913277",
          "grid": "https://cards.scryfall.io/grid/front/c/2/c2a6453e-a373-44ec-807a-15c0c8b1af57.webp?1783913277",
          "display": "https://cards.scryfall.io/display/front/c/2/c2a6453e-a373-44ec-807a-15c0c8b1af57.webp?1783913277",
          "art": "https://cards.scryfall.io/art/front/c/2/c2a6453e-a373-44ec-807a-15c0c8b1af57.webp?1783913277",
          "crop": "https://cards.scryfall.io/crop/front/c/2/c2a6453e-a373-44ec-807a-15c0c8b1af57.webp?1783913277",
          "jpeg": "https://cards.scryfall.io/normal/front/c/2/c2a6453e-a373-44ec-807a-15c0c8b1af57.jpg?1783913277"
        },
        "mana_cost": "{1}{R}{G}",
        "cmc": 3,
        "type_line": "Enchantment",
        "oracle_text": "Creature spells you control can't be countered.\nNontoken creatures you control have riot. (They enter with your choice of a +1/+1 counter or haste.)",
        "colors": [
          "G",
          "R"
        ],
        "color_identity": [
          "G",
          "R"
        ],
        "keywords": [],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "legal",
          "timeless": "legal",
          "gladiator": "legal",
          "pioneer": "legal",
          "modern": "legal",
          "legacy": "legal",
          "pauper": "not_legal",
          "vintage": "legal",
          "penny": "not_legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "not_legal",
          "brawl": "legal",
          "competitivebrawl": "legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "legal"
        },
        "games": [
          "paper",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": true,
        "variation": false,
        "set_id": "fed2c8cd-ab92-44f6-808a-41e7809bcfe2",
        "set": "rvr",
        "set_name": "Ravnica Remastered",
        "set_type": "masters",
        "set_uri": "https://api.scryfall.com/sets/fed2c8cd-ab92-44f6-808a-41e7809bcfe2",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Arvr&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/rvr?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/c2a6453e-a373-44ec-807a-15c0c8b1af57/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3Aacfa77fd-3610-4f12-9c3c-bd860ce91700&unique=prints",
        "collector_number": "217",
        "digital": false,
        "rarity": "uncommon",
        "watermark": "gruul",
        "flavor_text": "Some view Domri's unlikely ascent as a sign of Ilharg the Raze-Boar's imminent return.",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Maxime Minard",
        "artist_ids": [
          "a9065769-afcd-4e54-a3c0-5809e7b4108b"
        ],
        "illustration_id": "4fd63d51-61f0-4e5d-99e1-5af29316efb9",
        "border_color": "black",
        "frame": "2015",
        "full_art": false,
        "textless": false,
        "booster": true,
        "story_spotlight": false,
        "edhrec_rank": 223,
        "penny_rank": 2482,
        "prices": {
          "usd": "4.77",
          "usd_foil": "5.61",
          "usd_etched": null,
          "eur": "3.61",
          "eur_foil": "3.98",
          "tix": "0.04"
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=643224&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DRhythm%2Bof%2Bthe%2BWild",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DRhythm%2Bof%2Bthe%2BWild",
          "edhrec": "https://edhrec.com/route/?cc=Rhythm+of+the+Wild"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F530865%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=748570&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/120961?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "rory williams (::en)": {
        "object": "card",
        "id": "f51a010d-641c-413f-8f91-0c8ff3b2085c",
        "oracle_id": "16a44586-ea1d-45f1-b9de-da1c11f729df",
        "multiverse_ids": [
          634848
        ],
        "tcgplayer_id": 519268,
        "cardmarket_id": 739663,
        "name": "Rory Williams",
        "lang": "en",
        "released_at": "2023-10-13",
        "uri": "https://api.scryfall.com/cards/f51a010d-641c-413f-8f91-0c8ff3b2085c",
        "scryfall_uri": "https://scryfall.com/card/who/153/rory-williams?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T03:50:24Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/f/5/f51a010d-641c-413f-8f91-0c8ff3b2085c.jpg?1783914624",
          "normal": "https://cards.scryfall.io/normal/front/f/5/f51a010d-641c-413f-8f91-0c8ff3b2085c.jpg?1783914624",
          "large": "https://cards.scryfall.io/large/front/f/5/f51a010d-641c-413f-8f91-0c8ff3b2085c.jpg?1783914624",
          "png": "https://cards.scryfall.io/png/front/f/5/f51a010d-641c-413f-8f91-0c8ff3b2085c.png?1783914624",
          "art_crop": "https://cards.scryfall.io/art_crop/front/f/5/f51a010d-641c-413f-8f91-0c8ff3b2085c.jpg?1783914624",
          "border_crop": "https://cards.scryfall.io/border_crop/front/f/5/f51a010d-641c-413f-8f91-0c8ff3b2085c.jpg?1783914624",
          "thumb": "https://cards.scryfall.io/thumb/front/f/5/f51a010d-641c-413f-8f91-0c8ff3b2085c.webp?1783914624",
          "grid": "https://cards.scryfall.io/grid/front/f/5/f51a010d-641c-413f-8f91-0c8ff3b2085c.webp?1783914624",
          "display": "https://cards.scryfall.io/display/front/f/5/f51a010d-641c-413f-8f91-0c8ff3b2085c.webp?1783914624",
          "art": "https://cards.scryfall.io/art/front/f/5/f51a010d-641c-413f-8f91-0c8ff3b2085c.webp?1783914624",
          "crop": "https://cards.scryfall.io/crop/front/f/5/f51a010d-641c-413f-8f91-0c8ff3b2085c.webp?1783914624",
          "jpeg": "https://cards.scryfall.io/normal/front/f/5/f51a010d-641c-413f-8f91-0c8ff3b2085c.jpg?1783914624"
        },
        "mana_cost": "{W}{U}",
        "cmc": 2,
        "type_line": "Legendary Creature \u2014 Human Soldier",
        "oracle_text": `Partner with Amy Pond
First strike, lifelink
The Last Centurion \u2014 When you cast this spell from anywhere other than exile, exile it with three time counters on it. It gains suspend. Then investigate. (Create a Clue token. It's an artifact with "{2}, Sacrifice this token: Draw a card.")`,
        "power": "3",
        "toughness": "3",
        "colors": [
          "U",
          "W"
        ],
        "color_identity": [
          "U",
          "W"
        ],
        "keywords": [
          "Lifelink",
          "Investigate",
          "The Last Centurion",
          "Partner with",
          "First strike",
          "Partner"
        ],
        "all_parts": [
          {
            "object": "related_card",
            "id": "48dc2162-3350-4fd4-995a-b2080f8fb94e",
            "component": "combo_piece",
            "name": "Rory Williams",
            "type_line": "Legendary Creature \u2014 Human Soldier",
            "uri": "https://api.scryfall.com/cards/48dc2162-3350-4fd4-995a-b2080f8fb94e"
          },
          {
            "object": "related_card",
            "id": "1145be5c-62f5-43ef-8dea-3a1e85ad9b72",
            "component": "token",
            "name": "Clue",
            "type_line": "Token Artifact \u2014 Clue",
            "uri": "https://api.scryfall.com/cards/1145be5c-62f5-43ef-8dea-3a1e85ad9b72"
          },
          {
            "object": "related_card",
            "id": "dafb9f82-bccd-4444-8439-b6c872a17589",
            "component": "combo_piece",
            "name": "Amy Pond",
            "type_line": "Legendary Creature \u2014 Human",
            "uri": "https://api.scryfall.com/cards/dafb9f82-bccd-4444-8439-b6c872a17589"
          }
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "not_legal",
          "timeless": "not_legal",
          "gladiator": "not_legal",
          "pioneer": "not_legal",
          "modern": "not_legal",
          "legacy": "legal",
          "pauper": "not_legal",
          "vintage": "legal",
          "penny": "not_legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "not_legal",
          "brawl": "not_legal",
          "competitivebrawl": "not_legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "legal"
        },
        "games": [
          "paper"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": false,
        "variation": false,
        "set_id": "efdfdd99-cee7-4c11-a5e9-03d60f88bdd6",
        "set": "who",
        "set_name": "Doctor Who",
        "set_type": "commander",
        "set_uri": "https://api.scryfall.com/sets/efdfdd99-cee7-4c11-a5e9-03d60f88bdd6",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Awho&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/who?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/f51a010d-641c-413f-8f91-0c8ff3b2085c/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A16a44586-ea1d-45f1-b9de-da1c11f729df&unique=prints",
        "collector_number": "153",
        "digital": false,
        "rarity": "rare",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Axel Sauerwald",
        "artist_ids": [
          "ce5cbff7-7a24-4125-b485-f835185a9fec"
        ],
        "illustration_id": "d62602c6-25fb-4a78-8f61-54f91b3594e0",
        "border_color": "black",
        "frame": "2015",
        "frame_effects": [
          "legendary"
        ],
        "security_stamp": "triangle",
        "full_art": false,
        "textless": false,
        "booster": false,
        "story_spotlight": false,
        "promo_types": [
          "universesbeyond"
        ],
        "edhrec_rank": 14935,
        "prices": {
          "usd": "0.29",
          "usd_foil": "0.33",
          "usd_etched": null,
          "eur": "0.26",
          "eur_foil": "0.59",
          "tix": null
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=634848&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DRory%2BWilliams",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DRory%2BWilliams",
          "edhrec": "https://edhrec.com/route/?cc=Rory+Williams"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F519268%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=739663&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards?affiliate_id=scryfall&data%5Bsearch%5D=Rory+Williams&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "seluma light of aysen (::en)": {
        "object": "card",
        "id": "1eb501cc-0f83-40ca-8987-424bbee5f584",
        "oracle_id": "dbbf6379-01b4-400d-a277-5887e6be1d0f",
        "multiverse_ids": [],
        "tcgplayer_id": 709754,
        "name": "Seluma, Light of Aysen",
        "lang": "en",
        "released_at": "2026-10-19",
        "uri": "https://api.scryfall.com/cards/1eb501cc-0f83-40ca-8987-424bbee5f584",
        "scryfall_uri": "https://scryfall.com/card/mbc/4/seluma-light-of-aysen?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-08-18T15:06:32Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/1/e/1eb501cc-0f83-40ca-8987-424bbee5f584.jpg?1787065592",
          "normal": "https://cards.scryfall.io/normal/front/1/e/1eb501cc-0f83-40ca-8987-424bbee5f584.jpg?1787065592",
          "large": "https://cards.scryfall.io/large/front/1/e/1eb501cc-0f83-40ca-8987-424bbee5f584.jpg?1787065592",
          "png": "https://cards.scryfall.io/png/front/1/e/1eb501cc-0f83-40ca-8987-424bbee5f584.png?1787065592",
          "art_crop": "https://cards.scryfall.io/art_crop/front/1/e/1eb501cc-0f83-40ca-8987-424bbee5f584.jpg?1787065592",
          "border_crop": "https://cards.scryfall.io/border_crop/front/1/e/1eb501cc-0f83-40ca-8987-424bbee5f584.jpg?1787065592",
          "thumb": "https://cards.scryfall.io/thumb/front/1/e/1eb501cc-0f83-40ca-8987-424bbee5f584.webp?1787065592",
          "grid": "https://cards.scryfall.io/grid/front/1/e/1eb501cc-0f83-40ca-8987-424bbee5f584.webp?1787065592",
          "display": "https://cards.scryfall.io/display/front/1/e/1eb501cc-0f83-40ca-8987-424bbee5f584.webp?1787065592",
          "art": "https://cards.scryfall.io/art/front/1/e/1eb501cc-0f83-40ca-8987-424bbee5f584.webp?1787065592",
          "crop": "https://cards.scryfall.io/crop/front/1/e/1eb501cc-0f83-40ca-8987-424bbee5f584.webp?1787065592",
          "jpeg": "https://cards.scryfall.io/normal/front/1/e/1eb501cc-0f83-40ca-8987-424bbee5f584.jpg?1787065592"
        },
        "mana_cost": "{4}{W}",
        "cmc": 5,
        "type_line": "Legendary Creature \u2014 Angel Warrior",
        "oracle_text": "Rulebreaker \u2014 A deck with this commander can have Angel cards of any color identity and any basic land cards.\nFlying\nWhenever Seluma deals combat damage to a player, return target Angel creature card from your graveyard to the battlefield.",
        "power": "4",
        "toughness": "4",
        "colors": [
          "W"
        ],
        "color_identity": [
          "W"
        ],
        "keywords": [
          "Flying",
          "Rulebreaker"
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "not_legal",
          "timeless": "not_legal",
          "gladiator": "not_legal",
          "pioneer": "not_legal",
          "modern": "not_legal",
          "legacy": "not_legal",
          "pauper": "not_legal",
          "vintage": "not_legal",
          "penny": "not_legal",
          "commander": "not_legal",
          "oathbreaker": "not_legal",
          "standardbrawl": "not_legal",
          "brawl": "not_legal",
          "competitivebrawl": "not_legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "not_legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "not_legal"
        },
        "games": [
          "paper"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": false,
        "variation": false,
        "set_id": "a4135564-9f37-4aaf-963a-90666f843e0d",
        "set": "mbc",
        "set_name": "Mystery Booster Commander Edition",
        "set_type": "draft_innovation",
        "set_uri": "https://api.scryfall.com/sets/a4135564-9f37-4aaf-963a-90666f843e0d",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Ambc&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/mbc?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/1eb501cc-0f83-40ca-8987-424bbee5f584/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3Adbbf6379-01b4-400d-a277-5887e6be1d0f&unique=prints",
        "collector_number": "4",
        "digital": false,
        "rarity": "rare",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Greg Staples",
        "artist_ids": [
          "93d65564-bf00-447b-8406-e2031f03b6b1"
        ],
        "illustration_id": "be47a347-73eb-4533-8877-dbaf08f64e90",
        "border_color": "black",
        "frame": "2015",
        "frame_effects": [
          "legendary"
        ],
        "security_stamp": "oval",
        "full_art": false,
        "textless": false,
        "booster": false,
        "story_spotlight": false,
        "edhrec_rank": 21871,
        "prices": {
          "usd": null,
          "usd_foil": null,
          "usd_etched": null,
          "eur": null,
          "eur_foil": null,
          "tix": null
        },
        "related_uris": {
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DSeluma%252C%2BLight%2Bof%2BAysen",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DSeluma%252C%2BLight%2Bof%2BAysen",
          "edhrec": "https://edhrec.com/route/?cc=Seluma%2C+Light+of+Aysen"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F709754%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products/Search?referrer=scryfall&searchString=Seluma%2C+Light+of+Aysen&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards?affiliate_id=scryfall&data%5Bsearch%5D=Seluma%2C+Light+of+Aysen&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "sol ring (::en)": {
        "object": "card",
        "id": "8ee443cc-e17a-493b-9c93-1f9e141a30e4",
        "oracle_id": "6ad8011d-3471-4369-9d68-b264cc027487",
        "multiverse_ids": [],
        "resource_id": "B12151C9CD0511F86702A215428AAE1A3170DF60AA4DE769D4FA59EDC207CA20",
        "mtgo_id": 156438,
        "tcgplayer_id": 717788,
        "cardmarket_id": 909814,
        "name": "Sol Ring",
        "lang": "en",
        "released_at": "2026-10-02",
        "uri": "https://api.scryfall.com/cards/8ee443cc-e17a-493b-9c93-1f9e141a30e4",
        "scryfall_uri": "https://scryfall.com/card/frc/21/sol-ring?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-09-17T11:27:26Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/8/e/8ee443cc-e17a-493b-9c93-1f9e141a30e4.jpg?1789644446",
          "normal": "https://cards.scryfall.io/normal/front/8/e/8ee443cc-e17a-493b-9c93-1f9e141a30e4.jpg?1789644446",
          "large": "https://cards.scryfall.io/large/front/8/e/8ee443cc-e17a-493b-9c93-1f9e141a30e4.jpg?1789644446",
          "png": "https://cards.scryfall.io/png/front/8/e/8ee443cc-e17a-493b-9c93-1f9e141a30e4.png?1789644446",
          "art_crop": "https://cards.scryfall.io/art_crop/front/8/e/8ee443cc-e17a-493b-9c93-1f9e141a30e4.jpg?1789644446",
          "border_crop": "https://cards.scryfall.io/border_crop/front/8/e/8ee443cc-e17a-493b-9c93-1f9e141a30e4.jpg?1789644446",
          "thumb": "https://cards.scryfall.io/thumb/front/8/e/8ee443cc-e17a-493b-9c93-1f9e141a30e4.webp?1789644446",
          "grid": "https://cards.scryfall.io/grid/front/8/e/8ee443cc-e17a-493b-9c93-1f9e141a30e4.webp?1789644446",
          "display": "https://cards.scryfall.io/display/front/8/e/8ee443cc-e17a-493b-9c93-1f9e141a30e4.webp?1789644446",
          "art": "https://cards.scryfall.io/art/front/8/e/8ee443cc-e17a-493b-9c93-1f9e141a30e4.webp?1789644446",
          "crop": "https://cards.scryfall.io/crop/front/8/e/8ee443cc-e17a-493b-9c93-1f9e141a30e4.webp?1789644446",
          "jpeg": "https://cards.scryfall.io/normal/front/8/e/8ee443cc-e17a-493b-9c93-1f9e141a30e4.jpg?1789644446"
        },
        "mana_cost": "{1}",
        "cmc": 1,
        "type_line": "Artifact",
        "oracle_text": "{T}: Add {C}{C}.",
        "colors": [],
        "color_identity": [],
        "keywords": [],
        "produced_mana": [
          "C"
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "not_legal",
          "timeless": "not_legal",
          "gladiator": "not_legal",
          "pioneer": "not_legal",
          "modern": "not_legal",
          "legacy": "banned",
          "pauper": "not_legal",
          "vintage": "restricted",
          "penny": "not_legal",
          "commander": "legal",
          "oathbreaker": "banned",
          "standardbrawl": "not_legal",
          "brawl": "not_legal",
          "competitivebrawl": "not_legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "banned",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "legal",
          "tlr": "banned"
        },
        "games": [
          "paper",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": false,
        "nonfoil": true,
        "finishes": [
          "nonfoil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": true,
        "variation": false,
        "set_id": "cfd10490-7397-4143-bda7-d388b877636f",
        "set": "frc",
        "set_name": "Reality Fracture Commander",
        "set_type": "commander",
        "set_uri": "https://api.scryfall.com/sets/cfd10490-7397-4143-bda7-d388b877636f",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Afrc&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/frc?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/8ee443cc-e17a-493b-9c93-1f9e141a30e4/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A6ad8011d-3471-4369-9d68-b264cc027487&unique=prints",
        "collector_number": "21",
        "digital": false,
        "rarity": "uncommon",
        "flavor_text": "Jace could see the sunlight in his Multiverse, but somewhere along the way, he lost the feel of its warmth.",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Titus Lunter",
        "artist_ids": [
          "b11e6b3a-f4ca-4cf1-8fd7-475696de5f5c"
        ],
        "illustration_id": "f142ba5f-999f-42f6-b56e-26164a3b6b87",
        "border_color": "black",
        "frame": "2015",
        "full_art": false,
        "textless": false,
        "booster": false,
        "story_spotlight": false,
        "edhrec_rank": 1,
        "preview": {
          "source": "Wizards of the Coast",
          "source_uri": "https://youtu.be/mvTyHbTbfBo",
          "previewed_at": "2026-09-16"
        },
        "prices": {
          "usd": "2.17",
          "usd_foil": null,
          "usd_etched": null,
          "eur": "1.12",
          "eur_foil": null,
          "tix": "0.02"
        },
        "related_uris": {
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DSol%2BRing",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DSol%2BRing",
          "edhrec": "https://edhrec.com/route/?cc=Sol+Ring"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F717788%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=909814&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/156438?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "solemn simulacrum (::en)": {
        "object": "card",
        "id": "daafd816-f7c1-4630-9e5c-a1e5db570a35",
        "oracle_id": "00c0543c-2a1f-4425-8283-4062d74a1637",
        "multiverse_ids": [],
        "resource_id": "90A644E2DF7EB7F16EB89124CC0253DDDE9A4F8D08A451BC8732A33BC55F87F0",
        "mtgo_id": 150899,
        "tcgplayer_id": 698217,
        "cardmarket_id": 892724,
        "name": "Solemn Simulacrum",
        "lang": "en",
        "released_at": "2026-06-26",
        "uri": "https://api.scryfall.com/cards/daafd816-f7c1-4630-9e5c-a1e5db570a35",
        "scryfall_uri": "https://scryfall.com/card/msc/215/solemn-simulacrum?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T00:40:12Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/d/a/daafd816-f7c1-4630-9e5c-a1e5db570a35.jpg?1783903212",
          "normal": "https://cards.scryfall.io/normal/front/d/a/daafd816-f7c1-4630-9e5c-a1e5db570a35.jpg?1783903212",
          "large": "https://cards.scryfall.io/large/front/d/a/daafd816-f7c1-4630-9e5c-a1e5db570a35.jpg?1783903212",
          "png": "https://cards.scryfall.io/png/front/d/a/daafd816-f7c1-4630-9e5c-a1e5db570a35.png?1783903212",
          "art_crop": "https://cards.scryfall.io/art_crop/front/d/a/daafd816-f7c1-4630-9e5c-a1e5db570a35.jpg?1783903212",
          "border_crop": "https://cards.scryfall.io/border_crop/front/d/a/daafd816-f7c1-4630-9e5c-a1e5db570a35.jpg?1783903212",
          "thumb": "https://cards.scryfall.io/thumb/front/d/a/daafd816-f7c1-4630-9e5c-a1e5db570a35.webp?1783903212",
          "grid": "https://cards.scryfall.io/grid/front/d/a/daafd816-f7c1-4630-9e5c-a1e5db570a35.webp?1783903212",
          "display": "https://cards.scryfall.io/display/front/d/a/daafd816-f7c1-4630-9e5c-a1e5db570a35.webp?1783903212",
          "art": "https://cards.scryfall.io/art/front/d/a/daafd816-f7c1-4630-9e5c-a1e5db570a35.webp?1783903212",
          "crop": "https://cards.scryfall.io/crop/front/d/a/daafd816-f7c1-4630-9e5c-a1e5db570a35.webp?1783903212",
          "jpeg": "https://cards.scryfall.io/normal/front/d/a/daafd816-f7c1-4630-9e5c-a1e5db570a35.jpg?1783903212"
        },
        "mana_cost": "{4}",
        "cmc": 4,
        "type_line": "Artifact Creature \u2014 Golem",
        "oracle_text": "When this creature enters, you may search your library for a basic land card, put that card onto the battlefield tapped, then shuffle.\nWhen this creature dies, you may draw a card.",
        "power": "2",
        "toughness": "2",
        "colors": [],
        "color_identity": [],
        "keywords": [],
        "legalities": {
          "standard": "legal",
          "future": "legal",
          "historic": "legal",
          "timeless": "legal",
          "gladiator": "legal",
          "pioneer": "legal",
          "modern": "legal",
          "legacy": "legal",
          "pauper": "not_legal",
          "vintage": "legal",
          "penny": "legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "legal",
          "brawl": "legal",
          "competitivebrawl": "legal",
          "alchemy": "legal",
          "paupercommander": "not_legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "legal",
          "tlr": "not_legal"
        },
        "games": [
          "paper",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": true,
        "variation": false,
        "set_id": "9d739461-c5ac-43a1-af41-3d5a585b5c8d",
        "set": "msc",
        "set_name": "Marvel Super Heroes Commander",
        "set_type": "commander",
        "set_uri": "https://api.scryfall.com/sets/9d739461-c5ac-43a1-af41-3d5a585b5c8d",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Amsc&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/msc?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/daafd816-f7c1-4630-9e5c-a1e5db570a35/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A00c0543c-2a1f-4425-8283-4062d74a1637&unique=prints",
        "collector_number": "215",
        "digital": false,
        "rarity": "rare",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Flavio Greco Paglia",
        "artist_ids": [
          "9c5d82ee-a27b-47e4-8226-cd8647cc0b05"
        ],
        "illustration_id": "73964dc6-12ad-49e9-b947-7eb8f2e37c3b",
        "border_color": "black",
        "frame": "2015",
        "security_stamp": "oval",
        "full_art": false,
        "textless": false,
        "booster": false,
        "story_spotlight": false,
        "promo_types": [
          "surgefoil",
          "universesbeyond"
        ],
        "edhrec_rank": 41,
        "penny_rank": 1073,
        "prices": {
          "usd": "0.30",
          "usd_foil": null,
          "usd_etched": null,
          "eur": "0.29",
          "eur_foil": null,
          "tix": "0.14"
        },
        "related_uris": {
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DSolemn%2BSimulacrum",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DSolemn%2BSimulacrum",
          "edhrec": "https://edhrec.com/route/?cc=Solemn+Simulacrum"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F698217%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=892724&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/150899?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "spark double (::en)": {
        "object": "card",
        "id": "c41b9ba2-0006-4d8e-b600-efe81ff5e0cc",
        "oracle_id": "8dcb35e5-ae44-455f-86e3-4a77d496ff34",
        "multiverse_ids": [
          643069
        ],
        "mtgo_id": 120651,
        "tcgplayer_id": 530868,
        "cardmarket_id": 748410,
        "name": "Spark Double",
        "lang": "en",
        "released_at": "2024-01-12",
        "uri": "https://api.scryfall.com/cards/c41b9ba2-0006-4d8e-b600-efe81ff5e0cc",
        "scryfall_uri": "https://scryfall.com/card/rvr/62/spark-double?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T03:28:50Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/c/4/c41b9ba2-0006-4d8e-b600-efe81ff5e0cc.jpg?1783913330",
          "normal": "https://cards.scryfall.io/normal/front/c/4/c41b9ba2-0006-4d8e-b600-efe81ff5e0cc.jpg?1783913330",
          "large": "https://cards.scryfall.io/large/front/c/4/c41b9ba2-0006-4d8e-b600-efe81ff5e0cc.jpg?1783913330",
          "png": "https://cards.scryfall.io/png/front/c/4/c41b9ba2-0006-4d8e-b600-efe81ff5e0cc.png?1783913330",
          "art_crop": "https://cards.scryfall.io/art_crop/front/c/4/c41b9ba2-0006-4d8e-b600-efe81ff5e0cc.jpg?1783913330",
          "border_crop": "https://cards.scryfall.io/border_crop/front/c/4/c41b9ba2-0006-4d8e-b600-efe81ff5e0cc.jpg?1783913330",
          "thumb": "https://cards.scryfall.io/thumb/front/c/4/c41b9ba2-0006-4d8e-b600-efe81ff5e0cc.webp?1783913330",
          "grid": "https://cards.scryfall.io/grid/front/c/4/c41b9ba2-0006-4d8e-b600-efe81ff5e0cc.webp?1783913330",
          "display": "https://cards.scryfall.io/display/front/c/4/c41b9ba2-0006-4d8e-b600-efe81ff5e0cc.webp?1783913330",
          "art": "https://cards.scryfall.io/art/front/c/4/c41b9ba2-0006-4d8e-b600-efe81ff5e0cc.webp?1783913330",
          "crop": "https://cards.scryfall.io/crop/front/c/4/c41b9ba2-0006-4d8e-b600-efe81ff5e0cc.webp?1783913330",
          "jpeg": "https://cards.scryfall.io/normal/front/c/4/c41b9ba2-0006-4d8e-b600-efe81ff5e0cc.jpg?1783913330"
        },
        "mana_cost": "{3}{U}",
        "cmc": 4,
        "type_line": "Creature \u2014 Illusion",
        "oracle_text": "You may have this creature enter as a copy of a creature or planeswalker you control, except it enters with an additional +1/+1 counter on it if it's a creature, it enters with an additional loyalty counter on it if it's a planeswalker, and it isn't legendary.",
        "power": "0",
        "toughness": "0",
        "colors": [
          "U"
        ],
        "color_identity": [
          "U"
        ],
        "keywords": [],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "legal",
          "timeless": "legal",
          "gladiator": "legal",
          "pioneer": "legal",
          "modern": "legal",
          "legacy": "legal",
          "pauper": "not_legal",
          "vintage": "legal",
          "penny": "legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "not_legal",
          "brawl": "legal",
          "competitivebrawl": "legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "not_legal"
        },
        "games": [
          "paper",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": true,
        "variation": false,
        "set_id": "fed2c8cd-ab92-44f6-808a-41e7809bcfe2",
        "set": "rvr",
        "set_name": "Ravnica Remastered",
        "set_type": "masters",
        "set_uri": "https://api.scryfall.com/sets/fed2c8cd-ab92-44f6-808a-41e7809bcfe2",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Arvr&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/rvr?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/c41b9ba2-0006-4d8e-b600-efe81ff5e0cc/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A8dcb35e5-ae44-455f-86e3-4a77d496ff34&unique=prints",
        "collector_number": "62",
        "digital": false,
        "rarity": "rare",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Eric Deschamps",
        "artist_ids": [
          "37970e22-9cee-44c1-af44-5ee27cf26b76"
        ],
        "illustration_id": "fb4655d4-2c17-41a5-85db-de240ad91c1e",
        "border_color": "black",
        "frame": "2015",
        "security_stamp": "oval",
        "full_art": false,
        "textless": false,
        "booster": true,
        "story_spotlight": false,
        "edhrec_rank": 375,
        "penny_rank": 4413,
        "prices": {
          "usd": "11.27",
          "usd_foil": "12.18",
          "usd_etched": null,
          "eur": "9.20",
          "eur_foil": "8.93",
          "tix": "0.23"
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=643069&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DSpark%2BDouble",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DSpark%2BDouble",
          "edhrec": "https://edhrec.com/route/?cc=Spark+Double"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F530868%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=748410&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/120651?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "swamp (::en)": {
        "object": "card",
        "id": "b233b117-9369-45c1-80c5-cc857386b6be",
        "oracle_id": "56719f6a-1a6c-4c0a-8d21-18f7d7350b68",
        "multiverse_ids": [],
        "tcgplayer_id": 723325,
        "name": "Swamp",
        "lang": "en",
        "released_at": "2027-04-09",
        "uri": "https://api.scryfall.com/cards/b233b117-9369-45c1-80c5-cc857386b6be",
        "scryfall_uri": "https://scryfall.com/card/mdd/296/swamp?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-10-09T20:40:37Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/b/2/b233b117-9369-45c1-80c5-cc857386b6be.jpg?1791578437",
          "normal": "https://cards.scryfall.io/normal/front/b/2/b233b117-9369-45c1-80c5-cc857386b6be.jpg?1791578437",
          "large": "https://cards.scryfall.io/large/front/b/2/b233b117-9369-45c1-80c5-cc857386b6be.jpg?1791578437",
          "png": "https://cards.scryfall.io/png/front/b/2/b233b117-9369-45c1-80c5-cc857386b6be.png?1791578437",
          "art_crop": "https://cards.scryfall.io/art_crop/front/b/2/b233b117-9369-45c1-80c5-cc857386b6be.jpg?1791578437",
          "border_crop": "https://cards.scryfall.io/border_crop/front/b/2/b233b117-9369-45c1-80c5-cc857386b6be.jpg?1791578437",
          "thumb": "https://cards.scryfall.io/thumb/front/b/2/b233b117-9369-45c1-80c5-cc857386b6be.webp?1791578437",
          "grid": "https://cards.scryfall.io/grid/front/b/2/b233b117-9369-45c1-80c5-cc857386b6be.webp?1791578437",
          "display": "https://cards.scryfall.io/display/front/b/2/b233b117-9369-45c1-80c5-cc857386b6be.webp?1791578437",
          "art": "https://cards.scryfall.io/art/front/b/2/b233b117-9369-45c1-80c5-cc857386b6be.webp?1791578437",
          "crop": "https://cards.scryfall.io/crop/front/b/2/b233b117-9369-45c1-80c5-cc857386b6be.webp?1791578437",
          "jpeg": "https://cards.scryfall.io/normal/front/b/2/b233b117-9369-45c1-80c5-cc857386b6be.jpg?1791578437"
        },
        "mana_cost": "",
        "cmc": 0,
        "type_line": "Basic Land \u2014 Swamp",
        "oracle_text": "({T}: Add {B}.)",
        "colors": [],
        "color_identity": [
          "B"
        ],
        "keywords": [],
        "produced_mana": [
          "B"
        ],
        "legalities": {
          "standard": "legal",
          "future": "legal",
          "historic": "legal",
          "timeless": "legal",
          "gladiator": "legal",
          "pioneer": "legal",
          "modern": "legal",
          "legacy": "legal",
          "pauper": "legal",
          "vintage": "legal",
          "penny": "legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "legal",
          "brawl": "legal",
          "competitivebrawl": "legal",
          "alchemy": "legal",
          "paupercommander": "legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "legal",
          "predh": "legal",
          "tlr": "legal"
        },
        "games": [
          "paper",
          "mtgo",
          "arena"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": true,
        "variation": false,
        "set_id": "1c75c20b-221e-47c5-83be-f3be4c15087d",
        "set": "mdd",
        "set_name": "Marvel: Darkhold Destiny",
        "set_type": "expansion",
        "set_uri": "https://api.scryfall.com/sets/1c75c20b-221e-47c5-83be-f3be4c15087d",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Amdd&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/mdd?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/b233b117-9369-45c1-80c5-cc857386b6be/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A56719f6a-1a6c-4c0a-8d21-18f7d7350b68&unique=prints",
        "collector_number": "296",
        "digital": false,
        "rarity": "common",
        "flavor_text": '"Svartalfheim is the realm of the Dark Elves, so keep your wits about you, heroes. They battle with foul magic and poisoned blades, and they care not if they win. They care only that we lose."\n\u2014Sif',
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Maojin Lee",
        "artist_ids": [
          "aa40e688-7c3b-4242-b2d3-4bc7b722fbb5"
        ],
        "illustration_id": "03bb3921-9cb4-4a4d-a43d-203f80349168",
        "border_color": "black",
        "frame": "2015",
        "full_art": false,
        "textless": false,
        "booster": false,
        "story_spotlight": false,
        "preview": {
          "source": "TheGamer",
          "source_uri": "https://www.thegamer.com/mtg-marvel-darkhold-destiny-universes-beyond-reveal/",
          "previewed_at": "2026-10-09"
        },
        "prices": {
          "usd": null,
          "usd_foil": null,
          "usd_etched": null,
          "eur": null,
          "eur_foil": null,
          "tix": null
        },
        "related_uris": {
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DSwamp",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DSwamp",
          "edhrec": "https://edhrec.com/route/?cc=Swamp"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F723325%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products/Search?referrer=scryfall&searchString=Swamp&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards?affiliate_id=scryfall&data%5Bsearch%5D=Swamp&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "the eleventh doctor (::en)": {
        "object": "card",
        "id": "590849a7-9abc-4757-8e13-f680d3b1dceb",
        "oracle_id": "721e8249-ff1b-4c15-964b-4ba2a96beb75",
        "multiverse_ids": [
          634820
        ],
        "tcgplayer_id": 518906,
        "cardmarket_id": 738720,
        "name": "The Eleventh Doctor",
        "lang": "en",
        "released_at": "2023-10-13",
        "uri": "https://api.scryfall.com/cards/590849a7-9abc-4757-8e13-f680d3b1dceb",
        "scryfall_uri": "https://scryfall.com/card/who/125/the-eleventh-doctor?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T03:50:35Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/5/9/590849a7-9abc-4757-8e13-f680d3b1dceb.jpg?1783914635",
          "normal": "https://cards.scryfall.io/normal/front/5/9/590849a7-9abc-4757-8e13-f680d3b1dceb.jpg?1783914635",
          "large": "https://cards.scryfall.io/large/front/5/9/590849a7-9abc-4757-8e13-f680d3b1dceb.jpg?1783914635",
          "png": "https://cards.scryfall.io/png/front/5/9/590849a7-9abc-4757-8e13-f680d3b1dceb.png?1783914635",
          "art_crop": "https://cards.scryfall.io/art_crop/front/5/9/590849a7-9abc-4757-8e13-f680d3b1dceb.jpg?1783914635",
          "border_crop": "https://cards.scryfall.io/border_crop/front/5/9/590849a7-9abc-4757-8e13-f680d3b1dceb.jpg?1783914635",
          "thumb": "https://cards.scryfall.io/thumb/front/5/9/590849a7-9abc-4757-8e13-f680d3b1dceb.webp?1783914635",
          "grid": "https://cards.scryfall.io/grid/front/5/9/590849a7-9abc-4757-8e13-f680d3b1dceb.webp?1783914635",
          "display": "https://cards.scryfall.io/display/front/5/9/590849a7-9abc-4757-8e13-f680d3b1dceb.webp?1783914635",
          "art": "https://cards.scryfall.io/art/front/5/9/590849a7-9abc-4757-8e13-f680d3b1dceb.webp?1783914635",
          "crop": "https://cards.scryfall.io/crop/front/5/9/590849a7-9abc-4757-8e13-f680d3b1dceb.webp?1783914635",
          "jpeg": "https://cards.scryfall.io/normal/front/5/9/590849a7-9abc-4757-8e13-f680d3b1dceb.jpg?1783914635"
        },
        "mana_cost": "{1}{W}{U}",
        "cmc": 3,
        "type_line": "Legendary Creature \u2014 Time Lord Doctor",
        "oracle_text": "I. AM. TALKING! \u2014 Whenever The Eleventh Doctor deals combat damage to a player, you may exile a card from your hand with a number of time counters on it equal to its mana value. If it doesn't have suspend, it gains suspend.\n{2}: Target creature with power 3 or less can't be blocked this turn.",
        "power": "3",
        "toughness": "2",
        "colors": [
          "U",
          "W"
        ],
        "color_identity": [
          "U",
          "W"
        ],
        "keywords": [
          "I. AM. TALKING!"
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "not_legal",
          "timeless": "not_legal",
          "gladiator": "not_legal",
          "pioneer": "not_legal",
          "modern": "not_legal",
          "legacy": "legal",
          "pauper": "not_legal",
          "vintage": "legal",
          "penny": "not_legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "not_legal",
          "brawl": "not_legal",
          "competitivebrawl": "not_legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "legal"
        },
        "games": [
          "paper"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": false,
        "variation": false,
        "set_id": "efdfdd99-cee7-4c11-a5e9-03d60f88bdd6",
        "set": "who",
        "set_name": "Doctor Who",
        "set_type": "commander",
        "set_uri": "https://api.scryfall.com/sets/efdfdd99-cee7-4c11-a5e9-03d60f88bdd6",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Awho&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/who?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/590849a7-9abc-4757-8e13-f680d3b1dceb/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A721e8249-ff1b-4c15-964b-4ba2a96beb75&unique=prints",
        "collector_number": "125",
        "digital": false,
        "rarity": "rare",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Justyna Dura",
        "artist_ids": [
          "d2340aef-8ca9-4e0d-864c-6a4e8d5e350a"
        ],
        "illustration_id": "f3bbb62e-8af5-4a62-8b7e-0dac4e9c9d63",
        "border_color": "black",
        "frame": "2015",
        "frame_effects": [
          "legendary"
        ],
        "security_stamp": "triangle",
        "full_art": false,
        "textless": false,
        "booster": false,
        "story_spotlight": false,
        "promo_types": [
          "universesbeyond"
        ],
        "edhrec_rank": 9823,
        "preview": {
          "source": "Wizards of the Coast",
          "source_uri": "",
          "previewed_at": "2023-10-03"
        },
        "prices": {
          "usd": "0.36",
          "usd_foil": "0.41",
          "usd_etched": null,
          "eur": "0.27",
          "eur_foil": "0.36",
          "tix": null
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=634820&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DThe%2BEleventh%2BDoctor",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DThe%2BEleventh%2BDoctor",
          "edhrec": "https://edhrec.com/route/?cc=The+Eleventh+Doctor"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F518906%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=738720&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards?affiliate_id=scryfall&data%5Bsearch%5D=The+Eleventh+Doctor&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "the everforger (::en)": {
        "object": "card",
        "id": "1d1a4c67-630c-42de-b37c-1188451d4b20",
        "oracle_id": "b8354ac6-5285-43dd-9ba5-93064def2e96",
        "multiverse_ids": [],
        "tcgplayer_id": 709820,
        "name": "The Everforger",
        "lang": "en",
        "released_at": "2026-10-19",
        "uri": "https://api.scryfall.com/cards/1d1a4c67-630c-42de-b37c-1188451d4b20",
        "scryfall_uri": "https://scryfall.com/card/mbc/59/the-everforger?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-08-18T15:05:45Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/1/d/1d1a4c67-630c-42de-b37c-1188451d4b20.jpg?1787065545",
          "normal": "https://cards.scryfall.io/normal/front/1/d/1d1a4c67-630c-42de-b37c-1188451d4b20.jpg?1787065545",
          "large": "https://cards.scryfall.io/large/front/1/d/1d1a4c67-630c-42de-b37c-1188451d4b20.jpg?1787065545",
          "png": "https://cards.scryfall.io/png/front/1/d/1d1a4c67-630c-42de-b37c-1188451d4b20.png?1787065545",
          "art_crop": "https://cards.scryfall.io/art_crop/front/1/d/1d1a4c67-630c-42de-b37c-1188451d4b20.jpg?1787065545",
          "border_crop": "https://cards.scryfall.io/border_crop/front/1/d/1d1a4c67-630c-42de-b37c-1188451d4b20.jpg?1787065545",
          "thumb": "https://cards.scryfall.io/thumb/front/1/d/1d1a4c67-630c-42de-b37c-1188451d4b20.webp?1787065545",
          "grid": "https://cards.scryfall.io/grid/front/1/d/1d1a4c67-630c-42de-b37c-1188451d4b20.webp?1787065545",
          "display": "https://cards.scryfall.io/display/front/1/d/1d1a4c67-630c-42de-b37c-1188451d4b20.webp?1787065545",
          "art": "https://cards.scryfall.io/art/front/1/d/1d1a4c67-630c-42de-b37c-1188451d4b20.webp?1787065545",
          "crop": "https://cards.scryfall.io/crop/front/1/d/1d1a4c67-630c-42de-b37c-1188451d4b20.webp?1787065545",
          "jpeg": "https://cards.scryfall.io/normal/front/1/d/1d1a4c67-630c-42de-b37c-1188451d4b20.jpg?1787065545"
        },
        "mana_cost": "{6}",
        "cmc": 6,
        "type_line": "Legendary Artifact Creature \u2014 Construct",
        "oracle_text": "Rulebreaker \u2014 A deck with this commander can have artifact creature and Equipment cards of any color identity and any basic land cards.\nWhenever you cast an artifact creature or Equipment spell, you may copy that spell. Do this only once each turn. (The copy becomes a token.)",
        "power": "4",
        "toughness": "5",
        "colors": [],
        "color_identity": [],
        "keywords": [
          "Rulebreaker"
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "not_legal",
          "timeless": "not_legal",
          "gladiator": "not_legal",
          "pioneer": "not_legal",
          "modern": "not_legal",
          "legacy": "not_legal",
          "pauper": "not_legal",
          "vintage": "not_legal",
          "penny": "not_legal",
          "commander": "not_legal",
          "oathbreaker": "not_legal",
          "standardbrawl": "not_legal",
          "brawl": "not_legal",
          "competitivebrawl": "not_legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "not_legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "not_legal"
        },
        "games": [
          "paper"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": false,
        "variation": false,
        "set_id": "a4135564-9f37-4aaf-963a-90666f843e0d",
        "set": "mbc",
        "set_name": "Mystery Booster Commander Edition",
        "set_type": "draft_innovation",
        "set_uri": "https://api.scryfall.com/sets/a4135564-9f37-4aaf-963a-90666f843e0d",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Ambc&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/mbc?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/1d1a4c67-630c-42de-b37c-1188451d4b20/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3Ab8354ac6-5285-43dd-9ba5-93064def2e96&unique=prints",
        "collector_number": "59",
        "digital": false,
        "rarity": "rare",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Chris Seaman",
        "artist_ids": [
          "b9c49463-6f55-4039-9d32-c02a658af100"
        ],
        "illustration_id": "435c33da-4467-4557-855b-2a26134672d8",
        "border_color": "black",
        "frame": "2015",
        "frame_effects": [
          "legendary"
        ],
        "security_stamp": "oval",
        "full_art": false,
        "textless": false,
        "booster": false,
        "story_spotlight": false,
        "edhrec_rank": 19509,
        "prices": {
          "usd": null,
          "usd_foil": null,
          "usd_etched": null,
          "eur": null,
          "eur_foil": null,
          "tix": null
        },
        "related_uris": {
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DThe%2BEverforger",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DThe%2BEverforger",
          "edhrec": "https://edhrec.com/route/?cc=The+Everforger"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F709820%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products/Search?referrer=scryfall&searchString=The+Everforger&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards?affiliate_id=scryfall&data%5Bsearch%5D=The+Everforger&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "the great henge (::en)": {
        "object": "card",
        "id": "6340e0f3-7f9c-4d71-8daf-e1be5505eb5b",
        "oracle_id": "78427103-9543-41fb-b6d4-72963fe87275",
        "multiverse_ids": [
          627758
        ],
        "mtgo_id": 114817,
        "tcgplayer_id": 504588,
        "cardmarket_id": 722506,
        "name": "The Great Henge",
        "lang": "en",
        "released_at": "2023-08-04",
        "uri": "https://api.scryfall.com/cards/6340e0f3-7f9c-4d71-8daf-e1be5505eb5b",
        "scryfall_uri": "https://scryfall.com/card/cmm/294/the-great-henge?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T04:07:09Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/6/3/6340e0f3-7f9c-4d71-8daf-e1be5505eb5b.jpg?1783915629",
          "normal": "https://cards.scryfall.io/normal/front/6/3/6340e0f3-7f9c-4d71-8daf-e1be5505eb5b.jpg?1783915629",
          "large": "https://cards.scryfall.io/large/front/6/3/6340e0f3-7f9c-4d71-8daf-e1be5505eb5b.jpg?1783915629",
          "png": "https://cards.scryfall.io/png/front/6/3/6340e0f3-7f9c-4d71-8daf-e1be5505eb5b.png?1783915629",
          "art_crop": "https://cards.scryfall.io/art_crop/front/6/3/6340e0f3-7f9c-4d71-8daf-e1be5505eb5b.jpg?1783915629",
          "border_crop": "https://cards.scryfall.io/border_crop/front/6/3/6340e0f3-7f9c-4d71-8daf-e1be5505eb5b.jpg?1783915629",
          "thumb": "https://cards.scryfall.io/thumb/front/6/3/6340e0f3-7f9c-4d71-8daf-e1be5505eb5b.webp?1783915629",
          "grid": "https://cards.scryfall.io/grid/front/6/3/6340e0f3-7f9c-4d71-8daf-e1be5505eb5b.webp?1783915629",
          "display": "https://cards.scryfall.io/display/front/6/3/6340e0f3-7f9c-4d71-8daf-e1be5505eb5b.webp?1783915629",
          "art": "https://cards.scryfall.io/art/front/6/3/6340e0f3-7f9c-4d71-8daf-e1be5505eb5b.webp?1783915629",
          "crop": "https://cards.scryfall.io/crop/front/6/3/6340e0f3-7f9c-4d71-8daf-e1be5505eb5b.webp?1783915629",
          "jpeg": "https://cards.scryfall.io/normal/front/6/3/6340e0f3-7f9c-4d71-8daf-e1be5505eb5b.jpg?1783915629"
        },
        "mana_cost": "{7}{G}{G}",
        "cmc": 9,
        "type_line": "Legendary Artifact",
        "oracle_text": "This spell costs {X} less to cast, where X is the greatest power among creatures you control.\n{T}: Add {G}{G}. You gain 2 life.\nWhenever a nontoken creature you control enters, put a +1/+1 counter on it and draw a card.",
        "colors": [
          "G"
        ],
        "color_identity": [
          "G"
        ],
        "keywords": [],
        "produced_mana": [
          "G"
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "legal",
          "timeless": "legal",
          "gladiator": "legal",
          "pioneer": "legal",
          "modern": "legal",
          "legacy": "legal",
          "pauper": "not_legal",
          "vintage": "legal",
          "penny": "not_legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "not_legal",
          "brawl": "legal",
          "competitivebrawl": "legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "not_legal"
        },
        "games": [
          "paper",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": true,
        "variation": false,
        "set_id": "cd05036f-2698-43e6-a48e-5c8d82f0a551",
        "set": "cmm",
        "set_name": "Commander Masters",
        "set_type": "masters",
        "set_uri": "https://api.scryfall.com/sets/cd05036f-2698-43e6-a48e-5c8d82f0a551",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Acmm&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/cmm?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/6340e0f3-7f9c-4d71-8daf-e1be5505eb5b/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A78427103-9543-41fb-b6d4-72963fe87275&unique=prints",
        "collector_number": "294",
        "digital": false,
        "rarity": "mythic",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Adam Paquette",
        "artist_ids": [
          "89023dad-e6c0-41e0-83fb-eb2bfbbdc3f2"
        ],
        "illustration_id": "84a7f473-ffbc-4f4c-b54b-889e52ef2419",
        "border_color": "black",
        "frame": "2015",
        "frame_effects": [
          "legendary"
        ],
        "security_stamp": "oval",
        "full_art": false,
        "textless": false,
        "booster": true,
        "story_spotlight": false,
        "edhrec_rank": 229,
        "preview": {
          "source": "le Pincecr\xE2ne",
          "source_uri": "https://youtu.be/mtCi01NtIOg",
          "previewed_at": "2023-07-13"
        },
        "prices": {
          "usd": "64.68",
          "usd_foil": "71.55",
          "usd_etched": null,
          "eur": "50.78",
          "eur_foil": "59.60",
          "tix": "3.54"
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=627758&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DThe%2BGreat%2BHenge",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DThe%2BGreat%2BHenge",
          "edhrec": "https://edhrec.com/route/?cc=The+Great+Henge"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F504588%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=722506&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/114817?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "the unluckiest planeswalker (::en)": {
        "object": "card",
        "id": "abaa08a6-62aa-4f2f-8be9-5950c2b32dc4",
        "oracle_id": "c7ea2ce7-f684-44a2-94b2-d4aa7353f6fc",
        "multiverse_ids": [],
        "tcgplayer_id": 709782,
        "name": "The Unluckiest Planeswalker",
        "lang": "en",
        "released_at": "2026-10-19",
        "uri": "https://api.scryfall.com/cards/abaa08a6-62aa-4f2f-8be9-5950c2b32dc4",
        "scryfall_uri": "https://scryfall.com/card/mbc/26/the-unluckiest-planeswalker?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-08-18T15:13:56Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/a/b/abaa08a6-62aa-4f2f-8be9-5950c2b32dc4.jpg?1787066036",
          "normal": "https://cards.scryfall.io/normal/front/a/b/abaa08a6-62aa-4f2f-8be9-5950c2b32dc4.jpg?1787066036",
          "large": "https://cards.scryfall.io/large/front/a/b/abaa08a6-62aa-4f2f-8be9-5950c2b32dc4.jpg?1787066036",
          "png": "https://cards.scryfall.io/png/front/a/b/abaa08a6-62aa-4f2f-8be9-5950c2b32dc4.png?1787066036",
          "art_crop": "https://cards.scryfall.io/art_crop/front/a/b/abaa08a6-62aa-4f2f-8be9-5950c2b32dc4.jpg?1787066036",
          "border_crop": "https://cards.scryfall.io/border_crop/front/a/b/abaa08a6-62aa-4f2f-8be9-5950c2b32dc4.jpg?1787066036",
          "thumb": "https://cards.scryfall.io/thumb/front/a/b/abaa08a6-62aa-4f2f-8be9-5950c2b32dc4.webp?1787066036",
          "grid": "https://cards.scryfall.io/grid/front/a/b/abaa08a6-62aa-4f2f-8be9-5950c2b32dc4.webp?1787066036",
          "display": "https://cards.scryfall.io/display/front/a/b/abaa08a6-62aa-4f2f-8be9-5950c2b32dc4.webp?1787066036",
          "art": "https://cards.scryfall.io/art/front/a/b/abaa08a6-62aa-4f2f-8be9-5950c2b32dc4.webp?1787066036",
          "crop": "https://cards.scryfall.io/crop/front/a/b/abaa08a6-62aa-4f2f-8be9-5950c2b32dc4.webp?1787066036",
          "jpeg": "https://cards.scryfall.io/normal/front/a/b/abaa08a6-62aa-4f2f-8be9-5950c2b32dc4.jpg?1787066036"
        },
        "mana_cost": "{2}{R}",
        "cmc": 3,
        "type_line": "Legendary Planeswalker",
        "oracle_text": "Rulebreaker \u2014 A deck with this commander can have Aura cards of any color identity and any basic land cards.\n+1: Add one mana of any color. When you spend this mana to cast an Aura spell this turn, create a 1/1 red Gremlin creature token.\n\u22123: Discard your hand, then draw cards equal to twice the number of Auras you control. For each Aura attached to you, attach it to an opponent of your choice.\nThe Unluckiest Planeswalker can be your commander.",
        "loyalty": "4",
        "colors": [
          "R"
        ],
        "color_identity": [
          "R"
        ],
        "keywords": [
          "Rulebreaker"
        ],
        "produced_mana": [
          "B",
          "G",
          "R",
          "U",
          "W"
        ],
        "all_parts": [
          {
            "object": "related_card",
            "id": "d948b503-890a-49d5-a3cf-cb6e604851b8",
            "component": "token",
            "name": "Gremlin",
            "type_line": "Token Creature \u2014 Gremlin",
            "uri": "https://api.scryfall.com/cards/d948b503-890a-49d5-a3cf-cb6e604851b8"
          },
          {
            "object": "related_card",
            "id": "abaa08a6-62aa-4f2f-8be9-5950c2b32dc4",
            "component": "combo_piece",
            "name": "The Unluckiest Planeswalker",
            "type_line": "Legendary Planeswalker",
            "uri": "https://api.scryfall.com/cards/abaa08a6-62aa-4f2f-8be9-5950c2b32dc4"
          }
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "not_legal",
          "timeless": "not_legal",
          "gladiator": "not_legal",
          "pioneer": "not_legal",
          "modern": "not_legal",
          "legacy": "not_legal",
          "pauper": "not_legal",
          "vintage": "not_legal",
          "penny": "not_legal",
          "commander": "not_legal",
          "oathbreaker": "not_legal",
          "standardbrawl": "not_legal",
          "brawl": "not_legal",
          "competitivebrawl": "not_legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "not_legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "not_legal"
        },
        "games": [
          "paper"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": false,
        "variation": false,
        "set_id": "a4135564-9f37-4aaf-963a-90666f843e0d",
        "set": "mbc",
        "set_name": "Mystery Booster Commander Edition",
        "set_type": "draft_innovation",
        "set_uri": "https://api.scryfall.com/sets/a4135564-9f37-4aaf-963a-90666f843e0d",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Ambc&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/mbc?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/abaa08a6-62aa-4f2f-8be9-5950c2b32dc4/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3Ac7ea2ce7-f684-44a2-94b2-d4aa7353f6fc&unique=prints",
        "collector_number": "26",
        "digital": false,
        "rarity": "rare",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Kieran Yanner",
        "artist_ids": [
          "aa7e89ed-d294-4633-9057-ce04dacfcfa4"
        ],
        "illustration_id": "bea09478-ed78-44a4-a336-ecbd30e6aae3",
        "border_color": "black",
        "frame": "2015",
        "security_stamp": "oval",
        "full_art": false,
        "textless": false,
        "booster": false,
        "story_spotlight": false,
        "edhrec_rank": 22482,
        "prices": {
          "usd": null,
          "usd_foil": null,
          "usd_etched": null,
          "eur": null,
          "eur_foil": null,
          "tix": null
        },
        "related_uris": {
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DThe%2BUnluckiest%2BPlaneswalker",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DThe%2BUnluckiest%2BPlaneswalker",
          "edhrec": "https://edhrec.com/route/?cc=The+Unluckiest+Planeswalker"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F709782%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products/Search?referrer=scryfall&searchString=The+Unluckiest+Planeswalker&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards?affiliate_id=scryfall&data%5Bsearch%5D=The+Unluckiest+Planeswalker&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "the world tree (::en)": {
        "object": "card",
        "id": "a70cb6d9-3955-4064-917b-11dec26440c5",
        "oracle_id": "3437d504-bf62-4c27-b15f-f6330182ff7e",
        "multiverse_ids": [
          503895
        ],
        "mtgo_id": 87901,
        "arena_id": 75326,
        "tcgplayer_id": 230165,
        "cardmarket_id": 530337,
        "name": "The World Tree",
        "lang": "en",
        "released_at": "2021-02-05",
        "uri": "https://api.scryfall.com/cards/a70cb6d9-3955-4064-917b-11dec26440c5",
        "scryfall_uri": "https://scryfall.com/card/khm/275/the-world-tree?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T07:36:09Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/a/7/a70cb6d9-3955-4064-917b-11dec26440c5.jpg?1783928169",
          "normal": "https://cards.scryfall.io/normal/front/a/7/a70cb6d9-3955-4064-917b-11dec26440c5.jpg?1783928169",
          "large": "https://cards.scryfall.io/large/front/a/7/a70cb6d9-3955-4064-917b-11dec26440c5.jpg?1783928169",
          "png": "https://cards.scryfall.io/png/front/a/7/a70cb6d9-3955-4064-917b-11dec26440c5.png?1783928169",
          "art_crop": "https://cards.scryfall.io/art_crop/front/a/7/a70cb6d9-3955-4064-917b-11dec26440c5.jpg?1783928169",
          "border_crop": "https://cards.scryfall.io/border_crop/front/a/7/a70cb6d9-3955-4064-917b-11dec26440c5.jpg?1783928169",
          "thumb": "https://cards.scryfall.io/thumb/front/a/7/a70cb6d9-3955-4064-917b-11dec26440c5.webp?1783928169",
          "grid": "https://cards.scryfall.io/grid/front/a/7/a70cb6d9-3955-4064-917b-11dec26440c5.webp?1783928169",
          "display": "https://cards.scryfall.io/display/front/a/7/a70cb6d9-3955-4064-917b-11dec26440c5.webp?1783928169",
          "art": "https://cards.scryfall.io/art/front/a/7/a70cb6d9-3955-4064-917b-11dec26440c5.webp?1783928169",
          "crop": "https://cards.scryfall.io/crop/front/a/7/a70cb6d9-3955-4064-917b-11dec26440c5.webp?1783928169",
          "jpeg": "https://cards.scryfall.io/normal/front/a/7/a70cb6d9-3955-4064-917b-11dec26440c5.jpg?1783928169"
        },
        "mana_cost": "",
        "cmc": 0,
        "type_line": "Land",
        "oracle_text": 'This land enters tapped.\n{T}: Add {G}.\nAs long as you control six or more lands, lands you control have "{T}: Add one mana of any color."\n{W}{W}{U}{U}{B}{B}{R}{R}{G}{G}, {T}, Sacrifice this land: Search your library for any number of God cards, put them onto the battlefield, then shuffle.',
        "colors": [],
        "color_identity": [
          "B",
          "G",
          "R",
          "U",
          "W"
        ],
        "keywords": [],
        "produced_mana": [
          "B",
          "G",
          "R",
          "U",
          "W"
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "legal",
          "timeless": "legal",
          "gladiator": "legal",
          "pioneer": "legal",
          "modern": "legal",
          "legacy": "legal",
          "pauper": "not_legal",
          "vintage": "legal",
          "penny": "legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "not_legal",
          "brawl": "legal",
          "competitivebrawl": "legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "legal"
        },
        "games": [
          "arena",
          "paper",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": false,
        "variation": false,
        "set_id": "43057fad-b1c1-437f-bc48-0045bce6d8c9",
        "set": "khm",
        "set_name": "Kaldheim",
        "set_type": "expansion",
        "set_uri": "https://api.scryfall.com/sets/43057fad-b1c1-437f-bc48-0045bce6d8c9",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Akhm&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/khm?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/a70cb6d9-3955-4064-917b-11dec26440c5/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A3437d504-bf62-4c27-b15f-f6330182ff7e&unique=prints",
        "collector_number": "275",
        "digital": false,
        "rarity": "rare",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Anastasia Ovchinnikova",
        "artist_ids": [
          "3605d81f-5c97-4958-9dcc-d44a85e10305"
        ],
        "illustration_id": "4eda393d-c5f0-4ef4-9d8f-d889682c17bd",
        "border_color": "black",
        "frame": "2015",
        "security_stamp": "oval",
        "full_art": false,
        "textless": false,
        "booster": true,
        "story_spotlight": true,
        "edhrec_rank": 818,
        "penny_rank": 1707,
        "preview": {
          "source": "Cassius Marsh",
          "source_uri": "https://twitter.com/KingCash_7191/status/1347641967031820290",
          "previewed_at": "2021-01-08"
        },
        "prices": {
          "usd": "7.57",
          "usd_foil": "9.17",
          "usd_etched": null,
          "eur": "5.72",
          "eur_foil": "7.24",
          "tix": "0.02"
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=503895&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DThe%2BWorld%2BTree",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DThe%2BWorld%2BTree",
          "edhrec": "https://edhrec.com/route/?cc=The+World+Tree"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F230165%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=530337&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/87901?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "tolabow loch rascal (::en)": {
        "object": "card",
        "id": "f42c02c2-e3d8-4690-8a93-7c7a4c96bdd6",
        "oracle_id": "56d71eda-4037-45fb-9e98-1725147af6fc",
        "multiverse_ids": [],
        "tcgplayer_id": 707216,
        "name": "Tolabow, Loch Rascal",
        "lang": "en",
        "released_at": "2026-10-19",
        "uri": "https://api.scryfall.com/cards/f42c02c2-e3d8-4690-8a93-7c7a4c96bdd6",
        "scryfall_uri": "https://scryfall.com/card/mbc/12/tolabow-loch-rascal?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-08-18T15:08:43Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/f/4/f42c02c2-e3d8-4690-8a93-7c7a4c96bdd6.jpg?1787065723",
          "normal": "https://cards.scryfall.io/normal/front/f/4/f42c02c2-e3d8-4690-8a93-7c7a4c96bdd6.jpg?1787065723",
          "large": "https://cards.scryfall.io/large/front/f/4/f42c02c2-e3d8-4690-8a93-7c7a4c96bdd6.jpg?1787065723",
          "png": "https://cards.scryfall.io/png/front/f/4/f42c02c2-e3d8-4690-8a93-7c7a4c96bdd6.png?1787065723",
          "art_crop": "https://cards.scryfall.io/art_crop/front/f/4/f42c02c2-e3d8-4690-8a93-7c7a4c96bdd6.jpg?1787065723",
          "border_crop": "https://cards.scryfall.io/border_crop/front/f/4/f42c02c2-e3d8-4690-8a93-7c7a4c96bdd6.jpg?1787065723",
          "thumb": "https://cards.scryfall.io/thumb/front/f/4/f42c02c2-e3d8-4690-8a93-7c7a4c96bdd6.webp?1787065723",
          "grid": "https://cards.scryfall.io/grid/front/f/4/f42c02c2-e3d8-4690-8a93-7c7a4c96bdd6.webp?1787065723",
          "display": "https://cards.scryfall.io/display/front/f/4/f42c02c2-e3d8-4690-8a93-7c7a4c96bdd6.webp?1787065723",
          "art": "https://cards.scryfall.io/art/front/f/4/f42c02c2-e3d8-4690-8a93-7c7a4c96bdd6.webp?1787065723",
          "crop": "https://cards.scryfall.io/crop/front/f/4/f42c02c2-e3d8-4690-8a93-7c7a4c96bdd6.webp?1787065723",
          "jpeg": "https://cards.scryfall.io/normal/front/f/4/f42c02c2-e3d8-4690-8a93-7c7a4c96bdd6.jpg?1787065723"
        },
        "mana_cost": "{2}{U}{U}",
        "cmc": 4,
        "type_line": "Legendary Creature \u2014 Otter",
        "oracle_text": "Rulebreaker \u2014 If Tolabow, Loch Rascal is your commander, the color identity of instant and sorcery cards in your deck can include one color of your choice not in your commander's color identity, and your deck can have any basic land cards.\nWhenever you cast an instant or sorcery spell, create a 1/1 blue and red Otter creature token with prowess. (Whenever you cast a noncreature spell, it gets +1/+1 until end of turn.)",
        "power": "3",
        "toughness": "2",
        "colors": [
          "U"
        ],
        "color_identity": [
          "U"
        ],
        "keywords": [
          "Rulebreaker"
        ],
        "all_parts": [
          {
            "object": "related_card",
            "id": "f42c02c2-e3d8-4690-8a93-7c7a4c96bdd6",
            "component": "combo_piece",
            "name": "Tolabow, Loch Rascal",
            "type_line": "Legendary Creature \u2014 Otter",
            "uri": "https://api.scryfall.com/cards/f42c02c2-e3d8-4690-8a93-7c7a4c96bdd6"
          },
          {
            "object": "related_card",
            "id": "e6b2c465-c446-4dee-9101-763105dcf813",
            "component": "token",
            "name": "Otter",
            "type_line": "Token Creature \u2014 Otter",
            "uri": "https://api.scryfall.com/cards/e6b2c465-c446-4dee-9101-763105dcf813"
          }
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "not_legal",
          "timeless": "not_legal",
          "gladiator": "not_legal",
          "pioneer": "not_legal",
          "modern": "not_legal",
          "legacy": "not_legal",
          "pauper": "not_legal",
          "vintage": "not_legal",
          "penny": "not_legal",
          "commander": "not_legal",
          "oathbreaker": "not_legal",
          "standardbrawl": "not_legal",
          "brawl": "not_legal",
          "competitivebrawl": "not_legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "not_legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "not_legal"
        },
        "games": [
          "paper"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": false,
        "variation": false,
        "set_id": "a4135564-9f37-4aaf-963a-90666f843e0d",
        "set": "mbc",
        "set_name": "Mystery Booster Commander Edition",
        "set_type": "draft_innovation",
        "set_uri": "https://api.scryfall.com/sets/a4135564-9f37-4aaf-963a-90666f843e0d",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Ambc&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/mbc?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/f42c02c2-e3d8-4690-8a93-7c7a4c96bdd6/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A56d71eda-4037-45fb-9e98-1725147af6fc&unique=prints",
        "collector_number": "12",
        "digital": false,
        "rarity": "rare",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Brian Valeza",
        "artist_ids": [
          "bb2a9339-bbe4-445f-9736-3c43379ee076"
        ],
        "illustration_id": "f20ce7b7-a124-49e4-af25-5ea60cfda6f5",
        "border_color": "black",
        "frame": "2015",
        "frame_effects": [
          "legendary"
        ],
        "security_stamp": "oval",
        "full_art": false,
        "textless": false,
        "booster": false,
        "story_spotlight": false,
        "edhrec_rank": 23803,
        "prices": {
          "usd": null,
          "usd_foil": null,
          "usd_etched": null,
          "eur": null,
          "eur_foil": null,
          "tix": null
        },
        "related_uris": {
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DTolabow%252C%2BLoch%2BRascal",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DTolabow%252C%2BLoch%2BRascal",
          "edhrec": "https://edhrec.com/route/?cc=Tolabow%2C+Loch+Rascal"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F707216%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products/Search?referrer=scryfall&searchString=Tolabow%2C+Loch+Rascal&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards?affiliate_id=scryfall&data%5Bsearch%5D=Tolabow%2C+Loch+Rascal&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "umori the collector (::en)": {
        "object": "card",
        "id": "75ac31e0-ac70-4ee6-b2b1-cc445ffa1da9",
        "oracle_id": "913383a1-9c0d-40a1-8c5a-b0a8a95c09a6",
        "multiverse_ids": [
          479751
        ],
        "mtgo_id": 80471,
        "arena_id": 71298,
        "tcgplayer_id": 212025,
        "cardmarket_id": 451093,
        "name": "Umori, the Collector",
        "lang": "en",
        "released_at": "2020-04-24",
        "uri": "https://api.scryfall.com/cards/75ac31e0-ac70-4ee6-b2b1-cc445ffa1da9",
        "scryfall_uri": "https://scryfall.com/card/iko/231/umori-the-collector?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T08:23:28Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/7/5/75ac31e0-ac70-4ee6-b2b1-cc445ffa1da9.jpg?1783931008",
          "normal": "https://cards.scryfall.io/normal/front/7/5/75ac31e0-ac70-4ee6-b2b1-cc445ffa1da9.jpg?1783931008",
          "large": "https://cards.scryfall.io/large/front/7/5/75ac31e0-ac70-4ee6-b2b1-cc445ffa1da9.jpg?1783931008",
          "png": "https://cards.scryfall.io/png/front/7/5/75ac31e0-ac70-4ee6-b2b1-cc445ffa1da9.png?1783931008",
          "art_crop": "https://cards.scryfall.io/art_crop/front/7/5/75ac31e0-ac70-4ee6-b2b1-cc445ffa1da9.jpg?1783931008",
          "border_crop": "https://cards.scryfall.io/border_crop/front/7/5/75ac31e0-ac70-4ee6-b2b1-cc445ffa1da9.jpg?1783931008",
          "thumb": "https://cards.scryfall.io/thumb/front/7/5/75ac31e0-ac70-4ee6-b2b1-cc445ffa1da9.webp?1783931008",
          "grid": "https://cards.scryfall.io/grid/front/7/5/75ac31e0-ac70-4ee6-b2b1-cc445ffa1da9.webp?1783931008",
          "display": "https://cards.scryfall.io/display/front/7/5/75ac31e0-ac70-4ee6-b2b1-cc445ffa1da9.webp?1783931008",
          "art": "https://cards.scryfall.io/art/front/7/5/75ac31e0-ac70-4ee6-b2b1-cc445ffa1da9.webp?1783931008",
          "crop": "https://cards.scryfall.io/crop/front/7/5/75ac31e0-ac70-4ee6-b2b1-cc445ffa1da9.webp?1783931008",
          "jpeg": "https://cards.scryfall.io/normal/front/7/5/75ac31e0-ac70-4ee6-b2b1-cc445ffa1da9.jpg?1783931008"
        },
        "mana_cost": "{2}{B/G}{B/G}",
        "cmc": 4,
        "type_line": "Legendary Creature \u2014 Ooze",
        "oracle_text": "Companion \u2014 Each nonland card in your starting deck shares a card type. (If this card is your chosen companion, you may put it into your hand from outside the game for {3} as a sorcery.)\nAs Umori enters, choose a card type.\nSpells you cast of the chosen type cost {1} less to cast.",
        "power": "4",
        "toughness": "5",
        "colors": [
          "B",
          "G"
        ],
        "color_identity": [
          "B",
          "G"
        ],
        "keywords": [
          "Companion"
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "legal",
          "timeless": "legal",
          "gladiator": "legal",
          "pioneer": "legal",
          "modern": "legal",
          "legacy": "legal",
          "pauper": "not_legal",
          "vintage": "legal",
          "penny": "legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "not_legal",
          "brawl": "legal",
          "competitivebrawl": "legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "not_legal"
        },
        "games": [
          "arena",
          "paper",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": false,
        "variation": false,
        "set_id": "19feda43-15ab-427e-a0e4-148a4bf2b03a",
        "set": "iko",
        "set_name": "Ikoria: Lair of Behemoths",
        "set_type": "expansion",
        "set_uri": "https://api.scryfall.com/sets/19feda43-15ab-427e-a0e4-148a4bf2b03a",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Aiko&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/iko?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/75ac31e0-ac70-4ee6-b2b1-cc445ffa1da9/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A913383a1-9c0d-40a1-8c5a-b0a8a95c09a6&unique=prints",
        "collector_number": "231",
        "digital": false,
        "rarity": "rare",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Jehan Choo",
        "artist_ids": [
          "515df9fe-9c29-4e75-9e49-6ce5be4ec8c8"
        ],
        "illustration_id": "eeab7dac-e0d0-40a7-bdbb-f36f1067466a",
        "border_color": "black",
        "frame": "2015",
        "frame_effects": [
          "companion",
          "legendary"
        ],
        "security_stamp": "oval",
        "full_art": false,
        "textless": false,
        "booster": true,
        "story_spotlight": false,
        "edhrec_rank": 10768,
        "penny_rank": 6117,
        "preview": {
          "source": "Noxious",
          "source_uri": "https://twitter.com/coL_noxious/status/1245750973873741824",
          "previewed_at": "2020-04-02"
        },
        "prices": {
          "usd": "0.30",
          "usd_foil": "0.32",
          "usd_etched": null,
          "eur": "0.22",
          "eur_foil": "0.62",
          "tix": "0.02"
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=479751&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DUmori%252C%2Bthe%2BCollector",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DUmori%252C%2Bthe%2BCollector",
          "edhrec": "https://edhrec.com/route/?cc=Umori%2C+the+Collector"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F212025%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=451093&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/80471?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "valko indorian (::en)": {
        "object": "card",
        "id": "a0b51fb8-6e5a-479d-aa3a-17cf603dd05c",
        "oracle_id": "8023d419-8fd2-4b92-b6ea-f25fd67e6410",
        "multiverse_ids": [],
        "tcgplayer_id": 709774,
        "name": "Valko Indorian",
        "lang": "en",
        "released_at": "2026-10-19",
        "uri": "https://api.scryfall.com/cards/a0b51fb8-6e5a-479d-aa3a-17cf603dd05c",
        "scryfall_uri": "https://scryfall.com/card/mbc/60/valko-indorian?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-08-18T15:07:08Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/a/0/a0b51fb8-6e5a-479d-aa3a-17cf603dd05c.jpg?1787065628",
          "normal": "https://cards.scryfall.io/normal/front/a/0/a0b51fb8-6e5a-479d-aa3a-17cf603dd05c.jpg?1787065628",
          "large": "https://cards.scryfall.io/large/front/a/0/a0b51fb8-6e5a-479d-aa3a-17cf603dd05c.jpg?1787065628",
          "png": "https://cards.scryfall.io/png/front/a/0/a0b51fb8-6e5a-479d-aa3a-17cf603dd05c.png?1787065628",
          "art_crop": "https://cards.scryfall.io/art_crop/front/a/0/a0b51fb8-6e5a-479d-aa3a-17cf603dd05c.jpg?1787065628",
          "border_crop": "https://cards.scryfall.io/border_crop/front/a/0/a0b51fb8-6e5a-479d-aa3a-17cf603dd05c.jpg?1787065628",
          "thumb": "https://cards.scryfall.io/thumb/front/a/0/a0b51fb8-6e5a-479d-aa3a-17cf603dd05c.webp?1787065628",
          "grid": "https://cards.scryfall.io/grid/front/a/0/a0b51fb8-6e5a-479d-aa3a-17cf603dd05c.webp?1787065628",
          "display": "https://cards.scryfall.io/display/front/a/0/a0b51fb8-6e5a-479d-aa3a-17cf603dd05c.webp?1787065628",
          "art": "https://cards.scryfall.io/art/front/a/0/a0b51fb8-6e5a-479d-aa3a-17cf603dd05c.webp?1787065628",
          "crop": "https://cards.scryfall.io/crop/front/a/0/a0b51fb8-6e5a-479d-aa3a-17cf603dd05c.webp?1787065628",
          "jpeg": "https://cards.scryfall.io/normal/front/a/0/a0b51fb8-6e5a-479d-aa3a-17cf603dd05c.jpg?1787065628"
        },
        "mana_cost": "{3}{B}",
        "cmc": 4,
        "type_line": "Legendary Creature \u2014 Human Wizard",
        "oracle_text": "Rulebreaker \u2014 A deck with this commander can have Phyrexian cards of any color identity and any basic land cards.\nPhyrexian creatures you control have menace and lifelink.",
        "power": "2",
        "toughness": "4",
        "colors": [
          "B"
        ],
        "color_identity": [
          "B"
        ],
        "keywords": [
          "Rulebreaker"
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "not_legal",
          "timeless": "not_legal",
          "gladiator": "not_legal",
          "pioneer": "not_legal",
          "modern": "not_legal",
          "legacy": "not_legal",
          "pauper": "not_legal",
          "vintage": "not_legal",
          "penny": "not_legal",
          "commander": "not_legal",
          "oathbreaker": "not_legal",
          "standardbrawl": "not_legal",
          "brawl": "not_legal",
          "competitivebrawl": "not_legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "not_legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "not_legal"
        },
        "games": [
          "paper"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": false,
        "variation": false,
        "set_id": "a4135564-9f37-4aaf-963a-90666f843e0d",
        "set": "mbc",
        "set_name": "Mystery Booster Commander Edition",
        "set_type": "draft_innovation",
        "set_uri": "https://api.scryfall.com/sets/a4135564-9f37-4aaf-963a-90666f843e0d",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Ambc&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/mbc?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/a0b51fb8-6e5a-479d-aa3a-17cf603dd05c/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A8023d419-8fd2-4b92-b6ea-f25fd67e6410&unique=prints",
        "collector_number": "60",
        "digital": false,
        "rarity": "rare",
        "flavor_text": `"xe [being organic pl 2:4] '\u0161t[mother pl 2:2] [weep 2:3], loxu\u03C6 [being mixed organic/inorganic pl 2:4] \u03C6l[phyrexia-eternal-love] [comfort 1:2]. ^'el\u0161 norn.`,
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Paolo Parente",
        "artist_ids": [
          "d48dd097-720d-476a-8722-6a02854ae28b"
        ],
        "illustration_id": "8db91c31-f76b-48db-beec-1c5e6f5cedc5",
        "border_color": "black",
        "frame": "2015",
        "frame_effects": [
          "legendary"
        ],
        "security_stamp": "oval",
        "full_art": false,
        "textless": false,
        "booster": false,
        "story_spotlight": false,
        "edhrec_rank": 24697,
        "prices": {
          "usd": null,
          "usd_foil": null,
          "usd_etched": null,
          "eur": null,
          "eur_foil": null,
          "tix": null
        },
        "related_uris": {
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DValko%2BIndorian",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DValko%2BIndorian",
          "edhrec": "https://edhrec.com/route/?cc=Valko+Indorian"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F709774%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products/Search?referrer=scryfall&searchString=Valko+Indorian&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards?affiliate_id=scryfall&data%5Bsearch%5D=Valko+Indorian&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "whtz the bibliophile (::en)": {
        "object": "card",
        "id": "726f8ac7-d7a3-442c-adb6-82836e4490a7",
        "oracle_id": "73ba7ed0-0f08-4ba4-9f51-42c48f1b62ea",
        "multiverse_ids": [],
        "tcgplayer_id": 709817,
        "name": "Whtz, the Bibliophile",
        "lang": "en",
        "released_at": "2026-10-19",
        "uri": "https://api.scryfall.com/cards/726f8ac7-d7a3-442c-adb6-82836e4490a7",
        "scryfall_uri": "https://scryfall.com/card/mbc/57/whtz-the-bibliophile?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-08-03T13:46:30Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/7/2/726f8ac7-d7a3-442c-adb6-82836e4490a7.jpg?1785764790",
          "normal": "https://cards.scryfall.io/normal/front/7/2/726f8ac7-d7a3-442c-adb6-82836e4490a7.jpg?1785764790",
          "large": "https://cards.scryfall.io/large/front/7/2/726f8ac7-d7a3-442c-adb6-82836e4490a7.jpg?1785764790",
          "png": "https://cards.scryfall.io/png/front/7/2/726f8ac7-d7a3-442c-adb6-82836e4490a7.png?1785764790",
          "art_crop": "https://cards.scryfall.io/art_crop/front/7/2/726f8ac7-d7a3-442c-adb6-82836e4490a7.jpg?1785764790",
          "border_crop": "https://cards.scryfall.io/border_crop/front/7/2/726f8ac7-d7a3-442c-adb6-82836e4490a7.jpg?1785764790",
          "thumb": "https://cards.scryfall.io/thumb/front/7/2/726f8ac7-d7a3-442c-adb6-82836e4490a7.webp?1785764790",
          "grid": "https://cards.scryfall.io/grid/front/7/2/726f8ac7-d7a3-442c-adb6-82836e4490a7.webp?1785764790",
          "display": "https://cards.scryfall.io/display/front/7/2/726f8ac7-d7a3-442c-adb6-82836e4490a7.webp?1785764790",
          "art": "https://cards.scryfall.io/art/front/7/2/726f8ac7-d7a3-442c-adb6-82836e4490a7.webp?1785764790",
          "crop": "https://cards.scryfall.io/crop/front/7/2/726f8ac7-d7a3-442c-adb6-82836e4490a7.webp?1785764790",
          "jpeg": "https://cards.scryfall.io/normal/front/7/2/726f8ac7-d7a3-442c-adb6-82836e4490a7.jpg?1785764790"
        },
        "mana_cost": "{1}{W}{U}",
        "cmc": 3,
        "type_line": "Legendary Creature \u2014 Homunculus",
        "oracle_text": "Rulebreaker \u2014 A deck with this commander has no maximum deck size.\n{3}, {T}: You draw a card and gain 1 life. This ability costs {3} less to activate if you had 200 or more cards in your starting deck.",
        "power": "1",
        "toughness": "3",
        "colors": [
          "U",
          "W"
        ],
        "color_identity": [
          "U",
          "W"
        ],
        "keywords": [
          "Rulebreaker"
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "not_legal",
          "timeless": "not_legal",
          "gladiator": "not_legal",
          "pioneer": "not_legal",
          "modern": "not_legal",
          "legacy": "not_legal",
          "pauper": "not_legal",
          "vintage": "not_legal",
          "penny": "not_legal",
          "commander": "not_legal",
          "oathbreaker": "not_legal",
          "standardbrawl": "not_legal",
          "brawl": "not_legal",
          "competitivebrawl": "not_legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "not_legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "not_legal"
        },
        "games": [
          "paper"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": false,
        "variation": false,
        "set_id": "a4135564-9f37-4aaf-963a-90666f843e0d",
        "set": "mbc",
        "set_name": "Mystery Booster Commander Edition",
        "set_type": "draft_innovation",
        "set_uri": "https://api.scryfall.com/sets/a4135564-9f37-4aaf-963a-90666f843e0d",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Ambc&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/mbc?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/726f8ac7-d7a3-442c-adb6-82836e4490a7/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A73ba7ed0-0f08-4ba4-9f51-42c48f1b62ea&unique=prints",
        "collector_number": "57",
        "digital": false,
        "rarity": "rare",
        "flavor_text": "Created to keep the library well-stocked.",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Leanna Crossan",
        "artist_ids": [
          "976cfe82-042e-4c2a-b762-2bc3e86cb6d0"
        ],
        "illustration_id": "d53f1bcf-258f-4eb3-8014-c6bbbe345e93",
        "border_color": "black",
        "frame": "2015",
        "frame_effects": [
          "legendary"
        ],
        "security_stamp": "oval",
        "full_art": false,
        "textless": false,
        "booster": false,
        "story_spotlight": false,
        "edhrec_rank": 13825,
        "prices": {
          "usd": null,
          "usd_foil": null,
          "usd_etched": null,
          "eur": null,
          "eur_foil": null,
          "tix": null
        },
        "related_uris": {
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DWhtz%252C%2Bthe%2BBibliophile",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DWhtz%252C%2Bthe%2BBibliophile",
          "edhrec": "https://edhrec.com/route/?cc=Whtz%2C+the+Bibliophile"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F709817%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products/Search?referrer=scryfall&searchString=Whtz%2C+the+Bibliophile&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards?affiliate_id=scryfall&data%5Bsearch%5D=Whtz%2C+the+Bibliophile&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "wrenn and six (::en)": {
        "object": "card",
        "id": "5bd498cc-a609-4457-9325-6888d59ca36f",
        "oracle_id": "108ae90a-50fa-4cfd-b751-d630e41425fe",
        "multiverse_ids": [
          571629
        ],
        "mtgo_id": 102076,
        "tcgplayer_id": 276266,
        "cardmarket_id": 663973,
        "name": "Wrenn and Six",
        "lang": "en",
        "released_at": "2022-07-08",
        "uri": "https://api.scryfall.com/cards/5bd498cc-a609-4457-9325-6888d59ca36f",
        "scryfall_uri": "https://scryfall.com/card/2x2/296/wrenn-and-six?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-10-12T11:17:49Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/5/b/5bd498cc-a609-4457-9325-6888d59ca36f.jpg?1791803869",
          "normal": "https://cards.scryfall.io/normal/front/5/b/5bd498cc-a609-4457-9325-6888d59ca36f.jpg?1791803869",
          "large": "https://cards.scryfall.io/large/front/5/b/5bd498cc-a609-4457-9325-6888d59ca36f.jpg?1791803869",
          "png": "https://cards.scryfall.io/png/front/5/b/5bd498cc-a609-4457-9325-6888d59ca36f.png?1791803869",
          "art_crop": "https://cards.scryfall.io/art_crop/front/5/b/5bd498cc-a609-4457-9325-6888d59ca36f.jpg?1791803869",
          "border_crop": "https://cards.scryfall.io/border_crop/front/5/b/5bd498cc-a609-4457-9325-6888d59ca36f.jpg?1791803869",
          "thumb": "https://cards.scryfall.io/thumb/front/5/b/5bd498cc-a609-4457-9325-6888d59ca36f.webp?1791803869",
          "grid": "https://cards.scryfall.io/grid/front/5/b/5bd498cc-a609-4457-9325-6888d59ca36f.webp?1791803869",
          "display": "https://cards.scryfall.io/display/front/5/b/5bd498cc-a609-4457-9325-6888d59ca36f.webp?1791803869",
          "art": "https://cards.scryfall.io/art/front/5/b/5bd498cc-a609-4457-9325-6888d59ca36f.webp?1791803869",
          "crop": "https://cards.scryfall.io/crop/front/5/b/5bd498cc-a609-4457-9325-6888d59ca36f.webp?1791803869",
          "jpeg": "https://cards.scryfall.io/normal/front/5/b/5bd498cc-a609-4457-9325-6888d59ca36f.jpg?1791803869"
        },
        "mana_cost": "{R}{G}",
        "cmc": 2,
        "type_line": "Legendary Planeswalker \u2014 Wrenn",
        "oracle_text": '+1: Return up to one target land card from your graveyard to your hand.\n\u22121: Wrenn and Six deals 1 damage to any target.\n\u22127: You get an emblem with "Instant and sorcery cards in your graveyard have retrace." (You may cast instant and sorcery cards from your graveyard by discarding a land card in addition to paying their other costs.)',
        "loyalty": "3",
        "colors": [
          "G",
          "R"
        ],
        "color_identity": [
          "G",
          "R"
        ],
        "keywords": [],
        "all_parts": [
          {
            "object": "related_card",
            "id": "24b1203f-1f4c-4d02-a79f-1f6486904ea6",
            "component": "combo_piece",
            "name": "Wrenn and Six",
            "type_line": "Legendary Planeswalker \u2014 Wrenn",
            "uri": "https://api.scryfall.com/cards/24b1203f-1f4c-4d02-a79f-1f6486904ea6"
          },
          {
            "object": "related_card",
            "id": "35578c3f-e818-4887-83c4-dc3a89e28ed4",
            "component": "combo_piece",
            "name": "Wrenn and Six Emblem",
            "type_line": "Emblem \u2014 Wrenn",
            "uri": "https://api.scryfall.com/cards/35578c3f-e818-4887-83c4-dc3a89e28ed4"
          }
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "legal",
          "timeless": "legal",
          "gladiator": "legal",
          "pioneer": "not_legal",
          "modern": "legal",
          "legacy": "banned",
          "pauper": "not_legal",
          "vintage": "legal",
          "penny": "not_legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "not_legal",
          "brawl": "legal",
          "competitivebrawl": "restricted",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "restricted"
        },
        "games": [
          "paper",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": true,
        "variation": false,
        "set_id": "5a645837-b050-449f-ac90-1e7ccbf45031",
        "set": "2x2",
        "set_name": "Double Masters 2022",
        "set_type": "masters",
        "set_uri": "https://api.scryfall.com/sets/5a645837-b050-449f-ac90-1e7ccbf45031",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3A2x2&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/2x2?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/5bd498cc-a609-4457-9325-6888d59ca36f/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A108ae90a-50fa-4cfd-b751-d630e41425fe&unique=prints",
        "collector_number": "296",
        "digital": false,
        "rarity": "mythic",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Chase Stone",
        "artist_ids": [
          "2d753f61-5f5b-468e-97ea-8e0fdd347340"
        ],
        "illustration_id": "d0930da0-02bd-44a7-a183-507c49b8ef17",
        "border_color": "black",
        "frame": "2015",
        "security_stamp": "oval",
        "full_art": false,
        "textless": false,
        "booster": true,
        "story_spotlight": false,
        "edhrec_rank": 6578,
        "preview": {
          "source": "Wizards of the Coast",
          "source_uri": "https://magic.wizards.com/en/articles/archive/news/your-sneak-peek-double-masters-2022-dominaria-united-and-beyond-2022-05-12",
          "previewed_at": "2022-05-12"
        },
        "prices": {
          "usd": "7.93",
          "usd_foil": "10.10",
          "usd_etched": null,
          "eur": "9.52",
          "eur_foil": "15.68",
          "tix": "4.47"
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=571629&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DWrenn%2Band%2BSix",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DWrenn%2Band%2BSix",
          "edhrec": "https://edhrec.com/route/?cc=Wrenn+and+Six"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F276266%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=663973&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/102076?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "yorion sky nomad (::en)": {
        "object": "card",
        "id": "275426c4-c14e-47d0-a9d4-24da7f6f6911",
        "oracle_id": "e15504a7-2b67-4185-b916-172145f10b19",
        "multiverse_ids": [
          479752
        ],
        "mtgo_id": 80473,
        "arena_id": 71299,
        "tcgplayer_id": 212715,
        "cardmarket_id": 455533,
        "name": "Yorion, Sky Nomad",
        "lang": "en",
        "released_at": "2020-04-24",
        "uri": "https://api.scryfall.com/cards/275426c4-c14e-47d0-a9d4-24da7f6f6911",
        "scryfall_uri": "https://scryfall.com/card/iko/232/yorion-sky-nomad?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T08:23:27Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/2/7/275426c4-c14e-47d0-a9d4-24da7f6f6911.jpg?1783931007",
          "normal": "https://cards.scryfall.io/normal/front/2/7/275426c4-c14e-47d0-a9d4-24da7f6f6911.jpg?1783931007",
          "large": "https://cards.scryfall.io/large/front/2/7/275426c4-c14e-47d0-a9d4-24da7f6f6911.jpg?1783931007",
          "png": "https://cards.scryfall.io/png/front/2/7/275426c4-c14e-47d0-a9d4-24da7f6f6911.png?1783931007",
          "art_crop": "https://cards.scryfall.io/art_crop/front/2/7/275426c4-c14e-47d0-a9d4-24da7f6f6911.jpg?1783931007",
          "border_crop": "https://cards.scryfall.io/border_crop/front/2/7/275426c4-c14e-47d0-a9d4-24da7f6f6911.jpg?1783931007",
          "thumb": "https://cards.scryfall.io/thumb/front/2/7/275426c4-c14e-47d0-a9d4-24da7f6f6911.webp?1783931007",
          "grid": "https://cards.scryfall.io/grid/front/2/7/275426c4-c14e-47d0-a9d4-24da7f6f6911.webp?1783931007",
          "display": "https://cards.scryfall.io/display/front/2/7/275426c4-c14e-47d0-a9d4-24da7f6f6911.webp?1783931007",
          "art": "https://cards.scryfall.io/art/front/2/7/275426c4-c14e-47d0-a9d4-24da7f6f6911.webp?1783931007",
          "crop": "https://cards.scryfall.io/crop/front/2/7/275426c4-c14e-47d0-a9d4-24da7f6f6911.webp?1783931007",
          "jpeg": "https://cards.scryfall.io/normal/front/2/7/275426c4-c14e-47d0-a9d4-24da7f6f6911.jpg?1783931007"
        },
        "mana_cost": "{3}{W/U}{W/U}",
        "cmc": 5,
        "type_line": "Legendary Creature \u2014 Bird Serpent",
        "oracle_text": "Companion \u2014 Your starting deck contains at least twenty cards more than the minimum deck size. (If this card is your chosen companion, you may put it into your hand from outside the game for {3} as a sorcery.)\nFlying\nWhen Yorion enters, exile any number of other nonland permanents you own and control. Return those cards to the battlefield at the beginning of the next end step.",
        "power": "4",
        "toughness": "5",
        "colors": [
          "U",
          "W"
        ],
        "color_identity": [
          "U",
          "W"
        ],
        "keywords": [
          "Flying",
          "Companion"
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "legal",
          "timeless": "legal",
          "gladiator": "legal",
          "pioneer": "legal",
          "modern": "banned",
          "legacy": "legal",
          "pauper": "not_legal",
          "vintage": "legal",
          "penny": "legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "not_legal",
          "brawl": "legal",
          "competitivebrawl": "legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "not_legal"
        },
        "games": [
          "arena",
          "paper",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": false,
        "variation": false,
        "set_id": "19feda43-15ab-427e-a0e4-148a4bf2b03a",
        "set": "iko",
        "set_name": "Ikoria: Lair of Behemoths",
        "set_type": "expansion",
        "set_uri": "https://api.scryfall.com/sets/19feda43-15ab-427e-a0e4-148a4bf2b03a",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Aiko&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/iko?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/275426c4-c14e-47d0-a9d4-24da7f6f6911/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3Ae15504a7-2b67-4185-b916-172145f10b19&unique=prints",
        "collector_number": "232",
        "digital": false,
        "rarity": "rare",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Steven Belledin",
        "artist_ids": [
          "f07d73b9-52a0-4fe5-858b-61f7b42174a5"
        ],
        "illustration_id": "b91fb435-3541-44fa-99a8-eabf59376ee5",
        "border_color": "black",
        "frame": "2015",
        "frame_effects": [
          "companion",
          "legendary"
        ],
        "security_stamp": "oval",
        "full_art": false,
        "textless": false,
        "booster": true,
        "story_spotlight": false,
        "edhrec_rank": 4618,
        "penny_rank": 516,
        "prices": {
          "usd": "0.52",
          "usd_foil": "0.59",
          "usd_etched": null,
          "eur": "0.68",
          "eur_foil": "3.32",
          "tix": "0.02"
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=479752&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DYorion%252C%2BSky%2BNomad",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DYorion%252C%2BSky%2BNomad",
          "edhrec": "https://edhrec.com/route/?cc=Yorion%2C+Sky+Nomad"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F212715%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=455533&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/80473?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      },
      "zirda the dawnwaker (::en)": {
        "object": "card",
        "id": "1bd8e61c-2ee8-4243-a848-7008810db8a0",
        "oracle_id": "7b515c56-7b1e-42a8-82b0-1b30201fb162",
        "multiverse_ids": [
          479753
        ],
        "mtgo_id": 80475,
        "arena_id": 71300,
        "tcgplayer_id": 212601,
        "cardmarket_id": 454873,
        "name": "Zirda, the Dawnwaker",
        "lang": "en",
        "released_at": "2020-04-24",
        "uri": "https://api.scryfall.com/cards/1bd8e61c-2ee8-4243-a848-7008810db8a0",
        "scryfall_uri": "https://scryfall.com/card/iko/233/zirda-the-dawnwaker?utm_source=api",
        "layout": "normal",
        "highres_image": true,
        "image_status": "highres_scan",
        "image_updated_at": "2026-07-13T08:23:27Z",
        "image_uris": {
          "small": "https://cards.scryfall.io/small/front/1/b/1bd8e61c-2ee8-4243-a848-7008810db8a0.jpg?1783931007",
          "normal": "https://cards.scryfall.io/normal/front/1/b/1bd8e61c-2ee8-4243-a848-7008810db8a0.jpg?1783931007",
          "large": "https://cards.scryfall.io/large/front/1/b/1bd8e61c-2ee8-4243-a848-7008810db8a0.jpg?1783931007",
          "png": "https://cards.scryfall.io/png/front/1/b/1bd8e61c-2ee8-4243-a848-7008810db8a0.png?1783931007",
          "art_crop": "https://cards.scryfall.io/art_crop/front/1/b/1bd8e61c-2ee8-4243-a848-7008810db8a0.jpg?1783931007",
          "border_crop": "https://cards.scryfall.io/border_crop/front/1/b/1bd8e61c-2ee8-4243-a848-7008810db8a0.jpg?1783931007",
          "thumb": "https://cards.scryfall.io/thumb/front/1/b/1bd8e61c-2ee8-4243-a848-7008810db8a0.webp?1783931007",
          "grid": "https://cards.scryfall.io/grid/front/1/b/1bd8e61c-2ee8-4243-a848-7008810db8a0.webp?1783931007",
          "display": "https://cards.scryfall.io/display/front/1/b/1bd8e61c-2ee8-4243-a848-7008810db8a0.webp?1783931007",
          "art": "https://cards.scryfall.io/art/front/1/b/1bd8e61c-2ee8-4243-a848-7008810db8a0.webp?1783931007",
          "crop": "https://cards.scryfall.io/crop/front/1/b/1bd8e61c-2ee8-4243-a848-7008810db8a0.webp?1783931007",
          "jpeg": "https://cards.scryfall.io/normal/front/1/b/1bd8e61c-2ee8-4243-a848-7008810db8a0.jpg?1783931007"
        },
        "mana_cost": "{1}{R/W}{R/W}",
        "cmc": 3,
        "type_line": "Legendary Creature \u2014 Elemental Fox",
        "oracle_text": "Companion \u2014 Each permanent card in your starting deck has an activated ability. (If this card is your chosen companion, you may put it into your hand from outside the game for {3} as a sorcery.)\nAbilities you activate that aren't mana abilities cost {2} less to activate. This effect can't reduce the mana in that cost to less than one mana.\n{1}, {T}: Target creature can't block this turn.",
        "power": "3",
        "toughness": "3",
        "colors": [
          "R",
          "W"
        ],
        "color_identity": [
          "R",
          "W"
        ],
        "keywords": [
          "Companion"
        ],
        "legalities": {
          "standard": "not_legal",
          "future": "not_legal",
          "historic": "legal",
          "timeless": "legal",
          "gladiator": "legal",
          "pioneer": "legal",
          "modern": "legal",
          "legacy": "banned",
          "pauper": "not_legal",
          "vintage": "legal",
          "penny": "legal",
          "commander": "legal",
          "oathbreaker": "legal",
          "standardbrawl": "not_legal",
          "brawl": "legal",
          "competitivebrawl": "legal",
          "alchemy": "not_legal",
          "paupercommander": "not_legal",
          "duel": "legal",
          "oldschool": "not_legal",
          "premodern": "not_legal",
          "predh": "not_legal",
          "tlr": "legal"
        },
        "games": [
          "arena",
          "paper",
          "mtgo"
        ],
        "reserved": false,
        "game_changer": false,
        "foil": true,
        "nonfoil": true,
        "finishes": [
          "nonfoil",
          "foil"
        ],
        "oversized": false,
        "promo": false,
        "reprint": false,
        "variation": false,
        "set_id": "19feda43-15ab-427e-a0e4-148a4bf2b03a",
        "set": "iko",
        "set_name": "Ikoria: Lair of Behemoths",
        "set_type": "expansion",
        "set_uri": "https://api.scryfall.com/sets/19feda43-15ab-427e-a0e4-148a4bf2b03a",
        "set_search_uri": "https://api.scryfall.com/cards/search?order=set&q=e%3Aiko&unique=prints",
        "scryfall_set_uri": "https://scryfall.com/sets/iko?utm_source=api",
        "rulings_uri": "https://api.scryfall.com/cards/1bd8e61c-2ee8-4243-a848-7008810db8a0/rulings",
        "prints_search_uri": "https://api.scryfall.com/cards/search?order=released&q=oracleid%3A7b515c56-7b1e-42a8-82b0-1b30201fb162&unique=prints",
        "collector_number": "233",
        "digital": false,
        "rarity": "rare",
        "card_back_id": "0aeebaf5-8c7d-4636-9e82-8c27447861f7",
        "artist": "Jesper Ejsing",
        "artist_ids": [
          "a5f8354a-8b51-4e59-96b2-0e3aeae4fa1d"
        ],
        "illustration_id": "0261c04a-8c21-4b5c-a33d-7b158da20cc9",
        "border_color": "black",
        "frame": "2015",
        "frame_effects": [
          "companion",
          "legendary"
        ],
        "security_stamp": "oval",
        "full_art": false,
        "textless": false,
        "booster": true,
        "story_spotlight": false,
        "edhrec_rank": 3353,
        "penny_rank": 2855,
        "preview": {
          "source": "Wizards of the Coast",
          "source_uri": "https://magic.wizards.com/en/products/Ikoria",
          "previewed_at": "2020-04-08"
        },
        "prices": {
          "usd": "1.50",
          "usd_foil": "2.18",
          "usd_etched": null,
          "eur": "0.69",
          "eur_foil": "1.44",
          "tix": "0.02"
        },
        "related_uris": {
          "gatherer": "https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=479753&printed=false",
          "tcgplayer_infinite_articles": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Farticles&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Farticles%3FproductLineName%3Dmagic%26q%3DZirda%252C%2Bthe%2BDawnwaker",
          "tcgplayer_infinite_decks": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&trafcat=tcgplayer.com%2Fsearch%2Fdecks&u=https%3A%2F%2Fwww.tcgplayer.com%2Fsearch%2Fdecks%3FproductLineName%3Dmagic%26q%3DZirda%252C%2Bthe%2BDawnwaker",
          "edhrec": "https://edhrec.com/route/?cc=Zirda%2C+the+Dawnwaker"
        },
        "purchase_uris": {
          "tcgplayer": "https://partner.tcgplayer.com/c/4931599/1830156/21018?subId1=api&u=https%3A%2F%2Fwww.tcgplayer.com%2Fproduct%2F212601%3Fpage%3D1",
          "cardmarket": "https://www.cardmarket.com/en/Magic/Products?idProduct=454873&referrer=scryfall&utm_campaign=card_prices&utm_medium=text&utm_source=scryfall",
          "cardhoarder": "https://www.cardhoarder.com/cards/80475?affiliate_id=scryfall&ref=card-profile&utm_campaign=affiliate&utm_medium=card&utm_source=scryfall"
        }
      }
    };
  }
});

// test/test-counter.ts
var TestCounter;
var init_test_counter = __esm({
  "test/test-counter.ts"() {
    TestCounter = class {
      count = 0;
      passes = 0;
      fails = 0;
      add(pass) {
        this.count++;
        if (pass) {
          this.passes++;
        } else {
          this.fails++;
        }
        return this;
      }
      accumulate(counters) {
        counters.forEach((counter) => {
          this.count += counter.count;
          this.passes += counter.passes;
          this.fails += counter.fails;
        });
        return this;
      }
      format(message) {
        return message.replaceAll("{count}", `${this.count}`).replaceAll("{passes}", `${this.passes}`).replaceAll("{fails}", `${this.fails}`);
      }
    };
  }
});

// value.ts
function is_nullish(value) {
  return value === null || value === void 0 || Number.isNaN(value);
}
var init_value = __esm({
  "value.ts"() {
  }
});

// test/test.ts
var Test;
var init_test = __esm({
  "test/test.ts"() {
    init_text();
    init_test_counter();
    init_tag();
    init_value();
    Test = class _Test {
      constructor(pass_message = null, fail_message = null) {
        this.pass_message = pass_message;
        this.fail_message = fail_message;
      }
      pass_message;
      fail_message;
      static SUITE = new _Test(
        "Passed all {count} tests",
        "Passed {passes}/{count} tests (failed {fails})"
      );
      condition = true;
      children = [];
      negated = false;
      has_children() {
        return this.children.length > 0;
      }
      passes() {
        return !(this.has_children() ? this.children.every((test) => test.passes()) : this.condition) === this.negated;
      }
      mark(passes) {
        this.condition = passes;
      }
      pass() {
        this.mark(true);
      }
      fail() {
        this.mark(false);
      }
      negate() {
        this.negated = true;
        return this;
      }
      sub_test(pass_message, fail_message) {
        const test = new _Test();
        test.pass_message = pass_message;
        test.fail_message = fail_message;
        this.children.push(test);
        return test;
      }
      assert(condition, pass_message, fail_message) {
        const test = new _Test();
        test.pass_message = pass_message;
        test.fail_message = fail_message;
        test.mark(condition);
        this.children.push(test);
        return test;
      }
      assert_false(condition, pass_message, fail_message) {
        return this.assert(condition, pass_message, fail_message).negate();
      }
      assert_null(object, pass_message, fail_message) {
        const test = new _Test();
        test.pass_message = pass_message;
        test.fail_message = fail_message;
        test.mark(is_nullish(object));
        this.children.push(test);
        return test;
      }
      assert_match(expected, actual, pass_message = `{actual} matches {expected}`, fail_message = `{actual} does not match {expected}`) {
        const test = this.assert(
          actual === expected,
          format(pass_message, { expected, actual }),
          format(fail_message, { expected, actual })
        );
        if (Array.isArray(expected)) {
          test.assert(
            Array.isArray(actual),
            format("{actual} is array", { actual }),
            format("{actual} is not array", { actual })
          );
          test.assert_match(
            expected.length,
            actual?.length,
            `length {actual} matches expected`,
            `length {actual} does not match expected length {expected}`
          );
          expected.forEach((value, i) => {
            test.assert_match(
              value,
              actual?.[i],
              `{actual} at index ${i} matches expected`,
              `{actual} at index ${i} does not match {expected}`
            );
          });
        } else if (expected instanceof Set) {
          test.assert(
            actual instanceof Set,
            format("{actual} is Set", { actual }),
            format("{actual} is not Set", { actual })
          );
          test.assert_match(
            expected.size,
            actual?.size,
            `size {actual} matches expected`,
            `size {actual} does not match expected size {expected}`
          );
          expected.forEach((value) => {
            test.assert(
              actual?.has(value),
              format(`{actual} has {value}`, { actual, value }),
              format(`{actual} does not have {value}`, { actual, value })
            );
          });
          Object.entries(expected).forEach(([key, value]) => {
            if (value === void 0) return;
            test.assert_match(
              value,
              actual?.[key],
              `${key}: {actual} matches expected`,
              `${key}: {actual} does not match {expected}`
            );
          });
        } else if (expected instanceof RegExp) {
          test.mark(expected.test(String(actual)));
        } else if (expected && typeof expected === "object") {
          if (actual === expected) {
            test.assert(
              true,
              format("{actual} is the same object as {expected}", { expected, actual }),
              ""
            );
          } else {
            test.assert(
              actual && typeof actual === "object",
              format("{actual} is object", { actual }),
              format("{actual} is not object", { actual })
            );
            Object.entries(expected).forEach(([key, value]) => {
              if (value === void 0) return;
              test.assert_match(
                value,
                actual?.[key],
                `${key}: {actual} matches expected`,
                `${key}: {actual} does not match {expected}`
              );
            });
          }
        }
        return test;
      }
      assert_not_match(expected, actual, pass_message = `{actual} does not match {expected}`, fail_message = `{actual} matches {expected}`) {
        return this.assert_match(expected, actual, pass_message, fail_message).negate();
      }
      counter() {
        const counter = new TestCounter();
        if (this.has_children()) {
          return counter.accumulate(this.children.map((test) => test.counter()));
        } else {
          return counter.add(this.passes());
        }
      }
      log(expand_passed = false, pad = "") {
        if (expand_passed || !this.passes()) {
          const child_pad = pad.replaceAll("\u256D\u2500", "  ").replaceAll("\u251C\u2500", "\u2502 ");
          this.children.forEach((test, i) => test.log(
            expand_passed,
            child_pad + (i === 0 ? "\u256D\u2500" : "\u251C\u2500")
          ));
        }
        const { count, passes, fails } = this.counter();
        console.log(`${pad}${this.passes() ? "\u2705" : "\u274C"} ${format(this.passes() ? this.pass_message : this.fail_message, { count, passes, fails })}`);
      }
      async test() {
      }
      async run() {
        _Test.SUITE.children.push(this);
        return this.test();
      }
      tag_set(...tags) {
        return new Set(tags.map((tag) => Tag.match_or_new(tag)));
      }
      static async test() {
        return new this().run();
      }
      static log(expand_passed = false) {
        _Test.SUITE.log(expand_passed);
      }
    };
  }
});

// test/text-normalise-test.ts
var TextNormaliseTest;
var init_text_normalise_test = __esm({
  "test/text-normalise-test.ts"() {
    init_test();
    init_text();
    TextNormaliseTest = class extends Test {
      pass_message = "Passed all {count} text normalisation tests";
      fail_message = "Passed {passes}/{count} text normalisation tests (failed {fails})";
      async test() {
        Object.entries({
          "\xC9omer, King of Rohan": "eomer king of rohan",
          "\xC6therflux Reservoir": "aetherflux reservoir",
          "Fire // Ice": "fire ice"
        }).forEach(([input, expected]) => {
          const normalised = normalise(input);
          this.assert_match(expected, normalised);
        });
      }
    };
  }
});

// test/text-words-to-number-test.ts
var TextWordsToNumberTest;
var init_text_words_to_number_test = __esm({
  "test/text-words-to-number-test.ts"() {
    init_test();
    init_text();
    TextWordsToNumberTest = class extends Test {
      pass_message = "Passed all {count} word to number tests";
      fail_message = "Passed {passes}/{count} word to number tests (failed {fails})";
      async test() {
        Object.entries({
          "zero": 0,
          "one": 1,
          "two": 2,
          "three": 3,
          "four": 4,
          "five": 5,
          "ten": 10,
          "eleven": 11,
          "twelve": 12,
          "twenty": 20,
          "twenty one": 21,
          "twenty two": 22,
          "ninety nine": 99
        }).forEach(([input, expected]) => {
          const number = words_to_number(input);
          this.assert_match(expected, number);
        });
      }
    };
  }
});

// test/designation-test.ts
var DesignationTest;
var init_designation_test = __esm({
  "test/designation-test.ts"() {
    init_test();
    init_language();
    init_finish();
    init_condition();
    init_board();
    DesignationTest = class extends Test {
      pass_message = "Passed all {count} designation tests";
      fail_message = "Passed {passes}/{count} designation tests (failed {fails})";
      async test() {
        const designations = [
          Board,
          Condition,
          Finish,
          Language
        ];
        for (const designation of designations) {
          const self_test = this.sub_test(
            `Passed all {count} ${designation.name} self tests`,
            `Passed {passes}/{count} ${designation.name} self tests (failed {fails})`
          );
          designation.all().forEach((type) => {
            designation.all().forEach((test) => {
              if (test !== type) {
                [type.name, ...type.codes].forEach((code) => self_test.assert_false(
                  test.matches(code),
                  `${test} does not match "${code}"`,
                  `${test} matches "${code}"`
                ));
              }
            });
          });
          const cross_test = this.sub_test(
            `Passed all {count} ${designation.name} cross tests`,
            `Passed {passes}/{count} ${designation.name} cross tests (failed {fails})`
          );
          for (const designation_2 of designations) {
            if (designation_2 !== designation) {
              designation.all().forEach((type) => {
                [type.name, ...type.codes].forEach((code) => cross_test.assert_null(
                  designation_2.match(code),
                  `${designation_2.name} has no matches for "${code}"`,
                  `${designation_2.name} has a match for "${code}"`
                ));
              });
            }
          }
        }
      }
    };
  }
});

// test/card-parse-test.ts
var CardParseTest;
var init_card_parse_test = __esm({
  "test/card-parse-test.ts"() {
    init_deck_card();
    init_test();
    init_language();
    init_board();
    init_condition();
    init_finish();
    CardParseTest = class extends Test {
      pass_message = "Passed all {count} card parsing tests";
      fail_message = "Passed {passes}/{count} card parsing tests (failed {fails})";
      async test() {
        Object.entries({
          // quantity tests
          "forest": new DeckCard({ name: "forest" }),
          "3 forest": new DeckCard({ quantity: 3, name: "forest" }),
          "3x forest": new DeckCard({ quantity: 3, name: "forest" }),
          "3* forest": new DeckCard({ quantity: 3, name: "forest" }),
          "3\xD7 forest": new DeckCard({ quantity: 3, name: "forest" }),
          "0 forest": new DeckCard({ quantity: 0, name: "forest" }),
          "999 forest": new DeckCard({ quantity: 999, name: "forest" }),
          "1000 forest": new DeckCard({ name: "1000 forest" }),
          "-1 forest": new DeckCard({ name: "-1 forest" }),
          "3forest": new DeckCard({ name: "3forest" }),
          // language tests
          "forest *en*": new DeckCard({ name: "forest", language: Language.english }),
          "forest *EN*": new DeckCard({ name: "forest", language: Language.english }),
          "forest *English*": new DeckCard({ name: "forest", language: Language.english }),
          "forest *sp*": new DeckCard({ name: "forest", language: Language.spanish }),
          "forest *spanish*": new DeckCard({ name: "forest", language: Language.spanish }),
          // TappedOut
          "1x Llanowar Elves (M10)": new DeckCard({ quantity: 1, name: "Llanowar Elves", set: "m10" }),
          "1x Greven Il Vec *CMDR*": new DeckCard({ quantity: 1, name: "Greven Il Vec", board: Board.commander }),
          "1x Gyruda, Doom of Depths *CMPN*": new DeckCard({ quantity: 1, name: "Gyruda, Doom of Depths", board: Board.companion }),
          "1x Mishra's Factory (ATQ:1074)": new DeckCard({ quantity: 1, name: "Mishra's Factory", set: "atq", collector_number: "1074" }),
          "1x Llanowar Elves *GE*": new DeckCard({ quantity: 1, name: "Llanowar Elves", language: Language.german }),
          "1x Llanowar Elves *SL*": new DeckCard({ quantity: 1, name: "Llanowar Elves", condition: Condition.slightly_played }),
          "1x Llanowar Elves *mythic*": new DeckCard({ quantity: 1, name: "Llanowar Elves", tags: this.tag_set("mythic") }),
          "1x Llanowar Elves *CMC:20*": new DeckCard({ quantity: 1, name: "Llanowar Elves", tags: this.tag_set("CMC:20") }),
          "1x Llanowar Elves (M10) *F* *IT* *SL*": new DeckCard({ quantity: 1, name: "Llanowar Elves", set: "m10", finish: Finish.foil, language: Language.italian, condition: Condition.slightly_played }),
          "1x Island #Land": new DeckCard({ quantity: 1, name: "Island", tags: this.tag_set("Land") }),
          "1x Storm Crow #Wincon": new DeckCard({ quantity: 1, name: "Storm Crow", tags: this.tag_set("Wincon") }),
          "1x Llanowar Elves #Category_With_Spaces": new DeckCard({ quantity: 1, name: "Llanowar Elves", tags: this.tag_set("Category_With_Spaces") }),
          "4x Llanowar Elves *Need: 2*": new DeckCard({ quantity: 4, name: "Llanowar Elves", tags: this.tag_set("Need: 2") }),
          // Archidekt
          "2 Sensei's Divining Top": new DeckCard({ quantity: 2, name: "Sensei's Divining Top" }),
          "2x Sensei's Divining Top": new DeckCard({ quantity: 2, name: "Sensei's Divining Top" }),
          "1 Mountain (DOM) 263": new DeckCard({ quantity: 1, name: "Mountain", set: "dom", collector_number: "263" }),
          "1 Counterspell": new DeckCard({ quantity: 1, name: "Counterspell" }),
          "1 Path to Exile": new DeckCard({ quantity: 1, name: "Path to Exile" }),
          "2x Sol Ring": new DeckCard({ quantity: 2, name: "Sol Ring" }),
          "1x Path to Exile (cmm) [Removal] ^To Remove,#FF0000^": new DeckCard({ quantity: 1, name: "Path to Exile", set: "cmm", tags: this.tag_set("Removal", "To Remove") }),
          "1 Wrath of God": new DeckCard({ quantity: 1, name: "Wrath of God" }),
          "2 Island": new DeckCard({ quantity: 2, name: "Island" }),
          "1 Forest": new DeckCard({ quantity: 1, name: "Forest" }),
          // Edge Cases
          "1 Hazmat Suit (Used)": new DeckCard({ quantity: 1, name: "Hazmat Suit (Used)" }),
          "1 Hazmat Suit (Used) (UST)": new DeckCard({ quantity: 1, name: "Hazmat Suit (Used)", set: "ust" }),
          "1 Hazmat Suit (Used) 123": new DeckCard({ quantity: 1, name: "Hazmat Suit", set: "used", collector_number: "123" }),
          "1 Hazmat Suit (Used:123)": new DeckCard({ quantity: 1, name: "Hazmat Suit", set: "used", collector_number: "123" }),
          "17-Year Cicadas": new DeckCard({ name: "17-Year Cicadas" }),
          "17 Year Cicadas": new DeckCard({ quantity: 17, name: "Year Cicadas" }),
          "3 17-Year Cicadas": new DeckCard({ quantity: 3, name: "17-Year Cicadas" }),
          "1996 World Champion": new DeckCard({ name: "1996 World Champion" }),
          "100 1996 World Champion": new DeckCard({ quantity: 100, name: "1996 World Champion" }),
          "70,000 Light-Years from Home": new DeckCard({ name: "70,000 Light-Years from Home" }),
          "+2 mace": new DeckCard({ name: "+2 mace" }),
          "_____": new DeckCard({ name: "_____" }),
          "______": new DeckCard({ name: "______" }),
          "_____ Goblin": new DeckCard({ name: "_____ Goblin" }),
          '"Ach! Hans, Run!"': new DeckCard({ name: '"Ach! Hans, Run!"' }),
          "\xC9omer, King of Rohan": new DeckCard({ name: "\xC9omer, King of Rohan" }),
          "1 Sheoldred, Whispering One (PNPH) 73\u2605 *F*": new DeckCard({ quantity: 1, name: "Sheoldred, Whispering One", set: "pnph", collector_number: "73\u2605", finish: Finish.foil })
        }).forEach(([input, expected]) => {
          const card = DeckCard.parse(input);
          this.assert_match(
            expected,
            card,
            `Input "${input}" matched expected fields`,
            `Input "${input}" did not match expected fields`
          );
          if (card) {
            const card_string = card.to_string("1 Name (SET:000?)? *EN*? *F*? *NM*? [Tag] #Board");
            const card2 = DeckCard.parse(card_string);
            this.assert_match(
              expected,
              card2,
              `Reparsing card did not change it: ` + card_string,
              `Reparsing card changed it: ` + card_string
            );
          }
        });
      }
    };
  }
});

// test/card-load-test.ts
var CardLoadTest;
var init_card_load_test = __esm({
  "test/card-load-test.ts"() {
    init_deck_card();
    init_test();
    CardLoadTest = class extends Test {
      pass_message = "Passed all {count} card loading tests";
      fail_message = "Passed {passes}/{count} card loading tests (failed {fails})";
      async test() {
        await Promise.all(Object.entries({
          "forest": {
            name: "Forest",
            set: null,
            collector_number: null,
            card: { name: "Forest" }
          },
          "forest *FR*": { card: { name: "Forest", lang: "fr" } },
          "forest (KTK)": { card: { name: "Forest", set: "ktk" } },
          "forest (KTK) *FR*": { card: { name: "Forest", set: "ktk", lang: "fr" } },
          "forest (KTK:267)": { card: { name: "Forest", set: "ktk", collector_number: "267" } },
          "forest (KTK:267) *FR*": { card: { name: "Forest", set: "ktk", collector_number: "267", lang: "fr" } },
          "+2 mace": { card: { name: "+2 Mace" } },
          "_____": { card: { name: "_____" } },
          "______": { card: { name: "______" } },
          "_____ Goblin": { card: { name: "_____ Goblin" } },
          '"Ach! Hans, Run!"': { card: { name: '"Ach! Hans, Run!"' } },
          "\xC9omer, King of Rohan": { card: { name: "\xC9omer, King of Rohan" } },
          "\xC6therflux Reservoir": { card: { name: "Aetherflux Reservoir" } }
        }).map(async ([input, expected]) => {
          const card = await DeckCard.parse(input).load();
          if (card.card) {
            this.assert_match(
              expected,
              card,
              `Input "${input}" matched expected fields`,
              `Input "${input}" did not match expected fields`
            );
            if (card.card) {
              const id = card.card.id;
              await card.reload();
              this.assert_match(
                id,
                card.card.id,
                `Reloading card "${input}" did not change it`,
                `Reloading card "${input}" changed it from {expected} to {actual}`
              );
            }
          }
        }));
      }
    };
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
              element.addEventListener(event, value);
              listeners[event] = value;
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

// ui/card-edit-view.ts
var CardEditView;
var init_card_edit_view = __esm({
  "ui/card-edit-view.ts"() {
    init_xml();
    CardEditView = class {
      static show(card) {
        return HTML.div({
          id: "card-edit-modal",
          class: "modal"
        });
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
    SVG.rect({ x: 0, y: 0, width: 25, height: 35, fill: "black" }),
    SVG.rect({ x: 2, y: 2, width: 21, height: 31, fill: "white", opacity: "50%" }),
    SVG.g({ fill: "white", stroke: "black", stroke_width: 1 }, [
      SVG.rect({ x: 0.5, y: 0.5, width: 24, height: 3, rx: 1.5 }),
      SVG.rect({ x: 0.5, y: 19.5, width: 24, height: 3, rx: 1.5 }),
      SVG.rect({ x: 18.5, y: 31.5, width: 6, height: 3, rx: 1.5 })
    ]),
    SVG.rect({ x: 0, y: 0, width: 25, height: 35 }, [
      SVG.animate({
        attributeName: "fill",
        values: [
          "#0000007f",
          "#000000bf",
          "#0000007f"
        ].join(";"),
        dur: "4s",
        repeatCount: "indefinite"
      })
    ]),
    name && SVG.text({ x: 2, y: 2.5, font_size: 1.5, font_family: "monospace", fill: "white" }, name.length > 24 ? name.slice(0, 21) + "..." : name)
  ]);
}
function skeleton_back() {
  return SVG.svg({
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 25 35"
  }, [
    SVG.rect({ x: 0, y: 0, width: 25, height: 35, fill: "black" }),
    SVG.rect({ x: 2, y: 2, width: 21, height: 31, fill: "white", opacity: "50%" }),
    SVG.rect({ x: 0, y: 0, width: 25, height: 35 }, [
      SVG.animate({
        attributeName: "fill",
        values: [
          "#0000007f",
          "#000000bf",
          "#0000007f"
        ].join(";"),
        dur: "4s",
        repeatCount: "indefinite"
      })
    ])
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
    init_card_edit_view();
    init_skeleton();
    CardView = class _CardView {
      static renderings = /* @__PURE__ */ new WeakMap();
      static render(card, id, last_in_card = false, last_in_stack = false, face_id = card.display_face_id) {
        const card_class = /* @__PURE__ */ new Set(["card"]);
        if (!last_in_card) card_class.add("collapsible");
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
          const face = card.faces()[face_id2];
          const urls = [];
          if (face_id2 === 0 || card.is_double_faced()) {
            urls.push(...face.image_urls());
            const face_name = card.is_double_faced() && face.card_name(true) || card.card_name(true);
            urls.push(data_url(skeleton(face_name)));
          } else if (card.has_alternative_back()) {
            const back_url = card.back_image_url();
            if (back_url) {
              card_class.add("transform");
              urls.push(card.back_image_url());
              urls.push(data_url(skeleton_back()));
            }
          }
          faces.push(HTML.div({
            class: [
              "card-face",
              ["front", "back"][face_id2],
              !card.finish.is_default() && "foil"
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
            id: `${id}-${card.id}-${elements.length}`,
            class: [...card_class],
            onpointermove: ({ x, y }) => {
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
            onclick: () => {
              console.log(`clicked ${card.name}`);
              CardEditView.show(card);
            }
          },
          HTML.div({ class: "backdrop" }),
          HTML.div({ class: "trigger" }),
          HTML.div(
            { class: "card-shift" },
            last_in_card && HTML.div({ class: "count" }, `${card.quantity}\xD7`),
            tilt = HTML.div(
              { class: "card-tilt" },
              HTML.div({ class: "card-faces", style: faces_style }, faces)
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
        if (index_b < 0) index_a = Infinity;
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
    DeckView = class {
      static BY_BOARD = true;
      static GROUPING = CardClassifier;
      static ORDERING = CardClassifier;
      static FACE_SELECTOR = FaceSelector.front;
      static render(deck = Deck.current) {
        CardView.renderings = /* @__PURE__ */ new WeakMap();
        const show_boards = this.BY_BOARD && deck.some((card) => !card.board.is_default());
        return HTML.div(
          { id: "deck" },
          HTML.div(
            { id: "deck-groups", class: "groups" },
            show_boards ? Board.all().map((board) => this.render_board(deck.board(board), board)) : [this.render_board(deck.copy())]
          )
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
            class: ["group"]
          },
          group.name && HTML.div(
            {
              id: `${id}-label`,
              class: "label",
              style: {
                "--gradient": group.color && `linear-gradient(to right in oklab, ${group.color.map((c, i, { length }) => `${c} ${{ 0: "16px", [length - 1]: "calc(100% - 16px)" }[i] ?? ""}`).join(",")})`
              },
              ontimeout: (element) => {
                const top = element.getBoundingClientRect().top;
                const scroll = document.getElementById("deck").scrollTop;
                const controls = document.getElementById("controls").clientHeight;
                element.style.top = `${top + scroll - controls}px`;
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
              for (let j = 0; j < card.quantity; j++) {
                const last_of_card = j === card.quantity - 1;
                elements.push(CardView.render(
                  card,
                  `${id}-card-${j}`,
                  last_of_card,
                  last_deck_card && last_of_card,
                  grouping?.face_id(card, group.value)
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
            id: "card-image",
            style: {
              background_image: `url(${url})`
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

// test/deck-parse-test.ts
var DeckParseTest;
var init_deck_parse_test = __esm({
  "test/deck-parse-test.ts"() {
    init_test();
    init_deck();
    init_deck_card();
    init_board();
    init_finish();
    DeckParseTest = class extends Test {
      pass_message = "Passed all {count} deck parsing tests";
      fail_message = "Passed {passes}/{count} deck parsing tests (failed {fails})";
      async test() {
        const input = `About
Name Jace, Reforging the multiverse

Commander
1 Jace, Multiverse Architect

//Deck (40)
10x Black Lotus (2ed) 233 [Artifact]
1x Esika, God of the Tree // The Prismatic Bridge (khm) 168 [Creature]
1x Forest (plst) AKH-268 [Land]
2x Island (plst) AKH-258 [Land]
1x Lightning Bolt (a25) 141 [Instant]
1x Nezumi Graverobber // Nighteyes the Desecrator (plst) CHK-129 [Creature]
2x Sensei's Divining Top (ema) 232 *F* [Good Stuff] ^Don't Have,#f47373^
2x Swamp (gk1) 25 [Land]
1x Tovolar, Dire Overlord // Tovolar, the Midnight Scourge (mid) 311 [Commander{top}]
turn // burn
lightning bolt [sb]

//Sideboard
lightning bolt
`.trim();
        const deck = Deck.parse(input);
        this.assert_match(
          [
            // new DeckCard({quantity: 1, name: 'About'}),
            new DeckCard({ quantity: 1, name: "Name Jace, Reforging the multiverse", tags: this.tag_set("About") }),
            new DeckCard({ quantity: 1, name: "Jace, Multiverse Architect", board: Board.commander }),
            new DeckCard({ quantity: 10, name: "Black Lotus", set: "2ed", collector_number: "233", tags: this.tag_set("Artifact") }),
            new DeckCard({ quantity: 1, name: "Esika, God of the Tree // The Prismatic Bridge", set: "khm", collector_number: "168", tags: this.tag_set("Creature") }),
            new DeckCard({ quantity: 1, name: "Forest", set: "plst", collector_number: "AKH-268", tags: this.tag_set("Land") }),
            new DeckCard({ quantity: 2, name: "Island", set: "plst", collector_number: "AKH-258", tags: this.tag_set("Land") }),
            new DeckCard({ quantity: 1, name: "Lightning Bolt", set: "a25", collector_number: "141", tags: this.tag_set("Instant") }),
            new DeckCard({ quantity: 1, name: "Nezumi Graverobber // Nighteyes the Desecrator", set: "plst", collector_number: "CHK-129", tags: this.tag_set("Creature") }),
            new DeckCard({ quantity: 2, name: "Sensei's Divining Top", set: "ema", collector_number: "232", finish: Finish.foil, tags: this.tag_set("Good Stuff", "Don't Have") }),
            new DeckCard({ quantity: 2, name: "Swamp", set: "gk1", collector_number: "25", tags: this.tag_set("Land") }),
            new DeckCard({ quantity: 1, name: "Tovolar, Dire Overlord // Tovolar, the Midnight Scourge", set: "mid", collector_number: "311", board: Board.commander }),
            new DeckCard({ quantity: 1, name: "turn // burn" }),
            new DeckCard({ quantity: 1, name: "lightning bolt", board: Board.sideboard }),
            new DeckCard({ quantity: 1, name: "lightning bolt", board: Board.sideboard })
          ],
          deck
        );
      }
    };
  }
});

// test/deck-load-test.ts
var DeckLoadTest;
var init_deck_load_test = __esm({
  "test/deck-load-test.ts"() {
    init_test();
    init_deck();
    DeckLoadTest = class extends Test {
      pass_message = "Passed all {count} deck loading tests";
      fail_message = "Passed {passes}/{count} deck loading tests (failed {fails})";
      async test() {
        const input = `
forest
forest (ktk)
forest (ktk:267)
forest *FR*
_____
______
`.trim();
        const deck = Deck.parse(input);
        await deck.load();
        this.assert_match(
          [
            { card: { name: "Forest" } },
            { card: { name: "Forest", set: "ktk" } },
            { card: { name: "Forest", set: "ktk", collector_number: "267" } },
            { card: { name: "Forest", lang: "fr" } },
            { card: { name: "_____" } },
            { card: { name: "______" } }
          ],
          deck
        );
      }
    };
  }
});

// format.ts
var Format;
var init_format = __esm({
  "format.ts"() {
    Format = class _Format {
      constructor(name, format2 = {}) {
        this.name = name;
        this.code = name.toLowerCase().replaceAll(/\s/g, "");
        Object.assign(this, format2);
      }
      name;
      static standard = new _Format("Standard");
      static future = new _Format("Future Standard", { code: "future" });
      static historic = new _Format("Historic");
      static timeless = new _Format("Timeless");
      static gladiator = new _Format("Gladiator", { cards: 100, sideboard_limit: 0, copy_limit: 1 });
      static pioneer = new _Format("Pioneer");
      static modern = new _Format("Modern");
      static legacy = new _Format("Legacy");
      static pauper = new _Format("Pauper");
      static vintage = new _Format("Vintage");
      static penny = new _Format("Penny Dreadful", { code: "penny" });
      static commander = new _Format("Commander (EDH)", { code: "commander", cards: 100, sideboard_limit: 0, copy_limit: 1, has_commander: true });
      static oathbreaker = new _Format("Oathbreaker", { cards: 60, sideboard_limit: 0, copy_limit: 1, has_oathbreaker: true, has_signature_spell: true });
      static standard_brawl = new _Format("Standard Brawl", { cards: 60, sideboard_limit: 0, copy_limit: 1, has_brawler: true });
      static brawl = new _Format("Brawl", { cards: 100, sideboard_limit: 0, copy_limit: 1, has_brawler: true });
      static competitive_brawl = new _Format("Competitive Brawl", { cards: 100, sideboard_limit: 0, copy_limit: 1, has_brawler: true });
      static alchemy = new _Format("Alchemy");
      static pauper_commander = new _Format("Pauper Commander", { cards: 100, sideboard_limit: 0, copy_limit: 1, has_commander: true });
      static duel = new _Format("Duel Commander", { code: "duel" });
      static oldschool = new _Format("Old School 93/94", { code: "oldschool" });
      static premodern = new _Format("Premodern");
      static predh = new _Format("PreDH", { cards: 100, sideboard_limit: 0, copy_limit: 1, has_commander: true });
      static tlr = new _Format("Tiny Leaders: Reborn", { code: "tlr" });
      code;
      cards = [60, Infinity];
      sideboard_limit = 15;
      copy_limit = 4;
      has_commander = false;
      has_brawler = false;
      has_oathbreaker = false;
      has_signature_spell = false;
      min_cards() {
        return (Array.isArray(this.cards) ? this.cards[0] : this.cards) ?? 0;
      }
      max_cards() {
        return (Array.isArray(this.cards) ? this.cards[1] : this.cards) ?? Infinity;
      }
      has_command_zone() {
        return this.has_commander || this.has_brawler || this.has_oathbreaker;
      }
      static all() {
        return Object.fromEntries(
          Object.entries(this).filter(([_, value]) => value instanceof this)
        );
      }
    };
  }
});

// deck-validator.ts
var DeckValidator;
var init_deck_validator = __esm({
  "deck-validator.ts"() {
    init_catalog();
    init_text();
    init_board();
    DeckValidator = class {
      constructor(deck, format2 = deck.format) {
        this.deck = deck;
        this.format = format2;
      }
      deck;
      format;
      rulebreaks = [];
      is_valid(format2 = this.format) {
        return this.validate(format2).length === 0;
      }
      validate(format2 = this.format) {
        const errors = [];
        const commanders = this.deck.board(Board.commander);
        const commander_count = commanders.count();
        const conspiracies = this.deck.board(Board.conspiracy);
        this.rulebreaks.push(...commanders.skip_empty().flatMap((card) => card.rulebreaks()));
        this.rulebreaks.push(...conspiracies.skip_empty().flatMap((card) => card.rulebreaks()));
        if (format2) {
          const banned_cards = this.deck.board(...Board.STANDARD).filter((card) => card.legality(format2) === "banned");
          if (banned_cards.count() > 0) {
            errors.push({
              type: "illegal-card",
              message: `These cards are banned in this format`,
              cards: banned_cards
            });
          }
          const illegal_cards = this.deck.board(...Board.STANDARD).filter((card) => card.legality(format2) === "not_legal");
          if (illegal_cards.count() > 0) {
            errors.push({
              type: "illegal-card",
              message: `These cards are not legal in this format`,
              cards: illegal_cards
            });
          }
          const card_count = this.deck.board(...Board.STARTING_DECK).count();
          if (card_count < format2.min_cards()) {
            let min_cards = format2.min_cards();
            this.rulebreaks.forEach((rulebreak) => min_cards -= rulebreak.breaks_deck_min());
            if (card_count < min_cards) {
              errors.push({
                type: "too-few-cards",
                message: `You have ${card_count} cards, you need at least ${min_cards}`,
                board: Board.deck
              });
            }
          } else if (card_count > format2.max_cards() && !this.rulebreaks.some((rulebreak) => rulebreak.breaks_deck_max())) {
            errors.push({
              type: "too-many-cards",
              message: `You have ${card_count} cards, you can have up to ${format2.max_cards()}`,
              board: Board.deck
            });
          }
          const sideboard = this.deck.board(Board.sideboard);
          if (sideboard.count() > format2.sideboard_limit) {
            errors.push({
              type: "too-many-sideboard-cards",
              message: `You have ${sideboard.count()} cards in your sideboard, you can have up to ${format2.sideboard_limit}`,
              board: Board.sideboard
            });
          }
          if (format2.has_command_zone()) {
            const [
              commander_1,
              commander_2
            ] = commanders.flat();
            const has_legal_pair = commander_count === 2 && (commander_1.allows_second_commander(commander_2, format2) || commander_2.allows_second_commander(commander_1, format2));
            if (!has_legal_pair) {
              if (commander_count < 1) {
                errors.push({
                  type: "too-few-commanders",
                  message: `You must have a commander in this format`,
                  board: Board.commander
                });
              } else if (commander_count > 1) {
                errors.push({
                  type: "too-many-commanders",
                  message: `You cannot have more than one commander`,
                  board: Board.commander
                });
              } else if (format2.has_signature_spell) {
                errors.push({
                  type: "too-few-commanders",
                  message: `You must have an oathbreaker and a signature spell`,
                  board: Board.commander
                });
              }
              const illegal_commanders = commanders.filter((card) => !card.can_command(format2));
              if (illegal_commanders.count() > 0) {
                errors.push({
                  type: "illegal-commander",
                  message: `These cards cannot be commanders in this format`,
                  cards: illegal_commanders
                });
              }
            }
          } else {
            if (commander_count > 0) {
              errors.push({
                type: "too-many-commanders",
                message: `You cannot have commanders in this format`,
                board: Board.commander
              });
            }
          }
        }
        errors.push(...this.deck.board(Board.companion).skip_empty().flatMap((card) => this.validate_deck_restrictions(card, format2)));
        errors.push(...conspiracies.skip_empty().flatMap((card) => this.validate_deck_restrictions(card, format2)));
        let color_identity = this.deck.color_identity();
        this.deck.board(...Board.STANDARD).map((card) => {
          if (color_identity) {
            const additional_break = this.rulebreaks.find((rulebreak) => rulebreak.breaks_color_identity(card));
            if (additional_break) {
              const additional_colors = card.color_identity().difference(color_identity);
              const additional_color = [...additional_colors][0];
              if (additional_color) {
                color_identity = color_identity.plus(additional_color);
                additional_break.use();
              }
            }
            if (!color_identity.contains(card.color_identity()) && !this.rulebreaks.some((rulebreak) => rulebreak.breaks_color_identity(card))) {
              errors.push({
                type: "color-identity-error",
                message: `This card is not within your commander color identity`,
                cards: [card]
              });
            }
          }
        });
        this.deck.board(...Board.STANDARD).by_count((count, card) => {
          const max = card.copy_limit(format2);
          if (count > max) {
            errors.push({
              type: "too-many-copies",
              message: `You have ${count} of this card, you can only have ${max}`,
              cards: [card]
            });
          }
        });
        Board.all().filter((board) => !Board.STANDARD.includes(board)).forEach((board) => {
          const board_cards = this.deck.board(board);
          if (board_cards.count() === 0) return;
          if (board_cards.count() < board.min_cards()) {
            errors.push({
              type: "too-few-cards",
              message: `You must have at least ${board.min_cards()} cards in a ${board.name.toLowerCase()}`,
              board
            });
          } else if (board_cards.count() > board.max_cards()) {
            errors.push({
              type: "too-many-cards",
              message: `You can only have ${board.max_cards()} cards in a ${board.name.toLowerCase()}`,
              board
            });
          }
          if (board.copy_limit) {
            const too_many = board_cards.filter_by_count((count) => count > board.copy_limit);
            if (too_many.count() > 0) {
              errors.push({
                type: "too-many-copies",
                message: `You have only ${board.copy_limit} copy of each card in a ${board.name}`,
                cards: too_many
              });
            }
          }
          if (board.card_types) {
            const wrong_type = board_cards.filter((card) => !board.can_include(card));
            if (wrong_type.count() > 0) {
              errors.push({
                type: "illegal-card",
                message: `A ${board.name} can contain only ${board.card_types.join(" or ")} cards`,
                cards: wrong_type
              });
            }
          }
        });
        const phenomena = this.deck.board(Board.planar).filter((card) => card.is_type("Phenomenon"));
        if (phenomena.count() > 2) {
          errors.push({
            type: "planar-deck-error",
            message: `You can have up to 2 phenomenon cards in a planar deck`,
            cards: phenomena
          });
        }
        return errors;
      }
      validate_deck_restrictions(card, format2) {
        let deck = this.deck.board(...Board.STARTING_DECK);
        if (card.has_keyword("Companion")) {
          const companion_match = card.oracle().match(/Companion — (?<ability>[^(]+\.)/);
          if (!companion_match) return [];
          const { ability } = companion_match.groups;
          const mana_value_match = ability.match(/Your starting deck contains only (?<description>cards with ((?<parity>even|odd) )?mana values?( (?<mv>\d+) or (?<dir>less|greater))?(?<lands> and land cards)?)\./);
          if (mana_value_match) {
            const { parity, mv, dir, lands, description } = mana_value_match.groups;
            if (parity) {
              deck = deck.filter((card2) => card2.main_face().mana_value() % 2 !== (parity === "even" ? 0 : 1));
            }
            if (mv) {
              if (dir === "less") {
                deck = deck.filter((card2) => card2.main_face().mana_value() > parseInt(mv));
              } else {
                deck = deck.filter((card2) => card2.main_face().mana_value() < parseInt(mv));
              }
            }
            if (lands) {
              deck = deck.filter((card2) => !card2.is_type("Land"));
            }
            return deck.count() > 0 ? [{
              type: "deck-restriction-error",
              message: `Only ${description} are allowed in a deck with this companion`,
              cards: deck
            }] : [];
          }
          const unique_mana_symbol_match = ability.match(/No card in your starting deck has more than one of the same mana symbol in its mana cost\./);
          if (unique_mana_symbol_match) {
            deck = deck.filter((card2) => card2.card.mana_cost.match(/(\{[^}]+}).*\1/));
            return deck.count() > 0 ? [{
              type: "deck-restriction-error",
              message: `Each card must has unique symbols in its mana cost with this companion`,
              cards: deck
            }] : [];
          }
          if (format2) {
            const deck_size_match = ability.match(/Your starting deck contains at least (?<count>\w+|\d+) cards? more than the minimum deck size\./);
            if (deck_size_match) {
              const { count: count_string } = deck_size_match.groups;
              let count = words_to_number(count_string) ?? Number.parseInt(count_string);
              this.rulebreaks.forEach((rulebreak) => count -= rulebreak.breaks_deck_min());
              return deck.count() < format2.min_cards() + count ? [{
                type: "deck-restriction-error",
                message: `You must have ${count} more cards in a deck with this companion`
              }] : [];
            }
          }
          const each_card_match = ability.match(/Each ((?<type>\w+) )?card in your starting deck (?<quality>[^.]+)\./);
          if (each_card_match) {
            const { type, quality } = each_card_match.groups;
            const each_card = `Each ${type ? `${type} ` : ""}card`;
            if (type === "permanent") {
              deck = deck.filter((card2) => card2.is_permanent());
            } else {
              const non_match = type.match(/non(?<type>\w+)/);
              if (non_match) {
                deck = deck.filter((card2) => !card2.is_type(non_match.groups.type));
              } else {
                deck = deck.filter((card2) => card2.is_type(type));
              }
            }
            const types_match = quality.match(/is a (?<types>\w+(, (or )?\w+)*) card/);
            if (types_match) {
              const joined_types = types_match.groups.types;
              const types = joined_types.split(/, or |, /g);
              deck = deck.filter((card2) => !card2.is_any_type(types));
              return deck.count() > 0 ? [{
                type: "deck-restriction-error",
                message: `${each_card} must be a ${joined_types} card with this companion`,
                cards: deck
              }] : [];
            }
            const mv_match = quality.match(/has mana value (?<mv>\d+) or (?<dir>less|greater)/);
            if (mv_match) {
              const { mv, dir } = mv_match.groups;
              if (mv) {
                if (dir === "less") {
                  deck = deck.filter((card2) => card2.main_face().mana_value() > parseInt(mv));
                } else {
                  deck = deck.filter((card2) => card2.main_face().mana_value() < parseInt(mv));
                }
              }
              return deck.count() > 0 ? [{
                type: "deck-restriction-error",
                message: `${each_card} must have mana value ${mv} or ${dir}`,
                cards: deck
              }] : [];
            }
            const unique_match = quality.match(/has a different name/);
            if (unique_match) {
              deck = deck.filter_by_count((count) => count > 1);
              return deck.count() > 0 ? [{
                type: "deck-restriction-error",
                message: `${each_card} must have a different name`,
                cards: deck
              }] : [];
            }
            const shared_type_match = quality.match(/shares a card type/);
            if (shared_type_match) {
              let types = new Set(Catalog.card_types.all());
              deck = deck.filter((card2) => {
                const card_types = new Set(card2.card_types());
                const intersection = types.intersection(card_types);
                if (intersection.size > 0) {
                  types = intersection;
                  return false;
                } else {
                  return true;
                }
              });
              return deck.count() > 0 ? [{
                type: "deck-restriction-error",
                message: `${each_card} must share a card type`,
                cards: deck
              }] : [];
            }
            const activated_ability_match = quality.match(/has an activated ability/);
            if (activated_ability_match) {
              deck = deck.filter((card2) => !card2.has_activate_ability());
              return deck.count() > 0 ? [{
                type: "deck-restriction-error",
                message: `${each_card} must have an activated ability`,
                cards: deck
              }] : [];
            }
          }
        } else if (card.is_type("Conspiracy")) {
          const types_match = card.oracle().match(/Your starting deck can't have (?<types>\w+( \w+)*) cards(.$| and)/);
          if (types_match) {
            const joined_types = types_match.groups.types;
            const types = joined_types.split(/ /g);
            deck = deck.filter((card2) => card2.is_type(...types));
            return deck.count() > 0 ? [{
              type: "deck-restriction-error",
              message: `You can't have any ${joined_types} in your deck`,
              cards: deck
            }] : [];
          }
        }
        return [];
      }
    };
  }
});

// test/deck-validation-test.ts
var DeckValidationTest;
var init_deck_validation_test = __esm({
  "test/deck-validation-test.ts"() {
    init_test();
    init_deck();
    init_format();
    init_deck_validator();
    init_board();
    DeckValidationTest = class extends Test {
      pass_message = "Passed all {count} deck validation tests";
      fail_message = "Passed {passes}/{count} deck validation tests (failed {fails})";
      async test() {
        await Promise.all([
          {
            format: Format.modern,
            input: `60 Forest`,
            errors: []
          },
          {
            format: Format.commander,
            input: `
                    Borborygmos *CMDR*
                    Lightning Bolt
                    50 Mountain
                    48 Forest
                `,
            errors: []
          },
          {
            format: Format.modern,
            input: `59 Forest`,
            errors: [
              { type: "too-few-cards" }
            ]
          },
          {
            format: Format.commander,
            input: `
                    Borborygmos *CMDR*
                    50 Mountain
                    48 Forest
                `,
            errors: [
              { type: "too-few-cards" }
            ]
          },
          {
            format: Format.commander,
            input: `
                    Borborygmos *CMDR*
                    50 Mountain
                    50 Forest
                `,
            errors: [
              { type: "too-many-cards" }
            ]
          },
          {
            format: Format.commander,
            input: `
                    Borborygmos *CMDR*
                    50 Mountain
                    49 Forest
                    #sideboard
                    Forest
                `,
            errors: [
              { type: "too-many-sideboard-cards" }
            ]
          },
          {
            format: Format.modern,
            input: `
                    60 Forest
                    #sideboard
                    16 Forest
                `,
            errors: [
              { type: "too-many-sideboard-cards" }
            ]
          },
          {
            format: Format.modern,
            input: `
                    Borborygmos *CMDR*
                    30 Mountain
                    29 Forest
                `,
            errors: [
              { type: "too-many-commanders" }
            ]
          },
          {
            format: Format.commander,
            input: `100 Forest`,
            errors: [
              { type: "too-few-commanders" }
            ]
          },
          {
            format: Format.commander,
            input: `
                    Borborygmos *CMDR*
                    Progenitus *CMDR*
                    98 Forest
                `,
            errors: [
              { type: "too-many-commanders" }
            ]
          },
          {
            format: Format.commander,
            input: `
                    Aclazotz, Deepest Betrayal *CMDR*
                    99 Swamp
                `,
            errors: []
          },
          {
            format: Format.commander,
            input: `
                    Balamb Garden, SeeD Academy *CMDR*
                    50 Island
                    49 Forest
                `,
            errors: [
              { type: "illegal-commander" }
            ]
          },
          {
            format: Format.commander,
            input: `
                    # 2 Partners
                    Armix, Filigree Thrasher *CMDR*
                    Anara, Wolvid Familiar *CMDR*
                    49 Swamp
                    49 Forest
                `,
            errors: []
          },
          {
            format: Format.commander,
            input: `
                    # Partner-with pair
                    Alisaie Leveilleur *CMDR*
                    Alphinaud Leveilleur *CMDR*
                    49 Plains
                    49 Island
                `,
            errors: []
          },
          {
            format: Format.commander,
            input: `
                    # Invalid Partner-with pair
                    Alisaie Leveilleur *CMDR*
                    Bebop, Skull & Crossbones *CMDR*
                    49 Plains
                    49 Swamp
                `,
            errors: [
              { type: "too-many-commanders" }
            ]
          },
          {
            format: Format.commander,
            input: `
                    # Doctor's Companion pair
                    Amy Pond *CMDR*
                    The Eleventh Doctor *CMDR*
                    40 Plains
                    40 Island
                    18 Mountain
                `,
            errors: []
          },
          {
            format: Format.commander,
            input: `
                    # Invalid trio
                    Amy Pond *CMDR*
                    Rory Williams *CMDR*
                    The Eleventh Doctor *CMDR*
                    40 Plains
                    40 Island
                    17 Mountain
                `,
            errors: [
              { type: "too-many-commanders" }
            ]
          },
          {
            format: Format.commander,
            input: `
                    # Background
                    Alora, Merry Thief *CMDR*
                    Folk Hero *CMDR*
                    49 Plains
                    49 Island
                `,
            errors: []
          },
          {
            format: Format.commander,
            input: `
                    # Choose a color
                    Prismatic Piper *CMDR*
                    Armix, Filigree Thrasher *CMDR*
                    49 Swamp
                    49 Mountain
                `,
            errors: []
          },
          {
            format: Format.commander,
            input: `
                    # Choose too many colors
                    Prismatic Piper *CMDR*
                    50 Swamp
                    49 Mountain
                `,
            errors: [
              { type: "color-identity-error" }
            ]
          },
          {
            format: Format.commander,
            input: `
                    # Invalid Commander
                    Wrenn and Six *CMDR*
                    50 Mountain
                    49 Forest
                `,
            errors: [
              { type: "illegal-commander" }
            ]
          },
          {
            format: Format.brawl,
            input: `
                    # Valid Brawler
                    Wrenn and Six *CMDR*
                    50 Mountain
                    49 Forest
                `,
            errors: []
          },
          {
            format: Format.oathbreaker,
            input: `
                    # Valid Oathbreaker
                    Wrenn and Six *CMDR*
                    Cultivate *CMDR*
                    30 Mountain
                    28 Forest
                `,
            errors: []
          },
          {
            format: Format.oathbreaker,
            input: `
                    # Missing signature spell
                    Wrenn and Six *CMDR*
                    30 Mountain
                    29 Forest
                `,
            errors: [
              { type: "too-few-commanders" }
            ]
          },
          {
            format: Format.oathbreaker,
            input: `
                    # 2 Oathbreakers
                    Wrenn and Six *CMDR*
                    Domri Rade *CMDR*
                    30 Mountain
                    28 Forest
                `,
            errors: [
              { type: "too-many-commanders" }
            ]
          },
          {
            format: Format.oathbreaker,
            input: `
                    # 2 signature spells
                    Cultivate *CMDR*
                    Rampant Growth *CMDR*
                    58 Forest
                `,
            errors: [
              { type: "too-many-commanders" },
              { type: "illegal-commander" }
            ]
          },
          {
            format: Format.oathbreaker,
            input: `
                    # Missing Oathbreaker
                    Cultivate *CMDR*
                    59 Forest
                `,
            errors: [
              { type: "too-few-commanders" },
              { type: "illegal-commander" }
            ]
          },
          {
            format: Format.oathbreaker,
            input: `
                    # Illegal Oathbreaker
                    Borborygmos *CMDR*
                    Cultivate *CMDR*
                    30 Mountain
                    28 Forest
                `,
            errors: [
              { type: "too-many-commanders" },
              { type: "illegal-commander" }
            ]
          },
          {
            format: Format.commander,
            input: `
                    Borborygmos *CMDR*
                    Black Lotus
                    50 Mountain
                    48 Forest
                `,
            errors: [
              { type: "illegal-card", cards: [{ name: "Black Lotus" }] }
            ]
          },
          {
            format: Format.commander,
            input: `
                    Borborygmos *CMDR*
                    2 Lightning Bolt
                    50 Mountain
                    47 Forest
                `,
            errors: [
              { type: "too-many-copies" }
            ]
          },
          {
            format: Format.modern,
            input: `
                    # Gyruda Companion - even mvs
                    Gyruda, Doom of Depths *CMPN*
                    Spark Double
                    Reflections of Littjara
                    30 Island
                    28 Swamp
                `,
            errors: [
              { type: "deck-restriction-error", cards: [{ name: "Reflections of Littjara" }] }
            ]
          },
          {
            input: `
                    # Jegantha Companion - unique mana symbols
                    Jegantha, the Wellspring *CMPN*
                    Rhythm of the Wild
                    The Great Henge
                    Collision // Colossus
                    Fire // Ice
                    30 Forest
                    26 Mountain
                `,
            errors: [
              {
                type: "deck-restriction-error",
                cards: [
                  { name: "The Great Henge" },
                  { name: "Fire // Ice" }
                ]
              }
            ]
          },
          {
            input: `
                    # Kaheera Companion - kindred creatures
                    Kaheera, the Orphanguard *CMPN*
                    Etali, Primal Conqueror
                    Birds of Paradise
                    Changeling Outcast
                    30 Forest
                    28 Plains
                `,
            errors: [
              { type: "deck-restriction-error", cards: [{ name: "Birds of Paradise" }] }
            ]
          },
          {
            input: `
                    # Keruga Companion - mvs >= 3
                    Keruga, the Macrosage *CMPN*
                    Cultivate
                    Rampant Growth
                    30 Forest
                    28 Island
                `,
            errors: [
              { type: "deck-restriction-error", cards: [{ name: "Rampant Growth" }] }
            ]
          },
          {
            input: `
                    # Lurrus Companion - mvs <= 2
                    Lurrus of the Dream-Den *CMPN*
                    Arcane Signet
                    Rhystic Study
                    30 Plains
                    28 Swamp
                `,
            errors: [
              { type: "deck-restriction-error", cards: [{ name: "Rhystic Study" }] }
            ]
          },
          {
            input: `
                    # Lutri Companion - unique cards
                    Lutri, the Spellchaser *CMPN*
                    Arcane Signet
                    2 Lightning Bolt
                    30 Island
                    28 Mountain
                `,
            errors: [
              { type: "deck-restriction-error", cards: [{ name: "Lightning Bolt" }] }
            ]
          },
          {
            input: `
                    # Obosh Companion - odd mvs
                    Obosh, the Preypiercer *CMPN*
                    Arcane Signet
                    Cultivate
                    30 Swamp
                    28 Mountain
                `,
            errors: [
              { type: "deck-restriction-error", cards: [{ name: "Arcane Signet" }] }
            ]
          },
          {
            input: `
                    # Umori Companion - shared card type
                    Umori, the Collector *CMPN*
                    Birds of Paradise
                    Solemn Simulacrum
                    Arcane Signet
                    30 Swamp
                    28 Forest
                `,
            errors: [
              { type: "deck-restriction-error", cards: [{ name: "Arcane Signet" }] }
            ]
          },
          {
            format: Format.vintage,
            input: `
                    # Yorion Companion - deck size +20
                    Yorion, Sky Nomad *CMPN*
                    40 Island
                    39 Plains
                `,
            errors: [
              { type: "deck-restriction-error" }
            ]
          },
          {
            format: Format.vintage,
            input: `
                    # Yorion Companion - deck size +20
                    Yorion, Sky Nomad *CMPN*
                    40 Island
                    40 Plains
                `,
            errors: []
          },
          {
            input: `
                    # Zirda Companion - abilities
                    Zirda, the Dawnwaker *CMPN*
                    Arcane Signet # Written ability
                    Lightning Bolt # non permanent
                    Rhythm of the Wild # error
                    Swiftfoot Boots # equip kw
                    Nearby Planet # rangeling
                    30 Mountain
                    27 Plains
                `,
            errors: [
              { type: "deck-restriction-error", cards: [
                { name: "Rhythm of the Wild" }
              ] }
            ]
          },
          {
            input: `
                    # Rulebreaker - any lands
                    Grizzlegom, Hurloon Hero *CMDR*
                    The World Tree
                    20 Plains
                    20 Island
                    20 Swamp
                    20 Mountain
                    18 Forest
                `,
            errors: []
          },
          {
            input: `
                    # Rulebreaker - any big creatures & any basic lands
                    Maular, the Next Evolution *CMDR*
                    Absolute Virtue
                    20 Plains
                    20 Island
                    20 Swamp
                    20 Mountain
                    18 Forest
                `,
            errors: []
          },
          {
            input: `
                    # Rulebreaker - any angels & any basic lands
                    Seluma, Light of Aysen *CMDR*
                    Angelic Captain
                    Changeling Outcast
                    20 Plains
                    20 Island
                    20 Swamp
                    20 Mountain
                    17 Forest
                `,
            errors: []
          },
          {
            input: `
                    # Rulebreaker - any artifact creatures, equipment, & any basic lands
                    The Everforger *CMDR*
                    Breya, Etherium Shaper
                    Mage Slayer
                    20 Plains
                    20 Island
                    20 Swamp
                    20 Mountain
                    17 Forest
                `,
            errors: []
          },
          {
            input: `
                    # Rulebreaker - any auras & any basic lands
                    The Unluckiest Planeswalker *CMDR*
                    Buried in the Garden
                    20 Plains
                    20 Island
                    20 Swamp
                    20 Mountain
                    18 Forest
                `,
            errors: []
          },
          {
            input: `
                    # Rulebreaker - any phyrexians & any basic lands
                    Valko Indorian *CMDR*
                    Atraxa, Praetors' Voice
                    Realmwalker
                    20 Plains
                    20 Island
                    20 Swamp
                    20 Mountain
                    17 Forest
                `,
            errors: []
          },
          {
            input: `
                    # Rulebreaker - spells +1 id
                    Tolabow, Loch Rascal *CMDR*
                    Lightning Bolt
                    Beacon Bolt
                    20 Plains
                    20 Island
                    20 Swamp
                    20 Mountain
                    17 Forest
                `,
            errors: []
          },
          {
            input: `
                    # Rulebreaker - spells +1 id
                    Tolabow, Loch Rascal *CMDR*
                    Cultivate
                    Beacon Bolt
                    20 Plains
                    20 Island
                    20 Swamp
                    20 Mountain
                    17 Forest
                `,
            errors: [
              { type: "color-identity-error", cards: [{ name: "Beacon Bolt" }] }
            ]
          },
          {
            input: `
                    # Rulebreaker - no max size
                    Whtz, the Bibliophile *CMDR*
                    100 Plains
                    100 Island
                `,
            errors: []
          },
          {
            input: `
                    # Planar deck
                    Bant
                    Esper
                    Grixis
                    Jund
                    Naya
                    Agyrem
                    Akoum
                    Gavony
                    Chaotic Aether
                    Morphic Tide
                `,
            errors: []
          },
          {
            input: `
                    # Planar deck
                    Bant
                    Esper
                    Grixis
                    Jund
                    Naya
                    Agyrem
                    Akoum
                    Gavony
                    Chaotic Aether
                    Black Lotus
                `,
            errors: [
              { type: "illegal-card", cards: [{ name: "Black Lotus" }] }
            ]
          },
          {
            input: `
                    # Planar deck
                    Bant
                    Esper
                    Grixis
                    Jund
                    Naya
                    Agyrem
                    Akoum
                    Chaotic Aether
                    Morphic Tide
                `,
            errors: [
              { type: "too-few-cards", board: Board.planar }
            ]
          },
          {
            input: `
                    # Planar deck
                    Bant
                    Esper
                    Grixis
                    Jund
                    Naya
                    Agyrem
                    Akoum
                    Chaotic Aether
                    Morphic Tide
                    Planewide Disaster
                `,
            errors: [
              { type: "planar-deck-error" }
            ]
          },
          {
            input: `
                    # Planar deck
                    2 Bant
                    Esper
                    Grixis
                    Jund
                    Naya
                    Agyrem
                    Akoum
                    Chaotic Aether
                    Morphic Tide
                `,
            errors: [
              { type: "too-many-copies", cards: [{ name: "Bant" }] }
            ]
          },
          {
            format: Format.modern,
            input: `
                    # Reduced min deck size
                    Advantageous proclamation *Conspiracy*
                    55 Plains
                `,
            errors: []
          },
          {
            format: Format.modern,
            input: `
                    # Reduced min deck size error
                    Advantageous proclamation *Conspiracy*
                    54 Plains
                `,
            errors: [
              { type: "too-few-cards" }
            ]
          },
          {
            format: Format.vintage,
            input: `
                    # Yorion with reduced min deck size
                    Yorion, Sky Nomad *CMPN*
                    Advantageous proclamation *Conspiracy*
                    75 Plains
                `,
            errors: []
          },
          {
            format: Format.vintage,
            input: `
                    # Yorion with reduced min deck size error
                    Yorion, Sky Nomad *CMPN*
                    Advantageous proclamation *Conspiracy*
                    74 Plains
                `,
            errors: [
              { type: "deck-restriction-error" }
            ]
          },
          {
            input: `
                    # No basics conspiracy
                    Sovereign's Realm *Conspiracy*
                    Plains
                `,
            errors: [
              { type: "deck-restriction-error", cards: [{ name: "Plains" }] }
            ]
          }
        ].map(async ({ format: format2, input, errors }) => {
          input = input.replaceAll(/^\s*|\s*$/g, "");
          const deck = Deck.parse(input);
          deck.format = format2;
          await deck.load();
          const validator = new DeckValidator(deck);
          this.assert_match(
            errors,
            validator.validate(),
            `Input "${input}" matched expected validation`,
            `Input "${input}" did not match expected validation`
          );
        }));
      }
    };
  }
});

// test/test-runner.ts
var test_runner_exports = {};
__export(test_runner_exports, {
  run_tests: () => run_tests
});
async function run_tests() {
  load_card_cache();
  load_api_cache();
  await Catalog.load();
  await Promise.all([
    TextNormaliseTest.test(),
    TextWordsToNumberTest.test(),
    DesignationTest.test(),
    CardParseTest.test(),
    CardLoadTest.test(),
    DeckParseTest.test(),
    DeckLoadTest.test(),
    DeckValidationTest.test()
  ]).finally(() => {
    Test.log();
    API.CACHE.dump();
    DeckCard.CACHE.dump();
  });
}
var init_test_runner = __esm({
  "test/test-runner.ts"() {
    init_api_cache_fixture();
    init_card_cache_fixture();
    init_catalog();
    init_text_normalise_test();
    init_text_words_to_number_test();
    init_designation_test();
    init_card_parse_test();
    init_card_load_test();
    init_deck_parse_test();
    init_deck_load_test();
    init_deck_validation_test();
    init_test();
    init_api();
    init_deck_card();
  }
});

// ui/deck-controls/deck-upload.ts
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
  "ui/deck-controls/deck-upload.ts"() {
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
      blue: "#00bfff",
      red: "#ff2f00",
      green: "#5fdf00",
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

// ui/deck-controls/deck-controls.ts
function initialise_deck_controls() {
  const group_select = HTML.select({
    id: "group-by",
    onchange: () => {
      DeckView.GROUPING = CARD_GROUPINGS[group_select.value];
      DeckView.render();
    }
  });
  CARD_GROUPINGS.forEach((grouping, i) => {
    group_select.add(new Option(grouping.name, `${i}`));
  });
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
  });
  CARD_ORDERINGS.forEach((ordering, i) => {
    order_select.add(new Option(ordering.name, `${i}`));
  });
}
var CARD_GROUPINGS, CARD_ORDERINGS;
var init_deck_controls = __esm({
  "ui/deck-controls/deck-controls.ts"() {
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

// ui/deck-controls/initialise-controls.ts
var initialise_controls_exports = {};
__export(initialise_controls_exports, {
  initialise_controls: () => initialise_controls
});
function initialise_controls() {
  initialise_deck_controls();
  initialise_deck_upload();
}
var init_initialise_controls = __esm({
  "ui/deck-controls/initialise-controls.ts"() {
    init_deck_upload();
    init_deck_controls();
  }
});

// main.js
var require_main = __commonJS({
  "main.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var test_runner_1 = (init_test_runner(), __toCommonJS(test_runner_exports));
    var initialise_controls_1 = (init_initialise_controls(), __toCommonJS(initialise_controls_exports));
    (0, test_runner_1.run_tests)();
    (0, initialise_controls_1.initialise_controls)();
  }
});
export default require_main();
