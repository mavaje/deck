import {Designation} from "./designation";
import {normalise} from "../text";

export class Language extends Designation {
    static english = new Language('English', ['en'], true);
    static spanish = new Language('Spanish', ['es', 'sp'], true);
    static french = new Language('French', ['fr'], true);
    static german = new Language('German', ['de', 'ge'], true);
    static italian = new Language('Italian', ['it'], true);
    static portuguese = new Language('Portuguese', ['pt'], true);
    static korean = new Language('Korean', ['ko', 'kr'], false, /[\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uAC00-\uD7AF\uD7B0-\uD7FF]/);
    static japanese = new Language('Japanese', ['ja', 'jp'], false, /[\u3040-\u309F\u30A0-\u30FA\u30FC-\u30FF\u31F0-\u31FF\uFF66-\uFF9F\u3005]/);
    static russian = new Language('Russian', ['ru', 'rs'], false, /[\u0400-\u04FF]/);
    static chinese_simplified = new Language('Simplified Chinese', ['zhs', 'cs'], false, /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\u{20000}-\u{3134F}]/u);
    static chinese_traditional = new Language('Traditional Chinese', ['zht', 'ct'], false);
    static hebrew = new Language('Hebrew', ['he'], false, /[\u0590-\u05FF\uFB1D-\uFB4F]/);
    static latin = new Language('Latin', ['la'], true);
    static ancient_greek = new Language('Ancient Greek', ['grc', 'ag'], false, /[\u0370-\u03FF\u1F00-\u1FFF]/);
    static arabic = new Language('Arabic', ['ar'], false, /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/);
    static sanskrit = new Language('Sanskrit', ['sa'], false, /[\u0900-\u097F\uA8E0-\uA8FF\u1CD0-\u1CFF]/);
    static phyrexian = new Language('Phyrexian', ['ph'], false, /^\|/, true);
    static quenya = new Language('Quenya', ['qya'], false, /[\uE000-\uE07F]/, true);
    static dwarvish = new Language('Dwarvish', ['dw'], true, /[\u16A0-\u16FF\uE080-\uE0FF]/);
    static klingon = new Language('Klingon', ['tlh', 'kl'], true, /[\uF8D0-\uF8FF]/);

    static DEFAULT = this.english;

    constructor(
        name: string,
        codes: string[] = [],
        public is_latin: boolean = false,
        public detector: RegExp = null,
        public has_font: boolean = false) {
        super(name, codes);
    }

    is_default(): boolean {
        return this === Language.DEFAULT;
    }

    detects(text: string): boolean {
        if (!this.detector) return false;
        text = normalise(text, false, /^/g);
        return this.detector.test(text);
    }

    static detect(text: string): Language {
        if (!text) return Language.DEFAULT;

        for (const language of Language.all()) {
            if (language.detects(text)) {
                return language;
            }
        }

        return Language.DEFAULT;
    }

    static detect_font(text: string): Language {
        const language = Language.detect(text);
        return language.has_font ? language : null;
    }
}
