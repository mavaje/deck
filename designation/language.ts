import {Designation} from "./designation";

export class Language extends Designation {
    static english = new Language('English', ['en']);
    static spanish = new Language('Spanish', ['es', 'sp']);
    static french = new Language('French', ['fr']);
    static german = new Language('German', ['de', 'ge']);
    static italian = new Language('Italian', ['it']);
    static portuguese = new Language('Portuguese', ['pt']);
    static japanese = new Language('Japanese', ['ja', 'jp']);
    static korean = new Language('Korean', ['ko', 'kr']);
    static russian = new Language('Russian', ['ru', 'rs']);
    static chinese_simplified = new Language('Simplified Chinese', ['zhs', 'cs']);
    static chinese_traditional = new Language('Traditional Chinese', ['zht', 'ct']);
    static hebrew = new Language('Hebrew', ['he']);
    static latin = new Language('Latin', ['la']);
    static ancient_greek = new Language('Ancient Greek', ['grc', 'ag']);
    static arabic = new Language('Arabic', ['ar']);
    static sanskrit = new Language('Sanskrit', ['sa']);
    static phyrexian = new Language('Phyrexian', ['ph'], true);
    static quenya = new Language('Quenya', ['qya'], true);
    static dwarvish = new Language('Dwarvish', ['dw']);
    static klingon = new Language('Klingon', ['tlh', 'kl']);

    static DEFAULT = this.english;

    constructor(
        name: string,
        codes: string[] = [],
        public has_font: boolean = false,
    ) {
        super(name, codes);
    }

    is_default(): boolean {
        return this === Language.DEFAULT;
    }

    static infer(text: string): Language {
        if (/[\u0370-\u03FF\u1F00-\u1FFF]/.test(text)) return Language.ancient_greek;
        if (/[\u0400-\u04FF]/.test(text)) return Language.russian;
        if (/[\u0590-\u05FF]/.test(text)) return Language.hebrew;
        if (/[\u0600-\u06FF]/.test(text)) return Language.arabic;
        if (/[\u0900-\u097F]/.test(text)) return Language.sanskrit;
        if (/[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7AF]/.test(text)) return Language.korean;
        if (/[\u3040-\u309F\u30A0-\u30FF\u31F0-\u31FF\uFF65-\uFF9F]/.test(text)) return Language.japanese;
        if (/[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/.test(text)) return Language.chinese_simplified;
        if (/[\uE000-\uE07F]/.test(text)) return Language.quenya;

        if (/^\|/.test(text)) return Language.phyrexian;

        return Language.DEFAULT;
    }
}
